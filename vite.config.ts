// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === "development" ? [componentTagger()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",          // expõe em :: (IPv6) e 0.0.0.0 (IPv4) no Windows
    port: 8080,
    strictPort: true,
    proxy: {
      // Tudo que começar com /api vai para o backend (3333)
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
        secure: false,   // só para ambiente local
        // não reescrevemos o caminho; o backend já serve em /api/*
        // rewrite: (p) => p,
      },
    },
  },
}));
