import { allGameTokens, tokenProperty } from "@game-ui/core";
import type { CSSProperties } from "react";

/** The theme in effect at a point in the document. */
export interface ThemeScope {
  /** The nearest `data-game-theme` value, if any. */
  theme: string | undefined;
  /** Resolved `--game-*` token values, including class and inline overrides. */
  style: CSSProperties;
}

/**
 * Reads the theme in effect at `element` so it can be applied to content
 * portaled outside that element, such as a dialog rendered under `<body>`.
 */
export function readThemeScope(element: Element): ThemeScope {
  const computed = getComputedStyle(element);
  const style: Record<string, string> = {};
  for (const token of allGameTokens) {
    const property = tokenProperty(token);
    const value = computed.getPropertyValue(property).trim();
    if (value) style[property] = value;
  }
  const theme = element.closest("[data-game-theme]")?.getAttribute("data-game-theme") ?? undefined;
  return { theme, style };
}
