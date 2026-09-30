import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  envDir: fileURLToPath(new URL("..", import.meta.url)),
  resolve: { alias: { "@": fileURLToPath(new URL("..", import.meta.url)) } },
  esbuild: { jsx: "automatic" },
  publicDir: fileURLToPath(new URL("../public", import.meta.url)),
  build: { outDir: "../dist-firebase", emptyOutDir: true, target: "es2022" },
});
