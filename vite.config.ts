import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "@vorlefan/prisma-backup",
      fileName: "prisma-backup",
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["fs", "path", "crypto"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          fs: "fs",
          path: "path",
          crypto: "crypto",
        },
      },
    },
  },
  plugins: [dts()],
});
