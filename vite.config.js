import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// import prismjs from 'vite-plugin-prismjs'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        // prismjs({
        //     languages: [
        //         "markup", "css", "clike", "javascript", "apacheconf",
        //         "c", "csharp", "bash", "basic", "cpp", "nasm",
        //         "ruby", "markup-templating", "git", "go", "groovy", "http",
        //         "hsts", "ini", "java", "json", "jsonp", "markdown", "nginx",
        //         "php", "sql", "python", "sass", "scss", "scala", "scheme",
        //         "swift", "vbnet", "vim", "visual-basic", "yaml"
        //     ],
        //     plugins: ["line-numbers", "autolinker", "show-language", "copy-to-clipboard"],
        //     theme: "default",
        //     css: true
        // }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    // 设置100ms轮询间隔
    server: {
        host: "0.0.0.0",
        port: 8000,
        hmr: {
            overlay: false,
        },
        watch: {
            usePolling: true,
            interval: 100,
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            '/images': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
            "/sitemap.xml": {
                target: 'http://localhost:8080',
                changeOrigin: true,
            }
        }
    },
})
