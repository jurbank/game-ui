# Game UI Framework Roadmap

This roadmap turns [OVERVIEW.md](./OVERVIEW.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) into an implementation sequence. Those documents define the product and package boundaries; this document defines what to build next and how to know it is ready.

Start with a working themed React example in the documentation site, then expand the screen UI and prove the world UI boundary with Phaser. Complete the initial milestone before adding the broader component catalog.

## Current Baseline

The repository currently contains:

- A pnpm workspace with Vite+ configuration, checks, tests, and build scripts.
- An Astro/Starlight website with starter content.
- A placeholder `packages/utils` package with one sample test.
- The overview and architecture documents at the repository root.

The five framework packages, React examples, Tailwind integration, themes, and world UI renderers are not implemented yet.

Use the existing Vite+ task runner. The source documents show `turbo.json` in their proposed trees, but adding a second task runner is unnecessary. Keep the planning documents at the root initially and link to them from the website rather than creating competing copies.

## Initial Milestone

The first useful version is ready when a consumer can install the packages, select a theme, override tokens, and compose a small game interface using documented public APIs.

Required scope:

- `@game-ui/core`, `@game-ui/themes`, `@game-ui/react`, `@game-ui/world-ui`, and `@game-ui/phaser`.
- Arcade, Tactical, and Playful themes.
- Button, Panel, Modal, ProgressBar, Timer, PlayerList, and Scoreboard.
- FloatingLabel, Nameplate, and HealthBar concepts, with a Phaser FloatingLabel renderer at minimum.
- An Astro documentation site with working examples and agent usage guidance.
- A consumer example that demonstrates screen UI and world UI together while keeping game rules outside the framework.

The milestones below are ordered by dependency, not calendar dates. All unchecked tasks are planned work.

| Milestone                    | Depends on       | Reviewable result                                                    |
| ---------------------------- | ---------------- | -------------------------------------------------------------------- |
| 0. Workspace foundation      | Existing starter | Reliable development, checks, and package builds                     |
| 1. Themed React slice        | 0                | Button and Panel running in the docs with Arcade styling             |
| 2. Screen UI and themes      | 1                | All initial screen components and three theme previews               |
| 3. World UI and Phaser slice | 1                | Renderer-independent concepts and a working Phaser label demo        |
| 4. Consumer readiness        | 2 and 3          | Documented, packaged initial version verified outside source imports |

Milestones 2 and 3 can proceed independently once milestone 1 establishes the shared contracts and example infrastructure.

## Milestone 0 — Make the Workspace Ready

**Outcome:** contributors can install, run the website, and validate packages with predictable commands.

- [x] Give `apps/website` a workspace package name and align the root `dev` task with it. It currently targets `docs#dev`, while the website package name is empty.
- [x] Resolve the esbuild build-script policy deliberately and verify a clean `vp install` completes. The initial install reports `ERR_PNPM_IGNORED_BUILDS` and generates an unresolved `allowBuilds.esbuild` placeholder.
- [x] Review the nested website workspace configuration and lockfile; establish the root workspace as the dependency-management entry point.
- [x] Fix the existing website formatting failures so `vp check` has a clean baseline.
- [x] Replace the placeholder `packages/utils` with `packages/core`, retaining only utilities needed by actual framework code.
- [x] Establish the package template: TypeScript configuration, declaration output, explicit exports, package metadata, and Vite+ build/test tasks.
- [x] Create `packages/themes` and `packages/react` for milestone 1. Create world UI and Phaser packages when milestone 3 begins rather than filling them with speculative APIs.
- [x] Define external and peer dependency handling so consumer builds do not bundle duplicate React or Phaser runtimes.
- [x] Replace the starter README with setup, workspace navigation, and validation instructions; align the architecture's repository tree with the chosen tooling.
- [x] Add CI using the repository's validation tasks and enforce the dependency boundaries as packages are introduced.

**Acceptance criteria:** a fresh checkout installs successfully; `vp run dev` starts the website; checks, tests, and recursive builds pass. Public package imports resolve without reaching into `src`.

## Milestone 1 — Ship One Themed React Example

