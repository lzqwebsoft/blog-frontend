import mermaid from 'mermaid'

/**
 * 检查当前是否为深色模式
 */
function isDarkMode() {
    return document.documentElement.classList.contains('dark-theme')
}

/**
 * 初始化 Mermaid 配置
 */
export function initMermaidConfig() {
    const isDark = isDarkMode()
    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: isDark ? 'dark' : 'default',
        fontFamily: "'Inter Variable', 'Noto Sans SC Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        themeVariables: isDark
            ? {
                  darkMode: true,
                  background: '#181825',
                  primaryColor: '#3b82f6',
                  primaryTextColor: '#f1f5f9',
                  primaryBorderColor: '#60a5fa',
                  lineColor: '#94a3b8',
                  secondaryColor: '#282a36',
                  tertiaryColor: '#181825',
                  // Sequence diagram specific variables for dark mode
                  actorBkg: '#2a2b3d',
                  actorBorder: '#60a5fa',
                  actorTextColor: '#f1f5f9',
                  actorLineColor: '#64748b',
                  signalColor: '#cbd5e1',
                  signalTextColor: '#f1f5f9',
                  labelBoxBkgColor: '#2a2b3d',
                  labelBoxBorderColor: '#60a5fa',
                  labelTextColor: '#f1f5f9',
                  loopTextColor: '#f1f5f9',
                  noteBkgColor: '#2d3748',
                  noteTextColor: '#f8fafc',
                  noteBorderColor: '#4b5563',
                  rectBkgColor: 'rgba(255, 255, 255, 0.08)',
                  rectOpacity: 0.18,
              }
            : {
                  darkMode: false,
                  background: '#ffffff',
                  primaryColor: '#2563eb',
                  primaryTextColor: '#1e293b',
                  primaryBorderColor: '#3b82f6',
                  lineColor: '#64748b',
                  secondaryColor: '#f8fafc',
                  tertiaryColor: '#f1f5f9',
              },
    })
}

/**
 * 针对深色模式优化 Mermaid 生成的 SVG
 * 解决在 sequenceDiagram 等图表中自定义 rect rgb(...) 过于明亮导致与白字冲突的问题
 * @param {string} svg
 * @param {boolean} isDark
 * @returns {string}
 */
export function optimizeMermaidSvg(svg, isDark) {
    if (!svg) return svg

    if (isDark) {
        // 1. 调整 <rect class="rect" ...> 的透明度，使亮色 rect 在深色模式下变成半透明深邃色块
        svg = svg.replace(/<rect([^>]*class="[^"]*rect[^"]*"[^>]*)>/gi, (match, attrs) => {
            if (/fill-opacity="[^"]*"/i.test(attrs)) {
                return `<rect${attrs.replace(/fill-opacity="[^"]*"/i, 'fill-opacity="0.18"')}>`
            }
            return `<rect${attrs} fill-opacity="0.18">`
        })

        // 2. 注入针对深色模式的内联样式增强，确保在 <img :src="blobUrl"> 和 DOM 渲染中均生效
        const darkStyles = `
            .rect, rect.rect {
                fill-opacity: 0.18 !important;
                stroke-opacity: 0.5 !important;
            }
            .messageText, text.messageText {
                fill: #f1f5f9 !important;
                stroke: none !important;
            }
            .messageLine0, .messageLine1, line.messageLine0, line.messageLine1 {
                stroke: #94a3b8 !important;
            }
            .actor line, line.actor-line {
                stroke: #64748b !important;
            }
            .note, rect.note {
                fill: #2d3748 !important;
                stroke: #4a5568 !important;
            }
            .noteText, text.noteText {
                fill: #f7fafc !important;
            }
        `
        if (svg.includes('</style>')) {
            svg = svg.replace('</style>', `${darkStyles}</style>`)
        } else if (svg.includes('<svg')) {
            svg = svg.replace(/(<svg[^>]*>)/, `$1<style>${darkStyles}</style>`)
        }
    }

    return svg
}

/**
 * 判断 DOM 元素是否为 Mermaid 代码块
 * @param {HTMLElement} el
 * @returns {boolean}
 */
