import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const https = process.env.ANALYZ_HTTPS_CERT && process.env.ANALYZ_HTTPS_KEY ? {
  cert: readFileSync(process.env.ANALYZ_HTTPS_CERT),
  key: readFileSync(process.env.ANALYZ_HTTPS_KEY)
} : undefined

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg', 'pwa-192.png', 'pwa-512.png'],
    manifest: {
      name: 'آنالیز | حد و پیوستگی',
      short_name: 'آنالیز',
      description: 'آنالیز ریاضی',
      lang: 'fa',
      dir: 'rtl',
      theme_color: '#FABB8F',
      background_color: '#f8f9fb',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,pdf}'], maximumFileSizeToCacheInBytes: 6000000 }
  })],
  server: { https },
  preview: { https },
  build: {
    rollupOptions: { output: { manualChunks: {
      math: ['mathjs/number'],
      algebra: ['nerdamer/nerdamer.core.js', 'nerdamer/Algebra.js'],
      typography: ['katex'],
      graph: ['d3']
    } } }
  }
})
