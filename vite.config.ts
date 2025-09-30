import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "path";
import cesium from "vite-plugin-cesium";
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), cesium(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      cesium: "cesium",
    },
  },
  define: {
    CESIUM_BASE_URL: JSON.stringify("/cesium"),
  },
  server: {
    port: 3000,
  },
})
