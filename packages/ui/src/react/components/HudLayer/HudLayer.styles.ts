import type { HudInset, HudPlacement } from "./HudLayer.types.ts";

/**
 * A 3×3 grid over the game. The layer and slots ignore the pointer so the game
 * underneath keeps its input; only the slots' children take pointer events.
 */
export const hudLayer =
  "inset-[0] z-[1] grid grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] gap-game-md pointer-events-none font-game-body text-game-text";

export const hudLayerPositions = {
  fixed: "fixed",
  absolute: "absolute",
} as const;

/** Padding that never lets content under a notch or home indicator. */
export const hudLayerInsets: Record<HudInset, string> = {
  none: "pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]",
  sm: "pt-[max(var(--game-space-sm),env(safe-area-inset-top))] pr-[max(var(--game-space-sm),env(safe-area-inset-right))] pb-[max(var(--game-space-sm),env(safe-area-inset-bottom))] pl-[max(var(--game-space-sm),env(safe-area-inset-left))]",
  md: "pt-[max(var(--game-space-md),env(safe-area-inset-top))] pr-[max(var(--game-space-md),env(safe-area-inset-right))] pb-[max(var(--game-space-md),env(safe-area-inset-bottom))] pl-[max(var(--game-space-md),env(safe-area-inset-left))]",
  lg: "pt-[max(var(--game-space-lg),env(safe-area-inset-top))] pr-[max(var(--game-space-lg),env(safe-area-inset-right))] pb-[max(var(--game-space-lg),env(safe-area-inset-bottom))] pl-[max(var(--game-space-lg),env(safe-area-inset-left))]",
};

export const hudSlot =
  "flex flex-col gap-game-sm min-w-[0] min-h-[0] max-w-full max-h-full pointer-events-none *:pointer-events-auto";

export const hudSlotPlacements: Record<HudPlacement, string> = {
  "top-left": "col-start-1 row-start-1 self-start justify-self-start items-start",
  top: "col-start-2 row-start-1 self-start justify-self-center items-center",
  "top-right": "col-start-3 row-start-1 self-start justify-self-end items-end",
  left: "col-start-1 row-start-2 self-center justify-self-start items-start",
  center: "col-start-2 row-start-2 self-center justify-self-center items-center",
  right: "col-start-3 row-start-2 self-center justify-self-end items-end",
  // Bottom slots stack toward the edge and grow upward when their content is tall.
  "bottom-left": "col-start-1 row-start-3 self-end justify-self-start items-start justify-end",
  bottom: "col-start-2 row-start-3 self-end justify-self-center items-center justify-end",
  "bottom-right": "col-start-3 row-start-3 self-end justify-self-end items-end justify-end",
};
