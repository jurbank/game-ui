# Releasing

`@gameui/core`, `@gameui/themes`, `@gameui/react`, and `@gameui/world-ui` are published to npm under the `@gameui` scope. They are versioned together with [Changesets](https://github.com/changesets/changesets): every release bumps all four to the same version.

## Recording changes

Any change that affects a published package needs a changeset:

```bash
vp run changeset
```

Choose the bump for the affected packages and describe the change for consumers. Because the packages are a fixed group, the highest bump applies to all four. Commit the generated `.changeset/*.md` file with the change. Documentation-site and tooling-only changes need no changeset.

While the version is `0.x`, use `minor` for breaking changes and `patch` for everything else.

## Cutting a release

1. Apply pending changesets. This bumps versions, writes each package's `CHANGELOG.md`, formats, and updates the lockfile:

   ```bash
   vp run version-packages
   ```

2. Review the version and changelog diff, then commit it as `chore: release vX.Y.Z`.

3. Check what would be published. This runs the full validation gate (including the consumer fixture against packed tarballs) and an npm dry run:

   ```bash
   vp run release:dry-run
   ```

   Confirm each tarball contains `dist` (or `src` for themes), `README.md`, `LICENSE`, `CHANGELOG.md`, and `package.json`, and that internal dependencies are caret ranges such as `^0.1.0`.

4. Publish from your machine. You must be logged in to npm with publish rights to the `@gameui` organization:

   ```bash
   npm login
   vp run release
   ```

   This runs the validation gate again, publishes any package version not yet on the registry, and creates a git tag per package.

5. Push the release commit and tags:

   ```bash
   git push --follow-tags
   ```

## After the first publish

- Remove the `overrides` block from `examples/consumer/pnpm-workspace.yaml`, so the fixture proves that published versions resolve from the registry.
- Update the "Not on a registry yet" note in `apps/website/src/content/docs/getting-started/index.mdx` to plain `pnpm add` instructions.
