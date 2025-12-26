import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Note: removed '@tailwindcss/vite' plugin because it pulls in a native
// lightningcss binary that can fail to load on some deployment environments
// (e.g. Vercel). Tailwind works correctly via PostCSS/tailwindcss config
// and the imported CSS files, so the plugin is unnecessary.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls to the backend during local development so the dev server
    // and API appear same-origin. This restores the classic local dev flow and
    // avoids cross-site cookie/SameSite issues.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
})
