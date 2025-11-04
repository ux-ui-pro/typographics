import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true,
    cssCodeSplit: false,
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/index.scss',
      output: {
        assetFileNames: 'index.[ext]',
      },
    },
  },
});
