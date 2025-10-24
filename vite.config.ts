import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
    plugins: [tsconfigPaths()],
    server: {
    port: 8080,
    open: true,
  },
});