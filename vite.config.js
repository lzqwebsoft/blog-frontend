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
    build: {
        chunkSizeWarningLimit: 2500,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        // 1. Vue 核心框架全家桶
                        if (id.includes('vue') || id.includes('pinia') || id.includes('@vue')) {
                            return 'vue-vendor'
                        }
                        // 2. FontAwesome 图标库
                        if (id.includes('@fortawesome')) {
                            return 'fontawesome'
                        }
                        // 3. Prism.js 代码高亮
                        if (id.includes('prismjs')) {
                            return 'prismjs'
                        }
                        // 4. Markdown 解析
                        if (id.includes('marked')) {
                            return 'marked'
                        }
                        // 5. Axios 网络请求
                        if (id.includes('axios')) {
                            return 'axios'
                        }
                        // 6. KaTeX 数学公式渲染引擎
                        if (id.includes('katex')) {
                            return 'katex'
                        }
                        // 7. D3 可视化图表底层库
                        if (
                            id.includes('d3') ||
                            id.includes('internmap') ||
                            id.includes('delaunator') ||
                            id.includes('robust-predicates')
                        ) {
                            return 'd3'
                        }
                        // 8. Cytoscape 复杂网络拓扑图引擎
                        if (
                            id.includes('cytoscape') ||
                            id.includes('cose-base') ||
                            id.includes('layout-base')
                        ) {
                            return 'cytoscape'
                        }
                        // 9. Mermaid AST 与 Markdown 解析依赖
                        if (
                            id.includes('micromark') ||
                            id.includes('mdast') ||
                            id.includes('unist') ||
                            id.includes('vfile') ||
                            id.includes('langium') ||
                            id.includes('chevrotain')
                        ) {
                            return 'mermaid-parser'
                        }
                        // 10. Mermaid 核心图表与排版渲染引擎
                        if (
                            id.includes('mermaid') ||
                            id.includes('dagre') ||
                            id.includes('khroma') ||
                            id.includes('stylis') ||
                            id.includes('lodash') ||
                            id.includes('dompurify') ||
                            id.includes('sanitize-url') ||
                            id.includes('braintree') ||
                            id.includes('roughjs') ||
                            id.includes('hachure-fill') ||
                            id.includes('points-on-curve') ||
                            id.includes('points-on-path') ||
                            id.includes('elkjs') ||
                            id.includes('ts-dedent')
                        ) {
                            return 'mermaid'
                        }
                        // 11. 字体包
                        if (id.includes('@fontsource-variable')) {
                            return 'fonts'
                        }
                        // 12. 日期与工具库
                        if (id.includes('dayjs') || id.includes('blueimp-md5')) {
                            return 'utils'
                        }
                        return 'vendor'
                    }
                },
            }
        }
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
            '^/(sitemap|feed)\\.xml$': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        }
    },
})
