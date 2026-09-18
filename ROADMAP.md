# Game UI Framework Roadmap

This roadmap turns [OVERVIEW.md](./OVERVIEW.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) into an implementation sequence. Those documents define the product and package boundaries; this document defines what to build next and how to know it is ready.

Start with a working themed React example in the documentation site, then expand the screen UI and prove world UI contracts with a game-owned canvas example and shared state integration. Complete the initial milestone before adding the broader component catalog.

## Current Baseline

Milestones 0–3 are complete. The repository currently contains:

- A pnpm workspace with Vite+ configuration, checks, tests, and build scripts.
- An Astro/Starlight website with live React component examples.
- `@game-ui/core`, `@game-ui/themes`, `@game-ui/react`, and `@game-ui/world-ui`.
- Seven initial screen components, three themes, and a composed HUD/menu example.

M3 is finished: the world UI contracts, game-owned canvas integration, documentation, lifecycle tests, browser review, and recorded profiling are all done. No engine renderer package is required. M4 is the next milestone.

Use the existing Vite+ task runner. Keep the planning documents at the root and maintain consistent summaries in the website documentation.

## Initial Milestone

The first useful version is ready when a consumer can install the packages, select a theme, override tokens, and compose a small game interface using documented public APIs.

Required scope:

- `@game-ui/core`, `@game-ui/themes`, `@game-ui/react`, and the `@game-ui/world-ui` contracts package.
- Arcade, Tactical, and Playful themes.
- Button, Panel, Modal, ProgressBar, Timer, PlayerList, and Scoreboard.
- FloatingLabel, Nameplate, and HealthBar specifications, typed contracts, and game implementation guidance.
- An Astro documentation site with working examples and agent usage guidance.
- A game-owned canvas example that demonstrates world labels and health bars alongside React UI, sharing health and selection through game-owned Zustand bindings.
- A 3D integration recipe that checks spatial conventions without promising a shipped 3D renderer.

The milestones below are ordered by dependency, not calendar dates. All unchecked tasks are planned work.

| Milestone                                  | Depends on       | Reviewable result                                                    |
| ------------------------------------------ | ---------------- | -------------------------------------------------------------------- |
| 0. Workspace foundation                    | Existing starter | Reliable development, checks, and package builds                     |
| 1. Themed React slice                      | 0                | Button and Panel running in the docs with Arcade styling             |
| 2. Screen UI and themes                    | 1                | All initial screen components and three theme previews               |
| 3. World UI contracts and game integration | 2                | Engine-independent contracts, game-owned canvas UI, and shared state |
| 4. Consumer readiness                      | 2 and 3          | Documented, packaged initial version verified outside source imports |

M3 builds on M2's screen components so its example can demonstrate shared health, selection, and semantic presentation across both UI layers.

## Milestone 0 — Make the Workspace Ready

**Outcome:** contributors can install, run the website, and validate packages with predictable commands.

- [x] Give `apps/website` a workspace package name and align the root `dev` task with it. It currently targets `docs#dev`, while the website package name is empty.
- [x] Resolve the esbuild build-script policy deliberately and verify a clean `vp install` completes. The initial install reports `ERR_PNPM_IGNORED_BUILDS` and generates an unresolved `allowBuilds.esbuild` placeholder.
- [x] Review the nested website workspace configuration and lockfile; establish the root workspace as the dependency-management entry point.
- [x] Fix the existing website formatting failures so `vp check` has a clean baseline.
- [x] Replace the placeholder `packages/utils` with `packages/core`, retaining only utilities needed by actual framework code.
- [x] Establish the package template: TypeScript configuration, declaration output, explicit exports, package metadata, and Vite+ build/test tasks.
- [x] Create `packages/themes` and `packages/react` for milestone 1. Defer the world UI contracts package to milestone 3 rather than filling it with speculative APIs.
- [x] Define external and peer dependency handling so consumer builds do not bundle duplicate React runtimes.
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
- [x] Verify theme contrast, keyboard interaction, long labels, narrow viewports, and reduced-motion behavior where motion exists.
- [x] Add meaningful tests for component interactions and boundary values, with live documentation alongside each component.

