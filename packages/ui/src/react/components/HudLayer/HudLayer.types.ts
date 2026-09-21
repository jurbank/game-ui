import type { ComponentPropsWithRef } from "react";

export type HudPlacement =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export type HudInset = "none" | "sm" | "md" | "lg";

export interface HudLayerProps extends ComponentPropsWithRef<"div"> {
  /**
   * `fixed` covers the viewport. `absolute` covers the nearest positioned
   * ancestor, such as a wrapper around the game canvas.
   */
  position?: "fixed" | "absolute";
  /** Space between the layer's edges and its slots. Device safe areas are always respected. */
  inset?: HudInset;
}

export interface HudSlotProps extends ComponentPropsWithRef<"div"> {
  /** Where the slot sits in the layer. Content aligns toward that edge or corner. */
  placement: HudPlacement;
}
