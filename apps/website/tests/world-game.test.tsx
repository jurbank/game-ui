// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { WorldGame, WorldGameControls } from "../src/components/examples/WorldGame";
import { createGame, type GameState } from "../src/components/examples/world-game/game";
import type { CanvasPresentation } from "../src/components/examples/world-game/presentation";
import { createScene } from "../src/components/examples/world-game/scene";

const theme: CanvasPresentation = {
  background: "black",
  panel: "black",
  border: "gray",
  text: "white",
  muted: "gray",
  primary: "cyan",
  font: "14px sans-serif",
  textTones: {
    default: "white",
    primary: "cyan",
    success: "green",
    warning: "orange",
    danger: "red",
  },
  fillTones: {
    default: "cyan",
    primary: "cyan",
    success: "green",
    warning: "orange",
    danger: "red",
  },
};
const frames = new Map<number, FrameRequestCallback>();
const observers = new Set<ResizeObserver>();
let frameId = 0;
let context: CanvasRenderingContext2D;
const fillText = vi.fn<(text: string, x: number, y: number) => void>();
const fillRect = vi.fn<(x: number, y: number, width: number, height: number) => void>();

beforeEach(() => {
  frames.clear();
  fillText.mockClear();
  fillRect.mockClear();
  observers.clear();
  frameId = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    frames.delete(id);
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {
        observers.add(this as unknown as ResizeObserver);
      }
      disconnect() {
        observers.delete(this as unknown as ResizeObserver);
      }
    },
  );
  context = {
    setTransform: vi.fn(),
    fillRect,
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText,
    measureText: vi.fn(() => ({ width: 70 })),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context);
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 640,
    bottom: 360,
    width: 640,
    height: 360,
    toJSON() {},
  });
});
afterEach(() => {
  cleanup();
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

test("world clicks and React controls share selection and health, including transient labels", () => {
  const game = createGame();
  const canvas = document.createElement("canvas");
  const scene = createScene(canvas, game, theme);
  scene.setMotion(false);
  render(<WorldGameControls game={game} />);
  advance(1);
  expect(fillText).toHaveBeenCalledWith("◆ Nova · Ready", expect.any(Number), expect.any(Number));
  // Rook at time zero: x=320+sin(2)*20, y=180+20+cos(2)*16-12 (camera y).
  fireEvent.pointerDown(canvas, {
    clientX: 320 + Math.sin(2) * 20,
    clientY: 188 + Math.cos(2) * 16,
  });
  expect(screen.getByRole("button", { name: "Rook" }).getAttribute("aria-pressed")).toBe("true");
  expect(
    screen.getByRole("progressbar", { name: "Rook health" }).getAttribute("aria-valuenow"),
  ).toBe("41");
  fireEvent.click(screen.getByRole("button", { name: "Heal 10" }));
  advance(17);
  expect(game.store.getState().pilots[1]!.health).toBe(51);
  expect(fillText).toHaveBeenCalledWith("◆ Rook · Ready", expect.any(Number), expect.any(Number));
  expect(fillText).toHaveBeenCalledWith("+10 HP", expect.any(Number), expect.any(Number));
  expect(fillRect).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), 72 * 0.51, 8);
  fireEvent.click(screen.getByRole("button", { name: "Wisp" }));
  advance(33);
  expect(fillText).toHaveBeenCalledWith("◆ Wisp · Ready", expect.any(Number), expect.any(Number));
  for (let i = 1; i <= 11; i++) advance(33 + i * 100);
  vi.mocked(fillText).mockClear();
  advance(1200);
  expect(vi.mocked(fillText).mock.calls.some(([text]) => text.includes("HP"))).toBe(false);
  scene.dispose();
});

test("game actions validate inputs, clamp health, publish before events, and isolate instances", () => {
  const first = createGame();
  const second = createGame();
  const events = vi.fn(() => expect(first.store.getState().pilots[0]!.health).toBe(0));
  const unsubscribe = first.onHealthChange(events);
  first.store.getState().changeHealth("nova", -500);
  expect(events).toHaveBeenCalledWith({ entityId: "nova", delta: -84 });
  first.store.getState().changeHealth("nova", -1);
  first.store.getState().changeHealth("missing", 10);
  first.store.getState().changeHealth("nova", Number.NaN);
  first.store.getState().selectEntity("missing");
  expect(events).toHaveBeenCalledTimes(1);
  expect(first.store.getState().selectedId).toBe("nova");
  unsubscribe();
  first.store.getState().changeHealth("nova", 500);
  expect(first.store.getState().pilots[0]!.health).toBe(100);
  expect(events).toHaveBeenCalledTimes(1);
  expect(second.store.getState().pilots[0]!.health).toBe(84);
});

