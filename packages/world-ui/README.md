# @gameui/world-ui

TypeScript contracts for game-owned FloatingLabel, Nameplate, and HealthBar implementations. No renderer, React, DOM, engine, state library, runtime validation, or update loop. All public exports are types; use `import type`.

```ts
import type { HealthBar } from "@gameui/world-ui";

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

Public types and defaults are in [src/index.ts](https://github.com/jurbank/game-ui/blob/master/packages/world-ui/src/index.ts). The [full specification](https://github.com/jurbank/game-ui/blob/master/apps/website/src/content/docs/world-ui/contracts.mdx) covers units, required behavior, unsupported options, semantic roles, accessibility, and disposal.

- [Canvas reference game](https://github.com/jurbank/game-ui/tree/master/apps/website/src/components/examples/world-game/): game-owned 2D implementation, not exported by this package.
- [State/presentation integration](https://github.com/jurbank/game-ui/blob/master/apps/website/src/content/docs/world-ui/integration.mdx): game-owned Zustand bindings and theme mapping.
- [3D recipe](https://github.com/jurbank/game-ui/blob/master/apps/website/src/content/docs/world-ui/3d-recipe.mdx): guidance, not a tested engine integration.

## For coding agents

- These are types, not components. Draw descriptors in the game's renderer; this package renders nothing.
- Use Nameplate for names/status/selection above characters, HealthBar for entity health, and FloatingLabel for place names and short-lived world text such as damage numbers (`lifetimeMs`, a new `id` per event).
- Keep one game-owned value for anything shown in both layers, such as health in a HealthBar and a screen ProgressBar.
- Reject optional capabilities your renderer doesn't support (`occlusion: "hide"`, `maxDistance`, 3D anchors) with an error at creation. Never ignore them silently.
- Resolve theme tokens at startup and on theme change, never per frame. World text is invisible to assistive technology, so mirror important information in screen UI.

Build with `vp run @gameui/world-ui#build`; validate with `vp check` and `vp run @gameui/world-ui#test`. This package publishes `dist` with explicit exports following the workspace template.
