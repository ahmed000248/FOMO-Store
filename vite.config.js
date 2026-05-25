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
      'zustand',
      'react-hot-toast',
    ],
    // 3D libs excluded — lazy loaded on demand, no need to pre-bundle
    exclude: ['@react-three/fiber', '@react-three/drei', 'three'],
  },

  build: {
    // vendor-3d (Three.js) is ~1 MB but lazy-loaded on demand — not a true initial-load problem
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Firebase (modular SDK — keep together for tree-shaking)
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase'))
            return 'vendor-firebase';

          // 3D stack — lazy loaded, never in initial bundle
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three'))
            return 'vendor-3d';

          // Framer Motion v12 uses the `motion` package internally
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion'))
            return 'vendor-motion';

          // React Icons — large icon set, split away from React core
          if (id.includes('node_modules/react-icons'))
            return 'vendor-icons';

          // React core — smallest possible initial chunk
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          )
            return 'vendor-react';

          // Router — separate so it can be cached independently
          if (id.includes('node_modules/react-router'))
            return 'vendor-router';

          // Everything else (zustand, react-hot-toast, headlessui, emailjs, helmet…)
          if (id.includes('node_modules'))
            return 'vendor-utils';
        },
      },
    },
  },
});
