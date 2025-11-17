import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Note: removed '@tailwindcss/vite' plugin because it pulls in a native
// lightningcss binary that can fail to load on some deployment environments
// (e.g. Vercel). Tailwind works correctly via PostCSS/tailwindcss config
// and the imported CSS files, so the plugin is unnecessary.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
