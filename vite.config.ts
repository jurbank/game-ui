import { defaultClientConditions, defaultServerConditions, defineConfig } from "vite-plus";

/**
 * Workspace-only export condition that resolves `@game-ui/*` packages to their
 * source, so checks, tests, and dev servers do not require a prior build.
 * Published packages omit it through `publishConfig.exports`.
 */
export const sourceCondition = "@game-ui/source";

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: { conditions: [sourceCondition, ...defaultClientConditions] },
  ssr: { resolve: { conditions: [sourceCondition, ...defaultServerConditions] } },
  run: {
    cache: true,
  },
});
