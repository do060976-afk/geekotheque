import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le dépôt est publié à https://do060976-afk.github.io/geekotheque/
export default defineConfig({
  plugins: [react()],
  base: '/geekotheque/',
});
