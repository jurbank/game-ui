import type { ToastTone } from "./Toast.types.ts";

/** Toasts stack in normal flow, so the region can sit in any HudSlot. */
export const toastViewport =
  "box-border flex flex-col gap-game-xs w-[20rem] max-w-full m-[0] p-[0] outline-none";

export const toastRoot =
  "box-border flex flex-col gap-[0.125rem] w-full px-game-md py-game-sm font-game-body bg-game-panel border-(length:--game-border-width) border-l-[4px] border-game-border rounded-game-md shadow-game transition-[opacity,translate] duration-(--game-duration-normal) ease-game data-starting-style:opacity-0 data-starting-style:translate-y-[0.5rem] data-ending-style:opacity-0 data-limited:hidden";

/** The accent edge carries the tone; text stays text-coloured for contrast. */
export const toastTones: Record<ToastTone, string> = {
  default: "border-l-game-border",
  primary: "border-l-game-primary",
  success: "border-l-game-success",
  warning: "border-l-game-warning",
  danger: "border-l-game-danger",
};

export const toastTitle = "m-[0] font-game-display text-game-md leading-[1.2] text-game-text";

export const toastDescription = "m-[0] text-game-sm text-game-text-muted";
