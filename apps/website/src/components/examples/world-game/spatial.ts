import type { WorldDescriptor, WorldPoint2D } from "@gameui/ui";

export interface Camera2D {
  x: number;
  y: number;
  zoom: number;
}

/** Demo world units equal CSS pixels at zoom 1; +x right, +y down. */
export function project(
  descriptor: WorldDescriptor<"2d">,
  entities: ReadonlyMap<string, WorldPoint2D>,
  camera: Camera2D,
  width: number,
  height: number,
  out: { x: number; y: number },
): boolean {
  const { anchor, offset } = descriptor;
  const point = anchor.kind === "entity" ? entities.get(anchor.entityId) : anchor.position;
  if (!point) return false;
  // This game has translation-only entities. Other games apply their full local transform here.
  let x = point.x + (anchor.kind === "entity" ? (anchor.localOffset?.x ?? 0) : 0);
  let y = point.y + (anchor.kind === "entity" ? (anchor.localOffset?.y ?? 0) : 0);
  if (offset?.space === "world") {
    x += offset.value.x;
    y += offset.value.y;
  }
  out.x = (x - camera.x) * camera.zoom + width / 2;
  out.y = (y - camera.y) * camera.zoom + height / 2;
  if (offset?.space === "screen") {
    out.x += offset.x;
    out.y += offset.y;
  }
  return Number.isFinite(out.x) && Number.isFinite(out.y);
}

/** This example supports only a declared subset, checked once at creation/update. */
export function assertSupported(descriptor: WorldDescriptor) {
  if (
    descriptor.anchor.dimension !== "2d" ||
    descriptor.occlusion === "hide" ||
    descriptor.maxDistance !== undefined
  ) {
    throw new Error("Canvas example supports 2D anchors with no occlusion or distance cutoff.");
  }
  if (
    descriptor.lifetimeMs !== undefined &&
    (!Number.isFinite(descriptor.lifetimeMs) || descriptor.lifetimeMs < 0)
  ) {
    throw new Error("lifetimeMs must be a finite non-negative number.");
  }
}

export function healthFraction(value: number, max: number) {
  return Number.isFinite(value) && Number.isFinite(max) && max > 0
    ? Math.min(1, Math.max(0, value / max))
    : 0;
}
