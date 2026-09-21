# @gameui/react

Screen-space React components for Game UI: Button, Panel, Modal, ProgressBar, Timer, PlayerList, and Scoreboard.

```tsx
import { Button, Panel } from "@gameui/react";

<Panel title="Paused" variant="raised">
  <Button onClick={resume}>Resume</Button>
</Panel>;
```

Import the component styles along with a theme. See the [styling contract](https://github.com/jurbank/game-ui/blob/master/packages/themes/README.md#styling-contract) for layer order and Tailwind usage.

```css
@import "@gameui/themes";
@import "@gameui/react/styles.css";
```

React 19 and React DOM 19 are peer dependencies. Components receive game state through props and never own global game state.

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

- Compose these before writing a new component. Change the look with `--game-*` token overrides, not raw colours or forked components.
- Components are controlled: pass game state through props and handle callbacks in game code. The game decides ranking, winners, thresholds, and lifecycle.
- UI attached to characters or world positions is not React: implement `@gameui/world-ui` contracts in the game's renderer.

The full agent guide is at `apps/website/src/content/docs/agent-guide/index.mdx` in the Game UI repository.

## Development

Components with complex interaction behavior are built on [Base UI](https://base-ui.com)'s unstyled primitives, which provide accessibility and keyboard behavior; this package supplies all styling. Base UI is an internal dependency: expose Game UI props rather than Base UI's API, and prefer native HTML where it is sufficient. See [behavior primitives](https://github.com/jurbank/game-ui/blob/master/ARCHITECTURE.md#behavior-primitives).

Component class strings live in `*.styles.ts` files. The build precompiles them with Tailwind CSS into `dist/styles.css`, without Tailwind's default theme, so only static utilities and semantic `game-*` utilities work. `tests/styles.test.ts` fails if any class generates no CSS. Use arbitrary values such as `leading-[1.2]` only for structural values that should not vary by theme.
