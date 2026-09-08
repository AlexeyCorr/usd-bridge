import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Приложение живёт на суб-пути alexeycorr.dev/usd-bridge.
export default defineConfig({
  base: '/usd-bridge/',
  plugins: [
    // compiler: true — нативный React Compiler на oxc (без Babel).
    react({ compiler: true }),
    VitePWA({
      registerType: 'autoUpdate',
      // Ноль сетевых запросов в рантайме: всё в precache, работает офлайн.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
      manifest: {
        name: 'usd-bridge',
        short_name: 'usd-bridge',
        description: 'Кросс-курс валют через доллар по вашим собственным курсам',
        lang: 'ru',
        id: '/usd-bridge/',
        start_url: '/usd-bridge/',
        scope: '/usd-bridge/',
        display: 'standalone',
        background_color: '#f7f7f9',
        theme_color: '#f7f7f9',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Тестируем только src/core — чистый TS, DOM не нужен.
    environment: 'node',
    globals: true,
    include: ['src/core/**/*.test.ts'],
  },
});
