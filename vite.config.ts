import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relative : le site fonctionne aussi bien en local que sur GitHub Pages (https://<compte>.github.io/chat-evo/)
export default defineConfig({
  base: './',
  plugins: [react()],
});
