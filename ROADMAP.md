# Roadmap

## Next

- **Windows and Linux keeper.** Today the keeper reads the Claude desktop app's files on a Mac. A version that reads Claude Code's own transcripts alone (no desktop app) would work anywhere, with less status detail.
- **Room words in one place.** The words that pick each room live in `board/src/core.js`. Moving them into `meta/people` (or a new `meta/rooms` doc) would let you change rooms without rebuilding the page.
- **Card templates** for the common asks: spend approval, publish approval, pick one of N.

## Later

- A weekly digest card from the manager: what got decided, what's stalled, what each staff session shipped.
- Light and dark themes for the Office town (it's daytime only today).
- A "today" view: just the cards and the red people, nothing else.

## Limits on purpose

- **Nothing runs unattended against the board.** The keeper plans, the manager applies, a read-back confirms. Slower, but it never reports a write that didn't land.
- **A yes is never passed on.** Sessions must read their own card. This costs a few tokens and stops a whole class of mistakes.
- **No server.** Everything lives in one Artifact. That keeps it free and private, and means it can't do anything when your Mac is asleep.

## Blocked on Claude

- A public, documented way to read session status (running, waiting on a prompt). Until then status is inferred from transcripts and can lag.
