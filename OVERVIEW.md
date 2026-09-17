# Game UI Framework Overview

## Purpose

This project is a reusable UI framework for browser-based games.
Its goal is to make it fast to build visually consistent game interfaces across multiple projects without forcing every game to reinvent common UI patterns.
The framework is designed primarily for games built with React and Phaser, but the architecture should remain flexible enough to support other renderers later.
The framework should be easy for both humans and coding agents to understand and extend.

## Core Goals

- Provide reusable game UI components.
- Keep game-specific visuals easy to theme.
- Separate screen UI from world-attached UI.
- Avoid coupling reusable UI concepts directly to one rendering engine.
- Make components easy to discover and use through documentation.
- Give coding agents clear rules for when and how to use framework components.
- Keep the framework small enough to remain practical.
- Support multiple games without forcing them to share the same visual identity.

## Primary Use Cases

The framework should support common multiplayer and single-player web game interfaces such as:

- HUDs
- Scoreboards
- Player lists
- Timers
- Health and energy displays
- Match state indicators
- Menus
- Modals
- Settings screens
- Lobbies
- Matchmaking UI
- Inventory UI
- Notifications
- Toasts
- Kill feeds
- Progress bars
- Interaction prompts
- Floating labels
- Nameplates
- Damage numbers
- Objective markers

## UI Layers

The framework separates game UI into three conceptual layers.

### 1. Game World

The actual gameplay layer.
Examples:

- Player sprites
- Enemies
- Projectiles
- Terrain
- Physics objects
- Pickups
- Effects
  This layer belongs to the game itself and is not part of the UI framework.

### 2. World UI

UI that is attached to an entity or world position.
Examples:

- Player names
- Unit health bars
- NPC labels
- Damage numbers
- Interaction prompts
- Objective markers
- Location labels
- Status indicators
  World UI belongs conceptually to the UI framework, but is usually rendered by the game renderer rather than React.
  For Phaser games, world UI should normally be rendered through Phaser.

### 3. Screen UI

UI positioned relative to the screen rather than the world.
Examples:

- HUD panels
- Scoreboards
- Menus
- Settings
- Inventory screens
- Lobbies
- Match results
- Chat
  Screen UI is primarily implemented with React.

## Technology Direction

The initial stack is:

- React for screen UI
- Base UI for unstyled, accessible behavior primitives in complex screen UI components
- Tailwind CSS for styling
- CSS custom properties for theming
- Phaser for 2D world UI rendering
- TypeScript throughout
- Astro for documentation and component examples
  The framework should avoid forcing Phaser-specific concerns into reusable UI concepts.

## Repository Structure

This project is a monorepo.

