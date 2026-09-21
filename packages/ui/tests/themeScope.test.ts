// @vitest-environment happy-dom
import { afterEach, expect, test } from "vite-plus/test";
import { readThemeScope } from "../src/react/internal/themeScope.ts";

afterEach(() => document.body.replaceChildren());

test("reads the nearest theme and resolved token values", () => {
  document.body.innerHTML = `
    <div data-game-theme="arcade">
      <div data-game-theme="tactical">
        <span id="anchor" style="--game-primary: #ff00aa; --game-radius-md: 0"></span>
      </div>
    </div>`;
  const scope = readThemeScope(document.getElementById("anchor")!);
  expect(scope.theme).toBe("tactical");
  expect(scope.style).toMatchObject({ "--game-primary": "#ff00aa", "--game-radius-md": "0" });
});

test("ignores properties that are not game tokens", () => {
  document.body.innerHTML = `<span id="anchor" style="--other: 1; color: red"></span>`;
  expect(readThemeScope(document.getElementById("anchor")!)).toEqual({
    theme: undefined,
    style: {},
  });
});
