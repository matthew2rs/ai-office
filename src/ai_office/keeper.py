"""Office keeper: reads your Claude Code desktop sessions and prepares the Office update for the Decide board.

Who appears on the Office: every session whose title ends with " (Name)", for example "Meta ads (Rory)",
and that is not archived. The part before the brackets is the department. Titles starting "Old:" are skipped,
and so is the manager's own session (the page draws the manager walking around).

Why it never writes to the board itself (it writes only its own state folder): writing to an Artifact's database needs your approval in a live
Claude Code session. A background script can only ask for that and then stop. So the keeper reads and plans,
and the manager applies the plan with ArtifactData during its check-in, then checks it landed.

Check-in flow (the manager-checkin skill runs this):
  1. python3 office_keeper.py --plan            exit 0 = nothing changed. exit 3 = changes to apply.
  2. ArtifactData list sessions, and get meta/status. Paste both results into step 3.
  3. python3 office_keeper.py --batch -     prints the `writes` for ArtifactData batch (one line per batch of 50).
  4. ArtifactData get meta/status            read it back.
  5. python3 office_keeper.py --confirm -       VERIFIED (exit 0) or FAILED (exit 1, says why).
Other: --dry prints who is where, writes nothing.

Mac only: the session files live where the Claude desktop app keeps them. Standard library only.
"""
import glob
import json
import os
import re
import sys
import time

NEEDS_YOU = 'NEEDS YOU'
KIT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # the kit folder
BATCH_MAX = 50  # ArtifactData takes at most 50 writes per batch


def _env_path(name, default):
    return os.path.expanduser(os.environ.get(name) or default)


def settings():
    return {
        'sessions_dir': _env_path('AIO_SESSIONS_DIR', '~/Library/Application Support/Claude/claude-code-sessions'),
        'projects_dir': _env_path('AIO_PROJECTS_DIR', '~/.claude/projects'),
        'state_dir': _env_path('AIO_STATE_DIR', '~/.ai-office'),
        'people': _env_path('AIO_PEOPLE', os.path.join(KIT_DIR, 'people.json')),
        'manager': (os.environ.get('AIO_MANAGER') or 'Ada').strip(),
    }


def now_ms():
    fixed = os.environ.get('AIO_NOW_MS')
    return int(fixed) if fixed else int(time.time() * 1000)


def load_people(path):
    """Optional overrides: {"Rory": {"order": 1, "dept": "Meta ads"}}. Missing file = no overrides."""
    try:
        with open(path) as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def clean(t):
    t = re.sub(r'```.*?```', ' ', t, flags=re.S)
    t = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', t)
    t = re.sub(r'[`*_#>|]+', '', t)
    return re.sub(r'\s+', ' ', t).strip()


def last_turn(projects_dir, cli_id):
    """The last assistant text in a session's transcript, and what kind of entry came last."""
    if not cli_id:
        return None, None
    files = glob.glob(os.path.join(projects_dir, '*', f'{cli_id}.jsonl'))
    if not files:
        return None, None
    try:
        with open(files[0], 'rb') as f:
            f.seek(0, 2)
            size = f.tell()
            f.seek(max(0, size - 400_000))
            data = f.read().decode('utf8', 'ignore')
    except OSError:
        return None, None
    lines = data.split('\n')
    if size > 400_000:
        lines = lines[1:]  # the first line may be cut in half
    last_text, last_kind = None, None
    for line in lines:
        try:
            j = json.loads(line)
        except ValueError:
            continue
        kind = j.get('type')
        if kind == 'assistant':
            parts = j.get('message', {}).get('content', []) or []
            txt = ' '.join(p.get('text', '') for p in parts if isinstance(p, dict) and p.get('type') == 'text').strip()
            if txt:
                last_text = txt
            # a turn that ends on a tool call is still working (waiting on that tool)
            last_kind = 'tool' if any(isinstance(p, dict) and p.get('type') == 'tool_use' for p in parts) else 'assistant'
        elif kind == 'user':
            c = j.get('message', {}).get('content')
            is_result = isinstance(c, list) and c and isinstance(c[0], dict) and c[0].get('type') == 'tool_result'
            last_kind = 'tool_result' if is_result else 'user'
    return last_text, last_kind


