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
    /**
     * The consumer fixture is intentionally outside this workspace: it resolves
     * `@game-ui/*` to packed tarballs rather than source, and has its own
     * TypeScript and Vite versions. `vp run verify-consumer` type checks and
     * builds it with its own toolchain; checking it from here would resolve the
     * wrong packages and miss its Vite client types.
     */
    ignorePatterns: ["examples/**"],
  },
  resolve: { conditions: [sourceCondition, ...defaultClientConditions] },
  ssr: { resolve: { conditions: [sourceCondition, ...defaultServerConditions] } },
  run: {
    cache: true,
  },
});
