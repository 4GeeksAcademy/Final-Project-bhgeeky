import {
    defineConfig
} from 'vite'
import react from '@vitejs/plugin-react'
console.log('VITE_API_URL:', process.env.VITE_API_URL);
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000
    },
    build: {
        outDir: 'dist'
    },

    envPrefix: 'VITE_',
})