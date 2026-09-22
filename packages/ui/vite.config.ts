import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    // `index` is renderer-free (tokens and world UI contracts); `react` holds the
    // components; `input` is DOM-only keyboard ownership; `text` is the word
    // filter and depends on nothing. Separate entries keep React out of games
    // that only need `.`, `./input`, or `./text`.
    entry: {
      index: "src/index.ts",
      react: "src/react/index.ts",
      input: "src/input/index.ts",
      text: "src/text/index.ts",
    },
    dts: {
      tsgo: true,
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
