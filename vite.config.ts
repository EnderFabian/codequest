import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Permite abrir la app vía túnel (Cloudflare) desde otro PC o el mismo
    allowedHosts: ['.trycloudflare.com'],
  },
})
