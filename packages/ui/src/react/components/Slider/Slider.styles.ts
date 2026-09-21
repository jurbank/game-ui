import type { SliderSize } from "./Slider.types.ts";

export const sliderRoot = "flex flex-col gap-game-xs w-full font-game-body text-game-text";

export const sliderHeader =
  "flex items-baseline justify-between gap-game-sm text-game-sm text-game-text";

export const sliderValue = "tabular-nums text-game-text-muted";

export const sliderControl =
  "flex items-center w-full py-game-sm touch-none select-none cursor-pointer data-disabled:cursor-not-allowed data-disabled:opacity-50";

export const sliderTrack =
  "relative box-border w-full bg-game-surface border-(length:--game-border-width) border-game-border rounded-game-sm";

export const sliderTrackSizes: Record<SliderSize, string> = {
  sm: "h-game-xs",
  md: "h-game-sm",
};

export const sliderIndicator = "h-full rounded-game-sm bg-game-primary";

export const sliderThumb =
  "bg-game-primary border-(length:--game-border-width) border-game-border rounded-game-md shadow-game transition-[scale] duration-(--game-duration-fast) ease-game has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-game-focus-ring data-dragging:scale-110";

export const sliderThumbSizes: Record<SliderSize, string> = {
  sm: "size-[1rem]",
  md: "size-[1.25rem]",
};
