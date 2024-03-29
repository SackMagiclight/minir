import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/minir/',
    plugins: [react()],
    build: {
        sourcemap: true,
    },
    resolve: {
        alias: {
            '~': path.join(__dirname, 'src'),
            '@': __dirname,
            './runtimeConfig': './runtimeConfig.browser',
        },
    },
    server: {
        host: true,
        port: 3000,
    },
})
