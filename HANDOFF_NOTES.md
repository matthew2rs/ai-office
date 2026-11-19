# Handoff notes

Honest state of the kit at version 1.0.0.

## What works

- **Board:** the same page has been running daily as the author's own board, with 25 to 35 staff sessions, for the Decide, List and Talk tabs. The Office tab (isometric town) went live on that board in November 2026.
- **Keeper:** the plan, batch, confirm flow has been run for real against a live board many times. Every write is version-pinned and read back.
- **Smoke test:** imports the package, runs the keeper on a fake set of session files (8 sessions covering staff, helpers, the manager, archived and retired ones) through plan, batch and confirm, and checks the built board pages. It passes with the network blocked.
- **Demo page:** renders all four tabs at phone width (390px) and on desktop with the made-up team.

## What's untested

- **The kit as a whole on a second person's machine.** Built from the author's working setup and cleaned. The first outside install is planned; this note changes when it's done.
- **The `manager-checkin` and `decide-card` skills as written here.** They are a clean rewrite of the rules the author's manager follows, not a copy of a file. Expect to tune the wording after a week of use.
- **Pinch-to-zoom on a real phone** for the Office (tested with a mouse and in a phone-width frame). On a phone a one-finger drag on the map moves the map; scroll the page by dragging outside it.
- **Battery use** of the Office over a long time on a phone.
- **More than about 40 staff** on the Office (the keeper splits writes into batches of 50; the drawing hasn't been tried past about 40 people).

## Changes from the original setup

- Status "NEEDS (owner's name)" became **"NEEDS YOU"**. Message role `from` uses **`owner`**.
- The Talk tab is **inside the page** (the original opened a separate app).
- The keeper takes its paths from environment variables, works without a people file, takes the manager's name from `AIO_MANAGER`, and creates `meta/status` if it doesn't exist yet. It also guards against a missing transcript id and a missing activity time.
- The room words (`CATS`) and the special props (stage, hi-vis, workbench) use generic words.
- Character presets tied to particular sessions were removed. Everyone's look comes from a hash of their id; only the manager has a fixed look (suit and glasses).

## Where to change things

| You want to | Change |
|---|---|
| Different rooms, or different words for a room | `CATS` in `board/src/core.js`, then rebuild |
| Room colours, floors, props | `STY`, `PROP` and `EXTRA` in `board/src/theme.js` |
| The town around the office | `W3`, `buildOuter` and `lifeItems` in `board/src/theme.js` |
| How status is worked out | `status_for` in `src/ai_office/keeper.py` |
| Who appears on the Office | `TITLE` and the skip rules in `build()` in `keeper.py` |
| Card rules | `claude/CLAUDE.md` section 3 and `claude/skills/decide-card/SKILL.md` |

## Open decisions

- Whether to ship the keeper as a `pip install`-able package. It's one file with no dependencies, so it's left as a folder for now.
- Whether the board should show staff who have no session file yet (for example, planned roles). Today it shows only what the keeper finds.

## Why it's built this way

- **Who uses it, when, on what:** one person running several Claude Code sessions on a Mac. They answer cards on a phone between other things, and glance at the Office on a laptop to see who's stuck.
- **What it replaces:** scrolling through session after session to find the one waiting on you, and saying "yes" in a chat that another session then acts on.
- **What breaks if it goes wrong:** a session acting on a yes that wasn't for it, or a board that says everyone is fine when the update never landed. That's why a session must read its own card, and why the Office update is read back before it counts.
- **Smallest version that proves it:** the Decide tab and the house rules on their own. The Office and the keeper are the second layer; skip them and the cards still work.
- **What already existed:** Claude Code's own session list, and its terminal "agent view", show sessions but not decisions waiting on you. Several open-source dashboards draw sessions as an office. None put a phone-first decision card, the "a card answer is a yes" rule and a manager loop together.
