import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/',
    plugins: [tailwindcss(), react()],
    server: {
      port: 5173,
      proxy: {
        '/naver/revgeo': {
          target: 'https://maps.apigw.ntruss.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/naver\/revgeo/, '/map-reversegeocode/v2/gc'),
          headers: {
            'X-NCP-APIGW-API-KEY-ID': env.VITE_NAVER_ID,
            'X-NCP-APIGW-API-KEY': env.VITE_NAVER_SECRET,
          },
        },

        '^/places': 'http://localhost:3000',
        '^/users':  'http://localhost:3000',
      },
    },
  }
})
