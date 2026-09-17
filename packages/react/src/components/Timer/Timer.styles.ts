import type { TimerSize, TimerVariant } from "./Timer.types.ts";

export const timerRoot = "inline-flex flex-col gap-game-xs font-game-body";

export const timerLabel = "text-game-sm text-game-text-muted";

export const timerTime =
  "font-game-display leading-none tabular-nums transition-[color] duration-(--game-duration-normal) ease-game";

export const timerVariants: Record<TimerVariant, string> = {
  default: "text-game-text",
  warning: "text-game-warning",
  danger: "text-game-danger",
};

export const timerSizes: Record<TimerSize, string> = {
  sm: "text-game-md",
  md: "text-game-lg",
  lg: "text-game-xl",
};
