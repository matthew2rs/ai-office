#!/usr/bin/env python3
"""Build the Decide board from board/src.

    python3 tools/build_board.py

Writes:
  board/decide-board.html  the page you publish as a claude.ai Artifact (needs the db and assets capabilities)
  board/demo.html          the same page with a fake in-memory database and a made-up team, to open in any browser

You only need this if you change the files in board/src. The built files are already in the kit.
Standard library only.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'board' / 'src'
OUT = ROOT / 'board'

# Every id the Office tab uses. They get an "ow-" prefix so they can't clash with the other tabs.
IDS = ['pulse', 'rnote', 'refresh', 'banners', 'stage', 'map', 'mini', 'zin', 'zout', 'zfit', 'hint', 'chips',
       'sheet', 's-sw', 's-nm', 's-dp', 's-do', 's-ts', 's-x', 's-fb']


def _need(text, part, where):
    if part not in text:
        sys.exit(f'build_board: could not find {part[:60]!r} in {where}. Was the file edited?')


def office_css(shell):
    """The Office styles from shell.html, scoped under .ow so they never touch the other tabs."""
    css = shell.split('<style>', 1)[1].split('</style>', 1)[0]
    _need(css, '.head{', 'shell.html')
    css = css[css.index('.head{'):]
    for i in IDS:
        css = re.sub(r'#' + re.escape(i) + r'\b', '#ow-' + i, css)

    def scope(sel):
        return ','.join('.ow ' + p.strip() for p in sel.split(','))

    out = []
    for line in css.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith('@media'):
            head, body = line.split('{', 1)
            rules = re.findall(r'([^{}]+)\{([^{}]*)\}', body[:-1])
            out.append(head + '{' + ''.join(scope(a) + '{' + b + '}' for a, b in rules) + '}')
        else:
            out.extend(scope(a) + '{' + b + '}' for a, b in re.findall(r'([^{}]+)\{([^{}]*)\}', line))
    head = ('/* Office tab: one town you can pan and zoom. Scoped to .ow so the other tabs are untouched. */\n'
            'body.wide .wrap{max-width:1100px}\nbody.wide .tabs{max-width:640px;width:100%}\n'
            '.ow{display:flex;flex-direction:column;gap:12px;min-width:0;--bad-bg:#fdecea}\n'
            '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ow{--bad-bg:#3a1b19}}\n'
            ':root[data-theme="dark"] .ow{--bad-bg:#3a1b19}\n')
    return head + '\n'.join(out) + '\n'


def office_html(shell):
    body = shell.split('<div class="wrap">', 1)[1]
    _need(body, '<div><h1>Office</h1><p class="pulse" id="pulse">Loading…</p></div>', 'shell.html')
    body = body.replace('<div><h1>Office</h1><p class="pulse" id="pulse">Loading…</p></div>',
                        '<p class="pulse" id="pulse">Loading…</p>', 1)
    body = body.replace('<div class="dp" id="s-ts"></div>', '<div class="dp" id="s-ts"></div><div id="s-fb"></div>', 1)
    for i in IDS:
        body = body.replace('id="' + i + '"', 'id="ow-' + i + '"')
    body = body.replace('class="head"', 'class="ow-head head"')
    return '<section id="v-office" class="ow" hidden>\n<div>' + body.rstrip() + '\n</section>'


def office_js():
    theme = (SRC / 'theme.js').read_text().replace('/*CHUNK*/', (SRC / 'chunk3d.js').read_text())
    return theme + '\n' + (SRC / 'core.js').read_text().rstrip() + '\n'


FAKE_DB = r"""<script>
/* Demo only: a tiny in-memory stand-in for the Artifact database, so the page runs from a file. */
(function(){
const DATA=__DEMO__;
const store={};const subs={};
const key=(c,i)=>c+'/'+i;
for(const[c,docs]of Object.entries(DATA))for(const[i,v]of Object.entries(docs))store[key(c,i)]=JSON.parse(JSON.stringify(v));
const snap=c=>({docs:Object.keys(store).filter(k=>k.startsWith(c+'/')&&k.split('/').length===2).map(k=>({id:k.split('/')[1],data:()=>store[k]}))});
const fire=c=>(subs[c]||[]).forEach(f=>setTimeout(()=>f(snap(c)),0));
const docRef=(c,i)=>({onSnapshot:(cb)=>{(subs[key(c,i)]=subs[key(c,i)]||[]).push(cb);setTimeout(()=>cb({data:()=>store[key(c,i)]}),0);return()=>{}},
 set:async v=>{store[key(c,i)]=v;fire(c);(subs[key(c,i)]||[]).forEach(f=>f({data:()=>store[key(c,i)]}))},
 update:async v=>{store[key(c,i)]=Object.assign(store[key(c,i)]||{},v);fire(c)},get:async()=>({data:()=>store[key(c,i)]})});
const sorted=(c,f,dir)=>{const s=snap(c);s.docs.sort((a,b)=>String(a.data()[f]).localeCompare(String(b.data()[f]))*(dir==='desc'?-1:1));return s};
const ordered=(c,f,dir)=>({limit:()=>ordered(c,f,dir),onSnapshot:(cb)=>{(subs[c]=subs[c]||[]).push(()=>cb(sorted(c,f,dir)));setTimeout(()=>cb(sorted(c,f,dir)),0);return()=>{}}});
const col=c=>({orderBy:(f,dir)=>ordered(c,f,dir),onSnapshot:(cb)=>{(subs[c]=subs[c]||[]).push(cb);setTimeout(()=>cb(snap(c)),0);return()=>{}},
 doc:i=>docRef(c,i),add:async v=>{const i='d'+Date.now()+Math.random().toString(36).slice(2,6);store[key(c,i)]=v;fire(c);return{id:i}}});
window.claude={use:async n=>n==='db'?{collection:col,doc:p=>{const[c,i]=p.split('/');return docRef(c,i)}}:null};
})();
</script>"""


def main():
    shell = (SRC / 'shell.html').read_text()
    page = (SRC / 'page.html').read_text()
    for slot in ('{{OFFICE_CSS}}', '{{OFFICE_HTML}}', '{{OFFICE_JS}}'):
        _need(page, slot, 'page.html')
    page = (page.replace('{{OFFICE_CSS}}', office_css(shell))
                .replace('{{OFFICE_HTML}}', office_html(shell))
                .replace('{{OFFICE_JS}}', office_js()))
    (OUT / 'decide-board.html').write_text(page)

    demo = json.loads((SRC / 'demo_data.json').read_text())
    fake = FAKE_DB.replace('__DEMO__', json.dumps(demo))
    banner = ('<div style="background:#1f5f8b;color:#fff;font:14px Inter,system-ui,sans-serif;padding:8px 14px;text-align:center">'
              'Demo with a made-up team. Nothing you do here is saved.</div>')
    _need(page, '<body>', 'decide-board.html')
    demo_page = page.replace('<body>', '<body>' + fake + banner, 1)
    (OUT / 'demo.html').write_text(demo_page)
    print('built', OUT / 'decide-board.html', 'and', OUT / 'demo.html')


if __name__ == '__main__':
    main()
