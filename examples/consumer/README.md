# Consumer fixture

A minimal game UI that installs Game UI the way a real consumer does: from packed
tarballs, outside this repository's pnpm workspace.

It exists because nothing else in the repository can catch a broken published
package. Workspace checks, tests, and the documentation website all resolve
`@game-ui/*` through the `@game-ui/source` export condition, which points at
`src`. A broken `dist` build, export map, or CSS entry would pass all of them.

## Run it

```bash
vp run verify-consumer   # from the repository root
```

That builds the packages, packs them, lints the published shape, installs the
tarballs here, type checks, builds, and asserts the output.

## What it verifies

| Step                       | Catches                                                       |
| -------------------------- | ------------------------------------------------------------- |
| `publint`                  | Malformed export maps, missing files, bad metadata            |
| `arethetypeswrong`         | Declarations that do not resolve for ESM or bundler consumers |
| `pnpm install` of tarballs | Unresolvable dependencies and peer dependency conflicts       |
| `tsc --noEmit`             | Shipped `.d.mts` errors, on a mainstream TypeScript version   |
| `vite build`               | Imports that only work against workspace source               |
| Output assertions          | Missing themes, tokens, component CSS, or wrong layer order   |

The fixture deliberately uses plain Vite and TypeScript 5.9 rather than this
repository's Vite+ and TypeScript 7, so the tested combination matches what a
consumer is likely to have.

## Isolation

`examples/` is not matched by the root `pnpm-workspace.yaml` globs, and this
directory has its own `pnpm-workspace.yaml`. pnpm stops at the nearest workspace
file, so the fixture resolves independently and gets its own lockfile.

## The overrides

`pnpm-workspace.yaml` overrides `@game-ui/core`, `@game-ui/themes`, and
`@game-ui/world-ui` to the local tarballs. `@game-ui/react` depends on them by
version, and those versions are not on a registry yet, so without the overrides
pnpm tries to fetch them and fails. Remove the overrides once the packages are
published; that is the point at which this fixture also starts proving that real
published versions resolve.
