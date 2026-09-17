/**
 * Semantic design token names, grouped by category.
 *
 * Each name maps to a CSS custom property (`--game-<name>`). Themes supply the
 * values; components reference only these names.
 */
export const gameTokens = {
  color: [
    "bg",
    "surface",
    "panel",
    "primary",
    "primary-contrast",
    "secondary",
    "secondary-contrast",
    "danger",
    "danger-contrast",
    "success",
    "warning",
    "text",
    "text-muted",
    "border",
    "focus-ring",
  ],
  font: ["font-body", "font-display"],
  fontSize: ["font-size-sm", "font-size-md", "font-size-lg", "font-size-xl"],
  radius: ["radius-sm", "radius-md", "radius-lg"],
  borderWidth: ["border-width"],
  shadow: ["shadow"],
  space: ["space-xs", "space-sm", "space-md", "space-lg", "space-xl"],
  motion: ["duration-fast", "duration-normal", "ease"],
} as const;

export type GameTokenCategory = keyof typeof gameTokens;

export type GameToken = (typeof gameTokens)[GameTokenCategory][number];

/** Every token name as a flat list. */
export const allGameTokens: readonly GameToken[] = Object.values(gameTokens).flat();

/** The CSS custom property name for a token, e.g. `--game-primary`. */
export function tokenProperty<T extends GameToken>(token: T): `--game-${T}` {
  return `--game-${token}`;
}

/** A CSS `var()` reference to a token, e.g. `var(--game-primary)`. */
export function tokenVar<T extends GameToken>(token: T): `var(--game-${T})` {
  return `var(${tokenProperty(token)})`;
}