**Outcome:** a real component proves the path from tokens to shared package to live documentation.

- [x] Define the initial semantic token contract: colors, typography, radii, and shadows, plus spacing and motion tokens needed by the first components. Keep shared token names/types in core and CSS values in themes.
- [x] Implement base CSS, the Arcade theme, and Tailwind mappings to semantic variables.
- [x] Define the consumer styling contract: CSS export paths, import order, and how component styles reach the final build. Verify the approach in a consumer build rather than assuming Tailwind scans workspace packages.
- [x] Implement Button and Panel with small typed APIs, sensible defaults, semantic styling, and composition through children.
- [x] Preserve native button behavior, keyboard activation, visible focus, and disabled semantics.
- [x] Add React support to the Astro website and create the documentation sections for getting started, concepts, components, world UI, themes, patterns, and agent guidance.
- [x] Replace the starter landing page with a live Button/Panel example and a component index showing what is actually available.
- [x] Demonstrate a local token override that changes the example's identity without editing shared component source.

**Acceptance criteria:** the website imports Button and Panel through public package exports; the example is interactive, styled in a production build, and changes appearance through CSS variables. Core imports no React, Phaser, or Astro code.

## Milestone 2 — Complete the Initial Screen UI

**Outcome:** the framework can compose a useful HUD, scoreboard, and menu across all three starting themes.

- [x] Add Tactical and Playful themes and a preview that renders the same component examples in each theme.
- [x] Add Base UI (`@base-ui/react`) to `@game-ui/react` and the dependency boundary allowlist. Build interactive components on its unstyled primitives, per the behavior primitives section of the architecture.
- [x] Build ProgressBar on Base UI Progress with controlled `value` and `max`, accessible labeling, and documented behavior for empty, full, and invalid ranges.
- [x] Build Timer around a game-provided time value and formatting options. Keep the authoritative clock and match lifecycle in the game.
- [x] Build Modal on Base UI Dialog with an accessible name, focus management, focus restoration, Escape handling, and a documented dismissal policy. Ensure region-scoped themes reach the portaled dialog.
- [x] Build PlayerList with game-provided entries and explicit empty-state behavior.
- [x] Build Scoreboard with supplied rows, scores, and statuses. Games determine winners, team membership, and ranking policy.
- [x] Compose a responsive HUD/menu example from these primitives. Keep any demo match state in the website example.
- [ ] Verify theme contrast, keyboard interaction, long labels, narrow viewports, and reduced-motion behavior where motion exists.
- [ ] Add meaningful tests for component interactions and boundary values, with live documentation alongside each component.

**Acceptance criteria:** all seven initial screen components are documented and usable in each theme. A demo updates health, time, player rows, and scores through props, opens and closes its modal by keyboard, and requires no shared global game store.

## Milestone 3 — Prove World UI with Phaser

**Outcome:** the first world UI implementation demonstrates reusable intent and renderer-specific execution.

- [ ] Add simple `WorldAnchor` and `WorldOffset` types to core. Start with coordinates; introduce a dynamic position getter only if the example needs it.
- [ ] Create `@game-ui/world-ui` with FloatingLabel, Nameplate, and HealthBar contracts independent of React and Phaser.
- [ ] Specify units, defaults, and update/lifecycle semantics for the supported configuration: anchors, offsets, variants, priority, visibility distance, and lifetime. Clearly distinguish concept fields from features the first renderer actually supports.
- [ ] Create `@game-ui/phaser` and implement FloatingLabel rendering, content/position updates, visibility, depth, lifetime, and explicit disposal.
- [ ] Define how world UI presentation receives semantic style values. CSS variables do not directly style Phaser text; use an explicit adapter or resolved style input without introducing DOM dependencies into core or world UI.
- [ ] Add a client-only Phaser example to the Astro site, with cleanup on unmount and scene shutdown. Ensure the website's server build does not evaluate browser-only Phaser code.
- [ ] Demonstrate a label following a moving world anchor and behaving correctly when the camera moves or zooms.
- [ ] Test lifecycle cleanup and repeated creation/destruction; profile a repeatable many-label scenario and record hardware, label counts, and frame timing.
- [ ] Add pooling or more complex culling only when the measured scenario requires it. Keep per-frame label updates out of React.
- [ ] Document Nameplate and HealthBar as concept-only APIs until their renderers exist; do not imply they are already renderable through Phaser.

