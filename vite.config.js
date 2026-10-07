import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // relative asset paths, so the build works at any address (e.g. GitHub Pages' /3d-house-/)
  base: './',
  plugins: [react()],
  server: { port: 5173, open: false },
})
