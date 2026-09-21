# Game UI

A reusable UI framework for browser-based games: React screen UI, engine-independent world UI contracts for game-owned implementations, and themes built on semantic CSS variables.

- [OVERVIEW.md](./OVERVIEW.md) — purpose, goals, and design principles
- [ARCHITECTURE.md](./ARCHITECTURE.md) — package boundaries and dependency rules
- [ROADMAP.md](./ROADMAP.md) — implementation sequence and current milestone

## Setup

Requirements: Node.js 22.18 or newer and the [Vite+](https://viteplus.dev/guide/) CLI (`vp`). Vite+ downloads the pinned pnpm version automatically.

```bash
vp install
vp run dev   # start the documentation website at http://localhost:4321
```

The root workspace owns all dependencies and the single `pnpm-lock.yaml`. Run `vp install` from the repository root, not inside individual packages.

## Workspace

| Path                     | Package                    | Purpose                                                  |
| ------------------------ | -------------------------- | -------------------------------------------------------- |
| `apps/website`           | `@gameui/website`          | Astro/Starlight documentation and examples               |
| `packages/ui`            | `@gameui/ui`               | The published framework: tokens, themes, React, world UI |
| `tools/workspace-checks` | `@gameui/workspace-checks` | Repository checks such as package dependency boundaries  |

`@gameui/ui` has separate entry points: `@gameui/ui/react` for screen components, CSS subpaths for themes and component styles, and a renderer-free root, `@gameui/ui`, for token helpers and typed world concepts. The website includes a game-owned canvas example with shared Zustand health/selection and a 3D integration recipe. Games own world rendering and state integration; no engine adapter or state library is required by the framework. See [Package Conventions](./ARCHITECTURE.md#package-conventions) before adding one, and [`packages/ui`](./packages/ui/README.md#styling-contract) for the styling contract.

Run a task in one package with `vp run <package>#<task>`, for example `vp run @gameui/website#build`.

## Validation

```bash
vp check        # format, lint, and type check
vp test         # run tests
vp run ready    # full gate: check, recursive tests, recursive builds, consumer fixture
```

Use `vp check --fix` to apply formatting. If runtime or package-manager behavior looks wrong, run `vp env doctor`. See [AGENTS.md](./AGENTS.md) for the contributor checklist.

## Releasing

The four `@gameui/*` packages version together with Changesets. Run `vp run changeset` to record a change that affects a published package. See [RELEASING.md](./RELEASING.md) for cutting and publishing a release.
