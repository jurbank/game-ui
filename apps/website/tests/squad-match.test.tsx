// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useMemo, useState } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { SquadMatch } from "../src/components/examples/SquadMatch";
import {
  SquadHud,
  standings,
  type SquadHudActions,
  type SquadHudState,
} from "../src/components/examples/squad-match/hud";
import { createGame, ROUND_MS } from "../src/components/examples/world-game/game";
import type { CanvasPresentation } from "../src/components/examples/world-game/presentation";
import { createScene } from "../src/components/examples/world-game/scene";

const frames = new Map<number, FrameRequestCallback>();
let frameId = 0;
const fillText = vi.fn<(text: string, x: number, y: number) => void>();

beforeEach(() => {
  // These tests drive animation frames by hand, so skip Base UI's exit transitions.
  vi.stubGlobal("BASE_UI_ANIMATIONS_DISABLED", true);
  frames.clear();
  fillText.mockClear();
  frameId = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  // Every Canvas2D call is a no-op except the ones these tests read.
  const context = new Proxy(
    {},
    {
      get: (_, key) =>
        key === "fillText" ? fillText : key === "measureText" ? () => ({ width: 70 }) : () => {},
      set: () => true,
    },
  ) as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue(
    DOMRect.fromRect({ x: 0, y: 0, width: 640, height: 360 }),
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function advance(timestamp: number) {
  const callbacks = [...frames.values()];
  frames.clear();
  act(() => {
    for (const callback of callbacks) callback(timestamp);
  });
}

function dialogClosed() {
  return waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
}

/**
 * A consumer that replaced Zustand with plain React state. SquadHud and the
 * framework components are unchanged; only the binding differs.
 */
function ReactStateMatch() {
  const [state, setState] = useState<SquadHudState>({
    pilots: [
      { id: "nova", name: "Nova", health: 40, max: 100, score: 10 },
      { id: "kite", name: "Kite", health: 100, max: 100, score: 90 },
    ],
    selectedId: "nova",
    remainingMs: 65_000,
    paused: false,
  });
  const actions = useMemo<SquadHudActions>(
    () => ({
      select: (selectedId) => setState((s) => ({ ...s, selectedId })),
      changeHealth: (id, delta) =>
        setState((s) => ({
          ...s,
          pilots: s.pilots.map((p) =>
            p.id === id ? { ...p, health: Math.max(0, Math.min(p.max, p.health + delta)) } : p,
          ),
        })),
      awardScore: (id, points) =>
        setState((s) => ({
          ...s,
          pilots: s.pilots.map((p) => (p.id === id ? { ...p, score: p.score + points } : p)),
        })),
      setPaused: (paused) => setState((s) => ({ ...s, paused })),
      restart: () => {},
    }),
    [],
  );
  return <SquadHud {...state} actions={actions} />;
}

test("the HUD runs unchanged on a non-Zustand state source", async () => {
  render(<ReactStateMatch />);
  expect(screen.getByRole("timer").textContent).toContain("1:05");
  const health = () =>
    screen.getByRole("progressbar", { name: "Nova health" }).getAttribute("aria-valuenow");
  fireEvent.click(screen.getByRole("button", { name: "Damage 10" }));
  expect(health()).toBe("30");

  fireEvent.click(screen.getByRole("button", { name: "Select Kite" }));
  expect(screen.getByRole("button", { name: "Select Kite" }).getAttribute("aria-pressed")).toBe(
    "true",
  );
  expect(screen.getByRole("progressbar", { name: "Kite health" })).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Pause (P)" }));
  const dialog = await screen.findByRole("dialog", { name: "Paused" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Resume" }));
  await dialogClosed();
});

test("standings rank by score, break ties by name, and mark the local player", () => {
  const rows = standings([
    { id: "rook", name: "Rook", health: 0, max: 100, score: 500 },
    { id: "nova", name: "Nova", health: 80, max: 100, score: 900 },
    { id: "ace", name: "Ace", health: 50, max: 100, score: 500 },
  ]);
  expect(rows.map((row) => [row.id, row.rank, row.highlight])).toEqual([
    ["nova", 1, true],
    ["ace", 2, false],
    ["rook", 3, false],
  ]);
  expect(rows[0]!.self).toBe(true);
  expect(rows[2]!.status).toBe("Down");
});

test("match actions validate input, the clock stops while paused and at zero, and reset restores the opening", () => {
  const game = createGame();
  const { store } = game;
  const { tick, setPaused, awardScore, changeHealth, reset } = {
    tick: (ms: number) => store.getState().tick(ms),
    setPaused: (paused: boolean) => store.getState().setPaused(paused),
    awardScore: (id: string, points: number) => store.getState().awardScore(id, points),
    changeHealth: (id: string, delta: number) => store.getState().changeHealth(id, delta),
    reset: () => store.getState().reset(),
  };
  tick(1000);
  tick(Number.NaN);
  tick(-50);
  expect(store.getState().remainingMs).toBe(ROUND_MS - 1000);
  setPaused(true);
  tick(5000);
  expect(store.getState().remainingMs).toBe(ROUND_MS - 1000);
  setPaused(false);
  tick(ROUND_MS * 2);
  expect(store.getState().remainingMs).toBe(0);

  awardScore("nova", 150);
  awardScore("missing", 150);
  awardScore("nova", Number.POSITIVE_INFINITY);
  awardScore("rook", -5000);
  expect(store.getState().pilots.map((pilot) => pilot.score)).toEqual([1390, 0, 1510]);

  changeHealth("nova", -30);
  const events = vi.fn();
  game.onHealthChange(events);
  reset();
  expect(store.getState()).toMatchObject({
    remainingMs: ROUND_MS,
    paused: false,
    selectedId: "nova",
  });
  expect(store.getState().pilots[0]).toMatchObject({ health: 84, score: 1240 });
  expect(events).not.toHaveBeenCalled();
});

test("pausing the game freezes label lifetimes and ignores world clicks until resumed", () => {
  const theme = new Proxy({}, { get: () => new Proxy({}, { get: () => "black" }) });
  const game = createGame();
  const canvas = document.createElement("canvas");
  const scene = createScene(canvas, game, theme as CanvasPresentation);
  scene.setMotion(false);
  advance(1);
  game.store.getState().changeHealth("nova", -10);
  game.store.getState().setPaused(true);
  // Nova at time zero sits at x=320-150, y=180+20+16-12 (camera y).
  fireEvent.pointerDown(canvas, { clientX: 170, clientY: 204 });
  expect(game.store.getState().pilots[0]!.health).toBe(74);
  // Well past the 1 s lifetime in wall time, but the scene clock is frozen.
  for (let i = 1; i <= 20; i++) advance(1 + i * 100);
  fillText.mockClear();
  advance(2200);
  expect(fillText).toHaveBeenCalledWith("-10 HP", expect.any(Number), expect.any(Number));

  game.store.getState().setPaused(false);
  fireEvent.pointerDown(canvas, { clientX: 170, clientY: 204 });
  expect(game.store.getState().pilots[0]!.health).toBe(64);
  for (let i = 1; i <= 12; i++) advance(2200 + i * 100);
  fillText.mockClear();
  advance(3500);
  expect(fillText.mock.calls.some(([text]) => text.includes("HP"))).toBe(false);
  scene.dispose();
});

test("the walkthrough shares state across views, pauses by key, ends the round, and cleans up", async () => {
  // Fake only the clock's interval. performance.now stays real (Base UI's
  // transitions read it) but jumps forward with each simulated interval.
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  const realNow = performance.now.bind(performance);
  let skipped = 0;
  vi.spyOn(performance, "now").mockImplementation(() => realNow() + skipped);
  const passTime = (ms: number) => {
    for (let elapsed = 0; elapsed < ms; elapsed += 250) {
      skipped += 250;
      act(() => {
        vi.advanceTimersByTime(250);
      });
    }
  };
  const removeListener = vi.spyOn(window, "removeEventListener");
  const { unmount } = render(<SquadMatch />);
  expect(frames.size).toBe(1);

  fireEvent.click(screen.getByRole("button", { name: "Score 150" }));
  const nova = within(screen.getByRole("table")).getByText("Nova").closest("tr")!;
  expect(nova.textContent).toContain("1,390");

  passTime(10_000);
  // Real milliseconds between intervals also count, so allow the next second down.
  const beforePause = screen.getByRole("timer").textContent;
  expect(beforePause).toMatch(/2:(50|49)/);

  fireEvent.keyDown(window, { key: "p" });
  await screen.findByRole("dialog", { name: "Paused" });
  passTime(10_000);
  // The open modal makes the page behind it inert, so query hidden content.
  expect(screen.getByRole("timer", { hidden: true }).textContent).toBe(beforePause);
  fireEvent.keyDown(window, { key: "p" });
  await dialogClosed();

  passTime(ROUND_MS);
  const over = await screen.findByRole("dialog", { name: "Round over" });
  expect(within(over).getByRole("table")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Damage 10", hidden: true }).hasAttribute("disabled"),
  ).toBe(true);
  fireEvent.keyDown(window, { key: "p" });
  expect(screen.queryByRole("dialog", { name: "Paused" })).toBeNull();
  fireEvent.click(within(over).getByRole("button", { name: "Play again" }));
  await dialogClosed();
  expect(screen.getByRole("timer").textContent).toContain("3:00");

  // Flush UI frames so only the scene loop's pending frame remains.
  advance(performance.now());
  expect(frames.size).toBe(1);
  unmount();
  expect(frames.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
  expect(removeListener).toHaveBeenCalledWith("keydown", expect.any(Function));
});
