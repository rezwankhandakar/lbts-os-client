import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // ── Code Splitting ─────────────────────────────────────────────
    // আগে: সব library একটা bundle-এ → initial load slow
    // এখন: বড় library আলাদা chunk-এ → browser parallel download করে
    //        + cache করে রাখে (library বদলালে না, app বদলালে হয়)
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — সবচেয়ে বেশি cache হওয়া দরকার
          'react-vendor': ['react', 'react-dom', 'react-router'],

          // Firebase — বিশাল (~300KB), আলাদা রাখলে app chunk ছোট হয়
          'firebase': ['firebase/app', 'firebase/auth'],

          // Excel export — শুধু export করলে load হবে, initial load-এ না
          'xlsx': ['xlsx', 'file-saver'],

          // UI utilities — একসাথে load হয়
          'ui-libs': ['sweetalert2', 'react-hot-toast', 'lucide-react', 'react-icons'],

          // Form + data fetching
          'data-libs': ['axios', 'react-hook-form', '@tanstack/react-query'],
        },
      },
    },

    // ── Build optimizations ────────────────────────────────────────
    chunkSizeWarningLimit: 600, // 600KB warning threshold (default 500KB)
    sourcemap: false,           // production-এ sourcemap বন্ধ → build দ্রুত + ছোট
    minify: 'esbuild',          // esbuild fastest minifier (Vite default, explicit করা)
  },

  // ── Dev server optimization ────────────────────────────────────
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router',
      'axios', 'firebase/app', 'firebase/auth',
      'sweetalert2', 'react-hot-toast',
    ],
  },
})