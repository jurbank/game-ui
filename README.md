# Game UI

A reusable UI framework for browser-based games: React screen UI, renderer-independent world UI concepts, a Phaser renderer, and themes built on semantic CSS variables.

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

| Path                     | Package                     | Purpose                                                 |
| ------------------------ | --------------------------- | ------------------------------------------------------- |
| `apps/website`           | `@game-ui/website`          | Astro/Starlight documentation and examples              |
| `packages/core`          | `@game-ui/core`             | Renderer-independent types and token contract           |
| `packages/themes`        | `@game-ui/themes`           | Token values, themes, and Tailwind mapping              |
| `packages/react`         | `@game-ui/react`            | Screen UI React components                              |
| `tools/workspace-checks` | `@game-ui/workspace-checks` | Repository checks such as package dependency boundaries |

The remaining framework packages (`world-ui`, `phaser`) are added as their roadmap milestones begin. See [Package Conventions](./ARCHITECTURE.md#package-conventions) before adding one, and [`packages/themes`](./packages/themes/README.md) for the styling contract.

Run a task in one package with `vp run <package>#<task>`, for example `vp run @game-ui/website#build`.

## Validation

```bash
vp check        # format, lint, and type check
vp test         # run tests
vp run ready    # full gate: check, recursive tests, recursive builds
```

Use `vp check --fix` to apply formatting. If runtime or package-manager behavior looks wrong, run `vp env doctor`. See [AGENTS.md](./AGENTS.md) for the contributor checklist.
