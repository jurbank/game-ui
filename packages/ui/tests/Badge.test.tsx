// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { Badge } from "../src/react/index.ts";

afterEach(cleanup);

test("renders its text with the tone's text-safe colour", () => {
  render(<Badge tone="warning">Reconnecting</Badge>);
  const badge = screen.getByText("Reconnecting");
  expect(badge.dataset.tone).toBe("warning");
  expect(badge.className).toContain("text-game-warning-text");
  expect(badge.className).toContain("border-game-warning");
});

test("defaults to a muted small badge without a dot", () => {
  render(<Badge>Host</Badge>);
  const badge = screen.getByText("Host");
  expect(badge.dataset.tone).toBe("default");
  expect(badge.dataset.size).toBe("sm");
  expect(badge.querySelector("[data-game-part=dot]")).toBeNull();
});

test("an optional dot is decorative and matches the tone", () => {
  render(
    <Badge tone="success" dot>
      Online
    </Badge>,
  );
  const dot = screen.getByText("Online").querySelector("[data-game-part=dot]")!;
  expect(dot.getAttribute("aria-hidden")).toBe("true");
  expect(dot.className).toContain("bg-game-success");
  expect(screen.getByText("Online").textContent).toBe("Online");
});

test("passes through size, class names, refs, and native props", () => {
  const ref = createRef<HTMLSpanElement>();
  render(
    <Badge ref={ref} size="md" className="ml-2" title="Server region">
      EU
    </Badge>,
  );
  expect(ref.current?.dataset.size).toBe("md");
  expect(ref.current?.className.split(" ").at(-1)).toBe("ml-2");
  expect(ref.current?.title).toBe("Server region");
});
