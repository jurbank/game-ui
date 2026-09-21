// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { Slider } from "../src/react/index.ts";

afterEach(cleanup);

/**
 * Base UI keeps the thumb `visibility: hidden` until it can measure layout,
 * which happy-dom never provides, so queries include hidden elements. For the
 * same reason the testing library computes no accessible name, so naming
 * tests check the ARIA wiring directly.
 */
function slider() {
  return screen.getByRole("slider", { hidden: true });
}

test("is a slider named by its label, reporting value and range", () => {
  render(<Slider label="Music volume" defaultValue={40} />);
  const input = slider();
  const labelId = input.getAttribute("aria-labelledby");
  expect(labelId && document.getElementById(labelId)?.textContent).toBe("Music volume");
  expect(input.getAttribute("aria-valuenow")).toBe("40");
  expect(input.getAttribute("min")).toBe("0");
  expect(input.getAttribute("max")).toBe("100");
});

test("an unlabelled slider takes its name from aria-label", () => {
  render(<Slider aria-label="Sensitivity" defaultValue={5} min={1} max={10} />);
  expect(slider().getAttribute("aria-label")).toBe("Sensitivity");
});

test("arrow keys change the value by step; the game receives each change", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Slider aria-label="Volume" defaultValue={50} step={5} onValueChange={onValueChange} />);

  slider().focus();
  await user.keyboard("{ArrowRight}");
  expect(onValueChange).toHaveBeenLastCalledWith(55);
  await user.keyboard("{ArrowLeft}{ArrowLeft}");
  expect(onValueChange).toHaveBeenLastCalledWith(45);
  expect(slider().getAttribute("aria-valuenow")).toBe("45");
});

test("commits once per key press, so games can save or play a sound", async () => {
  const user = userEvent.setup();
  const onValueCommitted = vi.fn();
  render(<Slider aria-label="Volume" defaultValue={50} onValueCommitted={onValueCommitted} />);

  slider().focus();
  await user.keyboard("{ArrowUp}");
  expect(onValueCommitted).toHaveBeenCalledTimes(1);
  expect(onValueCommitted).toHaveBeenLastCalledWith(51);
});

test("stays within the range", async () => {
  const user = userEvent.setup();
  render(<Slider aria-label="Volume" defaultValue={100} />);
  slider().focus();
  await user.keyboard("{ArrowRight}{End}");
  expect(slider().getAttribute("aria-valuenow")).toBe("100");
  await user.keyboard("{Home}{ArrowLeft}");
  expect(slider().getAttribute("aria-valuenow")).toBe("0");
});

test("follows a value the game controls", async () => {
  const user = userEvent.setup();
  function Settings() {
    const [volume, setVolume] = useState(30);
    return (
      <>
        <Slider aria-label="Volume" value={volume} onValueChange={setVolume} />
        <output>{volume}</output>
      </>
    );
  }
  render(<Settings />);
  slider().focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByText("31")).toBeTruthy();
  expect(slider().getAttribute("aria-valuenow")).toBe("31");
});

test("a controlled slider ignores input the game does not accept", async () => {
  const user = userEvent.setup();
  render(<Slider aria-label="Volume" value={30} />);
  slider().focus();
  await user.keyboard("{ArrowRight}");
  expect(slider().getAttribute("aria-valuenow")).toBe("30");
});

test("shows the formatted value when asked", () => {
  render(
    <Slider
      label="Field of view"
      defaultValue={90}
      min={60}
      max={120}
      showValue
      format={{ style: "unit", unit: "degree" }}
      locale="en-US"
    />,
  );
  expect(screen.getByText("90 deg")).toBeTruthy();
});

test("disabled sliders cannot be changed", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Slider aria-label="Volume" defaultValue={50} disabled onValueChange={onValueChange} />);
  slider().focus();
  await user.keyboard("{ArrowRight}");
  expect(onValueChange).not.toHaveBeenCalled();
  expect(slider().hasAttribute("disabled")).toBe(true);
});

test("applies size, class names, and refs", () => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(
    <Slider ref={ref} aria-label="Volume" defaultValue={10} size="sm" className="w-40" />,
  );
  const root = container.firstElementChild as HTMLElement;
  expect(ref.current).toBe(root);
  expect(root.dataset.size).toBe("sm");
  expect(root.className.split(" ").at(-1)).toBe("w-40");
  expect(root.querySelector("[data-game-part=thumb]")?.className).toContain("size-[1rem]");
});
