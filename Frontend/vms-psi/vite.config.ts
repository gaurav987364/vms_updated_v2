import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        sw: path.resolve(__dirname, "src/service-worker.js"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "sw" ? "service-worker.js" : "assets/[name]-[hash].js";
        },
      },
    },
  },
});
