# @gameui/ui

Themeable UI for browser games: semantic design tokens and starting themes, screen-space React components, and engine-independent contracts for world UI your game draws itself.

```bash
pnpm add @gameui/ui react react-dom
```

```tsx
import { Button, Panel } from "@gameui/ui/react";

<Panel title="Paused" variant="raised">
  <Button onClick={resume}>Resume</Button>
</Panel>;
```

```css
@import "@gameui/ui/themes.css";
@import "@gameui/ui/styles.css";
```

## Entry points

| Import                           | Contents                                                                                                                                     | Loads React |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `@gameui/ui/react`               | Button, Panel, Modal, ProgressBar, Timer, PlayerList, Scoreboard, Slider, Switch, Tabs, HudLayer, TextField, Badge, Announcement, Toast, Kbd | Yes         |
| `@gameui/ui`                     | Token names and helpers; type-only world UI contracts                                                                                        | No          |
| `@gameui/ui/input`               | Keyboard ownership between the game and focused HUD controls                                                                                 | No          |
| `@gameui/ui/styles.css`          | Precompiled component styles for `@gameui/ui/react`                                                                                          | No          |
| `@gameui/ui/themes.css`          | Default tokens, base styles, and every starting theme                                                                                        | No          |
| `@gameui/ui/tokens.css`          | Neutral default value for every token on `:root`                                                                                             | No          |
| `@gameui/ui/base.css`            | Text color and font for themed regions; reduced-motion handling                                                                              | No          |
| `@gameui/ui/themes/arcade.css`   | Arcade theme, scoped to `[data-game-theme="arcade"]`                                                                                         | No          |
| `@gameui/ui/themes/tactical.css` | Tactical theme, scoped to `[data-game-theme="tactical"]`                                                                                     | No          |
| `@gameui/ui/themes/playful.css`  | Playful theme, scoped to `[data-game-theme="playful"]`                                                                                       | No          |
| `@gameui/ui/tailwind.css`        | Tailwind v4 `@theme` mapping from utilities to tokens                                                                                        | No          |

React 19 and React DOM 19 are optional peer dependencies, needed only for `@gameui/ui/react`. A game without React screen UI, such as a canvas or three.js game, can use `@gameui/ui` and the theme CSS alone. To load only the themes a game uses, combine `tokens.css`, `base.css`, and individual theme files instead of `themes.css`.

## Styling contract

### Cascade layers and import order

All framework CSS lives in the `game-ui` cascade layer, with the sublayers `game-ui.tokens`, `game-ui.themes`, `game-ui.base`, and `game-ui.components`. Declare where `game-ui` sits with one `@layer` statement at the top of your stylesheet: **after resets, before utilities**. Unlayered CSS beats all layered CSS, so your own styles and token overrides always win.

With Tailwind CSS v4:

```css
@layer theme, base, game-ui, components, utilities;

@import "tailwindcss";
@import "@gameui/ui/themes.css";
@import "@gameui/ui/styles.css";
@import "@gameui/ui/tailwind.css";

/* game styles and token overrides */
```

This places Game UI above Tailwind's Preflight reset, which would otherwise reset button fonts, padding, and backgrounds, and below Tailwind utilities, so utilities passed through `className` override component styles.

Without Tailwind:

```css
@import "@gameui/ui/themes.css";
@import "@gameui/ui/styles.css";

/* game styles and token overrides */
```

If you use another layered reset or framework, list its layers before `game-ui`, for example `@layer starlight, game-ui;`. An unlayered reset beats every layer, so import it into a layer first: `@import "modern-normalize" layer(reset);` with `@layer reset, game-ui;`.

### Selecting a theme

Themes apply to an element with `data-game-theme` and everything inside it:

```html
<html data-game-theme="arcade"></html>
```

Without a theme attribute, components use the neutral defaults from `tokens.css`. A theme can also be applied to a single region, such as a preview panel.

### Overriding tokens

Override `--game-*` variables in unlayered CSS. Because framework CSS is layered, overrides win regardless of selector specificity:

```css
[data-game-theme="arcade"] {
  --game-primary: #7cf29a;
  --game-primary-contrast: #062611;
}

.boss-fight {
  --game-danger: #ff2a00;
}
```

When changing a color that text sits on, update its `-contrast` partner too.

### Using tokens

With Tailwind, use the mapped utilities, such as `bg-game-panel`, `text-game-text`, `border-game-border`, `rounded-game-md`, `shadow-game`, `p-game-md`, `font-game-display`, `text-game-lg`, and `ease-game`. Tokens without a Tailwind namespace use variable shorthand, such as `border-(length:--game-border-width)` and `duration-(--game-duration-fast)`.

Without Tailwind, reference variables directly (`var(--game-panel)`), or use `tokenVar("panel")` from `@gameui/ui`:

```ts
import { tokenVar } from "@gameui/ui";

tokenVar("primary"); // "var(--game-primary)"
```

The mapping uses `@theme inline`, so utilities read the `--game-*` variables on the element itself. This is what lets a theme or override on any ancestor restyle the utilities inside it.

### Token reference

| Category   | Tokens                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color      | `bg`, `surface`, `panel`, `primary`, `primary-contrast`, `secondary`, `secondary-contrast`, `danger`, `danger-contrast`, `success`, `warning`, `text`, `text-muted`, `border`, `focus-ring` |
| Typography | `font-body`, `font-display`, `font-size-sm`, `font-size-md`, `font-size-lg`, `font-size-xl`                                                                                                 |
| Shape      | `radius-sm`, `radius-md`, `radius-lg`, `border-width`, `shadow`                                                                                                                             |
| Spacing    | `space-xs`, `space-sm`, `space-md`, `space-lg`, `space-xl`                                                                                                                                  |
| Motion     | `duration-fast`, `duration-normal`, `ease`                                                                                                                                                  |