export function isMermaidElement(el) {
    if (!el) return false

    // 如果已经是渲染后的容器或内部元素
    if (
        el.classList?.contains('mermaid-container') ||
        el.classList?.contains('mermaid-chart') ||
        el.closest?.('.mermaid-container')
    ) {
        return true
    }

    // 如果是 code-toolbar 包装的 mermaid 元素
    if (el.classList?.contains('code-toolbar')) {
        const inner = el.querySelector('pre, code, .mermaid-container')
        if (inner && isMermaidElement(inner)) {
            return true
        }
    }

    const className = (el.getAttribute?.('class') || '').toLowerCase()
    const codeEl = el.querySelector ? el.querySelector('code') : null
    const codeClassName = (codeEl?.getAttribute?.('class') || '').toLowerCase()

    return (
        className.includes('language-mermaid') ||
        className.includes('brush:mermaid') ||
        className.includes('brush: mermaid') ||
        className === 'mermaid' ||
        className.includes(' mermaid') ||
        codeClassName.includes('language-mermaid') ||
        codeClassName.includes('brush:mermaid') ||
        codeClassName === 'mermaid' ||
        codeClassName.includes(' mermaid')
    )
}

/**
 * 渲染指定容器内的所有 Mermaid 代码块
 * @param {string|HTMLElement} containerSelector
 * @param {Object} options
 * @param {Function} options.onPreviewImage - 点击查看大图时的回调
 */
