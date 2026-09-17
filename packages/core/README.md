# @game-ui/core

Renderer-independent shared contracts: semantic token names and, later, world anchor types and other framework-level types.

This package must not depend on React, Phaser, Astro, or any individual game.

```ts
import { gameTokens, tokenVar } from "@game-ui/core";

tokenVar("primary"); // "var(--game-primary)"
```

Token values live in `@game-ui/themes`.
