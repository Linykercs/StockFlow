import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// O Vite repassa /api (e o Swagger) para o backend em localhost:8080.
// O cabeçalho Origin é retirado porque, para o backend, a chamada vem do próprio Vite;
// sem isso, acessando por um link externo o Spring recusa por CORS.
const backend: ProxyOptions = {
  target: 'http://localhost:8080',
  configure: (proxy) => {
    proxy.on('proxyReq', (requisicao) => requisicao.removeHeader('origin'))
  },
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': backend,
      '/docs': backend,
      '/swagger-ui': backend,
      '/v3/api-docs': backend,
    },
  },
})
