import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          firebase: ['firebase'],
          ui: ['sweetalert2', 'react-hot-toast', 'lucide-react', 'react-icons'],
          query: ['@tanstack/react-query'],
        }
      }
    }
  }
})
