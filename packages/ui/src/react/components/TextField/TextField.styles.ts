import type { TextFieldSize } from "./TextField.types.ts";

export const textFieldRoot = "flex flex-col gap-game-xs w-full font-game-body text-game-text";

export const textFieldLabel = "text-game-sm text-game-text";

export const textFieldInput =
  "box-border w-full min-w-[0] m-[0] font-game-body text-game-text bg-game-surface border-(length:--game-border-width) border-game-border rounded-game-md outline-none placeholder:text-game-text-muted transition-[border-color] duration-(--game-duration-fast) ease-game focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-game-focus-ring data-invalid:border-game-danger data-disabled:cursor-not-allowed data-disabled:opacity-50";

export const textFieldInputSizes: Record<TextFieldSize, string> = {
  sm: "px-game-sm py-game-xs text-game-sm",
  md: "px-game-sm py-game-sm text-game-md",
};

export const textFieldDescription = "m-[0] text-game-sm text-game-text-muted";

export const textFieldError = "m-[0] text-game-sm text-game-danger-text";