def sentence(txt, limit=130):
    """The first sentence or two of a reply, short enough for a name tag."""
    if not txt:
        return ''
    out = ''
    for p in re.findall(r'.+?(?:[.!?](?=\s|$)|$)', clean(txt)):
        out = (out + ' ' + p).strip()
        if len(out) >= 35:
            break
    out = re.sub(r'[:\s]\s*\d+\.$', '.', out)
    if len(out) > limit:
        out = out[:limit].rsplit(' ', 1)[0] + '...'
    return out


TITLE = re.compile(r'^(.+?)\s*\(([A-Z][a-z]+(?: [A-Z0-9][A-Za-z0-9]*)?)\)\s*$')


def status_for(meta, text, kind, age_min):
    """The app writes no 'running' flag, so status is read from the last transcript entry and its age."""
    if meta.get('interruptedAwaitingPerson'):
        return NEEDS_YOU
    if age_min < 4 or (kind == 'tool' and age_min < 360) or (kind in ('tool_result', 'user') and age_min < 30):
        return 'BUILDING'
    if text and clean(text).rstrip(' .)"\'').endswith('?') and age_min < 720:
        return NEEDS_YOU
    if age_min < 180:
        return 'DONE'
    return 'IDLE'


def build(cfg=None):
    cfg = cfg or settings()
    people = load_people(cfg['people'])
    mgr = cfg['manager'].lower()
    docs, seen = [], {}
    for path in glob.glob(os.path.join(cfg['sessions_dir'], '*', '*', 'local_*.json')):
        try:
            with open(path) as f:
                meta = json.load(f)
        except (OSError, ValueError):
            continue
        if meta.get('isArchived'):
            continue
        title = meta.get('title') or ''
        if title.lower().startswith('old:'):
            continue
        m = TITLE.match(title)
        if not m:
            continue
        dept, name = m.group(1), m.group(2)
        if name.lower() == mgr or dept.lower().startswith('manager'):
            continue
        over = people.get(name, {}) if isinstance(people.get(name), dict) else {}
        text, kind = last_turn(cfg['projects_dir'], meta.get('cliSessionId'))
        last = int(meta.get('lastActivityAt') or 0)
        age_min = (now_ms() - last) / 60000 if last else 10 ** 9
        seen[name] = seen.get(name, 0) + 1
        shown = name if seen[name] == 1 else f'{name} {seen[name]}'
        iso = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(last / 1000)) if last else ''
        docs.append({'id': meta.get('sessionId') or os.path.basename(path)[:-5], 'session': title, 'name': shown,
                     'dept': over.get('dept', dept), 'status': status_for(meta, text, kind, age_min),
                     'latest': sentence(text) or 'Nothing reported yet.', 'ts': iso, 'order': int(over.get('order', 60))})
    docs.sort(key=lambda x: (x['order'], x['name']))
    return docs


def signature(docs):
    return json.dumps([(d['id'], d['status'], d['latest'], d['name'], d['dept']) for d in docs], sort_keys=True)


def _load(path, default):
    try:
        with open(path) as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def _save(path, obj):
    with open(path, 'w') as f:
        json.dump(obj, f, indent=1)


def versions(text):
    """{doc id: version} from pasted ArtifactData list/get output (both the saved-file listing and the inline form)."""
    v = {}
    for m in re.finditer(r'"([^"\n]+)"\s+\d+ bytes\s+version (\d+)', text):
        v[m.group(1)] = int(m.group(2))
    for m in re.finditer(r'"id":\s*"([^"]+)".{0,4000}?"version":\s*(\d+)', text, flags=re.S):
        v.setdefault(m.group(1), int(m.group(2)))
    return v


def status_line(docs):
    n = lambda k: sum(d['status'] == k for d in docs)
    line = f"{n('BUILDING')} working · {n('DONE')} on a break · {n('IDLE')} quiet"
    return (f"{n(NEEDS_YOU)} need{'s' if n(NEEDS_YOU) == 1 else ''} you · " + line) if n(NEEDS_YOU) else line


