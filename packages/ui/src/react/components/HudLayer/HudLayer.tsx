import {
  hudLayer,
  hudLayerInsets,
  hudLayerPositions,
  hudSlot,
  hudSlotPlacements,
} from "./HudLayer.styles.ts";
import type { HudLayerProps, HudSlotProps } from "./HudLayer.types.ts";

/**
 * A layer over the game for screen UI. Place content with `HudSlot`s; empty
 * areas pass the pointer through to the game underneath.
 */
export function HudLayer({ position = "fixed", inset = "md", className, ...props }: HudLayerProps) {
  return (
    <div
      {...props}
      data-position={position}
      className={[hudLayer, hudLayerPositions[position], hudLayerInsets[inset], className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

/** One of nine areas of a `HudLayer`. Children stack vertically and take pointer input. */
export function HudSlot({ placement, className, ...props }: HudSlotProps) {
  return (
    <div
      {...props}
      data-placement={placement}
      className={[hudSlot, hudSlotPlacements[placement], className].filter(Boolean).join(" ")}
    />
  );
}
