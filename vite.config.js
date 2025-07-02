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
        name: 'TripWise: Travel Schedule & Expense Manager',
        short_name: 'TripWise',
        description: 'Plan trips, track expenses, and collaborate with travel companions',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb', // Tailwind primary blue
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
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-calls',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache user data and authentication endpoints
          {
            urlPattern: /\/api\/(user|login|register)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'auth-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 12 }
            }
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000
  },
  base: '/'
});
