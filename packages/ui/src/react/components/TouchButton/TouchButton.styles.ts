import type { TouchButtonSize, TouchButtonVariant } from "./TouchButton.types.ts";

export const touchButtonBase =
  "grid place-items-center shrink-0 box-border rounded-full font-game-display leading-none border-(length:--game-border-width) border-game-border shadow-game opacity-80 touch-none select-none [-webkit-touch-callout:none] transition-[scale,opacity] duration-(--game-duration-fast) ease-game data-pressed:scale-90 data-pressed:opacity-100";

export const touchButtonVariants: Record<TouchButtonVariant, string> = {
  primary: "bg-game-primary text-game-primary-contrast",
  secondary: "bg-game-secondary text-game-secondary-contrast",
  danger: "bg-game-danger text-game-danger-contrast",
};

export const touchButtonSizes: Record<TouchButtonSize, string> = {
  md: "size-[4.5rem] text-game-sm",
  lg: "size-[5.5rem] text-game-md",
};