**Acceptance criteria:** a Phaser label follows its anchor, honors the documented supported configuration, and leaves no retained objects or listeners after disposal. World UI depends only on core. No shared API accepts a Phaser sprite as its world anchor, and all text/content decisions stay in the demo game.

## Milestone 4 — Verify Consumer Readiness

**Outcome:** another game can adopt the initial framework from its documentation and built packages.

- [ ] Compose a small simulated game example in the website: Phaser world labels plus a React HUD, scoreboard, and modal. A complete game or networking backend is unnecessary.
- [ ] Demonstrate a small typed state/command bridge owned by the example. Avoid making a particular store library mandatory for consumers.
- [ ] Finish getting-started instructions covering package installation, CSS imports, theme selection, token overrides, React use, and Phaser lifecycle integration.
- [ ] Document every shipped component/concept with purpose, when to use and avoid it, props/configuration, variants, tokens, accessibility, relevant performance notes, live examples, and agent guidance.
- [ ] Publish an agent guide that maps UI needs to primitives, explains screen versus world UI, and requires checking existing variants/composition before creating new components.
- [ ] Test built package artifacts in a minimal consumer fixture outside workspace source resolution. Verify JavaScript, declarations, CSS exports, peer dependencies, and production styling.
- [ ] Record supported runtime/framework versions based on tested combinations, plus known limitations and unsupported renderer features.
- [ ] Choose the initial distribution method and versioning/release process; prepare package metadata and a changelog. Registry publication is a separate release step.
- [ ] Run the full validation gate and walk through the onboarding instructions from a clean consumer setup.

**Acceptance criteria:** the consumer fixture imports only public APIs, builds successfully, and renders with each theme. A developer can follow the guide to select a theme, override a few tokens, and compose screen/world UI without changing shared package source.

## First Three Implementation PRs

Keep each PR small enough to review against a concrete result:

1. **Repair the workspace baseline.** Fix the website name/task target, dependency build policy, workspace ownership, and existing formatting failures. Update setup instructions and establish passing validation.
2. **Establish core and theme packaging.** Replace the sample utils package, add the first semantic tokens and Arcade CSS, and verify public JavaScript/type/CSS exports. Document the styling contract.
3. **Render Button and Panel in the website.** Add the React package and Astro integration, build the two components, and ship their interactive docs with a token-override example.

Finish any remaining milestone 0 infrastructure alongside these PRs before expanding the component catalog. Begin with PR 1.

## Validation Gate

Follow `AGENTS.md` and use the repository's Vite+ commands:

```bash
vp install
vp check
vp test
vp run ready
```

`vp run ready` currently runs checks, recursive package test scripts, and recursive builds. Keep it aligned with newly introduced packages and consumer validation. Use `vp env doctor` when runtime or package-manager setup is suspect.

Tests should target behavior and boundaries: controlled values, keyboard/focus behavior, theme delivery in consumer builds, allowed dependency direction, and renderer lifecycle cleanup. Review live examples for presentation, responsiveness, and camera behavior that unit tests cannot establish alone.

## After the Initial Milestone

Choose the next work from actual game integration needs, in this order of preference:

1. Fill demonstrated gaps in existing components and improve documentation from consumer feedback.
2. Add Phaser Nameplate and HealthBar renderers when a game needs them.
3. Add DamageNumber, InteractionPrompt, and ObjectiveMarker concepts together with their first real renderer/use case.
4. Extract recurring screen patterns such as Toast, Lobby, HUDLayout, settings, inventory, matchmaking presentation, and kill feeds when composition reveals a reusable API.
5. Consider Pixi, Three.js, DOM world UI, icons, or audio UI only with a concrete consumer.

Defer a runtime theme composer, general renderer abstraction, mandatory global state layer, and performance infrastructure without measured demand. Physics, networking, matchmaking backends, entity systems, AI, asset management, and game simulation remain outside framework scope.
