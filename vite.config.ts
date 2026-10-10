import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // /meetup 전용 HTML(검색 로봇이 자바스크립트 없이 제목·설명·본문을 읽도록) — index.html은 그대로
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "client", "index.html"),
        meetup: path.resolve(import.meta.dirname, "client", "meetup.html"),
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
