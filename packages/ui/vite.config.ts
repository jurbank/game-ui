import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    // `index` is renderer-free (tokens and world UI contracts); `react` holds the
    // components; `input` is DOM-only keyboard ownership. Separate entries keep
    // React out of games that only need `.` or `./input`.
    entry: { index: "src/index.ts", react: "src/react/index.ts", input: "src/input/index.ts" },
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
