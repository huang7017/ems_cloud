import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},
  esbuild: {
    // 只在生产构建时移除 console 和 debugger
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
}))
