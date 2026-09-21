#!/usr/bin/env node
/**
 * Verifies the built packages the way a consumer receives them.
 *
 * Workspace checks, tests, and the website all resolve `@gameui/*` to source
 * through the `@gameui/source` export condition, so none of them can catch a
 * broken `dist` output, export map, or CSS entry. This script packs real
 * tarballs, installs them into `examples/consumer` (which is outside the pnpm
 * workspace and has no access to that condition), then type checks and builds.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, copyFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = join(root, "examples", "consumer");
const tarballs = join(fixture, ".tarballs");
const PACKAGES = ["core", "themes", "react", "world-ui"];

const run = (cmd, args, cwd) => {
  process.stdout.write(`\n$ ${cmd} ${args.join(" ")}   (${cwd.replace(root, ".")})\n`);
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
};

const step = (message) => process.stdout.write(`\n=== ${message}\n`);

// 1. Pack each package to a stable filename the fixture can pin. Packages must
//    already be built: this runs as a `vp run` task, and invoking `vp run -r
//    build` from inside one re-enters the task graph and fails.
for (const name of PACKAGES) {
  // themes is CSS-only and publishes src, so it has no dist.
  if (name === "themes") continue;
  if (!existsSync(join(root, "packages", name, "dist"))) {
    process.stderr.write(
      `\npackages/${name}/dist is missing. Run \`vp run -r build\` first, or use \`vp run ready\`.\n`,
    );
    process.exit(1);
  }
}

step("Packing tarballs");
rmSync(tarballs, { recursive: true, force: true });
mkdirSync(tarballs, { recursive: true });
for (const name of PACKAGES) {
  const dir = join(root, "packages", name);
  run("pnpm", ["pack", "--pack-destination", tarballs], dir);
  const packed = readdirSync(tarballs).find(
    (file) => file.startsWith(`gameui-${name}-`) && file.endsWith(".tgz"),
  );
  if (!packed) throw new Error(`pnpm pack produced no tarball for ${name}`);
  copyFileSync(join(tarballs, packed), join(tarballs, `gameui-${name}.tgz`));
}

// 2. Static export-map and type-resolution checks against the real tarballs.
step("Linting published package shape (publint)");
for (const name of PACKAGES) {
  run("pnpm", ["dlx", "publint@0.3.24", join(tarballs, `gameui-${name}.tgz`)], root);
}

step("Checking type resolution (arethetypeswrong)");
for (const name of ["core", "react", "world-ui"]) {
  run(
    "pnpm",
    [
      "dlx",
      "@arethetypeswrong/cli@0.18.5",
      "--pack",
      join(tarballs, `gameui-${name}.tgz`),
      // The packages are ESM-only by design, so CJS and node10 resolution
      // failures are expected rather than defects.
      "--profile",
      "esm-only",
      // attw resolves JS and type entries; a CSS entry has neither.
      "--exclude-entrypoints",
      "styles.css",
    ],
    root,
  );
}

// 3. Install and build as a consumer. The fixture carries its own
//    pnpm-workspace.yaml, so pnpm treats it as a separate workspace root
//    rather than adopting it into this repository's.
step("Installing fixture from tarballs");
rmSync(join(fixture, "node_modules"), { recursive: true, force: true });
rmSync(join(fixture, "pnpm-lock.yaml"), { force: true });
run("pnpm", ["install", "--no-frozen-lockfile"], fixture);

step("Type checking fixture against shipped declarations");
run("pnpm", ["run", "typecheck"], fixture);

step("Building fixture");
run("pnpm", ["run", "build"], fixture);

// 4. Assert the built output actually carries themed, styled UI.
step("Verifying build output");
const dist = join(fixture, "dist", "assets");
if (!existsSync(dist)) throw new Error("fixture build produced no assets directory");
const files = readdirSync(dist);

const cssFile = files.find((f) => f.endsWith(".css"));
if (!cssFile) throw new Error("fixture build produced no CSS bundle");
const css = readFileSync(join(dist, cssFile), "utf8");

const jsFile = files.find((f) => f.endsWith(".js"));
if (!jsFile) throw new Error("fixture build produced no JS bundle");
const js = readFileSync(join(dist, jsFile), "utf8");

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

// Every theme's tokens must survive the consumer's production CSS pipeline.
// Minifiers drop the attribute-selector quotes, so accept either spelling.
for (const theme of ["arcade", "tactical", "playful"]) {
  expect(
    new RegExp(`\\[data-game-theme=["']?${theme}["']?\\]`).test(css),
    `CSS is missing the ${theme} theme block`,
  );
}
// Component CSS arrives through the package's precompiled stylesheet, whose
// rules are token-bound Tailwind utilities inside the game-ui.components layer.
expect(css.includes("game-ui.components"), "CSS is missing the game-ui.components layer");
expect(/\.bg-game-primary\s*\{/.test(css), "CSS is missing token-bound component utilities");
expect(/--game-primary\s*:/.test(css), "CSS is missing the --game-primary token definition");
// The documented layer order must survive, or Tailwind's Preflight would win
// over component styles and passed-in utilities would stop winning over them.
// Cascade-layer precedence follows each layer name's FIRST appearance, in
// either an `@layer a, b;` declaration or an `@layer x { }` block, and a
// minifier may rewrite one form into the other. So derive the order rather
// than matching a literal declaration.
const layerOrder = [];
for (const match of css.matchAll(/@layer\s+([^{;]+)[{;]/g)) {
  for (const name of match[1].split(",")) {
    // A sublayer such as `game-ui.components` registers its root, `game-ui`.
    const root = name.trim().split(".")[0];
    if (root && !layerOrder.includes(root)) layerOrder.push(root);
  }
}
const precedes = (a, b) => {
  const ia = layerOrder.indexOf(a);
  const ib = layerOrder.indexOf(b);
  return ia !== -1 && ib !== -1 && ia < ib;
};
expect(
  precedes("base", "game-ui"),
  `game-ui must come after base so Preflight cannot override components (order: ${layerOrder.join(" < ")})`,
);
expect(
  precedes("game-ui", "utilities"),
  `utilities must come after game-ui so className utilities win (order: ${layerOrder.join(" < ")})`,
);

// The bundle must contain component code and exactly one React runtime.
expect(js.length > 10_000, "JS bundle is implausibly small");
const reactCopies = readdirSync(join(fixture, "node_modules")).filter((d) => d === "react");
expect(reactCopies.length === 1, "expected exactly one hoisted React copy");

if (failures.length > 0) {
  process.stderr.write(
    `\nConsumer verification failed:\n${failures.map((f) => `  - ${f}`).join("\n")}\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `\nConsumer fixture verified: ${cssFile} carries all three themes and component styles; ` +
    `${jsFile} built from published exports.\n`,
);
