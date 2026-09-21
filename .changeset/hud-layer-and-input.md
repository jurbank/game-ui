---
"@gameui/ui": minor
---

Add `HudLayer`, `HudSlot`, `TextField`, `Badge`, `Announcement`, `Kbd`, and toasts (`createToastManager`, `ToastRegion`) to `@gameui/ui/react`, and a new `@gameui/ui/input` entry.

- `HudLayer` covers the viewport (or a positioned container) with nine anchored slots for HUD content. Empty areas pass the pointer through to the game; insets respect device safe areas.
- `@gameui/ui/input` decides whether the game or focused UI owns the keyboard: `uiOwnsKeyboard()` for gating game input, and `releaseFocusOnGameKeys()` so game keys do not also press the last clicked HUD button. DOM only, no React.
- `TextField`: a labelled text input on Base UI Field. The game owns validation and passes `error`, which marks the field invalid and announces the message.
- `Badge`: a small tone-coloured label for roles and statuses, with an optional dot for live states.
- `Announcement`: a big centered message for match moments such as countdowns and "Go!", in an always-mounted live region that never takes the pointer.
- `createToastManager()` and `ToastRegion`: short-lived event messages posted from anywhere in game code, including outside React.
- `Kbd`: a key cap for control hints.

Fixes:

- `Modal`, `ProgressBar`, `Slider`, and `TextField` now size with `box-sizing: border-box`. In pages without a CSS reset, their full-width parts overflowed their container by their border and padding, and a `Modal` could overflow a phone screen.
- `Scoreboard` no longer overflows a narrow container: the name column shrinks and truncates long names, header included, so score and status columns stay visible.
