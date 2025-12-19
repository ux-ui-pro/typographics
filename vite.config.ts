import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    transformer: 'lightningcss',
  },
  build: {
    sourcemap: true,
    cssCodeSplit: false,
    cssMinify: 'lightningcss',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/index.scss',
      output: {
        assetFileNames: 'index.[ext]',
      },
    },
  },
});
