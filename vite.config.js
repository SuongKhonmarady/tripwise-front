import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Tos der leng app',
        short_name: 'tosderleng',
        description: 'ចង់ទៅណា? Plan trips, track expenses, and collaborate with travel companions',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#42b883', // change to your brand color
        icons: [
          {
            src: '/icons/image.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/image.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000
  },
  base: '/'
});
