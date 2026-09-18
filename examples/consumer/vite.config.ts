import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * A plain Vite config, like a real game's. It deliberately does not register
 * the workspace's `@game-ui/source` condition, so imports resolve to the
 * published `dist` output.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist", emptyOutDir: true },
});
