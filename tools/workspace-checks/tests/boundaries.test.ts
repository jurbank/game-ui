import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, test } from "vite-plus/test";

/**
 * Allowed runtime dependencies per framework package, from ARCHITECTURE.md.
 * Dependencies flow toward general concepts, never toward renderers or games.
 * Add a package here when it is introduced.
 */
const allowedDependencies: Record<string, readonly string[]> = {
  "@gameui/ui": ["@base-ui/react", "react", "react-dom"],
  "@gameui/phaser": ["@gameui/ui", "phaser"],
};

/**
 * Source paths, relative to a package, that must stay renderer-free: they may
 * not import renderer frameworks or reach into the package's React code. This
 * is what keeps `@gameui/ui`'s root entry usable by games without React.
 */
const rendererFreeSources: Record<string, readonly string[]> = {
  "@gameui/ui": ["src/index.ts", "src/tokens", "src/world", "src/css", "src/input"],
};

/** Renderer and site frameworks that only specific packages may use. */
const restrictedModules = ["react", "react-dom", "@base-ui/react", "phaser", "astro"];

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

/** Every module specifier imported by a file. */
function importSpecifiers(file: string): string[] {
  const code = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
  return [
    ...code.matchAll(/\bfrom\s+["']([^"']+)["']/g),
    ...code.matchAll(/\bimport\s*\(?\s*["']([^"']+)["']/g),
    ...code.matchAll(/@import\s+["']([^"']+)["']/g),
  ].map(([, specifier]) => specifier);
}

/** The package name of each bare module specifier imported by a file. */
function importedPackages(file: string): string[] {
  return importSpecifiers(file)
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
        const isFramework = name.startsWith("@gameui/") || restrictedModules.includes(name);
        if (isFramework) {
          expect(allowed, `${file} must not import ${name}`).toContain(name);
        }
        expect(declared, `${file} imports undeclared package ${name}`).toContain(name);
      }
    }
  });
});

describe.each(packages.filter(({ manifest }) => rendererFreeSources[manifest.name]))(
  "$manifest.name renderer-free sources",
  ({ path, manifest }) => {
    const roots = rendererFreeSources[manifest.name]!.map((entry) => join(path, entry));
    const files = roots.flatMap((root) =>
      statSync(root).isDirectory() ? sourceFiles(root) : [root],
    );
    const reactDir = join(path, "src", "react");

    test.each(files.map((file) => ({ file: file.slice(path.length + 1), abs: file })))(
      "$file imports no renderer code",
      ({ abs }) => {
        for (const name of importedPackages(abs)) {
          expect(restrictedModules, `${abs} must not import ${name}`).not.toContain(name);
        }
        for (const specifier of importSpecifiers(abs).filter((s) => s.startsWith("."))) {
          const target = resolve(dirname(abs), specifier);
          expect(target.startsWith(reactDir), `${abs} must not import ${specifier}`).toBe(false);
        }
      },
    );
  },
);
