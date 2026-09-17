// @vitest-environment happy-dom
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { Button, PlayerList, type PlayerEntry } from "../src/index.ts";

afterEach(cleanup);

const squad: PlayerEntry[] = [
  { id: "p1", name: "Nova", status: "Ready", statusTone: "success" },
  { id: "p2", name: "Rook", status: "Picking", statusTone: "warning" },
  { id: "p3", name: "Wisp" },
];

test("renders the game's entries as a list, in the given order", () => {
  render(<PlayerList aria-label="Squad" players={squad} />);
  const items = within(screen.getByRole("list", { name: "Squad" })).getAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual(["NovaReady", "RookPicking", "Wisp"]);
});

test("keeps the game's order rather than sorting", () => {
  const reversed = [...squad].reverse();
  render(<PlayerList aria-label="Squad" players={reversed} />);
  const names = screen.getAllByRole("listitem").map((item) => item.dataset.playerId);
  expect(names).toEqual(["p3", "p2", "p1"]);
});

test("an empty list explains itself instead of rendering an empty list", () => {
  render(<PlayerList aria-label="Squad" players={[]} />);
  expect(screen.queryByRole("list")).toBeNull();
  expect(screen.getByText("No players")).toBeTruthy();
});

test("the empty state can be replaced by the game", () => {
  render(<PlayerList aria-label="Squad" players={[]} empty="Waiting for players to join…" />);
  expect(screen.getByText("Waiting for players to join…")).toBeTruthy();
});

test("marks the local player's row", () => {
  render(
    <PlayerList
      aria-label="Squad"
      players={[
        { id: "p1", name: "Nova", self: true },
        { id: "p2", name: "Rook" },
      ]}
    />,
  );
  const [mine, other] = screen.getAllByRole("listitem");
  expect(mine?.dataset.self).toBe("");
  expect(other?.dataset.self).toBeUndefined();
});

test("shows icons, details, and toned statuses supplied by the game", () => {
  render(
    <PlayerList
      aria-label="Squad"
      players={[
        {
          id: "p1",
          name: "Nova",
          icon: <span data-testid="icon">★</span>,
          detail: "1,240",
          status: "Eliminated",
          statusTone: "danger",
        },
      ]}
    />,
  );
  const row = screen.getByRole("listitem");
  expect(within(row).getByTestId("icon")).toBeTruthy();
  expect(within(row).getByText("1,240")).toBeTruthy();
  const status = row.querySelector("[data-game-part=status]");
  expect(status?.textContent).toBe("Eliminated");
  expect(status?.className).toContain("text-game-danger-text");
});

test("a status without a tone is muted", () => {
  render(<PlayerList aria-label="Squad" players={[{ id: "p1", name: "Nova", status: "Idle" }]} />);
  expect(
    screen.getByRole("listitem").querySelector("[data-game-part=status]")?.className,
  ).toContain("text-game-text-muted");
});

test("per-player actions stay interactive", async () => {
  const user = userEvent.setup();
  const onKick = vi.fn();
  render(
    <PlayerList
      aria-label="Squad"
      players={[
        { id: "p1", name: "Nova", actions: <Button onClick={onKick}>Kick Nova</Button> },
        { id: "p2", name: "Rook" },
      ]}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Kick Nova" }));
  expect(onKick).toHaveBeenCalledTimes(1);
});

test("long names truncate and keep the full name available", () => {
  const name = "A very long player name that will not fit in a narrow lobby panel";
  render(<PlayerList aria-label="Squad" players={[{ id: "p1", name }]} />);
  const nameElement = screen.getByTitle(name);
  expect(nameElement.className).toContain("truncate");
  expect(nameElement.textContent).toBe(name);
});

test("applies size, class names, refs, and an empty marker", () => {
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(
    <PlayerList
      ref={ref}
      aria-label="Squad"
      players={squad}
      size="sm"
      className="max-w-80"
      data-testid="list"
    />,
  );
  const root = screen.getByTestId("list");
  expect(ref.current).toBe(root);
  expect(root.dataset.size).toBe("sm");
  expect(root.dataset.empty).toBeUndefined();
  expect(root.className.split(" ").at(-1)).toBe("max-w-80");
  expect(screen.getAllByRole("listitem")[0]?.className).toContain("text-game-sm");

  rerender(<PlayerList ref={ref} aria-label="Squad" players={[]} data-testid="list" />);
  expect(screen.getByTestId("list").dataset.empty).toBe("");
});

test("follows a roster the game changes", () => {
  const { rerender } = render(<PlayerList aria-label="Squad" players={squad} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(3);

  const afterElimination: PlayerEntry[] = [
    { id: "p1", name: "Nova", status: "Eliminated", statusTone: "danger" },
    { id: "p3", name: "Wisp", status: "Ready", statusTone: "success" },
  ];
  rerender(<PlayerList aria-label="Squad" players={afterElimination} />);
  const rows = screen.getAllByRole("listitem");
  expect(rows.map((row) => row.dataset.playerId)).toEqual(["p1", "p3"]);
  expect(rows[0]?.textContent).toBe("NovaEliminated");

  // A roster that empties mid-match falls back to the empty state.
  rerender(<PlayerList aria-label="Squad" players={[]} />);
  expect(screen.queryByRole("list")).toBeNull();
  expect(screen.getByText("No players")).toBeTruthy();
});

test("reaches every player's actions by keyboard, in row order", async () => {
  const user = userEvent.setup();
  render(
    <PlayerList
      aria-label="Squad"
      players={[
        { id: "p1", name: "Nova", actions: <Button>Mute Nova</Button> },
        { id: "p2", name: "Rook", actions: <Button>Mute Rook</Button> },
      ]}
    />,
  );

  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Mute Nova" }));
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Mute Rook" }));
});
