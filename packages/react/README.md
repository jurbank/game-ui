# @game-ui/react

Screen-space React components for Game UI: Button, Panel, and Modal.

```tsx
import { Button, Panel } from "@game-ui/react";

<Panel title="Paused" variant="raised">
  <Button onClick={resume}>Resume</Button>
</Panel>;
```

Import the component styles along with a theme. See the [styling contract](../themes/README.md#styling-contract) for layer order and Tailwind usage.

```css
@import "@game-ui/themes";
@import "@game-ui/react/styles.css";
```

React 19 and React DOM 19 are peer dependencies. Components receive game state through props and never own global game state.

## Development

Components with complex interaction behavior are built on [Base UI](https://base-ui.com)'s unstyled primitives, which provide accessibility and keyboard behavior; this package supplies all styling. Base UI is an internal dependency: expose Game UI props rather than Base UI's API, and prefer native HTML where it is sufficient. See [behavior primitives](../../ARCHITECTURE.md#behavior-primitives).

Component class strings live in `*.styles.ts` files. The build precompiles them with Tailwind CSS into `dist/styles.css`, without Tailwind's default theme, so only static utilities and semantic `game-*` utilities work. `tests/styles.test.ts` fails if any class generates no CSS. Use arbitrary values such as `leading-[1.2]` only for structural values that should not vary by theme.
