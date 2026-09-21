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

3. Check what would be published. This runs the full validation gate (including the consumer fixture against packed tarballs) and an npm dry run:

   ```bash
   vp run release:dry-run
   ```

   Confirm the tarball contains `dist`, `src/css`, `README.md`, `LICENSE`, `CHANGELOG.md`, and `package.json`.

4. Publish from your machine.

   npm requires two-factor authentication to publish, so enable it on your account first (npm profile → Two-Factor Authentication, with an authenticator app). You also need publish rights to the `@gameui` organization.

   Log in from **outside this repository**. Its `devEngines` field requires pnpm, and the npm CLI refuses to run in a directory that declares another package manager:

   ```bash
   cd ~ && npm login && npm whoami
   ```

   A one-time code expires in about 30 seconds, which is shorter than the validation gate takes. So run the gate first, then publish with a fresh code:

   ```bash
   vp run ready
   NPM_CONFIG_OTP=123456 vp run publish-packages
   ```

   This publishes the version if it is not yet on the registry and creates a git tag for it. `vp run release` does both steps in one command, but only works without 2FA or with a granular access token that has "bypass 2FA" enabled.

   If a publish fails partway, re-run it with a new code. Already-published versions are skipped.

5. Push the release commit and tags:

   ```bash
   git push --follow-tags
   ```

## After the first publish

- Remove the `overrides` block from `examples/consumer/pnpm-workspace.yaml`, so the fixture proves that published versions resolve from the registry.
- Update the "Not on a registry yet" note in `apps/website/src/content/docs/getting-started/index.mdx` to plain `pnpm add` instructions.
