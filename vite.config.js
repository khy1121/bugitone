import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'
  const uploadsProxyTarget = getProxyOrigin(
    env.VITE_UPLOADS_PROXY_TARGET || env.UPLOADS_PROXY_TARGET || apiProxyTarget
  )
  const apiProxy = {
    '/api': {
      target: apiProxyTarget,
      changeOrigin: true,
    },
    '/uploads': {
      target: uploadsProxyTarget,
      changeOrigin: true,
    },
  }

  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'NADOK',
        short_name: 'NADOK',
        description: 'Personal reading notes and AI chat',
        theme_color: '#997c26',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        globIgnores: ['**/icons/*.png'],
        // 기본값은 /assets/ 아래 파일을 모두 '파일명에 해시가 있음'으로 보고 revision을 붙이지 않음.
        // 이 프로젝트는 public/assets 아래 이미지·폰트도 /assets/로 서비스되므로, 같은 이름으로 파일을 교체하면
        // 서비스워커가 옛 파일을 계속 내려주는 문제가 생김 (예: 로고 폰트 교체 후 모바일에서 NA가 안 보임).
        // 모든 파일에 내용 기반 revision을 붙이도록 어떤 URL과도 일치하지 않는 패턴으로 지정.
        dontCacheBustURLsMatching: /(?!)/,
        runtimeCaching: [
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
    proxy: apiProxy,
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    proxy: apiProxy,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  }
})

function getProxyOrigin(value) {
  try {
    return new URL(value).origin
  } catch {
    return value
  }
}