export async function renderMermaidBlocks(containerSelector = '.article-content', options = {}) {
    const container =
        typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector

    if (!container) return

    // 查找所有候选元素（pre、.mermaid、.code-toolbar 等）
    const candidatePres = Array.from(
        container.querySelectorAll('pre, .mermaid, pre.language-mermaid, .code-toolbar')
    )
    const mermaidElements = []
    const processedSet = new Set()

    candidatePres.forEach((el) => {
        let target = el
        if (el.tagName.toLowerCase() === 'code' && el.parentElement?.tagName.toLowerCase() === 'pre') {
            target = el.parentElement
        }
        if (el.classList?.contains('code-toolbar')) {
            const preInToolbar = el.querySelector('pre')
            if (preInToolbar) {
                target = preInToolbar
            }
        }

        if (isMermaidElement(target) && !processedSet.has(target)) {
            processedSet.add(target)
            mermaidElements.push(target)
        }
    })

    if (mermaidElements.length === 0) return

    // 初始化配置
    initMermaidConfig()

    for (let index = 0; index < mermaidElements.length; index++) {
        const el = mermaidElements[index]

        // 如果已经渲染过则跳过
        if (el.dataset.mermaidRendered === 'true' || el.classList.contains('mermaid-rendered')) {
            continue
        }

        // 提取源码文本（textContent 会自动解码 HTML 实体如 &gt; 为 >）
        const codeEl = el.querySelector('code')
        const rawCode = (codeEl ? codeEl.textContent : el.textContent) || ''
        const code = rawCode.trim()

        if (!code) continue

        const uniqueId = `mermaid-svg-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`

        try {
            const { svg: rawSvg, bindFunctions } = await mermaid.render(uniqueId, code)
            const isDark = isDarkMode()
            const svg = optimizeMermaidSvg(rawSvg, isDark)

            // 创建外层卡片容器
            const wrapper = document.createElement('div')
            wrapper.className = 'mermaid-container'
            wrapper.dataset.mermaidRendered = 'true'
            wrapper.dataset.mermaidCode = code

            // 创建工具栏
            const toolbar = document.createElement('div')
            toolbar.className = 'mermaid-toolbar'

            const badge = document.createElement('div')
            badge.className = 'mermaid-badge'
            badge.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                <span>Mermaid 流程图</span>
            `

            const actions = document.createElement('div')
            actions.className = 'mermaid-actions'

            // 复制源码按钮
            const copyBtn = document.createElement('button')
            copyBtn.type = 'button'
            copyBtn.className = 'mermaid-action-btn'
            copyBtn.title = '复制 Mermaid 源码'
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span class="btn-text">复制源码</span>
            `
            copyBtn.addEventListener('click', async (e) => {
                e.stopPropagation()
                try {
                    await navigator.clipboard.writeText(code)
                    const textSpan = copyBtn.querySelector('.btn-text')
                    if (textSpan) {
                        const originText = textSpan.textContent
                        textSpan.textContent = '已复制'
                        copyBtn.classList.add('copied')
                        setTimeout(() => {
                            textSpan.textContent = originText
                            copyBtn.classList.remove('copied')
                        }, 2000)
                    }
                } catch (err) {
                    console.error('复制失败:', err)
                }
            })

            actions.appendChild(copyBtn)

            // 全屏 / 大图预览按钮
            const previewBtn = document.createElement('button')
            previewBtn.type = 'button'
            previewBtn.className = 'mermaid-action-btn'
            previewBtn.title = '点击放大查看'
            previewBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                <span class="btn-text">放大查看</span>
            `
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                if (typeof options.onPreviewImage === 'function') {
                    // 动态获取当前最新的 SVG（支持主题切换重新渲染后获取最新的 SVG 内容）
                    const currentSvg = chart.innerHTML || svg
                    const svgBlob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' })
                    const url = URL.createObjectURL(svgBlob)
                    const currentDark = isDarkMode()
                    const className = currentDark ? 'mermaid-preview-dark' : 'mermaid-preview-light'
                    options.onPreviewImage(url, { isDark: currentDark, isMermaid: true, className })
                }
            })

            if (options.onPreviewImage) {
                actions.appendChild(previewBtn)
            }

            toolbar.appendChild(badge)
            toolbar.appendChild(actions)
            wrapper.appendChild(toolbar)

            // 图表渲染区域
            const chart = document.createElement('div')
            chart.className = 'mermaid-chart'
            chart.innerHTML = svg
            wrapper.appendChild(chart)

            if (bindFunctions) {
                bindFunctions(chart)
            }

            // 替换节点：若被 Prism 的 code-toolbar 包裹，则连同 code-toolbar 一起替换并移除 Prism toolbar
            const codeToolbar = el.closest('.code-toolbar')
            if (codeToolbar && codeToolbar.parentNode) {
                const prismToolbar = codeToolbar.querySelector('.toolbar')
                if (prismToolbar) {
                    prismToolbar.remove()
                }
                codeToolbar.parentNode.replaceChild(wrapper, codeToolbar)
            } else if (el.parentNode) {
                const nextSibling = el.nextElementSibling
                if (nextSibling && nextSibling.classList.contains('toolbar')) {
                    nextSibling.remove()
                }
                el.parentNode.replaceChild(wrapper, el)
            }
        } catch (error) {
            console.error('渲染 Mermaid 失败:', error, code)
            el.classList.add('mermaid-render-error')
            el.dataset.mermaidRendered = 'error'
        }
    }
}

/**
 * 重新根据当前主题渲染所有 Mermaid 图表
 * @param {string|HTMLElement} containerSelector
 */
export async function reRenderMermaidTheme(containerSelector = '.article-content') {
    const container =
        typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector

    if (!container) return

    const renderedContainers = Array.from(container.querySelectorAll('.mermaid-container[data-mermaid-code]'))
    if (renderedContainers.length === 0) return

    initMermaidConfig()

    for (let index = 0; index < renderedContainers.length; index++) {
        const wrapper = renderedContainers[index]
        const code = wrapper.dataset.mermaidCode
        if (!code) continue

        const chartEl = wrapper.querySelector('.mermaid-chart')
        if (!chartEl) continue

        const uniqueId = `mermaid-rerender-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`

        try {
            const { svg: rawSvg, bindFunctions } = await mermaid.render(uniqueId, code)
            const isDark = isDarkMode()
            const svg = optimizeMermaidSvg(rawSvg, isDark)
            chartEl.innerHTML = svg
            if (bindFunctions) {
                bindFunctions(chartEl)
            }
        } catch (err) {
            console.error('主题切换重新渲染 Mermaid 失败:', err)
        }
    }
}
