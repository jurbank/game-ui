import type { VirtualStickArea, VirtualStickSize } from "./VirtualStick.types.ts";

/** Stops the browser from scrolling, zooming, selecting, or opening a callout under a thumb. */
const touchSurface = "touch-none select-none [-webkit-touch-callout:none]";

export const stickZone = `absolute top-[0] bottom-[0] z-[-1] pointer-events-auto ${touchSurface}`;

export const stickZoneAreas: Record<VirtualStickArea, string> = {
  left: "left-[0] w-[50%]",
  right: "right-[0] w-[50%]",
  full: "left-[0] right-[0]",
};

export const stickBase = `grid place-items-center shrink-0 box-border rounded-full bg-game-surface/60 border-(length:--game-border-width) border-game-border ${touchSurface}`;

/** A dynamic base is placed by the pointer and shows only while held. */
export const stickBaseDynamic =
  "absolute left-[0] top-[0] opacity-0 transition-opacity duration-(--game-duration-fast) ease-game data-active:opacity-100";

export const stickBaseSizes: Record<VirtualStickSize, string> = {
  md: "size-[7.5rem]",
  lg: "size-[9.5rem]",
};

export const stickKnob =
  "size-[45%] box-border rounded-full bg-game-primary border-(length:--game-border-width) border-game-border shadow-game pointer-events-none";
