# @gameui/ui

## 0.3.0

### Minor Changes

- 0bcd7de: Add `HudLayer`, `HudSlot`, `TextField`, `Badge`, `Announcement`, `Kbd`, and toasts (`createToastManager`, `ToastRegion`) to `@gameui/ui/react`, and a new `@gameui/ui/input` entry.

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

## 0.2.0

### Minor Changes

- Add `Slider`, `Switch`, and `Tabs` to `@gameui/ui/react`, the first of the settings-and-menus set. All three are built on Base UI and styled with the semantic tokens, so they follow every theme.

  - `Slider`: a single-value range control with `onValueChange` while dragging and `onValueCommitted` once on release, for saving settings or playing a sample sound.
  - `Switch`: an on/off control; with `label`, the text is clickable too.
  - `Tabs`: data-driven sections (`tabs={[{ value, label, content }]}`), starting on the first enabled tab.

## 0.1.0

### Minor Changes

- f315084: Game UI now ships as one package, `@gameui/ui`, replacing `@gameui/core`, `@gameui/themes`, `@gameui/react`, and `@gameui/world-ui`.

  | Before                                         | After                                             |
  | ---------------------------------------------- | ------------------------------------------------- |
  | `@gameui/react`                                | `@gameui/ui/react`                                |
  | `@gameui/core`, `@gameui/world-ui`             | `@gameui/ui`                                      |
  | `@gameui/react/styles.css`                     | `@gameui/ui/styles.css`                           |
  | `@gameui/themes`                               | `@gameui/ui/themes.css`                           |
  | `@gameui/themes/{tokens,base,tailwind}.css`    | `@gameui/ui/{tokens,base,tailwind}.css`           |
  | `@gameui/themes/{arcade,tactical,playful}.css` | `@gameui/ui/themes/{arcade,tactical,playful}.css` |

  React is now an optional peer dependency, required only for `@gameui/ui/react`. The root entry loads no React, so canvas and three.js games can use tokens and world UI contracts without it.
