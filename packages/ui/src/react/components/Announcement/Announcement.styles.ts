import type { AnnouncementSize, AnnouncementTone } from "./Announcement.types.ts";

/**
 * The live region stays mounted so screen readers catch every change. It never
 * takes the pointer, even inside a HudSlot: it sits over the middle of the game.
 */
export const announcementRegion = "flex justify-center pointer-events-none!";

export const announcementCard =
  "flex flex-col items-center gap-game-xs px-game-lg py-game-md text-center font-game-body bg-game-panel border-(length:--game-border-width) border-game-border rounded-game-lg shadow-game animate-[game-ui-announce_var(--game-duration-normal)_var(--game-ease)_both]";

export const announcementTitle = "m-[0] font-game-display leading-[1.1]";

export const announcementTitleSizes: Record<AnnouncementSize, string> = {
  md: "text-game-xl",
  lg: "text-[length:calc(var(--game-font-size-xl)*2)]",
};

/** Text on the panel, so each tone uses its text-safe value. */
export const announcementTitleTones: Record<AnnouncementTone, string> = {
  default: "text-game-text",
  primary: "text-game-primary-text",
  success: "text-game-success-text",
  warning: "text-game-warning-text",
  danger: "text-game-danger-text",
};

export const announcementDetail = "m-[0] text-game-md text-game-text-muted";
