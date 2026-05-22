import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('firebase'))      return 'vendor-firebase';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('react-icons'))   return 'vendor-icons';
          if (id.includes('node_modules'))  return 'vendor';
        },
      },
    },
  },
});
