// @vitest-environment happy-dom
import { afterEach, expect, test } from "vite-plus/test";
import { releaseFocusOnGameKeys, uiOwnsKeyboard } from "../src/input/index.ts";

afterEach(() => document.body.replaceChildren());

function focus(html: string, selector: string) {
  document.body.innerHTML = html;
  document.querySelector<HTMLElement>(selector)!.focus();
}

test("the game owns the keyboard when nothing, or a plain control, has focus", () => {
  expect(uiOwnsKeyboard()).toBe(false);
  focus(`<button id="b">Invite</button>`, "#b");
  expect(uiOwnsKeyboard()).toBe(false);
});

test.each([
  [`<input id="t">`, "#t"],
  [`<textarea id="t"></textarea>`, "#t"],
  [`<div role="dialog"><button id="t">Done</button></div>`, "#t"],
  [`<div role="slider" tabindex="0" id="t"></div>`, "#t"],
  [`<div role="tablist"><button role="tab" id="t">Audio</button></div>`, "#t"],
  [`<div data-game-ui-keyboard><button id="t">Custom</button></div>`, "#t"],
])("the UI owns the keyboard with focus in %s", (html, selector) => {
  focus(html, selector);
  expect(uiOwnsKeyboard()).toBe(true);
});

test("a game key releases focus from a plain button", () => {
  const release = releaseFocusOnGameKeys({ keys: ["Space"] });
  focus(`<button id="b">Invite</button>`, "#b");
  const button = document.querySelector("button")!;

  button.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", bubbles: true }));
  expect(document.activeElement).toBe(document.body);
  release();
});

test("leaves focus alone for other keys and for controls that use the keyboard", () => {
  const release = releaseFocusOnGameKeys({ keys: ["Space", "ArrowLeft"] });

  focus(`<button id="b">Invite</button>`, "#b");
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter" }));
  expect(document.activeElement?.id).toBe("b");

  focus(`<div role="dialog"><button id="d">Done</button></div>`, "#d");
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
  expect(document.activeElement?.id).toBe("d");
  release();
});

test("never prevents the default, so engines still receive the key", () => {
  const release = releaseFocusOnGameKeys({ keys: ["Space"] });
  focus(`<button id="b">Invite</button>`, "#b");
  const event = new KeyboardEvent("keydown", { code: "Space", bubbles: true, cancelable: true });
  document.activeElement!.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  release();
});

test("stops listening when released", () => {
  const release = releaseFocusOnGameKeys({ keys: ["Space"] });
  release();
  focus(`<button id="b">Invite</button>`, "#b");
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
  expect(document.activeElement?.id).toBe("b");
});
