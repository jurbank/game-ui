import type { BadgeSize, BadgeTone } from "./Badge.types.ts";

export const badgeBase =
  "inline-flex items-center gap-game-xs font-game-display uppercase leading-none whitespace-nowrap bg-game-surface border-(length:--game-border-width) rounded-game-sm";

/** Text on the surface, so each tone uses its text-safe value, like PlayerList statuses. */
export const badgeTones: Record<BadgeTone, string> = {
  default: "text-game-text-muted border-game-border",
  primary: "text-game-primary-text border-game-primary",
  success: "text-game-success-text border-game-success",
  warning: "text-game-warning-text border-game-warning",
  danger: "text-game-danger-text border-game-danger",
};

export const badgeSizes: Record<BadgeSize, string> = {
  sm: "px-game-xs py-[0.125rem] text-game-sm",
  md: "px-game-sm py-game-xs text-game-md",
};

export const badgeDot = "size-[0.5em] shrink-0 rounded-full";

export const badgeDotTones: Record<BadgeTone, string> = {
  default: "bg-game-text-muted",
  primary: "bg-game-primary",
  success: "bg-game-success",
  warning: "bg-game-warning",
  danger: "bg-game-danger",
};
