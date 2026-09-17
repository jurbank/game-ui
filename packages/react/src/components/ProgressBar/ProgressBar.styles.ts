import type { ProgressBarSize, ProgressBarVariant } from "./ProgressBar.types.ts";

export const progressRoot = "flex flex-col gap-game-xs w-full font-game-body text-game-text";

export const progressHeader =
  "flex items-baseline justify-between gap-game-sm text-game-sm text-game-text";

export const progressValue = "tabular-nums text-game-text-muted";

export const progressTrack =
  "relative w-full overflow-hidden bg-game-surface border-(length:--game-border-width) border-game-border rounded-game-sm";

export const progressTrackSizes: Record<ProgressBarSize, string> = {
  sm: "h-game-sm",
  md: "h-game-md",
  lg: "h-game-lg",
};

export const progressIndicator =
  // Base UI sets no inline height while indeterminate, so the height is a class.
  "h-full rounded-game-sm transition-[width] duration-(--game-duration-normal) ease-game data-indeterminate:w-full data-indeterminate:bg-transparent data-indeterminate:bg-[repeating-linear-gradient(135deg,var(--game-border)_0,var(--game-border)_8px,transparent_8px,transparent_16px)]";

export const progressIndicatorVariants: Record<ProgressBarVariant, string> = {
  primary: "bg-game-primary",
  success: "bg-game-success",
  warning: "bg-game-warning",
  danger: "bg-game-danger",
};
