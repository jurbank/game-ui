/** Plain data only. Render objects, entity lookup, and update loops belong to the game. */
export interface WorldPoint2D {
  readonly x: number;
  readonly y: number;
}

export interface WorldPoint3D extends WorldPoint2D {
  readonly z: number;
}

export type WorldDimension = "2d" | "3d";
export type WorldPoint<D extends WorldDimension> = D extends "3d" ? WorldPoint3D : WorldPoint2D;

/** Screen offsets use CSS pixels, +x right, +y down, after camera projection. */
export type WorldOffset<D extends WorldDimension = WorldDimension> =
  | { readonly space: "screen"; readonly x: number; readonly y: number }
  | { readonly space: "world"; readonly value: WorldPoint<D> };

/** IDs are game-owned stable references, never native engine objects. */
export type WorldAnchor<D extends WorldDimension = WorldDimension> = D extends WorldDimension
  ? { readonly dimension: D } & (
      | {
          readonly kind: "entity";
          readonly entityId: string;
          /** Local offset follows the entity's full transform, in its local units. */
          readonly localOffset?: WorldPoint<D>;
        }
      | {
          readonly kind: "position";
          readonly position: WorldPoint<D>;
        }
    )
  : never;

export type WorldTone = "default" | "primary" | "success" | "warning" | "danger";

interface WorldPresentationFields<D extends WorldDimension> {
  /** Scene-unique identity. Update the existing render object when content changes. */
  readonly id: string;
  readonly anchor: WorldAnchor<D>;
  /** Applied after entity-local offset; defaults to zero. */
  readonly offset?: WorldOffset<D>;
  /** Defaults to "default". Meaning/thresholds are chosen by the game. */
  readonly tone?: WorldTone;
  /** Defaults to true. Invisible descriptors still age. */
  readonly visible?: boolean;
  /** Defaults to "hide" (resume when resolved). "dispose" ends the instance. */
  readonly missingAnchor?: "hide" | "dispose";
  /** Omitted = persistent; milliseconds of scene time since creation. Zero = expire immediately. */
  readonly lifetimeMs?: number;
  /** Optional capabilities: reject unsupported requests at creation/update, never silently ignore. */
  readonly occlusion?: "none" | "hide";
  /** Optional camera-to-anchor cutoff in world units, measured before screen offset. */
  readonly maxDistance?: number;
}

/** Distribute dimensions so a 3D anchor always requires a 3D world offset, even without a type argument. */
export type WorldPresentation<D extends WorldDimension = WorldDimension> = D extends WorldDimension
  ? WorldPresentationFields<D>
  : never;

/** Contextual plain text. No HTML, gameplay trigger, or animation is implied. */
export type FloatingLabel<D extends WorldDimension = WorldDimension> = WorldPresentation<D> & {
  readonly kind: "floating-label";
  readonly text: string;
};

/** Identity with optional plain-text status; identity need not be the anchor entity ID. */
export type Nameplate<D extends WorldDimension = WorldDimension> = WorldPresentation<D> & {
  readonly kind: "nameplate";
  readonly name: string;
  readonly status?: string;
  readonly selected?: boolean;
};

/** Finite determinate health. Clamp value to [0,max]; invalid ranges display empty. */
export type HealthBar<D extends WorldDimension = WorldDimension> = WorldPresentation<D> & {
  readonly kind: "health-bar";
  readonly value: number;
  readonly max: number;
  /** Human-readable meaning; also use it in an accessible screen equivalent. */
  readonly label: string;
};

export type WorldDescriptor<D extends WorldDimension = WorldDimension> =
  | FloatingLabel<D>
  | Nameplate<D>
  | HealthBar<D>;
