---
"@gameui/ui": minor
---

Game UI now ships as one package, `@gameui/ui`, replacing `@gameui/core`, `@gameui/themes`, `@gameui/react`, and `@gameui/world-ui`.

| Before                                         | After                                             |
| ---------------------------------------------- | ------------------------------------------------- |
| `@gameui/react`                                | `@gameui/ui/react`                                |
| `@gameui/core`, `@gameui/world-ui`             | `@gameui/ui`                                      |
| `@gameui/react/styles.css`                     | `@gameui/ui/styles.css`                           |
| `@gameui/themes`                               | `@gameui/ui/themes.css`                           |
| `@gameui/themes/{tokens,base,tailwind}.css`    | `@gameui/ui/{tokens,base,tailwind}.css`           |
| `@gameui/themes/{arcade,tactical,playful}.css` | `@gameui/ui/themes/{arcade,tactical,playful}.css` |

React is now an optional peer dependency, required only for `@gameui/ui/react`. The root entry loads no React, so canvas and three.js games can use tokens and world UI contracts without it.
