import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";

/**
 * Allowed runtime dependencies per framework package, from ARCHITECTURE.md.
 * Dependencies flow toward general concepts, never toward renderers or games.
 * Add a package here when it is introduced.
 */
const allowedDependencies: Record<string, readonly string[]> = {
  "@game-ui/core": [],
  "@game-ui/themes": ["@game-ui/core"],
  "@game-ui/react": ["@game-ui/core", "@game-ui/themes", "react", "react-dom"],
  "@game-ui/world-ui": ["@game-ui/core"],
  "@game-ui/phaser": ["@game-ui/core", "@game-ui/world-ui", "phaser"],
};

/** Renderer and site frameworks that only specific packages may use. */
const restrictedModules = ["react", "react-dom", "phaser", "astro"];

const packagesDir = new URL("../../../packages/", import.meta.url).pathname;

const packages = readdirSync(packagesDir)
  .filter((dir) => existsSync(join(packagesDir, dir, "package.json")))
  .map((dir) => {
    const path = join(packagesDir, dir);
    const manifest = JSON.parse(readFileSync(join(path, "package.json"), "utf8"));
    return { dir, path, manifest };
  });

function sourceFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(m?[jt]sx?|css)$/.test(entry) ? [path] : [];
  });
}

/** The package name of each bare module specifier imported by a file. */
function importedPackages(file: string): string[] {
  const code = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
  const specifiers = [
    ...code.matchAll(/\bfrom\s+["']([^"']+)["']/g),
    ...code.matchAll(/\bimport\s*\(?\s*["']([^"']+)["']/g),
    ...code.matchAll(/@import\s+["']([^"']+)["']/g),
  ].map(([, specifier]) => specifier);

  return specifiers
    .filter((specifier) => !specifier.startsWith(".") && !specifier.startsWith("node:"))
    .map((specifier) =>
      specifier
        .split("/")
        .slice(0, specifier.startsWith("@") ? 2 : 1)
        .join("/"),
    );
}

test("framework packages are registered in the boundary map", () => {
  for (const { manifest } of packages) {
    expect(Object.keys(allowedDependencies)).toContain(manifest.name);
  }
});

describe.each(packages)("$manifest.name", ({ path, manifest }) => {
  const allowed = new Set(allowedDependencies[manifest.name] ?? []);

  test("declares only allowed runtime and peer dependencies", () => {
    const declared = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });
    for (const name of declared) {
      expect(allowed, `${manifest.name} must not depend on ${name}`).toContain(name);
    }
  });

  test("source imports only allowed, declared packages", () => {
    const runtime = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });
    const buildTime = [...runtime, ...Object.keys({ ...manifest.devDependencies })];
    for (const file of sourceFiles(join(path, "src"))) {
      // Stylesheets are compiled at build time, so they may import dev dependencies.
      const declared = new Set(file.endsWith(".css") ? buildTime : runtime);
      for (const name of importedPackages(file)) {
        const isFramework = name.startsWith("@game-ui/") || restrictedModules.includes(name);
        if (isFramework) {
          expect(allowed, `${file} must not import ${name}`).toContain(name);
        }
        expect(declared, `${file} imports undeclared package ${name}`).toContain(name);
      }
    }
  });
});
