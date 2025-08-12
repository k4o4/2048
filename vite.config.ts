// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_E2E': JSON.stringify(process.env.VITE_E2E ?? '0')
  },
  server: { port: 5173, strictPort: true },
});