Durations are set to `0ms` when the user prefers reduced motion.

## World UI contracts

TypeScript contracts for game-owned FloatingLabel, Nameplate, and HealthBar implementations. No renderer, React, DOM, engine, state library, runtime validation, or update loop. Use `import type`.

```ts
import type { HealthBar } from "@gameui/ui";

const health: HealthBar<"2d"> = {
  kind: "health-bar",
  id: "health:pilot",
  anchor: { kind: "entity", dimension: "2d", entityId: "pilot" },
  offset: { space: "screen", x: 0, y: -24 },
  label: "Pilot health",
  value: 42,
  max: 100,
  tone: "warning",
};
```

Public types and defaults are in [src/world/index.ts](https://github.com/jurbank/game-ui/blob/master/packages/ui/src/world/index.ts). The [full specification](https://github.com/jurbank/game-ui/blob/master/apps/website/src/content/docs/world-ui/contracts.mdx) covers units, required behavior, unsupported options, semantic roles, accessibility, and disposal.

- [Canvas reference game](https://github.com/jurbank/game-ui/tree/master/apps/website/src/components/examples/world-game/): game-owned 2D implementation, not exported by this package.
- [State/presentation integration](https://github.com/jurbank/game-ui/blob/master/apps/website/src/content/docs/world-ui/integration.mdx): game-owned Zustand bindings and theme mapping.
- [3D recipe](https://github.com/jurbank/game-ui/blob/master/apps/website/src/content/docs/world-ui/3d-recipe.mdx): guidance, not a tested engine integration.

## For coding agents

Before creating screen UI, map the need to an existing component and check its variants:

| Need                        | Component                                                 |
| --------------------------- | --------------------------------------------------------- |
| Action or toggle            | `Button` (`primary`, `secondary`, `danger`)               |
| HUD section, menu, card     | `Panel` (`default`, `raised`, `inset`)                    |
| Pause, confirm, results     | `Modal` (`dismissible={false}` to force a choice)         |
| Health, shield, XP, loading | `ProgressBar` (`primary`, `success`, `warning`, `danger`) |
| Match clock, cooldown       | `Timer`, fed from the game's clock                        |
| Roster, party, ready check  | `PlayerList`, row controls in `actions`                   |
| Standings, results          | `Scoreboard`, extra stats in `columns`                    |
| Volume, sensitivity, FOV    | `Slider`; save in `onValueCommitted`                      |
| On/off setting              | `Switch` (in-match toggles use `Button aria-pressed`)     |
| Sections of a screen        | `Tabs`                                                    |
| Placing HUD over the game   | `HudLayer` + `HudSlot`, not hand-written positioning      |
| Name, room code, chat       | `TextField`; validation in game code, passed as `error`   |
| Role or status label        | `Badge` (roster rows use their own `status`)              |
| Countdown, "Go!", round end | `Announcement` in a `center` HudSlot                      |
| Joins, pickups, notices     | `createToastManager()` + `ToastRegion`                    |
| Key hints                   | `Kbd`, one per key                                        |
| Game keys vs HUD focus      | `uiOwnsKeyboard`, `releaseFocusOnGameKeys` (`/input`)     |

- Compose these before writing a new component. Change the look with `--game-*` token overrides, not raw colours or forked components.
- Components are controlled: pass game state through props and handle callbacks in game code. The game decides ranking, winners, thresholds, and lifecycle.
- UI attached to characters or world positions is not React: implement the world UI contracts in the game's renderer.
- World contracts are types, not components. Use Nameplate for names/status/selection above characters, HealthBar for entity health, and FloatingLabel for place names and short-lived world text such as damage numbers (`lifetimeMs`, a new `id` per event).
- Keep one game-owned value for anything shown in both layers, such as health in a HealthBar and a screen ProgressBar.
- Reject optional world capabilities your renderer doesn't support (`occlusion: "hide"`, `maxDistance`, 3D anchors) with an error at creation. Never ignore them silently.
- Resolve theme tokens at startup and on theme change, never per frame. World text is invisible to assistive technology, so mirror important information in screen UI.

The full agent guide is at `apps/website/src/content/docs/agent-guide/index.mdx` in the Game UI repository.

## Development

Source is split into modules: `src/tokens`, `src/world`, and `src/css` are renderer-free and make up the root entry; `src/react` holds the components. `tools/workspace-checks` fails if a renderer-free module imports React, Base UI, or anything under `src/react`.

Components with complex interaction behavior are built on [Base UI](https://base-ui.com)'s unstyled primitives, which provide accessibility and keyboard behavior; this package supplies all styling. Base UI is an internal dependency: expose Game UI props rather than Base UI's API, and prefer native HTML where it is sufficient. See [behavior primitives](https://github.com/jurbank/game-ui/blob/master/ARCHITECTURE.md#behavior-primitives).

Component class strings live in `*.styles.ts` files. The build precompiles them with Tailwind CSS into `dist/styles.css`, without Tailwind's default theme, so only static utilities and semantic `game-*` utilities work. `tests/styles.test.ts` fails if any class generates no CSS. Use arbitrary values such as `leading-[1.2]` only for structural values that should not vary by theme.

### Adding a theme

1. Add `src/css/themes/<name>.css` defining every token inside `@layer game-ui.themes` and `[data-game-theme="<name>"]`.
2. Export it as `./themes/<name>.css` in both `exports` and `publishConfig.exports`, and import it from `src/css/index.css`.
3. Run `vp test`. The tests verify that every theme defines exactly the token contract, is exported and bundled, and meets 4.5:1 contrast for text and `-contrast` pairs.