```text
game-ui/
├─ apps/
│  └─ website/
├─ packages/
│  ├─ core/
│  ├─ react/
│  ├─ world-ui/
│  ├─ phaser/
│  └─ themes/
├─ docs/
├─ package.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

## apps/website

The Astro website is both documentation and a visual showcase.
It should contain:

- Getting started guides
- Architecture documentation
- Component documentation
- Live examples
- Theme previews
- World UI documentation
- Agent usage guidelines
- Design principles
  The site should make it easy to answer:
- What components exist?
- When should I use each one?
- What variants are available?
- How should this component be themed?
- Should this be React UI or world UI?
- Can an agent reuse an existing primitive instead of creating something new?

## packages/core

Contains renderer-independent shared concepts.
Examples:

- Shared types
- Semantic design tokens
- Common utilities
- World anchor types
- UI state contracts
- Shared enums
  This package must not depend on React or Phaser.

## packages/react

Contains screen-space React components.
Examples:

- Button
- Panel
- Modal
- Dialog
- ProgressBar
- Timer
- PlayerList
- Scoreboard
- Lobby
- Toast
- HUD layouts
  Components should consume semantic theme tokens rather than hardcoded visual values.
  Components with complex interaction behavior, such as Modal, are built on Base UI's unstyled primitives rather than a styled library such as shadcn/ui, so themes control every visual value.

## packages/world-ui

Defines world UI concepts and behaviors without assuming a specific renderer.
Examples:

- FloatingLabel
- Nameplate
- HealthBar
- DamageNumber
- InteractionPrompt
- ObjectiveMarker
  This package should define configuration, behavior, lifecycle, priority, and semantic variants.
  It should not directly depend on Phaser.

## packages/phaser

Provides Phaser renderers and adapters for world UI concepts.
Examples:

- FloatingLabelRenderer
- NameplateRenderer
- HealthBarRenderer
- DamageNumberRenderer
- ObjectiveMarkerRenderer
  This package translates world UI concepts into Phaser objects and game-loop behavior.

## packages/themes

Contains theme tokens and starting themes.
Initial themes:

- Arcade
- Tactical
- Playful
  Themes should be based on semantic CSS variables.
  Components should not hardcode colors, border radii, shadows, font choices, or similar game-specific visual values.

## Theming Philosophy

Tailwind is the styling implementation layer.
CSS variables are the theming API.
Example semantic tokens:

```css
--game-bg
--game-surface
--game-panel
--game-primary
--game-secondary
--game-danger
--game-success
--game-text
--game-text-muted
--game-border
--game-radius-sm
--game-radius-md
--game-radius-lg
--game-shadow
--game-font-body
--game-font-display
```

A component should use semantic values such as:

```text
bg-game-panel
text-game-text
border-game-border
rounded-game-md
```

A game may change the values behind those tokens without changing the component.

## Starting Themes

### Arcade

Designed for competitive and action-focused games.
Typical characteristics:

- Dark background
- Bright accents
- Strong contrast
- Chunky controls
- More energetic motion

### Tactical

Designed for strategy, simulation, military, or data-heavy games.
Typical characteristics:

- Dark or neutral surfaces
- Restrained accent colors
- Compact spacing
- Dense information layouts
- Sharper corners

### Playful

Designed for casual, puzzle, party, and family-friendly games.
Typical characteristics:

- Brighter surfaces
- Rounded components
- Larger controls
- Softer shapes
- Friendly typography
  These themes are starting points rather than rigid visual systems.
  Games should be able to override theme tokens freely.

## Agent-Friendly Design

One of the framework goals is to give coding agents a clear design vocabulary.
Agents should prefer existing framework primitives before creating custom UI.
Example mapping:

```text
Player name
→ Nameplate
"Press E to open"
→ InteractionPrompt
"+25"
→ DamageNumber
Area name
→ FloatingLabel with location variant
Match players
→ PlayerList
Game timer
→ Timer
```

The game decides the content and context.
The framework decides reusable behavior and styling conventions.

## Agent Rule: Avoid Reinventing Components

Before creating new game UI, an agent should:

1. Search the framework for an existing component.
2. Check documented variants.
3. Check whether composition of existing components can solve the need.
4. Create a new reusable primitive only when the need is genuinely different.
5. Create game-specific UI only when it should not belong to the shared framework.

## Agent Rule: Do Not Hardcode Theme Values

Shared components should not use arbitrary game-specific visual values.
Avoid:

```text
bg-blue-600
text-yellow-400
rounded-xl
```

Prefer semantic tokens:

```text
bg-game-primary
text-game-text
rounded-game-md
```

Game-specific one-off artwork is an exception.

## Agent Rule: Choose the Correct UI Layer

Use screen UI when the element belongs to the viewport.
Use world UI when the element belongs to an entity or world position.
Do not render large quantities of world-attached UI through React unless there is a clear reason.

## Floating Labels

Floating labels are a first-class world UI primitive.
Supported conceptual variants may include:

- name
- location
- status
- interaction
- generic
  A floating label may define:
- Text
- Anchor
- Offset
- Priority
- Visibility distance
- Fade behavior
- Alignment
- Lifetime
  The renderer decides how the label is drawn.

## Framework Scope

This project should focus on reusable UI infrastructure.
It should not become a general-purpose game engine.
Out of scope unless clearly needed:

- Physics
- Networking
- Matchmaking backend logic
- Entity component systems
- Game AI
- Level generation
- General asset management
- Core game simulation

## Design Principles

### Reusable, Not Generic for Its Own Sake

Build abstractions that are repeatedly useful across games.
Do not create abstractions solely because they might be useful someday.

### Semantic APIs

Prefer APIs that describe intent.
Good:

```text
variant="interaction"
priority="high"
```

Less desirable:

```text
fontSize={13}
color="#ffff00"
```

### Easy Defaults

A component should look acceptable with minimal configuration.

### Easy Overrides

Games must be able to customize the framework without forking shared components.

### Performance Awareness

React is appropriate for most screen UI.
High-volume or world-attached UI should generally use the game renderer.

### Progressive Complexity

Start simple.
Only introduce additional packages, adapters, or abstractions when real games demonstrate the need.

## Initial Milestone

The first useful version should include:

- Monorepo setup
- Astro website
- Tailwind theme infrastructure
- Arcade theme
- Tactical theme
- Playful theme
- Button
- Panel
- Modal
- ProgressBar
- Timer
- PlayerList
- Scoreboard
- FloatingLabel concept
- Nameplate concept
- HealthBar concept
- Phaser renderer for at least one world UI primitive
- Component documentation
- Agent usage documentation

## Long-Term Possibilities

Potential future packages may include:

```text
packages/pixi
packages/three
packages/dom-world-ui
packages/icons
packages/audio-ui
```

These should only be introduced when actual games require them.

## Success Criteria

The framework is successful when a new game can quickly establish a complete UI by:

1. Installing the shared packages.
2. Choosing a starting theme.
3. Overriding a small number of tokens.
4. Composing existing UI primitives.
5. Adding only the game-specific UI that is genuinely unique.
   A coding agent should be able to inspect the documentation and understand the same workflow without needing broad knowledge of every game in the larger ecosystem.
