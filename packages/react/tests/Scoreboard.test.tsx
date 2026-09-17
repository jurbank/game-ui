// @vitest-environment happy-dom
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { Scoreboard, type ScoreboardRow } from "../src/index.ts";

afterEach(cleanup);

const rows: ScoreboardRow[] = [
  { id: "p3", name: "Wisp", rank: 1, score: 1510, highlight: true },
  { id: "p1", name: "Nova", rank: 2, score: 1240, self: true },
  { id: "p2", name: "Rook", rank: 3, score: 980 },
];

test("renders a table of the rows the game supplies, in order", () => {
  render(<Scoreboard caption="Final scores" rows={rows} />);
  const table = screen.getByRole("table", { name: "Final scores" });
  const names = within(table)
    .getAllByRole("rowheader")
    .map((cell) => cell.textContent);
  expect(names).toEqual(["Wisp", "Nova", "Rook"]);
});

test("the game's ranking is displayed, not computed", () => {
  // Tied players sharing a rank, in an order the game chose.
  render(
    <Scoreboard
      caption="Final scores"
      rows={[
        { id: "a", name: "Ash", rank: "1=", score: 10 },
        { id: "b", name: "Bee", rank: "1=", score: 10 },
      ]}
    />,
  );
  const ranks = screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent);
  expect(ranks).toEqual(["1=", "1="]);
});

test("marks the winning and local rows without deciding either", () => {
  render(<Scoreboard caption="Final scores" rows={rows} />);
  const [winner, mine, other] = screen.getAllByRole("row").slice(1);
  expect(winner?.dataset.highlight).toBe("");
  expect(winner?.dataset.rowId).toBe("p3");
  expect(mine?.dataset.self).toBe("");
  expect(other?.dataset.highlight).toBeUndefined();
  expect(other?.dataset.self).toBeUndefined();
});

test("shows extra statistic columns supplied by the game", () => {
  render(
    <Scoreboard
      caption="Match stats"
      columns={[
        { id: "kills", header: "K" },
        { id: "deaths", header: "D" },
        { id: "team", header: "Team", align: "start" },
      ]}
      rows={[
        { id: "p1", name: "Nova", score: 1240, values: { kills: 12, deaths: 4, team: "Red" } },
      ]}
    />,
  );
  const headers = screen.getAllByRole("columnheader").map((cell) => cell.textContent);
  expect(headers).toEqual(["Player", "K", "D", "Team", "Score"]);

  const cells = within(screen.getAllByRole("row")[1]!)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);
  expect(cells).toEqual(["12", "4", "Red", "1240"]);
});

test("a missing value for a column renders an empty cell", () => {
  render(
    <Scoreboard
      caption="Match stats"
      columns={[{ id: "kills", header: "K" }]}
      rows={[{ id: "p1", name: "Nova" }]}
    />,
  );
  expect(within(screen.getAllByRole("row")[1]!).getAllByRole("cell")[0]?.textContent).toBe("");
});

test("omits columns no row uses", () => {
  render(<Scoreboard caption="Scores" rows={[{ id: "p1", name: "Nova" }]} />);
  expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual(["Player"]);
});

test("statuses carry their tone", () => {
  render(
    <Scoreboard
      caption="Scores"
      rows={[{ id: "p1", name: "Nova", status: "Eliminated", statusTone: "danger" }]}
    />,
  );
  const status = screen.getAllByRole("row")[1]?.querySelector("[data-game-part=status]");
  expect(status?.textContent).toBe("Eliminated");
  expect(status?.className).toContain("text-game-danger");
});

test("an empty scoreboard explains itself instead of rendering an empty table", () => {
  render(<Scoreboard caption="Scores" rows={[]} />);
  expect(screen.queryByRole("table")).toBeNull();
  expect(screen.getByText("No results yet")).toBeTruthy();
});

test("the empty state can be replaced by the game", () => {
  render(<Scoreboard rows={[]} empty="The match has not started." />);
  expect(screen.getByText("The match has not started.")).toBeTruthy();
});

test("headers can be renamed for teams or other subjects", () => {
  render(
    <Scoreboard
      caption="Team scores"
      nameHeader="Team"
      scoreHeader="Points"
      rankHeader="Place"
      rows={[{ id: "red", name: "Red", rank: 1, score: 3 }]}
    />,
  );
  expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
    "Place",
    "Team",
    "Points",
  ]);
});

test("a caption can be hidden visually while still naming the table", () => {
  render(<Scoreboard caption="Final scores" hideCaption rows={rows} />);
  const table = screen.getByRole("table", { name: "Final scores" });
  expect(table.querySelector("caption")?.className).toContain("sr-only");
});

test("an explicit aria-label wins over the caption", () => {
  render(<Scoreboard caption="Scores" aria-label="Round 3 final scores" rows={rows} />);
  expect(screen.getByRole("table", { name: "Round 3 final scores" })).toBeTruthy();
});

test("applies size, class names, refs, and an empty marker", () => {
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(
    <Scoreboard
      ref={ref}
      caption="Scores"
      rows={rows}
      size="sm"
      className="max-w-96"
      data-testid="board"
    />,
  );
  const root = screen.getByTestId("board");
  expect(ref.current).toBe(root);
  expect(root.dataset.size).toBe("sm");
  expect(root.dataset.empty).toBeUndefined();
  expect(root.className.split(" ").at(-1)).toBe("max-w-96");
  expect(screen.getAllByRole("rowheader")[0]?.className).toContain("text-game-sm");

  rerender(<Scoreboard ref={ref} caption="Scores" rows={[]} data-testid="board" />);
  expect(screen.getByTestId("board").dataset.empty).toBe("");
});
