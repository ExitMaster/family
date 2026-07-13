import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: '연어항해일지',
        short_name: '연어일지',
        description: 'ADHD 작업기억 보조 — 브레인 덤프 + AI 트리아지',
        lang: 'ko',
        start_url: '/',
        display: 'standalone',
        background_color: '#101828',
        theme_color: '#101828',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcuts: [
          {
            name: '새 덤프',
            short_name: '덤프',
            description: '바로 입력창으로',
            url: '/?dump=1',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // 덤프 화면(앱 셸) 프리캐시 — 비행기 모드에서도 열린다
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
});
