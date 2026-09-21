// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from "vite-plus/test";
import { createStick, createTouchButton, watchTouchInput } from "../src/input/index.ts";

afterEach(() => document.body.replaceChildren());

test("a stick rests at zero and reads the pointer's offset as a direction", () => {
  const stick = createStick({ deadzone: 0 });
  expect(stick.read()).toEqual({ x: 0, y: 0, magnitude: 0, active: false });

  stick.move(0.5, 0);
  expect(stick.read()).toEqual({ x: 0.5, y: 0, magnitude: 0.5, active: true });

  // y is positive downward, like the screen.
  stick.move(0, 1);
  expect(stick.read()).toMatchObject({ x: 0, y: 1 });
});

test("offsets past the rim clamp to full travel, keeping the direction", () => {
  const stick = createStick({ deadzone: 0 });
  stick.move(3, 4);
  expect(stick.read()).toMatchObject({ x: 0.6, y: 0.8, magnitude: 1 });
  expect(stick.knob()).toEqual({ x: expect.closeTo(0.6), y: expect.closeTo(0.8) });
});

test("the dead zone reads as no input while held, then ramps from zero", () => {
  const stick = createStick({ deadzone: 0.2 });
  stick.move(0.1, 0);
  expect(stick.read()).toEqual({ x: 0, y: 0, magnitude: 0, active: true });
  // The knob still follows the thumb.
  expect(stick.knob()).toEqual({ x: 0.1, y: 0 });

  stick.move(0.6, 0);
  expect(stick.read().x).toBeCloseTo(0.5);
  stick.move(1, 0);
  expect(stick.read().x).toBe(1);
});

test("snapping picks the nearest of 4 or 8 directions and keeps the magnitude", () => {
  const four = createStick({ deadzone: 0, snap: "4way" });
  four.move(0.8, -0.3);
  expect(four.read()).toMatchObject({ x: expect.closeTo(0.854, 3), y: 0 });

  const eight = createStick({ deadzone: 0, snap: "8way" });
  eight.move(0.7, 0.6);
  const { x, y, magnitude } = eight.read();
  expect(x).toBeCloseTo(y);
  expect(Math.hypot(x, y)).toBeCloseTo(magnitude);
  eight.move(-1, 0.1);
  expect(eight.read()).toMatchObject({ x: -1, y: 0 });
});

test("release returns the stick to rest and notifies subscribers once", () => {
  const stick = createStick();
  const listener = vi.fn();
  const unsubscribe = stick.subscribe(listener);

  stick.move(1, 0);
  stick.release();
  stick.release();
  expect(listener).toHaveBeenCalledTimes(2);
  expect(stick.read().active).toBe(false);
  expect(stick.knob()).toEqual({ x: 0, y: 0 });

  unsubscribe();
  stick.move(1, 0);
  expect(listener).toHaveBeenCalledTimes(2);
});

test("ignores non-finite offsets", () => {
  const stick = createStick();
  stick.move(Number.NaN, 0);
  expect(stick.read().active).toBe(false);
});

test("a touch button reports held, and a press is latched until consumed", () => {
  const button = createTouchButton();
  expect(button.held).toBe(false);
  expect(button.consumePress()).toBe(false);

  // A tap shorter than a game tick: pressed and released between two reads.
  button.press();
  button.release();
  expect(button.held).toBe(false);
  expect(button.consumePress()).toBe(true);
  expect(button.consumePress()).toBe(false);

  button.press();
  expect(button.held).toBe(true);
  // Holding is one press, not one per call.
  button.press();
  expect(button.consumePress()).toBe(true);
  expect(button.consumePress()).toBe(false);
});

function fakeWindow(coarse: boolean) {
  const target = new EventTarget() as EventTarget & Pick<Window, "matchMedia">;
  target.matchMedia = ((query: string) => ({
    matches: coarse && query === "(pointer: coarse)",
  })) as never;
  return target;
}

function pointerDown(target: EventTarget, pointerType: string) {
  const event = new Event("pointerdown");
  Object.assign(event, { pointerType });
  target.dispatchEvent(event);
}

test("touch input starts from the pointer type and follows the last input", () => {
  const target = fakeWindow(false);
  const seen: boolean[] = [];
  const stop = watchTouchInput((touch) => seen.push(touch), { target });
  expect(seen).toEqual([false]);

  pointerDown(target, "touch");
  pointerDown(target, "touch");
  expect(seen).toEqual([false, true]);

  target.dispatchEvent(new Event("keydown"));
  expect(seen).toEqual([false, true, false]);

  pointerDown(target, "pen");
  pointerDown(target, "mouse");
  expect(seen).toEqual([false, true, false, true, false]);

  stop();
  pointerDown(target, "touch");
  expect(seen).toHaveLength(5);
});

test("keys typed into a text field do not turn touch input off", () => {
  const target = fakeWindow(true);
  const seen: boolean[] = [];
  const stop = watchTouchInput((touch) => seen.push(touch), { target });
  expect(seen).toEqual([true]);

  document.body.innerHTML = `<input id="name">`;
  document.querySelector<HTMLInputElement>("#name")!.focus();
  target.dispatchEvent(new Event("keydown"));
  expect(seen).toEqual([true]);
  stop();
});
