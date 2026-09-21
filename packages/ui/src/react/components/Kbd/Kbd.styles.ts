import type { KbdSize } from "./Kbd.types.ts";

/** A key cap: a thicker bottom edge reads as a physical key in every theme. */
export const kbdBase =
  "inline-flex items-center justify-center min-w-[1.8em] px-[0.4em] py-[0.2em] font-game-display leading-none whitespace-nowrap text-game-text bg-game-surface border-(length:--game-border-width) border-b-[3px] border-game-border rounded-game-sm";

export const kbdSizes: Record<KbdSize, string> = {
  sm: "text-game-sm",
  md: "text-game-md",
};
