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

## Repository Structure

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
│  ├─ core/
│  │  └─ src/
│  │     ├─ types/
│  │     ├─ tokens/
│  │     ├─ utils/
│  │     └─ index.ts
│  ├─ react/
│  │  └─ src/
│  │     ├─ components/
│  │     ├─ layouts/
│  │     ├─ hooks/
│  │     └─ index.ts
│  ├─ world-ui/
│  │  └─ src/
│  │     ├─ floating-label/
│  │     ├─ nameplate/
│  │     ├─ health-bar/
│  │     ├─ damage-number/
│  │     ├─ interaction-prompt/
│  │     ├─ objective-marker/
│  │     ├─ types/
│  │     └─ index.ts
│  ├─ phaser/
│  │  └─ src/
│  │     ├─ renderers/
│  │     ├─ adapters/
│  │     ├─ pools/
│  │     └─ index.ts
│  └─ themes/
│     └─ src/
│        ├─ base.css
│        ├─ tokens.css
│        ├─ themes/
│        │  ├─ arcade.css
│        │  ├─ tactical.css
│        │  └─ playful.css
│        └─ index.css
│
├─ ARCHITECTURE.md
├─ OVERVIEW.md
├─ ROADMAP.md
├─ package.json
├─ pnpm-workspace.yaml
├─ vite.config.ts
└─ tsconfig.json
```

## Package Dependency Direction

```text
@game-ui/core
    ↑
    ├── @game-ui/react
    ├── @game-ui/world-ui
    └── @game-ui/themes

@game-ui/world-ui
    ↑
    └── @game-ui/phaser
```

Dependencies should flow downward toward general concepts, never back toward specific renderers or games.

## packages/core

### Responsibility

Renderer-independent shared primitives.

### May contain

- Shared TypeScript types
- Semantic token definitions
- Small utilities
- World-coordinate types
- Shared enums
- Framework-level contracts

### Must not depend on

- React
- Phaser
- Astro
- Any individual game

## packages/react

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
- HUDLayout

### May depend on

- core
- themes
- React

### Must not depend on

- Phaser
- Individual games

### State rule

The package must not own global game state.
Components receive controlled values through props or small adapter hooks.
Example:

```tsx
<HealthBar value={42} max={100} />
```

The game decides whether that value comes from Zustand, Colyseus, React state, Phaser, or another source.

## packages/world-ui

### Responsibility

Define UI concepts attached to game entities or world positions.

### Initial primitives

- FloatingLabel
- Nameplate
- HealthBar
- DamageNumber
- InteractionPrompt
- ObjectiveMarker

### May depend on

- core

### Must not depend on

- React
- Phaser
- Individual games

### Example concept

```ts
interface FloatingLabelConfig {
  text: string;
  variant?: "name" | "location" | "status" | "interaction" | "generic";
  anchor: WorldAnchor;
  offset?: WorldOffset;
  priority?: number;
  maxDistance?: number;
  lifetime?: number;
}
```

This defines intent and behavior, not how the label is drawn.

## World Anchors

The initial world anchor can stay simple:

```ts
interface WorldAnchor {
  x: number;
  y: number;
}
```

If needed later, dynamic anchors can expose a position getter:

```ts
interface DynamicWorldAnchor {
  getPosition(): { x: number; y: number };
}
```

Do not make shared world UI accept `Phaser.GameObjects.Sprite` directly.
That would couple the concept to one renderer.

## packages/phaser

### Responsibility

Translate world UI concepts into Phaser-rendered objects and game-loop behavior.

### May handle

- Object creation
- Position updates
- Camera transforms
- Visibility
- Culling
- Pooling
- Animation
- Lifetime
- Distance-based fading
- Layer/depth ordering

### May depend on

- core
- world-ui
- Phaser

### Must not contain

- Game-specific entities
- Team rules
- Match logic
- Game-specific text decisions

### Good responsibility

"Render this label at this world anchor."

### Bad responsibility

"Show Blue Team above every friendly tank."
The game chooses the content; the renderer chooses how it is drawn.

## Renderer Adapter Model

```text
FloatingLabelConfig
        ↓
@game-ui/phaser
FloatingLabelRenderer
        ↓
Phaser Text / BitmapText / Graphics
```

The same world UI concept could later support:

```text
FloatingLabelConfig
├─ Phaser renderer
├─ Pixi renderer
├─ Three.js renderer
└─ DOM renderer
```

Do not add those renderer packages until a real game needs them.

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
High-volume world UI should normally use the game renderer.

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
@theme {
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

Avoid shared component styles such as:

```text
bg-blue-600
text-yellow-400
rounded-xl
```

when the value represents game branding rather than component behavior.

## Starting Themes

Three initial themes live in `packages/themes`:

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

React components should not directly reach into Phaser scenes whenever it can be avoided.
Preferred patterns:

```text
Phaser Scene
    ↓
Game State Store
    ↓
React HUD
```

or:

```text
React Control
    ↓
Typed Command/Event
    ↓
Game Scene
```

Possible bridges include:

- Zustand
- Typed event emitters
- Adapter hooks
- Small external stores
  Avoid circular ownership between React and Phaser.

## Component File Structure

A simple React component:

```text
packages/react/src/components/Button/
├─ Button.tsx
├─ Button.types.ts
├─ Button.test.tsx
└─ index.ts
```

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
import { Button } from "@game-ui/react/src/components/Button/Button";
```

Good:

```ts
import { Button } from "@game-ui/react";
```

or:

```ts
import { Button } from "@game-ui/react/button";
```

Use explicit package exports when useful.

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

## Agent Rules

### Prefer existing primitives

Before creating UI, agents should:

1. Search for an existing primitive.
2. Check documented variants.
3. Try composition of existing components.
4. Add a reusable primitive only if the need is genuinely different.
5. Keep one-off game mechanics inside the game.

### Use semantic styling

Agents should use framework tokens instead of hardcoded branding values.

### Choose the correct layer

World-attached information belongs in world UI.
Viewport-attached information belongs in screen UI.

### Keep game rules outside shared packages

The framework renders and styles information; the game decides what the information means.

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

### World UI does not know Phaser

Bad:

```text
FloatingLabel requires Phaser.GameObjects.Sprite.
```

Good:

```text
FloatingLabel accepts a renderer-independent anchor.
```

### React does not own the game loop

React displays screen state; Phaser or the game simulation owns per-frame gameplay.

### Themes do not contain game logic

Themes control presentation only.

### Games can override theme tokens

A game must be able to establish its own visual identity without editing shared package source.

## Architecture Summary

```text
Game Logic
   │
   ├── Screen state ──→ @game-ui/react
   │
   └── World state ───→ @game-ui/world-ui
                            │
                            └── @game-ui/phaser

Shared UI presentation
   └── @game-ui/themes + semantic CSS tokens
```

The framework should make common UI fast to build while keeping every game mechanically independent and visually customizable.
