import type { Stick } from "../../../input/index.ts";
import type { ComponentPropsWithRef } from "react";

/**
 * `static` sits where you place it; touches must start on it. `dynamic`
 * appears wherever a thumb lands inside its area of the HUD.
 */
export type VirtualStickMode = "static" | "dynamic";

/** The part of the `HudLayer` a dynamic stick listens on. */
export type VirtualStickArea = "left" | "right" | "full";

export type VirtualStickSize = "md" | "lg";

export interface VirtualStickProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** The stick to drive, from `createStick()` in `@gameui/ui/input`. The game reads it. */
  control: Stick;
  /**
   * Place a `static` stick in a `HudSlot`. Place a `dynamic` stick directly
   * inside `HudLayer`: it covers `area` beneath the slots, so HUD buttons stay
   * on top. Defaults to `static`.
   */
  mode?: VirtualStickMode;
  /** Where a dynamic stick listens. Ignored by static sticks. Defaults to `left`. */
  area?: VirtualStickArea;
  size?: VirtualStickSize;
}
