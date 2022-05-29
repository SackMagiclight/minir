import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'build',
        sourcemap: true,
    },
    resolve: {
        alias: {
            '~': path.join(__dirname, 'src'),
            '@': __dirname,
        },
    },
    server: {
        host: true,
    },
})
