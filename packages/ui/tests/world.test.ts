import { expectTypeOf, test } from "vite-plus/test";
import type { HealthBar, WorldAnchor, WorldDescriptor, WorldPoint3D } from "../src/index.ts";

test("descriptors support plain 2D and 3D game data without native objects", () => {
  const health = {
    kind: "health-bar",
    id: "health:pilot",
    anchor: { kind: "entity", dimension: "2d", entityId: "pilot" },
    offset: { space: "screen", x: 0, y: -24 },
    label: "Pilot health",
    value: 40,
    max: 100,
  } satisfies HealthBar<"2d">;
  expectTypeOf(health).toExtend<WorldDescriptor<"2d">>();
  const anchor = {
    kind: "position",
    dimension: "3d",
    position: { x: 1, y: 2, z: 3 },
  } satisfies WorldAnchor;
  expectTypeOf(anchor.position).toExtend<WorldPoint3D>();
});

test("dimension and anchor kind narrow the required coordinates", () => {
  function check(anchor: WorldAnchor) {
    if (anchor.dimension === "3d" && anchor.kind === "position") {
      expectTypeOf(anchor.position.z).toBeNumber();
    }
  }
  check({ dimension: "2d", kind: "entity", entityId: "pilot" });
  const missingZ: WorldAnchor<"3d"> = {
    dimension: "3d",
    kind: "position",
    // @ts-expect-error A 3D position needs z.
    position: { x: 0, y: 0 },
  };
  // @ts-expect-error Entity anchors cannot be native objects.
  const native: WorldAnchor = { dimension: "2d", kind: "entity", entityId: { x: 0, y: 0 } };
  const unknown: HealthBar = {
    kind: "health-bar",
    id: "hp",
    anchor: { kind: "entity", dimension: "2d", entityId: "p" },
    label: "Health",
    // @ts-expect-error Health is determinate; unknown progress belongs in screen ProgressBar.
    value: null,
    max: 100,
  };
  void [missingZ, native, unknown];
});

test("the dimension-free union still requires z for world offsets on 3D anchors", () => {
  type InvalidOffset = {
    kind: "floating-label";
    id: "hint";
    text: "Ready";
    anchor: { kind: "entity"; dimension: "3d"; entityId: "pilot" };
    offset: { space: "world"; value: { x: number; y: number } };
  };
  expectTypeOf<InvalidOffset>().not.toExtend<WorldDescriptor>();
});
