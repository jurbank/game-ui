// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { createStick, createTouchButton } from "../src/input/index.ts";
import { TouchButton, TouchControls, VirtualStick } from "../src/react/index.ts";

afterEach(cleanup);

/** Gives an element a layout box, which happy-dom does not compute. */
function layout(element: Element, left: number, top: number, width: number, height = width) {
  Object.defineProperty(element, "offsetWidth", { configurable: true, value: width });
  element.getBoundingClientRect = () =>
    ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect;
}

const pointer = (pointerId: number, clientX: number, clientY: number) => ({
  pointerId,
  clientX,
  clientY,
  pointerType: "touch",
});

test("a static stick reads drags from its center and releases on lift", () => {
  const stick = createStick({ deadzone: 0 });
  const { container } = render(<VirtualStick control={stick} />);
  const base = container.firstElementChild!;
  layout(base, 0, 0, 100);

  fireEvent.pointerDown(base, pointer(1, 75, 50));
  expect(stick.read()).toMatchObject({ x: 0.5, y: 0, active: true });
  expect(base.hasAttribute("data-active")).toBe(true);

  const knob = base.querySelector<HTMLElement>("[data-game-part=knob]")!;
  expect(knob.style.translate).toBe("25px 0px");

  // Another finger does not steal the stick.
  fireEvent.pointerMove(base, pointer(2, 50, 0));
  expect(stick.read().y).toBe(0);

  fireEvent.pointerMove(base, pointer(1, 50, 200));
  expect(stick.read()).toMatchObject({ x: 0, y: 1 });

  fireEvent.pointerUp(base, pointer(1, 50, 200));
  expect(stick.read().active).toBe(false);
  expect(base.hasAttribute("data-active")).toBe(false);
  expect(knob.style.translate).toBe("");
});

test("a dynamic stick centers where the thumb lands, inside its zone", () => {
  const stick = createStick({ deadzone: 0 });
  const { container } = render(<VirtualStick control={stick} mode="dynamic" area="right" />);
  const zone = container.firstElementChild!;
  const base = zone.querySelector<HTMLElement>("[data-game-part=base]")!;
  expect(zone.getAttribute("data-area")).toBe("right");
  layout(zone, 400, 0, 400, 300);
  layout(base, 0, 0, 100);

  fireEvent.pointerDown(zone, pointer(1, 600, 150));
  expect(stick.read()).toMatchObject({ x: 0, y: 0, active: true });
  expect(base.style.translate).toBe("150px 100px");

  fireEvent.pointerMove(zone, pointer(1, 600, 100));
  expect(stick.read()).toMatchObject({ x: 0, y: -1 });
  fireEvent.pointerCancel(zone, pointer(1, 600, 100));
  expect(stick.read().active).toBe(false);

  // Near the edge, the stick shifts inward so it stays whole.
  fireEvent.pointerDown(zone, pointer(2, 410, 290));
  expect(base.style.translate).toBe("0px 200px");
  // (-40, 40) from center is past the rim, so it clamps to full travel.
  expect(stick.read()).toMatchObject({ x: expect.closeTo(-0.707, 3), y: expect.closeTo(0.707, 3) });
});

test("unmounting mid-drag releases the stick", () => {
  const stick = createStick();
  const { container, unmount } = render(<VirtualStick control={stick} />);
  layout(container.firstElementChild!, 0, 0, 100);
  fireEvent.pointerDown(container.firstElementChild!, pointer(1, 100, 50));
  expect(stick.read().active).toBe(true);
  unmount();
  expect(stick.read().active).toBe(false);
});

test("a touch button holds while pressed and latches the press for the game", () => {
  const button = createTouchButton();
  const { getByText } = render(<TouchButton control={button}>Dash</TouchButton>);
  const element = getByText("Dash");
  expect(element.getAttribute("aria-hidden")).toBe("true");

  fireEvent.pointerDown(element, pointer(3, 0, 0));
  expect(button.held).toBe(true);
  expect(element.hasAttribute("data-pressed")).toBe(true);
  fireEvent.pointerUp(element, pointer(3, 0, 0));
  expect(button.held).toBe(false);
  expect(element.hasAttribute("data-pressed")).toBe(false);
  expect(button.consumePress()).toBe(true);
});

test("the pointer handlers pass through and can cancel the control", () => {
  const button = createTouchButton();
  const { getByText } = render(
    <TouchButton control={button} onPointerDown={(event) => event.preventDefault()}>
      Dash
    </TouchButton>,
  );
  fireEvent.pointerDown(getByText("Dash"), pointer(1, 0, 0));
  expect(button.held).toBe(false);
});

test("touch controls show on touch, hide on keys, and can be forced", () => {
  const { queryByText, rerender } = render(
    <TouchControls>
      <span>stick</span>
    </TouchControls>,
  );
  expect(queryByText("stick")).toBeNull();

  act(() => {
    window.dispatchEvent(Object.assign(new Event("pointerdown"), { pointerType: "touch" }));
  });
  expect(queryByText("stick")).not.toBeNull();
  act(() => {
    window.dispatchEvent(new Event("keydown"));
  });
  expect(queryByText("stick")).toBeNull();

  rerender(
    <TouchControls show="always">
      <span>stick</span>
    </TouchControls>,
  );
  expect(queryByText("stick")).not.toBeNull();
  rerender(
    <TouchControls show="never">
      <span>stick</span>
    </TouchControls>,
  );
  expect(queryByText("stick")).toBeNull();
});

test("twin sticks each follow their own finger at the same time", () => {
  const move = createStick({ deadzone: 0 });
  const aim = createStick({ deadzone: 0 });
  const { container } = render(
    <>
      <VirtualStick control={move} mode="dynamic" area="left" />
      <VirtualStick control={aim} mode="dynamic" area="right" />
    </>,
  );
  const [left, right] = container.querySelectorAll("[data-mode=dynamic]");
  layout(left!, 0, 0, 400, 300);
  layout(right!, 400, 0, 400, 300);
  for (const zone of [left!, right!])
    layout(zone.querySelector("[data-game-part=base]")!, 0, 0, 100);

  fireEvent.pointerDown(left!, pointer(1, 200, 150));
  fireEvent.pointerDown(right!, pointer(2, 600, 150));
  fireEvent.pointerMove(left!, pointer(1, 250, 150));
  fireEvent.pointerMove(right!, pointer(2, 600, 100));
  expect(move.read()).toMatchObject({ x: 1, y: 0, active: true });
  expect(aim.read()).toMatchObject({ x: 0, y: -1, active: true });

  // Lifting the aim finger leaves movement held.
  fireEvent.pointerUp(right!, pointer(2, 600, 100));
  expect(aim.read().active).toBe(false);
  expect(move.read()).toMatchObject({ x: 1, active: true });
});
