import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
const file = path => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  base: './',
  resolve: { alias: [
    { find: /^three$/, replacement: file('./vendor/three.module.js') },
    { find: /^three\/addons\//, replacement: file('./vendor/addons/') }
  ] },
  build: { assetsInlineLimit: 0, chunkSizeWarningLimit: 1000 }
});
