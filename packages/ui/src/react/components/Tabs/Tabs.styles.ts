import type { TabsSize } from "./Tabs.types.ts";

export const tabsRoot = "flex flex-col gap-game-md font-game-body text-game-text";

export const tabsList =
  "inline-flex self-start gap-game-xs p-game-xs bg-game-surface border-(length:--game-border-width) border-game-border rounded-game-md";

export const tabsTab =
  "border-0 bg-transparent font-game-display leading-none text-game-text-muted rounded-game-sm cursor-pointer transition-[background-color,color] duration-(--game-duration-fast) ease-game hover:text-game-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-game-focus-ring data-active:bg-game-primary data-active:text-game-primary-contrast data-disabled:cursor-not-allowed data-disabled:opacity-50";

export const tabsTabSizes: Record<TabsSize, string> = {
  sm: "px-game-sm py-game-xs text-game-sm",
  md: "px-game-md py-game-sm text-game-md",
};

export const tabsPanel =
  "outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-game-focus-ring rounded-game-sm";
