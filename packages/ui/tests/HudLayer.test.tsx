// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { Button, HudLayer, HudSlot, type HudPlacement } from "../src/react/index.ts";

afterEach(cleanup);

test("places slots in their area of the grid and aligns content toward the edge", () => {
  const placements: HudPlacement[] = ["top-left", "top", "bottom-right", "center"];
  render(
    <HudLayer data-testid="layer">
      {placements.map((placement) => (
        <HudSlot key={placement} placement={placement} data-testid={placement} />
      ))}
    </HudLayer>,
  );
  expect(screen.getByTestId("top-left").className).toContain("col-start-1 row-start-1");
  expect(screen.getByTestId("top").className).toContain("justify-self-center");
  expect(screen.getByTestId("bottom-right").className).toContain("items-end");
  expect(screen.getByTestId("center").dataset.placement).toBe("center");
  // Bottom slots grow upward, so a tall stack never runs off the screen.
  expect(screen.getByTestId("bottom-right").className).toContain("justify-end");
});

test("lets the pointer through empty areas but not through slot content", () => {
  render(
    <HudLayer data-testid="layer">
      <HudSlot placement="top-right" data-testid="slot">
        <Button>Settings</Button>
      </HudSlot>
    </HudLayer>,
  );
  expect(screen.getByTestId("layer").className).toContain("pointer-events-none");
  // The slot ignores the pointer, but its children take it.
  const slot = screen.getByTestId("slot");
  expect(slot.className).toContain("pointer-events-none");
  expect(slot.className).toContain("*:pointer-events-auto");
});

test("covers the viewport by default, or a positioned container", () => {
  const { rerender } = render(<HudLayer data-testid="layer" />);
  expect(screen.getByTestId("layer").className.split(" ")).toContain("fixed");
  rerender(<HudLayer data-testid="layer" position="absolute" />);
  const layer = screen.getByTestId("layer");
  expect(layer.className.split(" ")).toContain("absolute");
  expect(layer.dataset.position).toBe("absolute");
});

test("insets respect device safe areas", () => {
  const { rerender } = render(<HudLayer data-testid="layer" />);
  expect(screen.getByTestId("layer").className).toContain(
    "pt-[max(var(--game-space-md),env(safe-area-inset-top))]",
  );
  rerender(<HudLayer data-testid="layer" inset="none" />);
  expect(screen.getByTestId("layer").className).toContain("pt-[env(safe-area-inset-top)]");
});

test("passes through class names, refs, and native props", () => {
  const layerRef = createRef<HTMLDivElement>();
  const slotRef = createRef<HTMLDivElement>();
  render(
    <HudLayer ref={layerRef} className="z-10" aria-label="Match HUD">
      <HudSlot ref={slotRef} placement="bottom" className="w-80" />
    </HudLayer>,
  );
  expect(layerRef.current?.getAttribute("aria-label")).toBe("Match HUD");
  expect(layerRef.current?.className.split(" ").at(-1)).toBe("z-10");
  expect(slotRef.current?.className.split(" ").at(-1)).toBe("w-80");
});
