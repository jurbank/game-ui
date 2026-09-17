import type { FloatingLabel } from "@game-ui/world-ui";
import { expect, test } from "vite-plus/test";
import {
  assertSupported,
  healthFraction,
  project,
} from "../src/components/examples/world-game/spatial";

test("moving anchors and camera zoom preserve screen offsets and scale world offsets", () => {
  const point = { x: 10, y: 20 };
  const entities = new Map([["pilot", point]]);
  const label: FloatingLabel<"2d"> = {
    kind: "floating-label",
    id: "hint",
    text: "Ready",
    anchor: { kind: "entity", dimension: "2d", entityId: "pilot", localOffset: { x: 0, y: -2 } },
    offset: { space: "screen", x: 0, y: -10 },
  };
  const camera = { x: 5, y: 8, zoom: 2 };
  const out = { x: 0, y: 0 };
  expect(project(label, entities, camera, 100, 100, out)).toBe(true);
  expect(out).toEqual({ x: 60, y: 60 });
  point.x = 15;
  camera.zoom = 3;
  project(label, entities, camera, 100, 100, out);
  expect(out).toEqual({ x: 80, y: 70 });
  project(
    { ...label, offset: { space: "world", value: { x: 0, y: -10 } } },
    entities,
    camera,
    100,
    100,
    out,
  );
  expect(out).toEqual({ x: 80, y: 50 });
  entities.clear();
  expect(project(label, entities, camera, 100, 100, out)).toBe(false);
  project(
    { ...label, anchor: { kind: "position", dimension: "2d", position: { x: 5, y: 8 } } },
    entities,
    camera,
    100,
    100,
    out,
  );
  expect(out).toEqual({ x: 50, y: 40 });
});

test("health ranges are determinate, finite, and clamped", () => {
  expect(healthFraction(30, 60)).toBe(0.5);
  expect(healthFraction(-10, 100)).toBe(0);
  expect(healthFraction(200, 100)).toBe(1);
  for (const [value, max] of [
    [1, 0],
    [1, -1],
    [1, Infinity],
    [NaN, 100],
  ])
    expect(healthFraction(value!, max!)).toBe(0);
});

test("the canvas example rejects unsupported capabilities at setup", () => {
  const label: FloatingLabel<"2d"> = {
    kind: "floating-label",
    id: "hint",
    text: "Ready",
    anchor: { kind: "entity", dimension: "2d", entityId: "p" },
  };
  expect(() => assertSupported(label)).not.toThrow();
  expect(() => assertSupported({ ...label, occlusion: "hide" })).toThrow(/supports 2D/);
  expect(() => assertSupported({ ...label, maxDistance: 100 })).toThrow(/supports 2D/);
  expect(() =>
    assertSupported({
      ...label,
      anchor: { kind: "position", dimension: "3d", position: { x: 0, y: 0, z: 0 } },
      offset: { space: "screen", x: 0, y: 0 },
    }),
  ).toThrow(/supports 2D/);
  expect(() => assertSupported({ ...label, lifetimeMs: -1 })).toThrow(/lifetimeMs/);
});
