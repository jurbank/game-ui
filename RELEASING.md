# Releasing

`@gameui/ui` is published to npm under the `@gameui` scope and versioned with [Changesets](https://github.com/changesets/changesets).

It replaces `@gameui/core`, `@gameui/themes`, `@gameui/react`, and `@gameui/world-ui`, which were published once at 0.1.0. After the first `@gameui/ui` release, deprecate them so installs point people to the new package. Run it from outside this repository, with a fresh one-time code:

```bash
cd ~
for p in core themes react world-ui; do
  npm deprecate "@gameui/$p" "Merged into @gameui/ui. See https://github.com/jurbank/game-ui#readme" --otp=123456
done
```

## Recording changes

Any change that affects a published package needs a changeset:

```bash
vp run changeset
```

Choose the bump and describe the change for consumers. Commit the generated `.changeset/*.md` file with the change. Documentation-site and tooling-only changes need no changeset.

While the version is `0.x`, use `minor` for breaking changes and `patch` for everything else.

## Cutting a release

1. Apply pending changesets. This bumps versions, writes each package's `CHANGELOG.md`, formats, and updates the lockfile:

   ```bash
   vp run version-packages
   ```

2. Review the version and changelog diff, then commit it as `chore: release vX.Y.Z`.

3. Check what would be published. This runs the full validation gate (including the consumer fixture against packed tarballs), packs the package, and runs an npm dry run:

   ```bash
   pnpm run release:dry-run
   ```

   Confirm the tarball contains `dist`, `src/css`, `README.md`, `LICENSE`, `CHANGELOG.md`, and `package.json`.

4. Publish from a terminal. You need publish rights to the `@gameui` organization and to be logged in (`cd ~ && npm login`; npm refuses to run inside this repository because its `devEngines` requires pnpm).

   ```bash
   pnpm run release                # or: pnpm run release --skip-checks
   ```

   `tools/publish.mjs` runs `vp run ready`, packs with pnpm (which rewrites `exports` to `dist`; `npm pack` does not) into a temporary directory, runs `npm publish` from there, and creates the `@gameui/ui@<version>` git tag. npm prompts for your passkey or one-time code, so run it directly in a terminal rather than through `vp run` or a non-interactive shell. It refuses to run if the version is already on npm.

5. Push the release commit and tags:

   ```bash
   git push --follow-tags
   ```

## After the first publish

- Remove the `overrides` block from `examples/consumer/pnpm-workspace.yaml`, so the fixture proves that published versions resolve from the registry.
- Update the "Not on a registry yet" note in `apps/website/src/content/docs/getting-started/index.mdx` to plain `pnpm add` instructions.
