import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: resolve("src/index.ts"), formats: ["es", "cjs"], fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`, cssFileName: "styles" },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "clsx", "tailwind-merge"], output: { globals: { react: "React", "react-dom": "ReactDOM" } } },
    sourcemap: true
  }
});
