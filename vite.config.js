import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:10000', // Update this to your actual backend URL
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
