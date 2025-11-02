import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Базовый путь для приложения
  base: "./",

  // Настройки сервера разработки
  server: {
    port: 3000,
    host: true, // Доступно со всех сетевых интерфейсов
    strictPort: false,
    open: false,
  },

  // Настройки preview сервера
  preview: {
    port: 4173,
    host: true,
  },

  // Настройки сборки
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild",
    target: "esnext",
    cssCodeSplit: true,

    // Оптимизация чанков
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },

    // Размер предупреждений
    chunkSizeWarningLimit: 1000,
  },

  // Алиасы для путей
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },

  // Оптимизация зависимостей
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