**Acceptance criteria:** all seven initial screen components are documented and usable in each theme. A demo updates health, time, player rows, and scores through props, opens and closes its modal by keyboard, and requires no shared global game store.

## Milestone 3 — World UI Contracts and Game Integration

**Outcome:** a developer or agent can implement world UI in a game's chosen renderer and connect it to the same game-owned state and theme intent as the web UI, while retaining control over rendering and performance.

- [x] Create `@game-ui/world-ui` with lightweight TypeScript contracts for FloatingLabel, Nameplate, and HealthBar. Depend only on shared core types/tokens as needed; require no React, DOM, engine, state library, or world UI runtime.
- [x] Document each concept's purpose, content, semantic variants, defaults, required semantics, optional capabilities, and unsupported-option handling. Start with typed descriptors and examples; defer JSON Schema until serialized definitions need validation.
- [x] Define entity-reference and explicit-position anchor conventions suitable for 2D and 3D integrations. Specify coordinate spaces, offset/distance units, lifetime units, and missing-anchor behavior. Keep world-only types in world-ui; do not require native engine objects or per-frame descriptor allocation.
- [x] Write implementation guidance for projection, visibility, depth/occlusion, updates, lifetime, and disposal. Keep rendering, batching, culling, pooling, animation, and the update loop in the consuming game.
- [x] Map world concepts to related screen components and shared semantic roles: HealthBar to ProgressBar, Nameplate to player entries, and FloatingLabel to contextual text where useful. Document shared data without requiring identical visual rendering.
- [x] Define game-owned presentation mapping from semantic theme values to native renderer styles. Resolve values at initialization and theme changes; document conversions and unsupported effects without adding DOM dependencies to core or world-ui.
- [x] Build a client-only vanilla canvas reference game in the website with FloatingLabel, Nameplate, and HealthBar implementations alongside React UI. Keep its implementation in the example, document its supported capabilities, and ensure server builds do not evaluate browser-only code.
- [x] Demonstrate labels following moving anchors under camera movement/zoom. Add a 3D integration recipe covering entity resolution, projection, offset spaces, and occlusion decisions; identify it as guidance rather than a tested 3D renderer.
- [x] Create a Zustand store per example instance, owned by the demo game. Demonstrate shared health and selection from both a world interaction and a React control, with typed game actions and narrow subscriptions. Keep positions and camera animation in the game loop.
- [x] Document state versus one-shot events, game/server authority, optional game-owned providers, and subscription cleanup. Keep framework components controlled through props and callbacks; do not add a mandatory store, signal system, or generic data-provider API.
- [x] Test shared-state propagation, actions from either view, instance isolation, and cleanup on scene shutdown/unmount. Verify repeated creation/destruction leaves no retained subscriptions, listeners, or animation loops.
- [x] Profile a repeatable many-label scenario and record hardware, browser, label counts, and frame timing. Add pooling, culling complexity, or state-library changes only when measurements justify them. Do not parse schemas or read CSS values every frame.
- [x] Publish agent guidance for implementing the concepts in a game's renderer and connecting screen components. Distinguish contracts, game-owned examples, untested recipes, and shipped React components.

**Validation status (2026-09-17):** complete. Format/lint/type checks, automated state/lifecycle tests, package builds, and the production website build pass.

Browser review ran against the Astro production preview on a MacBook Air (Apple M5, 16 GB), macOS 26.5.2, Chrome 152, canvas 696 × 360 CSS px at DPR 1 on a 3440 × 1440 @ 50 Hz display. Confirmed in the browser: all three concepts render; nameplates and health bars follow moving anchors under camera pan/zoom; a world click selects a pilot, applies damage, and spawns a `lifetimeMs`-bounded damage label that expires on schedule; the React ProgressBar and the world health bar report the same game-owned value; selection propagates from either view; a theme change restyles both views; stopping the scene clears the canvas and halts the loop, and restarting reconnects to current state. No page console errors.

