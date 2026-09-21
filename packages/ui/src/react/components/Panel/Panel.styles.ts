import type { PanelPadding, PanelVariant } from "./Panel.types.ts";

export const panelBase =
  "block text-game-text font-game-body border-(length:--game-border-width) border-game-border rounded-game-lg";

export const panelVariants: Record<PanelVariant, string> = {
  default: "bg-game-panel",
  raised: "bg-game-panel shadow-game",
  inset: "bg-game-surface",
};

export const panelPaddings: Record<PanelPadding, string> = {
  none: "",
  sm: "p-game-sm",
  md: "p-game-md",
  lg: "p-game-lg",
};

export const panelTitle =
  "mt-[0] mb-game-sm font-game-display text-game-lg leading-[1.2] text-game-text";
