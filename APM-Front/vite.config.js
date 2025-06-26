import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // تحميل متغيرات البيئة بناءً على الوضع الحالي (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
    },
    define: {
      'process.env': {},
      'import.meta.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL),
        VITE_PUSHER_APP_KEY: JSON.stringify(env.VITE_PUSHER_APP_KEY),
        VITE_PUSHER_APP_CLUSTER: JSON.stringify(env.VITE_PUSHER_APP_CLUSTER)
      }
    }
  };
});