Recorded profiling (three runs per count, movement on, tab visible):

| Entities | Descriptors | Draw median  | Draw p95     | Frame median | Frame p95    |
| -------- | ----------- | ------------ | ------------ | ------------ | ------------ |
| 3        | 7           | 0.10 ms      | 0.20 ms      | 20.0 ms      | 20.7–20.8 ms |
| 100      | 201         | 0.60 ms      | 1.00–1.10 ms | 20.0 ms      | 20.7–21.0 ms |
| 500      | 1,001       | 1.80–1.90 ms | 2.20–2.30 ms | 20.0 ms      | 20.9–21.0 ms |

Draw cost scales roughly linearly with descriptor count and stays under 10% of the frame budget at 1,001 descriptors; frame median matched the 50 Hz vsync interval at every count. No pooling, culling, or state-library change is justified by these measurements. Full conditions are published at `/world-ui/canvas/`; re-measure on lower-end target hardware before relying on them.

**Acceptance criteria:** the canvas example renders all three initial concepts, follows moving anchors under camera changes, and cleans up objects, subscriptions, and animation loops on disposal. World and React health displays reflect the same game-owned values; selection from either view updates both without synchronizing separate authoritative copies. The documented contracts accommodate a 3D recipe without engine-specific types. A developer or agent can follow the guide to implement world UI in a chosen game environment without a framework renderer, mandatory state library, or per-frame React updates.

## Milestone 4 — Verify Consumer Readiness

**Outcome:** another game can adopt the initial framework from its documentation and built packages.

- [x] Extend the M3 game-owned canvas example into a consumer walkthrough with a React HUD, scoreboard, and modal. A complete game or networking backend is unnecessary.
- [x] Document how the example's typed state/actions bind to controlled component props, and how a consumer can replace Zustand without changing framework components or world contracts.
- [x] Finish getting-started instructions covering package installation, CSS imports, theme selection, token overrides, React use, game-owned world UI implementation, theme mapping, and state/subscription lifecycle integration.
- [ ] Document every shipped component/concept with purpose, when to use and avoid it, props/configuration, variants, tokens, accessibility, relevant performance notes, live examples, and agent guidance.
- [ ] Publish an agent guide that maps UI needs to primitives, explains screen versus world UI, and requires checking existing variants/composition before creating new components.
- [x] Test built package artifacts in a minimal consumer fixture outside workspace source resolution. Verify JavaScript, declarations, CSS exports, peer dependencies, and production styling.
- [ ] Record supported runtime/framework versions based on tested combinations, plus known limitations and reference-example capabilities. Do not claim engine support based only on an untested recipe.
- [ ] Choose the initial distribution method and versioning/release process; prepare package metadata and a changelog. Registry publication is a separate release step.
- [ ] Run the full validation gate and walk through the onboarding instructions from a clean consumer setup.

**Getting-started status (2026-09-18):** done. Installation now covers every package and its dependencies, installing packed tarballs from outside the repository (commands verified), the tested version combination, CSS imports, theme selection, token overrides, and React use. A new World UI and state page covers descriptors, renderer responsibilities, token-to-renderer mapping, shared state, and scene lifecycle, linking to the contracts, integration guide, and walkthrough. `.tarballs/` is gitignored for the documented pack step.

**Walkthrough status (2026-09-18):** done. `/getting-started/walkthrough/` runs the canvas reference game with a React Timer, PlayerList, ProgressBar, Scoreboard, and pause/round-over Modals, all bound to one game-owned store. The store gained a match clock, pause, scores, and reset; the scene freezes movement, label lifetimes, and world input while paused. `SquadHud` takes only props and callbacks, and `useSquadHud` is the sole Zustand-aware binding. Tests render the HUD from plain React state to prove the store is replaceable, and cover clock/pause/round-over behavior and unmount cleanup.

