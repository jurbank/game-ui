import type { ModalSize } from "./Modal.types.ts";

export const modalBackdrop =
  "fixed inset-[0] bg-[rgb(0_0_0/0.6)] transition-opacity duration-(--game-duration-normal) ease-game data-starting-style:opacity-0 data-ending-style:opacity-0";

export const modalViewport = "fixed inset-[0] flex items-center justify-center p-game-lg";

export const modalPopup =
  "box-border flex flex-col gap-game-md w-full max-h-full overflow-y-auto text-game-text font-game-body bg-game-panel border-(length:--game-border-width) border-game-border rounded-game-lg shadow-game p-game-lg outline-none transition-[opacity,scale] duration-(--game-duration-normal) ease-game data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95";

export const modalSizes: Record<ModalSize, string> = {
  sm: "max-w-[22rem]",
  md: "max-w-[32rem]",
  lg: "max-w-[48rem]",
};

export const modalHeader = "flex items-start justify-between gap-game-md";

export const modalTitle =
  "m-[0] min-w-[0] break-words font-game-display text-game-xl leading-[1.2] text-game-text";

export const modalDescription = "m-[0] text-game-md text-game-text-muted";

export const modalClose =
  "inline-flex shrink-0 items-center justify-center size-[2.25rem] text-game-lg leading-none text-game-text bg-game-surface border-(length:--game-border-width) border-game-border rounded-game-md cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-game-focus-ring hover:brightness-125";

export const modalActions = "flex flex-wrap justify-end gap-game-sm";
