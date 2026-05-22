import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // 프리캐시할 정적 에셋 패턴 (빌드 결과물 외 추가 파일)
      includeAssets: [
        'icons/*.png',
        'assets/fonts/*.ttf',
        'assets/onBoarding/*.svg',
      ],

      manifest: {
        name: '가독이',
        short_name: '가독이',
        description: '나만의 독서 기록 & AI 채팅 앱',
        theme_color: '#f8bc0a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // 빌드 결과물 전체 프리캐시
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff2}'],
        globIgnores: ['**/assets/shop/event.svg'],

        runtimeCaching: [
          // API 요청: 네트워크 우선 → 실패 시 캐시 반환 (최대 1일)
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              networkTimeoutSeconds: 8,
            },
          },
          // 외부 폰트(Pretendard CDN): 캐시 우선
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],

  server: {
    port: 5173,
    host: '0.0.0.0',
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})
