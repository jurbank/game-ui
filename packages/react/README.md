# @game-ui/react

Screen-space React components for Game UI: Button and Panel.

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

React 19 is a peer dependency. Components receive game state through props and never own global game state.

## Development

Component class strings live in `*.styles.ts` files. The build precompiles them with Tailwind CSS into `dist/styles.css`, without Tailwind's default theme, so only static utilities and semantic `game-*` utilities work. `tests/styles.test.ts` fails if any class generates no CSS. Use arbitrary values such as `leading-[1.2]` only for structural values that should not vary by theme.
