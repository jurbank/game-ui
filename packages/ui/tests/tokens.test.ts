import { expect, test } from "vite-plus/test";
import { allGameTokens, gameTokens, tokenProperty, tokenVar } from "../src/index.ts";

test("token names are unique", () => {
  expect(new Set(allGameTokens).size).toBe(allGameTokens.length);
});

test("token names are lowercase kebab-case", () => {
  for (const token of allGameTokens) {
    expect(token).toMatch(/^[a-z]+(-[a-z]+)*$/);
  }
});

test("flat list covers every category", () => {
  const categoryTotal = Object.values(gameTokens).reduce((sum, names) => sum + names.length, 0);
  expect(allGameTokens).toHaveLength(categoryTotal);
});

test("tokens map to --game- custom properties", () => {
  expect(tokenProperty("panel")).toBe("--game-panel");
  expect(tokenVar("radius-md")).toBe("var(--game-radius-md)");
});
