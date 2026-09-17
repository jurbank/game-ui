import type { PlayerListSize, PlayerStatusTone } from "./PlayerList.types.ts";

export const playerListRoot = "w-full font-game-body text-game-text";

export const playerListItems = "flex flex-col gap-game-xs m-[0] p-[0] list-none";

export const playerListRow =
  "flex items-center gap-game-sm min-w-[0] rounded-game-sm bg-game-panel border-(length:--game-border-width) border-transparent data-self:border-game-border data-self:bg-game-surface";

export const playerListRowSizes: Record<PlayerListSize, string> = {
  sm: "px-game-sm py-game-xs text-game-sm",
  md: "px-game-md py-game-sm text-game-md",
};

export const playerListIcon = "flex shrink-0 items-center justify-center";

export const playerListName = "flex-1 min-w-[0] truncate";

export const playerListDetail = "shrink-0 tabular-nums text-game-text-muted";

export const playerListStatus = "shrink-0 font-game-display uppercase text-game-sm";

/** Status is text on a surface, so it uses the tone's text-safe value. */
export const playerListStatusTones: Record<PlayerStatusTone, string> = {
  default: "text-game-text-muted",
  primary: "text-game-primary-text",
  success: "text-game-success-text",
  warning: "text-game-warning-text",
  danger: "text-game-danger-text",
};

export const playerListActions = "flex shrink-0 items-center gap-game-xs";

export const playerListEmpty =
  "m-[0] px-game-md py-game-sm text-game-md text-game-text-muted text-center";
