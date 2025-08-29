import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // .env.local 포함 읽기

  return {
    base: '/',
    plugins: [tailwindcss(), react()],
    server: {
      port: 5173,
      proxy: {
        // ⬇️ 브라우저는 /naver/revgeo?... 로 호출 → Vite가 NAVER로 전달
        '/naver/revgeo': {
          target: 'https://maps.apigw.ntruss.com',
          changeOrigin: true,
          // /naver/revgeo → /map-reversegeocode/v2/gc 로 경로 변경
          rewrite: (path) => path.replace(/^\/naver\/revgeo/, '/map-reversegeocode/v2/gc'),
          // 요청에 인증 헤더 주입
          headers: {
            'X-NCP-APIGW-API-KEY-ID': env.VITE_NAVER_ID,
            'X-NCP-APIGW-API-KEY': env.VITE_NAVER_SECRET,
          },
        },

        // 이미 쓰고 있던 BE 프록시도 유지
        '^/places': 'http://localhost:3000',
        '^/users':  'http://localhost:3000',
      },
    },
  }
})
