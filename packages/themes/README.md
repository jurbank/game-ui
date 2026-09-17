# @game-ui/themes

Semantic design token values, starting themes, and the Tailwind CSS mapping for Game UI.

CSS custom properties are the theming API. Token names are defined by `@game-ui/core`; this package supplies their values.

## Exports

| Import                         | Contents                                                        |
| ------------------------------ | --------------------------------------------------------------- |
| `@game-ui/themes`              | Default tokens, base styles, and every starting theme           |
| `@game-ui/themes/tokens.css`   | Neutral default value for every token on `:root`                |
| `@game-ui/themes/base.css`     | Text color and font for themed regions; reduced-motion handling |
| `@game-ui/themes/arcade.css`   | Arcade theme, scoped to `[data-game-theme="arcade"]`            |
| `@game-ui/themes/tailwind.css` | Tailwind v4 `@theme` mapping from utilities to tokens           |

Import only the themes a game uses by combining `tokens.css`, `base.css`, and individual theme files instead of the package root.

## Styling contract

### Cascade layers and import order

All framework CSS lives in the `game-ui` cascade layer, with the sublayers `game-ui.tokens`, `game-ui.themes`, `game-ui.base`, and `game-ui.components`. Declare where `game-ui` sits with one `@layer` statement at the top of your stylesheet: **after resets, before utilities**. Unlayered CSS beats all layered CSS, so your own styles and token overrides always win.

With Tailwind CSS v4:

```css
@layer theme, base, game-ui, components, utilities;

@import "tailwindcss";
@import "@game-ui/themes";
@import "@game-ui/react/styles.css";
@import "@game-ui/themes/tailwind.css";

/* game styles and token overrides */
```

This places Game UI above Tailwind's Preflight reset, which would otherwise reset button fonts, padding, and backgrounds, and below Tailwind utilities, so utilities passed through `className` override component styles.

Without Tailwind:

```css
@import "@game-ui/themes";
@import "@game-ui/react/styles.css";

/* game styles and token overrides */
```

If you use another layered reset or framework, list its layers before `game-ui`, for example `@layer starlight, game-ui;`. An unlayered reset beats every layer, so import it into a layer first: `@import "modern-normalize" layer(reset);` with `@layer reset, game-ui;`.

### Selecting a theme

Themes apply to an element with `data-game-theme` and everything inside it:

```html
<html data-game-theme="arcade"></html>
```

Without a theme attribute, components use the neutral defaults from `tokens.css`. A theme can also be applied to a single region, such as a preview panel.

### Overriding tokens

Override `--game-*` variables in unlayered CSS. Because framework CSS is layered, overrides win regardless of selector specificity:

```css
[data-game-theme="arcade"] {
  --game-primary: #7cf29a;
  --game-primary-contrast: #062611;
}

.boss-fight {
  --game-danger: #ff2a00;
}
```

When changing a color that text sits on, update its `-contrast` partner too.

### Using tokens

With Tailwind, use the mapped utilities, such as `bg-game-panel`, `text-game-text`, `border-game-border`, `rounded-game-md`, `shadow-game`, `p-game-md`, `font-game-display`, `text-game-lg`, and `ease-game`. Tokens without a Tailwind namespace use variable shorthand, such as `border-(length:--game-border-width)` and `duration-(--game-duration-fast)`.

Without Tailwind, reference variables directly (`var(--game-panel)`), or use `tokenVar("panel")` from `@game-ui/core`.

The mapping uses `@theme inline`, so utilities read the `--game-*` variables on the element itself. This is what lets a theme or override on any ancestor restyle the utilities inside it.

### Token reference

| Category   | Tokens                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color      | `bg`, `surface`, `panel`, `primary`, `primary-contrast`, `secondary`, `secondary-contrast`, `danger`, `danger-contrast`, `success`, `warning`, `text`, `text-muted`, `border`, `focus-ring` |
| Typography | `font-body`, `font-display`, `font-size-sm`, `font-size-md`, `font-size-lg`, `font-size-xl`                                                                                                 |
| Shape      | `radius-sm`, `radius-md`, `radius-lg`, `border-width`, `shadow`                                                                                                                             |
| Spacing    | `space-xs`, `space-sm`, `space-md`, `space-lg`, `space-xl`                                                                                                                                  |
| Motion     | `duration-fast`, `duration-normal`, `ease`                                                                                                                                                  |

Durations are set to `0ms` when the user prefers reduced motion.

## Adding a theme

1. Add `src/themes/<name>.css` defining every token inside `@layer game-ui.themes` and `[data-game-theme="<name>"]`.
2. Export it as `./<name>.css` and import it from `src/index.css`.
3. Run `vp test`. The tests verify that every theme defines exactly the core token contract, is exported and bundled, and meets 4.5:1 contrast for text and `-contrast` pairs.
