import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5173,
    // Note: Proxy is only used for localhost development
    // When accessing from network, the frontend uses the API_URL utility
    // which automatically detects the correct backend URL
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Only proxy when accessing via localhost
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Only proxy if accessing from localhost
            if (req.headers.host && !req.headers.host.includes('localhost')) {
              // Don't proxy, let the client handle it directly
            }
          });
        }
      }
    }
  }
})

