/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@vorlefan/prisma-backup',
      fileName: 'prisma-backup',
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['fs', 'path', 'crypto'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          fs: 'fs',
          path: 'path',
          crypto: 'crypto',
        },
      },
    },
  },
  plugins: [dts()],

  // Add this 'test' section
  test: {
    globals: true, // Optional: enables global APIs like describe, it, expect
    environment: 'node', // Set the test environment to Node.js
    coverage: {
      provider: 'v8', // Use the V8 engine for coverage
      reporter: ['text', 'json', 'html'], // Report formats
    },
  },
});
