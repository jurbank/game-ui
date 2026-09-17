# @game-ui/world-ui

TypeScript contracts for game-owned FloatingLabel, Nameplate, and HealthBar implementations. No renderer, React, DOM, engine, state library, runtime validation, or update loop. All public exports are types; use `import type`.

```ts
import type { HealthBar } from "@game-ui/world-ui";

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

Public types and defaults are in [src/index.ts](./src/index.ts). The [full specification](../../apps/website/src/content/docs/world-ui/contracts.mdx) covers units, required behavior, unsupported options, semantic roles, accessibility, and disposal.

- [Canvas reference game](../../apps/website/src/components/examples/world-game/): game-owned 2D implementation, not exported by this package.
- [State/presentation integration](../../apps/website/src/content/docs/world-ui/integration.mdx): game-owned Zustand bindings and theme mapping.
- [3D recipe](../../apps/website/src/content/docs/world-ui/3d-recipe.mdx): guidance, not a tested engine integration.

Build with `vp run @game-ui/world-ui#build`; validate with `vp check` and `vp run @game-ui/world-ui#test`. This package publishes `dist` with explicit exports following the workspace template.
