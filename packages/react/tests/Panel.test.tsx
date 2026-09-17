// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { Panel } from "../src/index.ts";

afterEach(cleanup);

test("a titled panel is a region named by its heading", () => {
  render(<Panel title="Squad">Members</Panel>);
  const region = screen.getByRole("region", { name: "Squad" });
  const heading = screen.getByRole("heading", { level: 2, name: "Squad" });
  expect(region.contains(heading)).toBe(true);
  expect(region.textContent).toContain("Members");
});

test("forwards refs to titled panels", () => {
  const ref = createRef<HTMLElement>();
  render(
    <Panel ref={ref} title="Match">
      Round 3
    </Panel>,
  );
  expect(ref.current).toBe(screen.getByRole("region", { name: "Match" }));
});

test("heading level follows the document outline", () => {
  render(
    <Panel title="Loadout" headingLevel={3}>
      Items
    </Panel>,
  );
  expect(screen.getByRole("heading", { level: 3, name: "Loadout" })).toBeTruthy();
});

test("an untitled panel is a plain container without a landmark", () => {
  const { container } = render(<Panel>Score: 42</Panel>);
  expect(screen.queryByRole("region")).toBeNull();
  expect(container.firstElementChild?.tagName).toBe("DIV");
  expect(container.textContent).toBe("Score: 42");
});

test("an explicit accessible name overrides the heading reference", () => {
  render(
    <Panel title="Stats" aria-labelledby={undefined} aria-label="Player statistics">
      Kills
    </Panel>,
  );
  expect(screen.getByRole("region", { name: "Player statistics" })).toBeTruthy();
});

test("applies variant, padding, class names, and refs", () => {
  const ref = createRef<HTMLElement>();
  render(
    <Panel ref={ref} variant="raised" padding="lg" className="w-80" data-testid="panel">
      Content
    </Panel>,
  );
  const panel = screen.getByTestId("panel");
  expect(ref.current).toBe(panel);
  expect(panel.dataset.variant).toBe("raised");
  expect(panel.className).toContain("shadow-game");
  expect(panel.className).toContain("p-game-lg");
  expect(panel.className.split(" ").at(-1)).toBe("w-80");
});
