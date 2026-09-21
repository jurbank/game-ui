import type { ScoreboardAlign, ScoreboardSize } from "./Scoreboard.types.ts";

export const scoreboardRoot = "w-full font-game-body text-game-text";

export const scoreboardTable = "w-full border-collapse text-left";

export const scoreboardCaption = "mb-game-sm text-game-sm text-game-text-muted text-left";

export const scoreboardCaptionHidden = "sr-only";

export const scoreboardHeaderCell =
  "font-game-display text-game-sm uppercase text-game-text-muted [font-weight:400]";

export const scoreboardRow =
  "group border-b-(length:--game-border-width) border-game-border last:border-b-[0] data-self:bg-game-surface data-highlight:bg-game-panel";

export const scoreboardCell = "align-middle";

export const scoreboardCellSizes: Record<ScoreboardSize, string> = {
  sm: "px-game-sm py-game-xs text-game-sm",
  md: "px-game-sm py-game-sm text-game-md",
};

export const scoreboardAlignments: Record<ScoreboardAlign, string> = {
  start: "text-left",
  end: "text-right",
};

export const scoreboardRank = "tabular-nums text-game-text-muted";

/**
 * The name column takes the leftover width and may shrink to nothing, so long
 * names truncate instead of pushing score and status columns out of a narrow
 * panel (a table cell otherwise grows to fit its unwrapped text).
 */
export const scoreboardName = "w-full max-w-[0] [font-weight:400]";

export const scoreboardNameText = "block truncate";

/** The header sets the column's minimum width too, so it shrinks and truncates the same way. */
export const scoreboardNameHeader = "w-full max-w-[0] truncate";

export const scoreboardScore =
  "tabular-nums font-game-display group-data-highlight:text-game-primary-text";

export const scoreboardValue = "tabular-nums";

export const scoreboardStatus = "font-game-display text-game-sm uppercase";

export const scoreboardEmpty =
  "m-[0] px-game-md py-game-sm text-game-md text-game-text-muted text-center";
