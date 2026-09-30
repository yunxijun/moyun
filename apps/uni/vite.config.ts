import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "path";

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      "@moyun/core": path.resolve(__dirname, "../../packages/core/src"),
      "@moyun/core/api": path.resolve(__dirname, "../../packages/core/src/api"),
      "@moyun/core/poem": path.resolve(__dirname, "../../packages/core/src/poem"),
      "@moyun/core/calligraphy": path.resolve(__dirname, "../../packages/core/src/calligraphy"),
      "@moyun/core/types": path.resolve(__dirname, "../../packages/core/src/types"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three'
          }
        },
      },
    },
  },
});