test("unrelated health changes do not notify a selected-pilot subscriber", () => {
  const { store } = createGame();
  const changed = vi.fn();
  const unsubscribe = store.subscribe(
    (state) => state.pilots.find((pilot) => pilot.id === state.selectedId),
    changed,
  );
  store.getState().changeHealth("rook", -10);
  expect(changed).not.toHaveBeenCalled();
  store.getState().selectEntity("rook");
  expect(changed).toHaveBeenCalledTimes(1);
  unsubscribe();
  store.getState().changeHealth("rook", -10);
  expect(changed).toHaveBeenCalledTimes(1);
});

test("repeated disposal releases subscriptions, listeners, observers, and frames; remount reads current state", () => {
  const game = createGame();
  const originalSubscribe = game.store.subscribe;
  const unsubscribeSpies: ReturnType<typeof vi.fn>[] = [];
  vi.spyOn(game.store, "subscribe").mockImplementation(
    (
      selector: (state: GameState) => unknown,
      listener?: (state: unknown, previous: unknown) => void,
    ) => {
      const unsubscribe = listener
        ? originalSubscribe(selector, listener)
        : originalSubscribe(selector);
      const spy = vi.fn(unsubscribe);
      unsubscribeSpies.push(spy);
      return spy;
    },
  );
  const originalOnHealth = game.onHealthChange.bind(game);
  vi.spyOn(game, "onHealthChange").mockImplementation((listener) => {
    const spy = vi.fn(originalOnHealth(listener));
    unsubscribeSpies.push(spy);
    return spy;
  });
  for (let index = 0; index < 5; index++) {
    const canvas = document.createElement("canvas");
    const add = vi.spyOn(canvas, "addEventListener");
    const remove = vi.spyOn(canvas, "removeEventListener");
    const scene = createScene(canvas, game, theme);
    advance(1);
    const lateFrame = [...frames.values()][0]!;
    const measured = vi.fn();
    scene.profile(measured);
    scene.dispose();
    scene.dispose();
    lateFrame(20);
    expect(remove).toHaveBeenCalledWith(
      "pointerdown",
      add.mock.calls.find(([name]) => name === "pointerdown")![1],
    );
    expect(frames.size).toBe(0);
    expect(observers.size).toBe(0);
    expect(measured).not.toHaveBeenCalled();
    game.store.getState().changeHealth("nova", -1);
  }
  expect(unsubscribeSpies).toHaveLength(20);
  for (const spy of unsubscribeSpies) expect(spy).toHaveBeenCalledTimes(1);
  const scene = createScene(document.createElement("canvas"), game, theme);
  advance(1);
  expect(fillRect).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), 72 * 0.79, 8);
  scene.dispose();
});

test("React StrictMode, stop/start, multiple instances, and unmount clean up scene resources", () => {
  const { unmount } = render(
    <StrictMode>
      <WorldGame />
      <WorldGame />
    </StrictMode>,
  );
  expect(frames.size).toBe(2);
  expect(observers.size).toBe(2);
  fireEvent.click(screen.getAllByRole("button", { name: "Stop scene" })[0]!);
  expect(frames.size).toBe(1);
  expect(observers.size).toBe(1);
  fireEvent.click(screen.getByRole("button", { name: "Start scene" }));
  expect(frames.size).toBe(2);
  unmount();
  expect(frames.size).toBe(0);
  expect(observers.size).toBe(0);
});

test("profiling reports the chosen workload once and changing counts cancels an old sample", () => {
  const scene = createScene(document.createElement("canvas"), createGame(), theme);
  const cancelled = vi.fn();
  scene.profile(cancelled);
  scene.setEntityCount(100);
  const measured = vi.fn();
  scene.profile(measured);
  for (let frame = 0; frame <= 300; frame++) advance(1 + frame * 16);
  expect(cancelled).not.toHaveBeenCalled();
  expect(measured).toHaveBeenCalledTimes(1);
  expect(measured).toHaveBeenCalledWith(
    expect.objectContaining({
      entities: 100,
      descriptors: 201,
      frames: 300,
      frameMedianMs: 16,
      frameP95Ms: 16,
      width: 640,
      height: 360,
    }),
  );
  advance(5000);
  expect(measured).toHaveBeenCalledTimes(1);
  scene.dispose();
});
