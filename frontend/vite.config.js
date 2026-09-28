import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Cabeceras anti-caché para todos los recursos servidos por Vite.
const cabecerasSinCache = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        // Evita que el navegador cachee el HTML o los módulos tras el login.
        headers: cabecerasSinCache,
        proxy: {
            // Redirige las peticiones /api hacia el backend Express existente.
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    },
    preview: {
        headers: cabecerasSinCache
    }
})
