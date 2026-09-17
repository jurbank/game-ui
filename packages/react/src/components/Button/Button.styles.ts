import type { ButtonSize, ButtonVariant } from "./Button.types.ts";

export const buttonBase =
  "inline-flex items-center justify-center gap-game-sm font-game-display leading-none whitespace-nowrap border-(length:--game-border-width) border-game-border rounded-game-md shadow-game cursor-pointer select-none transition-[filter,translate,box-shadow] duration-(--game-duration-fast) ease-game focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-game-focus-ring enabled:hover:brightness-110 enabled:active:translate-y-px enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-game-primary text-game-primary-contrast",
  secondary: "bg-game-secondary text-game-secondary-contrast",
  danger: "bg-game-danger text-game-danger-contrast",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-game-sm py-game-xs text-game-sm",
  md: "px-game-md py-game-sm text-game-md",
  lg: "px-game-lg py-game-md text-game-lg",
};
