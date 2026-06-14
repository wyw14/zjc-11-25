import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4524,
    proxy: {
      '/api': {
        target: 'http://localhost:4024',
        changeOrigin: true
      }
    }
  }
})