def cmd_plan(cfg):
    docs = build(cfg)
    os.makedirs(cfg['state_dir'], exist_ok=True)
    state = _load(os.path.join(cfg['state_dir'], 'state.json'), {})
    stamp = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(now_ms() / 1000))
    plan = {'docs': docs, 'line': status_line(docs), 'filled_at': stamp, 'sig': signature(docs)}
    if plan['sig'] == state.get('applied_sig'):
        print('NOTHING TO APPLY: the board already matches your staff sessions.')
        return 0
    _save(os.path.join(cfg['state_dir'], 'plan.json'), plan)
    print(f"NEEDS APPLY: {len(docs)} staff sessions. Next: ArtifactData list sessions and get meta/status, "
          f"then paste both results into: office_keeper.py --batch -")
    return 3


def cmd_batch(cfg, text):
    plan = _load(os.path.join(cfg['state_dir'], 'plan.json'), None)
    if not plan:
        print('No plan yet. Run --plan first.', file=sys.stderr)
        return 2
    ver = versions(text)
    writes, ids = [], {x['id'] for x in plan['docs']}
    for x in plan['docs']:
        w = {'op': 'set', 'collection': 'sessions', 'doc_id': x['id'], 'data': {k: v for k, v in x.items() if k != 'id'}}
        if x['id'] in ver:
            w['if_version'] = ver[x['id']]
        writes.append(w)
    for doc_id, n in ver.items():
        if doc_id != 'status' and doc_id not in ids:
            writes.append({'op': 'delete', 'collection': 'sessions', 'doc_id': doc_id, 'if_version': n})
    status = {'op': 'set' if 'status' not in ver else 'update', 'collection': 'meta', 'doc_id': 'status',
              'data': {'line': plan['line'], 'filled_at': plan['filled_at']}}
    if 'status' in ver:
        status['if_version'] = ver['status']
    writes.append(status)  # last, so meta/status only moves once everyone else has landed
    batches = [writes[i:i + BATCH_MAX] for i in range(0, len(writes), BATCH_MAX)]
    _save(os.path.join(cfg['state_dir'], 'batch.json'), {'batches': batches})
    if len(batches) > 1:
        print(f'{len(batches)} batches: run each line below as its own ArtifactData batch, in order.', file=sys.stderr)
    for b in batches:
        print(json.dumps({'writes': b}))
    return 0


def cmd_confirm(cfg, text):
    plan = _load(os.path.join(cfg['state_dir'], 'plan.json'), None)
    if not plan:
        print('FAILED: no plan.json. Run --plan first.', file=sys.stderr)
        return 1
    m = re.search(r'"filled_at"\s*:\s*"([^"]+)"', text)
    got = m.group(1) if m else None
    if got == plan['filled_at']:
        path = os.path.join(cfg['state_dir'], 'state.json')
        state = _load(path, {})
        state.update(applied_sig=plan['sig'], applied_at=plan['filled_at'])
        _save(path, state)
        print('VERIFIED: meta/status.filled_at =', plan['filled_at'])
        return 0
    print('FAILED: board filled_at =', got, '- expected', plan['filled_at'], '- the write did not land.', file=sys.stderr)
    return 1


def _read_src(src):
    return sys.stdin.read() if src == '-' else open(os.path.expanduser(src)).read()


USAGE = 'usage: python3 office_keeper.py [--plan | --dry | --batch FILE|- | --confirm FILE|-]'


def main(argv=None):
    args = list(sys.argv[1:] if argv is None else argv)
    cfg = settings()
    if '-h' in args or '--help' in args:
        print(USAGE)
        print(__doc__)
        return 0
    if '--dry' in args:
        docs = build(cfg)
        for d in docs:
            print(f"{d['status']:10} {d['name']:10} | {d['dept'][:28]:28} | {d['latest']}")
        print(len(docs), 'staff sessions on the Office')
        return 0
    for flag, fn in (('--batch', cmd_batch), ('--confirm', cmd_confirm)):
        if flag in args:
            i = args.index(flag)
            if i + 1 >= len(args):
                print(USAGE, file=sys.stderr)
                return 2
            return fn(cfg, _read_src(args[i + 1]))
    return cmd_plan(cfg)
