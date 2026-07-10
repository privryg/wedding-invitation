import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev + preview server both run on localhost:6969 as requested.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 6969,
    host: true,
    open: false,
  },
  preview: {
    port: 6969,
  },
})
