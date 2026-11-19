# Setting up AI Office

## The easy way: let Claude set it up (about 10 minutes)

1. **Get the kit onto your Mac.** Download the zip, double-click it to unzip, and drag the unzipped folder into your **home folder** and rename it `ai-office-kit` (GitHub calls it `ai-office-main`) (in Finder: Go menu, Home). Your home folder is the one with your name, holding Desktop, Documents and Downloads.
2. **Open it in Claude Code.** In the Claude desktop app, open the **Code** tab, start a new session and choose the `ai-office-kit` folder as the folder to work in.
3. **Paste this:**

   > Read INSTALL_WITH_CLAUDE.md and set up AI Office for me.

4. Claude asks you two names, publishes your board, installs the rules and skills, and tells you when to click **Allow**. It never asks you to type commands.

The rest of this page is the same setup done by hand, plus settings and troubleshooting.

---

## The manual way

About 20 minutes. You need:

- A Mac with the **Claude desktop app**, using **Claude Code** (the Code tab).
- A **claude.ai account** where Claude Code can publish Artifacts. If the `Artifact` and `ArtifactData` tools don't appear in your Claude Code session, this kit can't work yet on your plan.
- **Python 3.9 or newer** (`python3 --version`). macOS ships one with the developer tools: run `xcode-select --install` if `python3` is missing.
- Optional: **Node.js** (only the smoke test uses it, to check the board's scripts parse).

Tested on Python 3.14 in a clean virtualenv. There are no Python packages to install: the keeper uses the standard library only.

Put the kit folder at `~/ai-office-kit` (your home folder). Every command below uses that path; if you put it elsewhere, change `~/ai-office-kit` in the commands and tell your manager where it is.

---

## Step 1. Look at the demo (1 minute)

Open `board/demo.html` in Chrome or Safari. It's the real page with a fake database and a made-up team. Click a card button, open the Office tab, tap a person, send a Talk message. Nothing is saved.

## Step 2. Publish your board (3 minutes)

In any Claude Code session, open the kit folder and say:

> Publish `board/decide-board.html` as a new Artifact with the capabilities `db` and `assets`. Icon: `check`.

Claude publishes it and gives you a link like `https://claude.ai/artifact/AbC123...`. That's your board. If Claude says it needs to load a skill about artifact capabilities first, let it.

**Check it works:** open the link. You should see "Decide" with four tabs, and "Nothing waiting on you right now." Open it on your phone too (sign in to claude.ai in the phone's browser).

- **It's private.** Only you can open it, from any device where you're signed in to claude.ai. That includes your phone's browser.
- **Pin it** so it's one tap away: ask Claude to pin it, or use the pin in the claude.ai sidebar.
- **Don't share the link with your team** unless you mean to. Anyone you share it with can answer your cards.

### Name yourself and your manager (optional)

The board says "You" and "Ada" until you tell it otherwise. In Claude Code:

> Set the document `people` in collection `meta` on my board to `{"owner": {"name": "Sam"}, "manager": {"name": "Ada"}}`.

You can add a picture with `"pic": "https://..."` or an emoji with `"emoji": "🦊"` on either.

## Step 3. Add the house rules (3 minutes)

The quickest way is `bash ~/ai-office-kit/install.sh` (it also does step 4), then add the line it prints to `~/.claude/CLAUDE.md`. By hand:


1. Open `claude/CLAUDE.md` from the kit.
2. Copy all of it into your own `CLAUDE.md` (it's a hidden folder: in Finder press Cmd+Shift+. to show it). Use `~/.claude/CLAUDE.md` to apply it to every project, or a project's `CLAUDE.md` to apply it to one.
3. Fill in the `FILL IN` lines: your board link from step 2, your name, and where you put the kit folder. **Don't skip this:** every session, including the manager, finds the board through that line.
4. Sessions read `CLAUDE.md` when they start, so sessions that were already open won't follow the rules until you start a new one or tell them to re-read it.

## Step 4. Install the two skills (1 minute)

```bash
mkdir -p ~/.claude/skills
```

```bash
cp -R ~/ai-office-kit/claude/skills/manager-checkin ~/.claude/skills/
```

```bash
cp -R ~/ai-office-kit/claude/skills/decide-card ~/.claude/skills/
```

Start a new Claude Code session and type `/` to check that `manager-checkin` and `decide-card` are listed.

## Step 5. Name your sessions (5 minutes)

In the Claude desktop app, rename (right-click a session in the sidebar, Rename):

- Each **long-running** session to `Job (Name)`. One capitalised first name in brackets at the end:
  - `Meta ads (Rory)`
  - `Website (Theo)`
  - `Bookkeeping (Ravi)`
  - Two people with the same name are fine. The second shows as `Rory 2`.
- **One-off** sessions after the job, with no name: `Fix checkout footer`.
- **Finished** staff you want off the Office: `Old: Meta ads (Rory)`, or archive them.

The part before the brackets decides the room. "Meta ads" and "Google ads" go to Ads, "Website" and "SEO blog" to Web & Search, "Bookkeeping" and "Payroll" to Finance, and so on. Anything that matches nothing goes to Front office. The words for each room are in `board/src/core.js` (`CATS`) if you want to change them.

## Step 6. Start your manager (5 minutes)

1. Start a new Claude Code session in the kit folder (or in your main project) and title it `Manager (Ada)`, using your manager's name.
2. Tell it: *"You're my manager. Read the AI Office section of CLAUDE.md, then run /manager-checkin."*
3. The first check-in asks for permission to write to your board (`ArtifactData`). Allow it. It will also ask to run `office_keeper.py`.
4. When one check-in has worked, put it on a timer: `/loop 3h /manager-checkin` (or `1h` for more often; each check-in uses some of your Claude usage). The loop lives in that one manager session: keep it open (don't archive it), with the app open and the Mac awake.

### Check the keeper first

Before the first check-in, run this in Terminal:

```bash
python3 ~/ai-office-kit/office_keeper.py --dry
```

It prints every staff session it found, with its status, room and latest line, and reads files only. If it says `0 staff sessions`, either no session title ends in ` (Name)` yet (step 5), or the app keeps its files somewhere else (see Settings: `AIO_SESSIONS_DIR`).

## Step 7. Use it

- Sessions post cards with the `decide-card` skill when they need you. Answer on your phone.
- The red banner on the Office tab shows who needs you. Tap it to fly there.
- **Refresh** on the Office tab leaves a note for the manager. The Office updates at its next check-in, and the button says "Updated" with the time.
- **Talk** goes to the manager. Use it for oversight: "who owns X", "start a session for Y", "what's stuck".

---

## Settings

Everything has a sensible default. Set these only if you need to (environment variables win over defaults):

| Variable | Default | What it's for |
|---|---|---|
| `AIO_SESSIONS_DIR` | `~/Library/Application Support/Claude/claude-code-sessions` | Where the desktop app keeps session records |
| `AIO_PROJECTS_DIR` | `~/.claude/projects` | Where Claude Code keeps transcripts |
| `AIO_STATE_DIR` | `~/.ai-office` | The keeper's own plan and state files |
| `AIO_PEOPLE` | `people.json` in the kit folder | Optional overrides (see below) |
| `AIO_MANAGER` | `Ada` | Your manager's name; its session is left off the desks |

`people.json` is optional. Copy `people.example.json` to `people.json` in the kit folder and edit it to set the order people are listed in, or to override a department:

```json
{ "Rory": {"order": 1}, "Juno": {"order": 2, "dept": "Google ads"} }
```

## How status is worked out

The app doesn't record "running", so the keeper reads each session's last transcript entry and how long ago it was:

| Status on the board | When |
|---|---|
| **Needs you** (red) | The app shows the session waiting on you, or its last reply ends with a question (within 12 hours) |
| **Working** (blue) | Active in the last 4 minutes, or waiting on a long tool run (up to 6 hours), or on an unanswered message (30 minutes) |
| **On a break** (green) | Finished within the last 3 hours. Up to 6 people show in the lounge; the rest stay at their desks |
| **Quiet** (grey) | Everything else |

## Gotchas

- **The Office stopped updating?** Open the manager session: it's probably waiting for you to click Allow on a write to your board. Choose "always allow" for that session if it's offered.

- **The keeper is Mac-only and reads app internals.** The session file locations and fields are not a public API. If an app update moves them, `--dry` will show 0 sessions. Check `AIO_SESSIONS_DIR` first.
- **A session stuck on a permission prompt looks like a long job** (Working) until it times out. That's a limit of reading files.
- **Big teams:** ArtifactData takes up to 50 writes per batch. With more than about 45 staff the keeper prints two or more batches; the manager runs them in order.
- **ArtifactData writes ask for approval.** The first time, allow them for the manager session. A background `claude -p` can't answer that prompt, which is why the keeper only plans and the manager applies.
- **Never paste a card's yes into another session as permission.** The house rules require each session to read its card itself. This is on purpose.
- **Phone access** is through claude.ai in your phone's browser (or the Claude app's artifact view), signed in to the same account.
- **Time zones:** times show in the device's own time zone. The keeper stores UTC.
- **Reduced motion:** if your device asks for reduced motion, nobody walks and the cars stop. That's on purpose.

## Updating the board later

Edit files in `board/src/`, run `python3 tools/build_board.py`, then ask Claude Code to publish `board/decide-board.html` **to your existing board URL** (so the link and your data stay). It keeps your cards, people and messages, which live in the board's database, not in the page.

## Uninstall

Delete the two skills from `~/.claude/skills/`, remove the AI Office block from `CLAUDE.md`, delete `~/.ai-office/`, and delete the Artifact from claude.ai if you want the data gone.
