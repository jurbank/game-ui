// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { ProgressBar } from "../src/index.ts";

afterEach(cleanup);

/** The element Base UI sizes from the value, as a percentage width. */
function indicatorWidth() {
  return screen.getByRole("progressbar").querySelector<HTMLElement>("[data-game-part=indicator]")
    ?.style.width;
}

test("is a progressbar named by its label, reporting value and range", () => {
  render(<ProgressBar label="Shield" value={42} />);
  const bar = screen.getByRole("progressbar", { name: "Shield" });
  expect(bar.getAttribute("aria-valuenow")).toBe("42");
  expect(bar.getAttribute("aria-valuemin")).toBe("0");
  expect(bar.getAttribute("aria-valuemax")).toBe("100");
  expect(bar.getAttribute("aria-valuetext")).toBe("42%");
  expect(indicatorWidth()).toBe("42%");
});

test("an unlabelled bar takes its name from aria-label", () => {
  render(<ProgressBar aria-label="Health" value={10} />);
  expect(screen.getByRole("progressbar", { name: "Health" })).toBeTruthy();
});

test("reports progress against a game-supplied range", () => {
  render(<ProgressBar aria-label="Health" value={30} max={60} />);
  const bar = screen.getByRole("progressbar");
  expect(bar.getAttribute("aria-valuenow")).toBe("30");
  expect(bar.getAttribute("aria-valuemax")).toBe("60");
  expect(indicatorWidth()).toBe("50%");
});

test("an empty bar is at the minimum, and is not complete", () => {
  render(<ProgressBar aria-label="Health" value={0} />);
  const bar = screen.getByRole("progressbar");
  expect(indicatorWidth()).toBe("0%");
  expect(bar.dataset.complete).toBeUndefined();
  expect(bar.dataset.progressing).toBe("");
});

test("a full bar is complete", () => {
  render(<ProgressBar aria-label="Reload" value={100} />);
  const bar = screen.getByRole("progressbar");
  expect(indicatorWidth()).toBe("100%");
  expect(bar.dataset.complete).toBe("");
  expect(bar.getAttribute("aria-valuetext")).toBe("100%");
});

test("clamps values outside the range", () => {
  const { rerender } = render(<ProgressBar aria-label="Health" value={140} />);
  expect(indicatorWidth()).toBe("100%");
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");

  rerender(<ProgressBar aria-label="Health" value={-20} />);
  expect(indicatorWidth()).toBe("0%");
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
});

test("a null value is indeterminate", () => {
  render(<ProgressBar aria-label="Loading" value={null} />);
  const bar = screen.getByRole("progressbar");
  expect(bar.dataset.indeterminate).toBe("");
  expect(bar.getAttribute("aria-valuenow")).toBeNull();
  expect(indicatorWidth()).toBe("");
});

test("a non-finite value is indeterminate rather than a broken bar", () => {
  render(<ProgressBar aria-label="Loading" value={Number.NaN} />);
  expect(screen.getByRole("progressbar").dataset.indeterminate).toBe("");
  expect(indicatorWidth()).toBe("");
});

test("an unusable range renders an empty bar", () => {
  const { rerender } = render(<ProgressBar aria-label="Health" value={50} max={0} />);
  expect(indicatorWidth()).toBe("0%");
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");

  rerender(<ProgressBar aria-label="Health" value={50} min={10} max={10} />);
  expect(indicatorWidth()).toBe("0%");

  rerender(<ProgressBar aria-label="Health" value={50} max={Number.POSITIVE_INFINITY} />);
  expect(indicatorWidth()).toBe("0%");
});

test("an unusable range still allows indeterminate", () => {
  render(<ProgressBar aria-label="Loading" value={null} max={0} />);
  expect(screen.getByRole("progressbar").dataset.indeterminate).toBe("");
});

test("shows the formatted value when asked", () => {
  const { rerender } = render(<ProgressBar label="XP" value={25} showValue />);
  expect(screen.getByText("25%")).toBeTruthy();

  rerender(
    <ProgressBar
      label="XP"
      value={1250}
      max={5000}
      showValue
      format={{ style: "decimal" }}
      locale="en-US"
    />,
  );
  expect(screen.getByText("1,250")).toBeTruthy();
  expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe("1,250");
});

test("renders no header when there is nothing to show in it", () => {
  render(<ProgressBar aria-label="Health" value={10} />);
  const bar = screen.getByRole("progressbar");
  // The track comes first; Base UI appends its own visually hidden live region.
  expect(bar.firstElementChild?.className).toContain("h-game-md");
  expect(bar.textContent).toBe("x");
});

test("applies variant, size, class names, and refs", () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <ProgressBar
      ref={ref}
      aria-label="Health"
      value={10}
      variant="danger"
      size="lg"
      className="w-40"
    />,
  );
  const bar = screen.getByRole("progressbar");
  expect(ref.current).toBe(bar);
  expect(bar.dataset.variant).toBe("danger");
  expect(bar.dataset.size).toBe("lg");
  expect(bar.className.split(" ").at(-1)).toBe("w-40");
  expect(bar.querySelector("[data-game-part=indicator]")?.className).toContain("bg-game-danger");
  expect(bar.firstElementChild?.className).toContain("h-game-lg");
});

test("the indicator fills the track height in every state", () => {
  render(<ProgressBar aria-label="Loading" value={null} />);
  const indicator = screen
    .getByRole("progressbar")
    .querySelector<HTMLElement>("[data-game-part=indicator]");
  // Base UI only sets an inline height while a value is known.
  expect(indicator?.style.height).toBe("");
  expect(indicator?.className).toContain("h-full");
});

test("measures progress within a range that does not start at zero", () => {
  const { rerender } = render(<ProgressBar aria-label="Reactor" value={15} min={10} max={20} />);
  expect(indicatorWidth()).toBe("50%");
  expect(screen.getByRole("progressbar").getAttribute("aria-valuemin")).toBe("10");

  rerender(<ProgressBar aria-label="Reactor" value={10} min={10} max={20} />);
  expect(indicatorWidth()).toBe("0%");

  // Below the minimum clamps to the minimum, not to zero.
  rerender(<ProgressBar aria-label="Reactor" value={4} min={10} max={20} />);
  expect(indicatorWidth()).toBe("0%");
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("10");
});

test("follows a value the game changes", () => {
  const { rerender } = render(<ProgressBar aria-label="Health" value={100} />);
  expect(indicatorWidth()).toBe("100%");
  expect(screen.getByRole("progressbar").dataset.complete).toBe("");

  rerender(<ProgressBar aria-label="Health" value={40} />);
  expect(indicatorWidth()).toBe("40%");
  expect(screen.getByRole("progressbar").dataset.complete).toBeUndefined();
  expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe("40%");

  // A value that becomes unknown mid-match stops reporting a number.
  rerender(<ProgressBar aria-label="Health" value={null} />);
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBeNull();
});
