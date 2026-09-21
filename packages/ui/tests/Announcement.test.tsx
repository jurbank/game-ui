// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { Announcement } from "../src/react/index.ts";

afterEach(cleanup);

test("keeps an empty live region mounted, so later messages are announced", () => {
  render(<Announcement />);
  const region = screen.getByRole("status");
  expect(region.getAttribute("aria-live")).toBe("polite");
  expect(region.getAttribute("aria-atomic")).toBe("true");
  expect(region.textContent).toBe("");
});

test("shows the title and detail in the tone's text colour", () => {
  render(<Announcement title="Go!" detail="Most coins wins" tone="success" />);
  const region = screen.getByRole("status");
  expect(region.textContent).toBe("Go!Most coins wins");
  expect(screen.getByText("Go!").className).toContain("text-game-success-text");
  expect(region.dataset.tone).toBe("success");
});

test("a new title remounts the card so its entrance plays again", () => {
  const { rerender } = render(<Announcement title="3" />);
  const first = screen.getByRole("status").querySelector("[data-game-part=card]");
  rerender(<Announcement title="2" />);
  const second = screen.getByRole("status").querySelector("[data-game-part=card]");
  expect(second).not.toBe(first);
  expect(second?.textContent).toBe("2");
});

test("clearing the title hides the card", () => {
  const { rerender } = render(<Announcement title="Round over" />);
  rerender(<Announcement title={null} />);
  expect(screen.getByRole("status").textContent).toBe("");
});

test("never takes the pointer, even inside a HudSlot", () => {
  render(<Announcement title="3" politeness="assertive" />);
  const region = screen.getByRole("status");
  expect(region.className).toContain("pointer-events-none!");
  expect(region.getAttribute("aria-live")).toBe("assertive");
});
