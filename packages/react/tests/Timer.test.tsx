// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { Timer } from "../src/index.ts";
import { formatDuration } from "../src/components/Timer/Timer.format.ts";

afterEach(cleanup);

const reading = () => screen.getByRole("timer").textContent;

test("shows a game-provided time in minutes and seconds", () => {
  render(<Timer aria-label="Time" value={95_000} />);
  expect(reading()).toBe("1:35");
  expect(screen.getByRole("timer").getAttribute("datetime")).toBe("PT0H1M35S");
});

test("truncates rather than rounds, so a unit is never shown early", () => {
  const { rerender } = render(<Timer aria-label="Time" value={59_999} />);
  expect(reading()).toBe("0:59");

  rerender(<Timer aria-label="Time" value={60_000} />);
  expect(reading()).toBe("1:00");

  rerender(<Timer aria-label="Time" value={999} />);
  expect(reading()).toBe("0:00");
});

test("a countdown past zero reads as zero, not negative time", () => {
  render(<Timer aria-label="Time" value={-5_000} />);
  expect(reading()).toBe("0:00");
});

test("shows hours only once they are reached", () => {
  const { rerender } = render(<Timer aria-label="Time" value={3_599_000} />);
  expect(reading()).toBe("59:59");

  rerender(<Timer aria-label="Time" value={3_600_000} />);
  expect(reading()).toBe("1:00:00");
});

test("hours can be forced on or folded into minutes", () => {
  const { rerender } = render(<Timer aria-label="Time" value={95_000} hours="always" />);
  expect(reading()).toBe("0:01:35");

  rerender(<Timer aria-label="Time" value={5_400_000} hours="never" />);
  expect(reading()).toBe("90:00");
  // The machine-readable value still carries the hours.
  expect(screen.getByRole("timer").getAttribute("datetime")).toBe("PT1H30M0S");
});

test("shows fractions of a second at higher precision", () => {
  const { rerender } = render(<Timer aria-label="Time" value={9_370} precision="tenths" />);
  expect(reading()).toBe("0:09.3");

  rerender(<Timer aria-label="Time" value={9_378} precision="hundredths" />);
  expect(reading()).toBe("0:09.37");
});

test("an unknown time is a placeholder rather than zero", () => {
  const { rerender } = render(<Timer aria-label="Time" value={Number.NaN} />);
  expect(reading()).toBe("--:--");
  expect(screen.getByRole("timer").getAttribute("datetime")).toBeNull();

  rerender(<Timer aria-label="Time" value={Number.POSITIVE_INFINITY} precision="tenths" />);
  expect(reading()).toBe("--:--.-");
});

test("is named by its visible label", () => {
  render(<Timer label="Time remaining" value={30_000} />);
  expect(screen.getByRole("timer", { name: "Time remaining" }).textContent).toBe("0:30");
});

test("an explicit aria-label wins over the visible label", () => {
  render(<Timer label="Time" aria-label="Time remaining in round 3" value={30_000} />);
  expect(screen.getByRole("timer", { name: "Time remaining in round 3" })).toBeTruthy();
});

test("applies variant, size, class names, and refs", () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Timer
      ref={ref}
      aria-label="Time"
      value={12_000}
      variant="danger"
      size="lg"
      className="ml-auto"
      data-testid="timer"
    />,
  );
  const root = screen.getByTestId("timer");
  expect(ref.current).toBe(root);
  expect(root.dataset.variant).toBe("danger");
  expect(root.dataset.size).toBe("lg");
  expect(root.className.split(" ").at(-1)).toBe("ml-auto");
  expect(screen.getByRole("timer").className).toContain("text-game-danger-text");
  expect(screen.getByRole("timer").className).toContain("text-game-xl");
});

test("formats durations without a component", () => {
  expect(formatDuration(0)).toEqual({ text: "0:00", dateTime: "PT0H0M0S" });
  expect(formatDuration(3_723_400, "tenths")).toEqual({
    text: "1:02:03.4",
    dateTime: "PT1H2M3.4S",
  });
});

test("follows a clock the game advances", () => {
  const { rerender } = render(<Timer aria-label="Time" value={61_000} />);
  expect(reading()).toBe("1:01");

  rerender(<Timer aria-label="Time" value={1_000} />);
  expect(reading()).toBe("0:01");
  expect(screen.getByRole("timer").getAttribute("datetime")).toBe("PT0H0M1S");

  rerender(<Timer aria-label="Time" value={0} />);
  expect(reading()).toBe("0:00");
});

test("truncates at fractional boundaries too", () => {
  const { rerender } = render(<Timer aria-label="Time" value={9_999} precision="tenths" />);
  expect(reading()).toBe("0:09.9");

  rerender(<Timer aria-label="Time" value={9_999} precision="hundredths" />);
  expect(reading()).toBe("0:09.99");
});

test("handles durations far beyond a single match", () => {
  render(<Timer aria-label="Playtime" value={360_000_000} />);
  expect(reading()).toBe("100:00:00");
});
