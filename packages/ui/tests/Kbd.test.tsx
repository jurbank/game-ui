// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { Kbd } from "../src/react/index.ts";

afterEach(cleanup);

test("renders a kbd element styled as a key cap", () => {
  render(<Kbd>Space</Kbd>);
  const key = screen.getByText("Space");
  expect(key.tagName).toBe("KBD");
  expect(key.className).toContain("border-b-[3px]");
  expect(key.dataset.size).toBe("sm");
});

test("passes through size, class names, refs, and native props", () => {
  const ref = createRef<HTMLElement>();
  render(
    <Kbd ref={ref} size="md" className="mx-1" title="Dash">
      Shift
    </Kbd>,
  );
  expect(ref.current?.dataset.size).toBe("md");
  expect(ref.current?.className).toContain("text-game-md");
  expect(ref.current?.className.split(" ").at(-1)).toBe("mx-1");
  expect(ref.current?.title).toBe("Dash");
});
