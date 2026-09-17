import { tokenProperty, type GameToken } from "@game-ui/core";
import type { WorldTone } from "@game-ui/world-ui";

export interface CanvasPresentation {
  background: string;
  panel: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  font: string;
  textTones: Record<WorldTone, string>;
  fillTones: Record<WorldTone, string>;
}

/** Browser-only adapter owned by the game. Call on mount and explicit theme changes only. */
export function readPresentation(element: HTMLElement): CanvasPresentation {
  const styles = getComputedStyle(element);
  const read = (token: GameToken) => styles.getPropertyValue(tokenProperty(token)).trim();
  return {
    background: read("bg"),
    panel: read("panel"),
    border: read("border"),
    text: read("text"),
    muted: read("text-muted"),
    primary: read("primary"),
    // Fixed 14 CSS-pixel label size; theme font family is resolved once. No webfont assets required.
    font: `14px ${read("font-body") || "system-ui"}`,
    textTones: {
      default: read("text"),
      primary: read("primary-text"),
      success: read("success-text"),
      warning: read("warning-text"),
      danger: read("danger-text"),
    },
    fillTones: {
      default: read("primary"),
      primary: read("primary"),
      success: read("success"),
      warning: read("warning"),
      danger: read("danger"),
    },
  };
}
