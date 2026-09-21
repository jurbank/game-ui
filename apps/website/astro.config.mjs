// @ts-check
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { defaultClientConditions, defaultServerConditions } from "vite-plus";

/**
 * Resolves workspace `@gameui/*` packages to source through their public
 * exports, so the site runs without building packages first. Applied per Vite
 * environment because Astro builds client, server, and prerender environments.
 * @returns {import("vite").Plugin}
 */
function gameUiSource() {
  const sourceCondition = "@gameui/source";
  return {
    name: "game-ui-source-condition",
    configEnvironment(name, config) {
      const defaults = name === "client" ? defaultClientConditions : defaultServerConditions;
      // Vite concatenates arrays when merging, so only add to existing conditions.
      const conditions = config.resolve?.conditions
        ? [sourceCondition]
        : [sourceCondition, ...defaults];
      return { resolve: { conditions } };
    },
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    starlight({
      title: "Game UI",
      description: "Reusable, themeable UI for browser-based games.",
      // Layer order first, then framework styles, then site styles. Framework
      // styles are listed here rather than via CSS `@import` so Vite resolves
      // them with the source condition; Tailwind's CSS import resolver ignores it.
      customCss: [
        "./src/styles/layers.css",
        "@gameui/ui/themes.css",
        "@gameui/ui/styles.css",
        "./src/styles/examples.css",
      ],
      sidebar: [
        { label: "Getting Started", items: [{ autogenerate: { directory: "getting-started" } }] },
        { label: "Concepts", items: [{ autogenerate: { directory: "concepts" } }] },
        { label: "Components", items: [{ autogenerate: { directory: "components" } }] },
        { label: "World UI", items: [{ autogenerate: { directory: "world-ui" } }] },
        { label: "Themes", items: [{ autogenerate: { directory: "themes" } }] },
        { label: "Patterns", items: [{ autogenerate: { directory: "patterns" } }] },
        { label: "Agent Guide", items: [{ autogenerate: { directory: "agent-guide" } }] },
      ],
    }),
  ],
  vite: {
    // Tailwind compiles `@gameui/ui/styles.css` from source during development.
    plugins: [gameUiSource(), tailwindcss()],
  },
});
