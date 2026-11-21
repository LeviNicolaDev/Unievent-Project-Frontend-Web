import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5227';
  if (command === 'build' && env.VERCEL === '1') {
    const apiUrl = env.VITE_API_BASE_URL || '';
    if (!/^https:\/\//i.test(apiUrl) || /https:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(apiUrl)) {
      throw new Error('Configure VITE_API_BASE_URL na Vercel com a URL HTTPS pública da API Azure (incluindo /api).');
    }
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/imagens': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
