import { defineConfig } from 'vite';

export default defineConfig({
  build: {
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
