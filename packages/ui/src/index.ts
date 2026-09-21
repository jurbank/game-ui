/**
 * Renderer-independent entry: token names and world UI contracts. Must not
 * import React, the DOM, or any engine, so games without React can use it.
 * React components are exported from `@gameui/ui/react`.
 */
export {
  allGameTokens,
  gameTokens,
  tokenProperty,
  tokenVar,
  type GameToken,
  type GameTokenCategory,
} from "./tokens/index.ts";
export type * from "./world/index.ts";
