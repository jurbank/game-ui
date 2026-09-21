#!/usr/bin/env node
/**
 * Validates, packs, and publishes @gameui/ui, then tags the release.
 *
 *   pnpm run release                # full `vp run ready` gate first
 *   pnpm run release --skip-checks  # build only
 *   pnpm run release --dry-run      # everything except uploading and tagging
 *
 * The tarball is packed with pnpm, which applies `publishConfig.exports` (npm
 * pack does not), into a temporary directory. `npm publish` then runs from that
 * directory: outside this repository, so the pnpm-only `devEngines` check does
 * not block it, and in the foreground, so npm can prompt for passkey or
 * one-time-code authentication.
 *
 * Run it directly in a terminal, not through `vp run`, so npm's
 * authentication prompt stays interactive.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = join(root, "packages", "ui");
const { name, version } = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
const tag = `${name}@${version}`;
const skipChecks = process.argv.includes("--skip-checks");
const dryRun = process.argv.includes("--dry-run");

const run = (cmd, args, cwd) => {
  process.stdout.write(`\n$ ${cmd} ${args.join(" ")}   (${cwd.replace(root, ".")})\n`);
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
};
const output = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

const staging = mkdtempSync(join(tmpdir(), "gameui-publish-"));

try {
  // npm view exits non-zero for an unpublished version.
  let published = false;
  try {
    published = output("npm", ["view", tag, "version"], staging) === version;
  } catch {}
  if (published) {
    throw new Error(`${tag} is already on npm. Bump the version with \`vp run version-packages\`.`);
  }

  if (skipChecks) run("vp", ["run", "@gameui/ui#build"], root);
  else run("vp", ["run", "ready"], root);

  run("pnpm", ["pack", "--pack-destination", staging], packageDir);
  const tarball = readdirSync(staging).find((file) => file.endsWith(".tgz"));
  if (!tarball) throw new Error("pnpm pack produced no tarball");

  // Guard against publishing workspace-only exports that point at src/*.ts.
  const manifest = JSON.parse(
    output("tar", ["-xOf", join(staging, tarball), "package/package.json"], staging),
  );
  if (manifest.exports["."] !== "./dist/index.mjs") {
    throw new Error(
      `packed exports were not rewritten for publishing: ${JSON.stringify(manifest.exports["."])}`,
    );
  }

  const publishArgs = ["publish", "--access", "public", join(staging, tarball)];
  if (dryRun) {
    run("npm", [...publishArgs, "--dry-run"], staging);
    process.stdout.write(`\nDry run complete: ${tag} was not published or tagged.\n`);
  } else {
    run("npm", publishArgs, staging);
    const tags = output("git", ["tag", "--list", tag], root);
    if (!tags) run("git", ["tag", tag], root);
    process.stdout.write(
      `\nPublished ${tag}. Push the release commit and tag:\n  git push --follow-tags\n`,
    );
  }
} finally {
  rmSync(staging, { recursive: true, force: true });
}
