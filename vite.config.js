import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/.agent/**', '**/Screenshots/**'],
    },
  },

  // Pre-bundle heavy deps so dev server doesn't re-transform them on every request
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      '@react-three/fiber',
      '@react-three/drei',
      'three',
      'zustand',
      'react-hot-toast',
      'react-icons/ri',
    ],
  },

  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('firebase'))                               return 'vendor-firebase';
          if (id.includes('framer-motion') || id.includes('/motion/')) return 'vendor-motion';
          if (id.includes('react-icons'))                            return 'vendor-icons';
          if (id.includes('@react-three') || id.includes('/three/')) return 'vendor-3d';
          if (id.includes('node_modules'))                           return 'vendor';
        },
      },
    },
  },
});
