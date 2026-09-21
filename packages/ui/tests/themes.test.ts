import { readdirSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { allGameTokens } from "../src/index.ts";
import { compile } from "tailwindcss";
import { describe, expect, test } from "vite-plus/test";
import packageJson from "../package.json" with { type: "json" };

const srcDir = new URL("../src/css/", import.meta.url);
const readCss = (path: string) => readFileSync(new URL(path, srcDir), "utf8");

const themeNames = readdirSync(new URL("themes/", srcDir))
  .filter((file) => file.endsWith(".css"))
  .map((file) => basename(file, ".css"));

/** Custom property declarations (`--name: value;`) in a stylesheet. */
function declarations(css: string): Map<string, string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const found = new Map<string, string>();
  for (const [, name, value] of withoutComments.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    found.set(name, value.trim());
  }
  return found;
}

function luminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/../g)!
    .map((pair) => {
      const c = Number.parseInt(pair, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Surfaces that text can sit on. */
const surfaces = ["bg", "surface", "panel"] as const;

/** Tones components render as text, which must be readable on every surface. */
const toneTexts = ["primary-text", "success-text", "warning-text", "danger-text"] as const;

/**
 * Foreground/background pairs that must meet WCAG AA for normal text.
 * `-contrast` tokens are text on a solid fill; `-text` tokens are the tone
 * used as text on a surface.
 */
const textPairs = [
  ...surfaces.flatMap((surface) => [
    ["text", surface] as const,
    ["text-muted", surface] as const,
    ...toneTexts.map((tone) => [tone, surface] as const),
  ]),
  ["primary-contrast", "primary"],
  ["secondary-contrast", "secondary"],
  ["danger-contrast", "danger"],
] as const;

const stylesheets = [
  { label: "default tokens", file: "tokens.css" },
  ...themeNames.map((name) => ({ label: `${name} theme`, file: `themes/${name}.css` })),
];

describe.each(stylesheets)("$label", ({ file }) => {
  const values = declarations(readCss(file));

  test("defines exactly the core token contract", () => {
    const expected = allGameTokens.map((token) => `--game-${token}`).sort();
    expect([...values.keys()].sort()).toEqual(expected);
  });

  test.each(textPairs)("%s on %s meets 4.5:1 contrast", (fg, bg) => {
    const ratio = contrast(values.get(`--game-${fg}`)!, values.get(`--game-${bg}`)!);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

test.each(themeNames)("%s theme is scoped, layered, exported, and bundled", (name) => {
  const css = readCss(`themes/${name}.css`);
  expect(css).toContain(`[data-game-theme="${name}"]`);
  expect(css).toContain("@layer game-ui.themes");
  const path = `./src/css/themes/${name}.css`;
  expect(packageJson.exports).toHaveProperty([`./themes/${name}.css`], path);
  expect(packageJson.publishConfig.exports).toHaveProperty([`./themes/${name}.css`], path);
  expect(readCss("index.css")).toContain(`@import "./themes/${name}.css";`);
});

describe("reduced motion", () => {
  const base = readCss("base.css");

  test("zeroes both duration tokens for players who ask for less motion", () => {
    const block = base.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n {2}\}/)?.[0];
    expect(block).toBeTruthy();
    expect(block).toContain("--game-duration-fast: 0ms;");
    expect(block).toContain("--game-duration-normal: 0ms;");
    // Region-scoped themes redeclare the tokens, so the override must reach
    // them too, not only `:root`.
    expect(block).toContain("[data-game-theme]");
  });

  test.each(stylesheets)("$label declares durations the override can replace", ({ file }) => {
    const values = declarations(readCss(file));
    for (const token of ["duration-fast", "duration-normal"] as const) {
      expect(values.get(`--game-${token}`)).toMatch(/^\d+ms$/);
    }
  });
});

describe("tailwind mapping", () => {
  const mapping = declarations(readCss("tailwind.css"));

  test("only references core tokens", () => {
    const tokens = new Set(allGameTokens.map((token) => `var(--game-${token})`));
    for (const value of mapping.values()) {
      expect(tokens).toContain(value);
    }
  });

  test("generates utilities that read semantic variables", async () => {
    const compiler = await compile(`@tailwind utilities;\n${readCss("tailwind.css")}`);
    const css = compiler.build([
      "bg-game-panel",
      "text-game-text",
      "border-game-border",
      "rounded-game-md",
      "shadow-game",
      "p-game-md",
      "font-game-display",
      "text-game-lg",
    ]);

    expect(css).toMatch(/\.bg-game-panel\s*{\s*background-color: var\(--game-panel\);/);
    expect(css).toMatch(/\.rounded-game-md\s*{\s*border-radius: var\(--game-radius-md\);/);
    expect(css).toMatch(/\.p-game-md\s*{\s*padding: var\(--game-space-md\);/);
    expect(css).toMatch(/\.font-game-display\s*{\s*font-family: var\(--game-font-display\);/);
    expect(css).toContain("font-size: var(--game-font-size-lg)");
    expect(css).toContain("var(--game-shadow)");
  });
});
