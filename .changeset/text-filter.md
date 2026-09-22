---
"@gameui/ui": minor
---

Add `@gameui/ui/text`, a word filter for player-authored text such as display names, chat messages, and nameplates.

`createTextFilter({ words })` folds evasive spellings together before matching — case, accents, full-width forms, repeated letters (`shiiit`), digits and symbols for letters (`sh1t`, `a$$`), and separators inside a word (`a s s`) — and exempts an allow list so "Scunthorpe", "cockpit", and "analysis" stay clean. `matches` reports positions, `hasMatch` rejects input, and `clean` masks it. `match: "word"` (the default) suits chat; `match: "loose"` suits display names and clan tags.

The package ships no list of words to filter: `words` is required, because which words a game filters depends on its audience, rating, and languages. `defaultAllowList`, the list of words that must never be flagged, does ship and can be extended with `allow`.

The module uses no React, DOM, or engine, so the same filter runs in a client, a world renderer, and an authoritative server.
