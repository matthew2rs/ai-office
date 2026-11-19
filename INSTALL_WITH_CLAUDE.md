# Install AI Office (instructions for Claude)

The person you're working with wants AI Office set up. They may not be technical: explain each step in one plain sentence, do the work yourself, and ask them only for what you can't do (a name, a click on Allow, opening a link on their phone). Never ask them to type commands.

The kit folder is the folder this file is in. Call it KIT below.

## 1. Check the basics

- Run `python3 --version`. It needs 3.9 or newer. If it's missing, tell them macOS will offer to install developer tools, and run `xcode-select --install` with their OK.
- Check that you have the `Artifact` and `ArtifactData` tools. If you don't, stop and tell them: "Your Claude plan or app version can't publish boards from Claude Code yet, so AI Office can't be set up here."
- Run `python3 KIT/tests/smoke_test.py`. It must end with PASS.

## 2. Make their board

1. Ask: "What name should the board call you?" and "What should your manager be called? (Ada is the default.)"
2. Publish `KIT/board/decide-board.html` as a new Artifact with the capabilities `db` and `assets` and icon `check`. (Load any skill the Artifact tool asks for first.)
3. Write the document `people` in collection `meta`: `{"owner": {"name": <their name>}, "manager": {"name": <manager name>}}`.
4. Post a welcome card so the board isn't empty: write document `welcome` in collection `questions` with
   `title` "Welcome to your Decide board. Try a tap?", `session` "Setup", `when` "Now", `where` "phone", `status` "open", `created` (now, ISO),
   `context` "The problem: nothing yet, this is a practice card.\nSo what: this is how every session will ask you things.\nThe fix: tap the answer below.\nNot affected: nothing changes when you tap.",
   `options` ["Got it"], `rec` "Got it", `rec_index` 0.
5. Give them the link. Ask them to open it on their phone (signed in to claude.ai), tap "Got it", and pin the page.

## 3. Install the rules and skills

1. Tell them exactly what this step changes outside the kit folder: two skills added to `~/.claude/skills/`, a new file `~/.claude/ai-office-rules.md`, and one line added to `~/.claude/CLAUDE.md`. Wait for their yes. Then run `bash KIT/install.sh`. It copies the two skills into `~/.claude/skills/` and the house rules into `~/.claude/ai-office-rules.md`.
2. Fill in the `FILL IN` lines left in `~/.claude/ai-office-rules.md` (install.sh already filled in the kit folder): the board link, and their name. Ask whether the manager may archive finished one-job sessions by itself (default no) and set that line.
3. Add one line to `~/.claude/CLAUDE.md` (create it if it doesn't exist): `@~/.claude/ai-office-rules.md`. Tell them: "Every Claude Code session will now follow the AI Office rules. Sessions already open pick them up when you start a new one."

## 4. Name their sessions

1. Run `python3 KIT/office_keeper.py --dry`. It lists sessions already titled `Job (Name)`. If it finds 0, say so plainly: the Office stays empty until at least one session has a name in brackets.
2. Explain the rule in two lines: long-running sessions get a name in brackets, for example `Meta ads (Rory)`. One-off jobs keep a plain title.
3. Offer to suggest names for their current sessions. They rename them in the sidebar (right-click, Rename). You can't rename them for them unless you have a session-title tool; if you do, ask before using it.

## 5. Start the manager

1. Tell them to start a new Claude Code session in KIT, title it `Manager (<manager name>)`, and paste: "You're my manager. Read the AI Office rules, then run /manager-checkin once." The Office on the board fills in after this first check-in.
2. When that check-in has worked, they can put it on a timer: "/loop 3h /manager-checkin". Say it uses some of their Claude usage each time, and only runs while the app is open and the Mac is awake.
3. Tell them what they'll be asked to approve, in plain words:
   - "Allow Claude to write to your board": click Allow (choose "always" for this session if offered).
   - "Allow running office_keeper.py": click Allow. It only reads files on this Mac.
4. Tell them how to stop it: close the manager session, or tell it "stop the loop".

## 6. Finish

Say, in four short lines: where the board is, who the manager is, how a session asks them something (a card on the board), and what you didn't set up or check.
