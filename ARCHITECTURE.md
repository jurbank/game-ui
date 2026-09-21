# Game UI Framework Architecture

## Purpose

This document defines the technical boundaries of the shared game UI framework.
The framework should make UI reusable across games without coupling game logic, React, and rendering engines together.

## Core Rules

1. Screen UI and world UI are separate concerns.
2. Shared concepts should be renderer-independent when practical.
3. Tailwind is the styling implementation layer; semantic CSS variables are the theming API.
4. Shared packages must not contain individual game rules.
5. Package boundaries should be obvious to both humans and coding agents.
6. Add abstraction only after a real use case exists.
7. Games own world UI rendering, the game loop, and shared game state.
8. Framework components and contracts must not require a state library, signal system, or engine.

## Repository Structure

Game UI publishes one package, `@gameui/ui`. Its source is split into modules with enforced boundaries (see [Module Dependency Direction](#module-dependency-direction)), and subpath exports let a game load only the layers it uses. World renderer implementations live in consuming games or website examples.

```text
game-ui/
├─ apps/
│  └─ website/
│     ├─ src/
│     │  ├─ components/
│     │  ├─ content/
│     │  │  └─ docs/
│     │  ├─ layouts/
│     │  └─ pages/
│     └─ astro.config.mjs
│
├─ packages/
│  └─ ui/                    published as @gameui/ui
│     ├─ src/
│     │  ├─ index.ts         `@gameui/ui`: tokens + world contracts, renderer-free
│     │  ├─ tokens/
│     │  ├─ world/
│     │  ├─ css/             theme CSS, published unbuilt
│     │  │  ├─ tokens.css
│     │  │  ├─ base.css
│     │  │  ├─ tailwind.css
│     │  │  ├─ themes/
│     │  │  │  ├─ arcade.css
│     │  │  │  ├─ tactical.css
│     │  │  │  └─ playful.css
│     │  │  └─ index.css
│     │  └─ react/           `@gameui/ui/react`
│     │     ├─ components/
│     │     ├─ internal/
│     │     ├─ styles.css     compiled to `@gameui/ui/styles.css`
│     │     └─ index.ts
│     └─ tests/
│
├─ ARCHITECTURE.md
├─ OVERVIEW.md
├─ ROADMAP.md
├─ package.json
├─ pnpm-workspace.yaml
├─ vite.config.ts
└─ tsconfig.json
```

## Module Dependency Direction

```text
src/react  ──→ src/tokens + src/css, React, Base UI
src/world  ──→ nothing at runtime (types only)
src/tokens ──→ nothing
src/css    ──→ nothing (tests check it against src/tokens)
src/input  ──→ the DOM only (keyboard ownership; touch stick and button controllers)

Consuming game / website example
    ├── React bindings ──→ @gameui/ui/react
    └── Native world UI implementation ──→ @gameui/ui world contracts
```

Arrows point from consumers to their dependencies. The package never depends on individual games. The world UI contracts introduce no required rendering or state runtime.

`src/index.ts`, `src/tokens`, `src/world`, `src/css`, and `src/input` are renderer-free: they must not import React, Base UI, an engine, or anything under `src/react`. This keeps the `@gameui/ui` root and `@gameui/ui/input` entries usable by games without React. `tools/workspace-checks` enforces it on source, and `vp run verify-consumer` enforces it on the published `dist`.

## Tokens (`src/tokens`)

### Responsibility

Renderer-independent shared primitives.

### May contain

- Shared TypeScript types
- Semantic token definitions
- Small utilities
- Types shared by multiple UI layers; world-only spatial contracts belong in `src/world`
- Shared enums
- Framework-level contracts

### Must not depend on

- React
- Game engines such as Phaser or Three.js
- Astro
- Any individual game

## React components (`src/react`, exported as `@gameui/ui/react`)

### Responsibility

Screen-space UI rendered with React and normal DOM/CSS.

### Examples

- Button
- Panel
- Modal
- ProgressBar
- Timer
- PlayerList
- Scoreboard
- Toast
- Lobby
- HudLayer

### May depend on

- `src/tokens`
- `src/css`
- React
- Base UI (`@base-ui/react`)

### Must not depend on

- Game engines such as Phaser or Three.js
- Individual games
- Styled component libraries

### Behavior primitives

Components with non-trivial interaction behavior are built on [Base UI](https://base-ui.com), an unstyled, accessible React primitive library. Base UI supplies behavior and accessibility, such as focus trapping, focus restoration, Escape handling, ARIA wiring, and keyboard navigation. Game UI supplies all styling through semantic tokens.

- Use Base UI for components where behavior is hard to get right: Modal (Dialog), ProgressBar (Progress), and later Toast, Menu, Select, Tabs, Slider, and Tooltip.
- Do not wrap Base UI where native HTML is sufficient. Button renders a native `<button>` and Panel renders a `<div>` or `<section>`.
- Base UI is an implementation detail. Components expose Game UI props and types, not Base UI's API, and consumers never import `@base-ui/react` to use Game UI.
- Style Base UI parts with `game-*` utilities in `*.styles.ts`, using the data attributes Base UI sets for state, such as `data-open` and `data-disabled`.
- Do not use shadcn/ui or other styled component libraries as a base. Their styles use Tailwind's default theme and their own tokens, which would be replaced entirely, and their copy-into-your-app model does not suit a shared package.

Portaled parts such as dialogs, menus, and toasts render under `<body>`. A theme applied to the root element reaches them; a theme applied to a smaller region does not. Components that portal must carry the nearest theme into their portal so region-scoped themes still apply.

### State rule

Components must not own global game state.
Components receive controlled values through props and report intent through callbacks. Game-owned wrappers or hooks bind these props to the chosen store.
Example:

```tsx
<ProgressBar label="Health" value={42} max={100} />
```

The game decides whether that value comes from Zustand, Colyseus, React state, Phaser, or another source.

## World UI contracts (`src/world`)

### Responsibility

Provide engine-independent specifications, lightweight TypeScript contracts, and implementation guidance for UI attached to entities or world positions. Agents and developers use these conventions to build native world UI inside their games.

This module does not create render objects, run an update loop, own state, or require a component tree. A game may consume its types at development time without a framework runtime in the world rendering path. Start with typed descriptors and documentation; add JSON Schema only when serialized definitions need validation. Do not interpret or validate descriptors every frame.

### Initial concepts

- FloatingLabel
- Nameplate
- HealthBar

DamageNumber, InteractionPrompt, and ObjectiveMarker are later candidates driven by real game needs. These names describe concepts, not renderable React components.

### Dependencies

World contracts may use `src/tokens` names. It must not depend on React, the DOM, an engine, a state library, or individual games.

### Contract requirements

Each concept documents content, semantic variants, defaults, configuration, and implementation responsibilities. Distinguish required semantics from optional capabilities such as occlusion, distance fading, or overlap handling. Each implementation must state what it supports and how unsupported options are handled.

The public types in `packages/ui/src/world/index.ts` are used by a working canvas example and an untested 3D integration recipe in the website. The contract is a vocabulary for implementation, not a universal scene graph or renderer API.

## World Anchors and Spatial Semantics

Support both 2D and 3D games without assuming every anchor is an `{ x, y }` position. Define how a descriptor refers to an entity or an explicit position, with the game resolving entity references into its native representation.

Document coordinate space and dimensions, world units versus screen-pixel offsets, distance units, and lifetime units. Specify behavior for missing or removed anchors. Camera projection, axis conventions, depth, occlusion, and visibility policy remain in the game implementation, with supported behavior documented by its integration guide.

Shared contracts must not require a Phaser sprite, Three.js object, per-entity position callback, or a newly allocated position object each frame. Native objects and update strategies stay behind the game's integration boundary. Keep world-only spatial types in `src/world` until actual use by other modules justifies moving them to `src/tokens`.

## Game-Owned World UI Implementations

Games own:

- Render object creation and disposal
- Anchor resolution and position updates
- Camera transforms and projection
- Visibility, culling, and occlusion
- Batching, pooling, and allocations
- Animation, lifetime, and fading
- Layer/depth ordering
- Scene and subscription cleanup

A game may implement the conventions with Phaser, Three.js, another web game engine, or vanilla canvas. The framework does not require an engine adapter package. Reference implementations live in website examples and serve as implementation recipes; they are not supported production renderers shipped by the framework.

```text
World UI specification + semantic tokens
                  ↓ guides implementation
Game-owned label / nameplate / health bar
                  ↓ renders through
Phaser / Three.js / another engine / canvas
```

Extract optional adapters only after real integrations demonstrate reusable code. Renderer-specific objects and game rules must remain outside shared contracts.

## Connecting World and Screen UI

World UI and screen UI share game-owned data and semantic presentation roles. They render independently; neither layer must instantiate the other.

| World concept | Screen counterpart             | Shared data or intent                                 |
| ------------- | ------------------------------ | ----------------------------------------------------- |
| HealthBar     | ProgressBar                    | Current value, maximum, and game-selected status tone |
| Nameplate     | PlayerList or Scoreboard entry | Entity identity, display name, and status             |
| FloatingLabel | Text composed inside Panel     | Content and semantic role when relevant to the screen |

These are composition recommendations, not automatic bindings or promises of identical appearance. For example, game health `{ value: 42, max: 100 }` can feed a native entity health bar and a React ProgressBar. Health thresholds and visibility rules remain game decisions.

CSS custom properties style the web UI. A game-owned presentation adapter resolves relevant semantic values into engine-native colors, fonts, sizes, or materials at initialization and when the theme changes. Document unit conversions, font/asset requirements, and unsupported effects. Do not read computed styles every frame or put DOM dependencies in `src/tokens` or `src/world`.

## UI Layer Decision Rule

Use React when UI belongs to the viewport.
Use world UI when UI belongs to an entity or world position.

```text
Round timer                  → React
Match scoreboard             → React
Pause menu                   → React
Player name above character  → World UI
Damage number above enemy    → World UI
"Press E" above chest        → World UI
Objective marker             → World UI
```

## React Performance Boundary

React is suitable for most screen UI.
Avoid routing large amounts of per-frame game state through React.
Do not render hundreds of world-attached labels through React unless profiling shows it is appropriate.
High-volume world UI should use the game renderer. Keeping code in a game gives it control over optimization, but code location alone does not guarantee performance. Profile representative workloads and optimize the measured rendering, subscription, and allocation costs.

## Theme Architecture

Tailwind is the styling implementation layer.
CSS custom properties are the public theme contract.
Shared components should use semantic values rather than literal game colors.

### Example tokens

```css
:root {
  --game-bg: #000;
  --game-surface: #111;
  --game-panel: #181818;
  --game-primary: #fff;
  --game-secondary: #888;
  --game-danger: #f44;
  --game-success: #4c8;
  --game-text: #fff;
  --game-text-muted: #aaa;
  --game-border: #333;
  --game-radius-sm: 4px;
  --game-radius-md: 8px;
  --game-radius-lg: 12px;
  --game-font-body: system-ui;
  --game-font-display: system-ui;
}
```

### Tailwind mapping

Conceptually:

```css
@theme inline {
  --color-game-bg: var(--game-bg);
  --color-game-panel: var(--game-panel);
  --color-game-primary: var(--game-primary);
  --color-game-text: var(--game-text);
  --color-game-border: var(--game-border);
}
```

Shared components can then use:

```tsx
<div className="bg-game-panel text-game-text border-game-border">
```

The mapping must use `@theme inline` so utilities read the `--game-*` variables where they are applied; otherwise Tailwind resolves them once on `:root` and scoped themes or overrides do not reach the utilities.

Framework CSS lives in the `game-ui` cascade layer (`game-ui.tokens`, `game-ui.themes`, `game-ui.base`, `game-ui.components`). Consumers declare its position after resets and before utilities, such as `@layer theme, base, game-ui, components, utilities;` with Tailwind, so resets like Preflight do not override components and utilities and unlayered game CSS take precedence. React component styles are precompiled with Tailwind into `@gameui/ui/styles.css` without Tailwind's default theme, so only static and semantic `game-*` utilities generate CSS. The full styling contract is documented in [`packages/ui/README.md`](./packages/ui/README.md#styling-contract).

Avoid shared component styles such as:

```text
bg-blue-600
text-yellow-400
rounded-xl
```

when the value represents game branding rather than component behavior.

## Starting Themes

Three initial themes live in `packages/ui/src/css/themes`:

```text
arcade.css
 tactical.css
 playful.css
```

### Arcade

- Dark base
- Bright accents
- Strong contrast
- Chunkier controls
- More energetic motion

### Tactical

- Dark or neutral surfaces
- Restrained accents
- Compact spacing
- Dense layouts
- Sharper corners

### Playful

- Brighter surfaces
- Larger controls
- Softer shapes
- Rounded components
- Friendly typography
  These are starting points, not rigid skins.

## Theme Selection

A game may select a base theme with an attribute such as:

```html
<body data-game-theme="arcade"></body>
```

A game can then override semantic values locally:

```css
[data-game="space-arena"] {
  --game-primary: #8b5cf6;
  --game-secondary: #22d3ee;
}
```

Games should not need to fork shared components to establish a unique identity.

## Theme Composition Direction

The conceptual theme model is:

```text
Theme
├─ Palette
├─ Typography
├─ Shape
├─ Spacing
├─ Motion
└─ Effects
```

Do not build a runtime theme composer until real games demonstrate that need.
CSS variables are enough initially.

## React/Game Communication

Both UI layers read game-owned state and send typed actions to the game. Avoid synchronizing separate authoritative copies of world and screen state.

```text
World UI interaction ──┐
                      ├──→ Game action handler ──→ Game-owned state
React UI callback ────┘                                  │
                                      ┌─────────────────┴────────────────┐
                                      ↓                                  ↓
                              Native world UI                    React UI bindings
```

For example, selecting an entity in the world and selecting it from a screen list both call the game's `selectEntity(id)` action. Both views observe the resulting `selectedEntityId`. Gameplay commands are requests: the game or authoritative server validates them before publishing the resulting state.

### Ownership and update frequency

| Concern                                            | Owner                     |
| -------------------------------------------------- | ------------------------- |
| Health, selection, inventory, match state          | Game-owned state          |
| Positions, camera transforms, per-frame animation  | Game loop                 |
| Controlled values and interaction callbacks        | Framework component props |
| Store subscriptions, commands, and engine bindings | Game integration code     |
| Integration recipes and reference examples         | Framework documentation   |

Publish UI-relevant changes and subscribe only to the values each view needs. Sample rapidly changing displays when appropriate for the game; do not route all simulation state through React. World UI reads per-frame spatial data through the game loop. Dispose subscriptions when scenes or UI instances are destroyed.

Persistent values belong in state. One-shot notifications such as a damage-number trigger may use game-owned events with explicit delivery and cleanup rules; an event bus does not replace the current state snapshot.

### State libraries, providers, and signals

Keep Zustand for the first integration example. A vanilla store can be read and updated outside React, React bindings can use `useStore` with selectors, and native code can use `subscribeWithSelector` for relevant changes. See the [Zustand API reference](https://zustand.docs.pmnd.rs/reference/index) and [selective subscriptions](https://zustand.docs.pmnd.rs/reference/middlewares/subscribe-with-selector).

Create a store per game/example instance. A game-owned React provider may inject that instance when useful, as described in [Zustand's context guidance](https://zustand.docs.pmnd.rs/learn/guides/initialize-state-with-props). Shared components continue to accept props and callbacks; no provider is mandatory in the framework.

MobX, signals, React state, or other stores may supply the same component props and world data. MobX tracks observable properties read by observer components; this is a different subscription model, not evidence that migrating will improve this game's performance. See [MobX React integration](https://mobx.js.org/react-integration.html). Measure a representative workload before changing libraries.

Do not add a framework store, signal runtime, generic data-provider API, or mandatory bridge package in M3. Start with documented game-owned bindings and extract an optional adapter only when multiple integrations demonstrate repeated code.

## Component File Structure

A simple React component:

```text
packages/ui/src/react/components/Button/
├─ Button.tsx
├─ Button.types.ts
├─ Button.styles.ts
└─ index.ts
packages/ui/tests/
└─ Button.test.tsx
```

`*.styles.ts` holds the component's Tailwind class strings as complete literals, so the build can find them and tests can verify that every class generates CSS.

A larger component may contain internal helpers:

```text
Scoreboard/
├─ Scoreboard.tsx
├─ ScoreboardRow.tsx
├─ Scoreboard.types.ts
├─ Scoreboard.utils.ts
└─ index.ts
```

Avoid deep folder nesting without a real complexity need.

## Package Exports

Consumers should not import from deep internal paths.
Bad:

```ts
import { Button } from "@gameui/ui/src/react/components/Button/Button";
```

Good:

```ts
import { Button } from "@gameui/ui/react";
import { tokenVar, type HealthBar } from "@gameui/ui";
```

Only paths in the `exports` map are public: `.`, `./react`, `./input`, `./styles.css`, `./themes.css`, `./tokens.css`, `./base.css`, `./tailwind.css`, and `./themes/<name>.css`. Add a subpath only when a consumer needs to load something separately.

## Package Conventions

- One published package, `@gameui/ui`, with `"type": "module"` and an explicit `exports` map. Split out another package only for a genuinely separate dependency, such as an engine adapter; register it in `tools/workspace-checks` when it is introduced.
- TypeScript entries (`src/index.ts`, `src/react/index.ts`, `src/input/index.ts`) build with `vp pack` to `dist/` with declaration files. Theme CSS publishes unbuilt from `src/css`; `src/react/styles.css` is compiled to `dist/styles.css`.
- TypeScript and compiled CSS entries also export a `@gameui/source` condition pointing at `src`, with the plain map repeated in `publishConfig.exports`. The workspace TypeScript and Vite configs enable that condition, so checks, tests, and dev servers work from a fresh checkout without building first, while the published package exposes only built files.
- Tests live in `tests/` and run through the package `test` script, so `vp run ready` includes them.
- `react` and `react-dom` are optional `peerDependencies`, also listed in `devDependencies` for local development. They are required only by `@gameui/ui/react`. `vp pack` leaves dependencies and peer dependencies external, so consumer builds contain one copy of each runtime.
- Implementation libraries that consumers never import directly, such as `@base-ui/react`, are regular `dependencies`. They stay external in the build, so a consumer's bundler deduplicates them.

The allowed dependencies and renderer-free modules are enforced by `tools/workspace-checks`.

## Documentation Site

`apps/website` is an Astro app that serves as both documentation and component showcase.
Recommended content structure:

```text
apps/website/src/content/docs/
├─ getting-started/
├─ concepts/
├─ components/
├─ world-ui/
├─ themes/
├─ patterns/
└─ agent-guide/
```

The site should include live examples wherever practical.
It may replace the need for a separate playground app initially.

## Component Documentation Requirements

Each shared component or world UI primitive should document:

- Purpose
- When to use it
- When not to use it
- Props/configuration
- Variants
- Theme tokens
- Accessibility considerations
- Performance notes where relevant
- Live examples
- Agent guidance
- For world concepts: supported implementation capabilities, spatial units, related screen components, and game-owned state/theme bindings

## Agent Rules

### Prefer existing primitives

Before creating UI, agents should:

1. Search for an existing primitive.
2. Check documented variants.
3. Try composition of existing components.
4. Add a reusable primitive only if the need is genuinely different.
5. Keep one-off game mechanics inside the game.
6. Implement world UI inside the game using the documented concepts; do not assume a concept is a shipped renderer.

### Use semantic styling

Agents should use framework tokens instead of hardcoded branding values.

### Choose the correct layer

World-attached information belongs in world UI.
Viewport-attached information belongs in screen UI.

### Keep game rules outside shared packages

The framework renders screen components and defines world UI conventions. The game implements world rendering and decides what the information means.

## Architecture Guardrails

### Shared UI does not know game rules

Bad:

```text
Scoreboard determines which team won.
```

Good:

```text
The game passes rows, scores, and status into Scoreboard.
```

### World contracts do not know the engine

Bad:

```text
FloatingLabel requires Phaser.GameObjects.Sprite.
```

Good:

```text
FloatingLabel accepts a renderer-independent anchor.
```

### React does not own the game loop

React displays screen state; the game engine or simulation owns per-frame gameplay.

### Themes do not contain game logic

Themes control presentation only.

### Games can override theme tokens

A game must be able to establish its own visual identity without editing shared package source.

## Architecture Summary

```text
Game-owned state and actions
   ├── Game React bindings ──→ @gameui/ui/react
   └── Game-native world UI (follows @gameui/ui world contracts)

Shared presentation vocabulary
   ├── @gameui/ui theme CSS tokens ──→ screen styling
   └── Game-resolved semantic values ──→ native world styling
```

The framework should make common UI fast to build while keeping every game mechanically independent and visually customizable.
