#!/usr/bin/env python3
"""Smoke test. No network, no credentials, no Claude account needed.

    python3 tests/smoke_test.py

1. Imports every module.
2. Runs the keeper against a fake set of Claude desktop session files: plan -> batch -> confirm -> plan again.
3. Checks the built board pages: slots filled, Office ids present, every script parses (with node, if installed),
   and that rebuilding from board/src gives the same files.
"""
import json
import os
import pathlib
import shutil
import socket
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'src'))


def no_network(*a, **k):
    raise RuntimeError('network blocked in the smoke test')


socket.socket.connect = no_network  # anything that tries to reach out fails loudly

import ai_office  # noqa: E402
from ai_office import keeper  # noqa: E402

NOW = 1_800_000_000_000  # fixed clock, in ms
failures = []


def check(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        failures.append(msg)


def write_session(base, sid, title, minutes_ago, cli=None, **extra):
    d = base / 'acct' / 'org'
    d.mkdir(parents=True, exist_ok=True)
    meta = {'sessionId': sid, 'title': title, 'lastActivityAt': NOW - minutes_ago * 60000, 'cliSessionId': cli}
    meta.update(extra)
    (d / f'local_{sid}.json').write_text(json.dumps(meta))


def write_transcript(projects, cli, entries):
    p = projects / 'some-project'
    p.mkdir(parents=True, exist_ok=True)
    (p / f'{cli}.jsonl').write_text('\n'.join(json.dumps(e) for e in entries))


def keeper_round_trip():
    tmp = pathlib.Path(tempfile.mkdtemp())
    try:
        sessions, projects, state = tmp / 'sessions', tmp / 'projects', tmp / 'state'
        os.environ.update(AIO_SESSIONS_DIR=str(sessions), AIO_PROJECTS_DIR=str(projects), AIO_STATE_DIR=str(state),
                          AIO_PEOPLE=str(tmp / 'none.json'), AIO_MANAGER='Ada', AIO_NOW_MS=str(NOW))
        write_session(sessions, 's1', 'Meta ads (Rory)', 2, cli='c1')
        write_transcript(projects, 'c1', [{'type': 'assistant', 'message': {'content': [{'type': 'text', 'text': 'Testing the new carousel. It looks good so far.'}]}}])
        write_session(sessions, 's2', 'Website (Theo)', 300, cli='c2')
        write_transcript(projects, 'c2', [{'type': 'assistant', 'message': {'content': [{'type': 'text', 'text': 'The page is ready. Shall I put it live?'}]}}])
        write_session(sessions, 's3', 'Bookkeeping (Ravi)', 2000)
        write_session(sessions, 's4', 'Manager (Ada)', 1)            # the manager: skipped
        write_session(sessions, 's5', 'Quick fix for the footer', 1)  # a helper, no (Name): skipped
        write_session(sessions, 's6', 'Social posts (Lena)', 1, isArchived=True)
        write_session(sessions, 's7', 'Old: Social posts (Lena)', 1)
        write_session(sessions, 's8', 'Payroll (Ines)', 50, interruptedAwaitingPerson=True)

        docs = keeper.build()
        by = {d['name']: d for d in docs}
        check(sorted(by) == ['Ines', 'Ravi', 'Rory', 'Theo'], f'roster is the 4 staff sessions (got {sorted(by)})')
        check(by['Rory']['status'] == 'BUILDING', 'recent session is BUILDING')
        check(by['Theo']['status'] == keeper.NEEDS_YOU, 'session that ends on a question is NEEDS YOU')
        check(by['Ravi']['status'] == 'IDLE', 'old session is IDLE')
        check(by['Ines']['status'] == keeper.NEEDS_YOU, 'session waiting on a person is NEEDS YOU')
        check(by['Rory']['dept'] == 'Meta ads' and by['Rory']['latest'].startswith('Testing the new carousel'), 'dept and latest line come through')

        check(keeper.main(['--plan']) == 3, '--plan finds changes to apply')
        pasted = ('{"id":"s1","data":{},"version":4} {"id":"gone-session","data":{},"version":2} '
                  '"status" 120 bytes version 7')
        import io, contextlib
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            rc = keeper.cmd_batch(keeper.settings(), pasted)
        writes = [w for line in buf.getvalue().splitlines() for w in json.loads(line)['writes']]
        ops = {(w['op'], w['doc_id']): w for w in writes}
        check(rc == 0, '--batch builds the writes')
        check(ops.get(('set', 's1'), {}).get('if_version') == 4, 'existing doc is pinned to its version')
        check(('delete', 'gone-session') in ops, 'a session that left the roster is deleted')
        check(ops.get(('update', 'status'), {}).get('if_version') == 7, 'meta/status update is pinned')
        filled = ops[('update', 'status')]['data']['filled_at']
        with contextlib.redirect_stderr(io.StringIO()):  # the expected FAILED message
            bad = keeper.cmd_confirm(keeper.settings(), '{"filled_at":"wrong"}')
        check(bad == 1, '--confirm fails when the write did not land')
        check(keeper.cmd_confirm(keeper.settings(), json.dumps({'filled_at': filled})) == 0, '--confirm verifies the write')
        check(keeper.main(['--plan']) == 0, '--plan is quiet once the board matches')
        for i in range(60):
            write_session(sessions, f'x{i}', f'Support (Pat{chr(97 + i % 26)}{chr(97 + i // 26)})', 3000)
        with contextlib.redirect_stdout(io.StringIO()):
            keeper.main(['--plan'])
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(io.StringIO()):
            keeper.cmd_batch(keeper.settings(), '"status" 120 bytes version 9')
        lines = buf.getvalue().splitlines()
        sizes = [len(json.loads(x)['writes']) for x in lines]
        check(len(lines) == 2 and max(sizes) <= 50 and sum(sizes) == 65, f'big roster splits into batches of 50 or fewer (got {sizes})')
        check(json.loads(lines[-1])['writes'][-1]['doc_id'] == 'status', 'meta/status is the very last write')
        r = subprocess.run([sys.executable, str(ROOT / 'office_keeper.py'), '--dry'], capture_output=True, text=True, cwd='/')
        check(r.returncode == 0 and 'staff sessions on the Office' in r.stdout, 'office_keeper.py runs from any folder')
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def board_checks():
    board = ROOT / 'board'
    for name in ('decide-board.html', 'demo.html'):
        html = (board / name).read_text()
        check('{{' not in html, f'{name}: every template slot is filled')
        for i in ('ow-map', 'ow-refresh', 'ow-sheet', 'v-decide', 'v-talk', 'v-sessions'):
            check(f'id="{i}"' in html, f'{name}: has #{i}')
        scripts = [s.split('>', 1)[1].rsplit('</script', 1)[0] for s in html.split('<script')[1:]]
        node = shutil.which('node')
        if not node:
            print('skip node not installed, script syntax not checked')
            continue
        for k, js in enumerate(scripts):
            with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
                f.write('(async()=>{\n' + js + '\n})();')
            r = subprocess.run([node, '--check', f.name], capture_output=True, text=True)
            os.unlink(f.name)
            check(r.returncode == 0, f'{name}: script {k + 1} parses' + ('' if r.returncode == 0 else ': ' + r.stderr[:300]))
    # rebuilding from source gives the same files
    before = {n: (board / n).read_bytes() for n in ('decide-board.html', 'demo.html')}
    r = subprocess.run([sys.executable, str(ROOT / 'tools' / 'build_board.py')], capture_output=True, text=True)
    check(r.returncode == 0, 'tools/build_board.py runs')
    check(all((board / n).read_bytes() == b for n, b in before.items()), 'built pages match board/src')


if __name__ == '__main__':
    print('ai_office', ai_office.__version__, 'on Python', sys.version.split()[0])
    keeper_round_trip()
    board_checks()
    print('\nPASS' if not failures else f'\n{len(failures)} FAILED')
    sys.exit(1 if failures else 0)