**Consumer fixture status (2026-09-17):** done. `examples/consumer` installs packed tarballs outside the pnpm workspace and is verified by `vp run verify-consumer`, wired into `vp run ready`. The fixture has its own `pnpm-workspace.yaml`, so it never sees the `@game-ui/source` condition that resolves workspace imports to `src`.

The gate runs `publint` and `arethetypeswrong` against real tarballs, then installs, type checks, and builds the fixture, then asserts the output. `arethetypeswrong` uses the `esm-only` profile because the packages are deliberately ESM-only; node10 and CJS resolution failures are expected, not defects. Its CSS entry is excluded because that tool resolves only JavaScript and type entries.

Tested combination: Node 24.15/24.21, pnpm 12.4.2 (workspace) and 11.21 (fixture), React and react-dom 19.3.0, TypeScript 5.9.3 against the shipped declarations with `skipLibCheck: false`, Vite 7.3.6, Tailwind CSS 4.3.3. The fixture deliberately uses mainstream Vite and TypeScript rather than the workspace's Vite+ and TypeScript 7, so the recorded combination matches what a consumer is likely to have.

Two findings worth carrying forward:

- The packed `@game-ui/react` depends on `@game-ui/core` and `@game-ui/themes` by exact version, which pnpm resolves from the registry. Until those versions are published, the fixture needs `overrides` pointing them at the same tarballs. Consider `workspace:^` instead of `workspace:*` when versioning, so consumers can deduplicate.
- Browser review of the fixture's production build on macOS 26.5.2 / Chrome 152 confirmed all seven screen components render in all three themes, a local `--game-radius-md` override retheming without touching shared source, and the portaled Modal correctly inheriting a region-scoped theme. No page console errors.

**Acceptance criteria:** the consumer fixture imports only public APIs, builds successfully, and renders with each theme. A developer can follow the guide to select a theme, override a few tokens, and compose screen UI and implement native world UI from the contracts, sharing game-owned state and presentation roles without changing shared package source.

## Completed Foundation PR Sequence

The foundation was organized around these reviewable results:

1. **Repair the workspace baseline.** Fix the website name/task target, dependency build policy, workspace ownership, and existing formatting failures. Update setup instructions and establish passing validation.
2. **Establish core and theme packaging.** Replace the sample utils package, add the first semantic tokens and Arcade CSS, and verify public JavaScript/type/CSS exports. Document the styling contract.
3. **Render Button and Panel in the website.** Add the React package and Astro integration, build the two components, and ship their interactive docs with a token-override example.

These foundation milestones are complete, as is M3 and its validation. M4 is the next milestone.

## Validation Gate

Follow `AGENTS.md` and use the repository's Vite+ commands:

```bash
vp install
vp check
vp test
vp run ready
```

`vp run ready` currently runs checks, recursive package test scripts, and recursive builds. Keep it aligned with newly introduced packages and consumer validation. Use `vp env doctor` when runtime or package-manager setup is suspect.

Tests should target behavior and boundaries: controlled values, keyboard/focus behavior, theme delivery in consumer builds, allowed dependency direction, game-owned state bindings, and reference-example lifecycle cleanup. Review live examples for presentation, responsiveness, and camera behavior that unit tests cannot establish alone.

## After the Initial Milestone

Choose the next work from actual game integration needs, in this order of preference:

1. Fill demonstrated gaps in existing components and improve documentation from consumer feedback.
2. Refine world UI contracts and implementation recipes from real 2D and 3D game integrations.
3. Add DamageNumber, InteractionPrompt, and ObjectiveMarker concepts together with their first game-owned implementation/use case.
4. Extract recurring screen patterns such as Toast, Lobby, HUDLayout, settings, inventory, matchmaking presentation, and kill feeds when composition reveals a reusable API.
5. Extract optional engine or state adapters only when multiple integrations demonstrate repeated code. Consider icons or audio UI with a concrete consumer.

Defer a runtime theme composer, general renderer abstraction, mandatory global state/provider/signal layer, speculative state-library migrations, and performance infrastructure without measured demand. Physics, networking, matchmaking backends, entity systems, AI, asset management, and game simulation remain outside framework scope.
