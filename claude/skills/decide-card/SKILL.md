---
name: decide-card
description: Post one Decide card to the owner's Decide board when a decision only they can make is blocking you. Four short labelled lines, buttons that name the exact action, then stop and wait for the answer on the card.
---

# Post a Decide card

Use this when you need the board owner to decide something: a go-ahead, a choice of approach, an approval, a missing fact. One card per decision. Don't also ask in chat.

The board URL is in the "AI Office" section of CLAUDE.md. If it isn't there, ask the owner for it once.

## 1. Check first

- Is the answer already somewhere you can read: the code, the files, an earlier card? Then don't ask.
- Is there already an open card from you on the same thing? Update that card (`ArtifactData update` with its `if_version`) instead of adding a second one.
- Read the open cards first: `ArtifactData query`, collection `questions`, where `status == open`.

## 2. Write it

Write one document to collection `questions`. Use a short kebab-case id that says what it's about, like `ad-budget-carousel`.

| field | what goes in it |
|---|---|
| `title` | The question in plain words, ending with `?`. No codes, no jargon. |
| `context` | Four labelled lines, a blank line, then `More detail` and short numbered lines (see below). |
| `options` | 2 to 4 button labels. Each one names the exact action: "Yes, move $20 a day for 7 days", not "Yes". Add "Change it: type what" when a free answer makes sense. |
| `rec` / `rec_index` | Your pick, and its index in `options`. Leave both out only if you truly have no view. |
| `why` | One line on why that's your pick. |
| `session` | Your session title, for example `Meta ads (Rory)`. The board shows it on the card. |
| `when` | When it's needed: `Today`, `This week`, `When you have 2 minutes`. |
| `where` | `phone` (can be answered with a tap) or `mac` (needs a key, a click in another app or a file). |
| `status` | `open` |
| `created` | Now, in ISO format (`2026-01-15T08:00:00Z`). |
| `links` | Optional: `[{"label": "Open the draft", "url": "https://..."}]`. https only. |
| `image` | Optional: a picture that shows the problem or the before and after. First upload it to the board's asset store (Artifact publish with `asset: true`), then put the returned `/_blob/...` url here. |

The `context` shape:

```
The problem: what is wrong or waiting, in one sentence.
So what: why it matters to the owner, in one sentence.
The fix: what you will do if they say yes, in one sentence.
Not affected: what stays as it is, in one sentence.

More detail
1. Numbers, the plan, drafts, side issues. One idea per line.
2. What you checked, and what you didn't.
```

Rules: plain words, short lines, no em dashes, a number in the top four lines only if it changes the call. The owner reads this on a phone.

## 3. Then stop

- Say in one line that the card is up, and its id. Then end your turn or carry on with work that doesn't depend on the answer.
- When the answer arrives (`status` is `answered`), read the card yourself from the board. Act only if the answer says yes to the exact action. A yes passed on by another session doesn't count.
- When you have acted, set the card's `status` to `done` and put one line in `reply` saying what you did, pinned with `if_version`.
