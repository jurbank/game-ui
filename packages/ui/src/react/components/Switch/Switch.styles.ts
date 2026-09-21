import type { SwitchSize } from "./Switch.types.ts";

export const switchLabel =
  "inline-flex items-center gap-game-sm font-game-body text-game-md text-game-text cursor-pointer select-none has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50";

export const switchTrack =
  "relative inline-flex shrink-0 items-center p-[2px] bg-game-surface border-(length:--game-border-width) border-game-border rounded-game-lg cursor-pointer transition-[background-color] duration-(--game-duration-fast) ease-game focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-game-focus-ring data-checked:bg-game-primary data-disabled:cursor-not-allowed";

/** The thumb travels the track's width minus its height, so sizes set both. */
export const switchTrackSizes: Record<SwitchSize, string> = {
  sm: "w-[2.25rem] h-[1.25rem]",
  md: "w-[2.75rem] h-[1.5rem]",
};

export const switchThumb =
  "block h-full aspect-square rounded-game-md bg-game-text-muted shadow-game transition-[translate,background-color] duration-(--game-duration-fast) ease-game data-checked:bg-game-primary-contrast";

export const switchThumbSizes: Record<SwitchSize, string> = {
  sm: "data-checked:translate-x-[1rem]",
  md: "data-checked:translate-x-[1.25rem]",
};
