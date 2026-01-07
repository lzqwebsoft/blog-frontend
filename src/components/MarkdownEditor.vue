<template>
    <div class="markdown-editor" :class="{ 'fullscreen': isFullscreen }">
        <!-- 工具栏 -->
        <div class="editor-toolbar">
            <template v-for="(item, index) in toolbarList" :key="index">
                <div v-if="item.type === 'separator'" class="toolbar-separator"></div>
                <button v-else type="button" @click="handleToolbarClick(item)" :title="item.title" class="toolbar-btn"
                    :class="[item.class, { active: item.active }]">
                    <font-awesome-icon v-if="item.icon" :icon="item.icon" />
                    <span v-else>{{ item.text }}</span>
                </button>
            </template>
        </div>

        <!-- 编辑器内容区 -->
        <div class="editor-container" :class="`mode-${viewMode}`">
            <!-- 编辑区 -->
            <div v-show="viewMode === 'edit' || viewMode === 'split'" class="editor-pane">
                <textarea ref="textarea" v-model="content" @input="handleInput" @keydown="handleKeyDown"
                    @focus="$emit('focus', $event)" @blur="$emit('blur', $event)" class="markdown-textarea"
                    :style="{ height: isFullscreen ? 'calc(100vh - 60px)' : height + 'px' }"
                    :placeholder="placeholder"></textarea>
            </div>

            <!-- 预览区 -->
            <div v-show="viewMode === 'preview' || viewMode === 'split'" class="preview-pane">
                <div class="markdown-preview" v-html="renderedMarkdown"
                    :style="{ height: isFullscreen ? 'calc(100vh - 60px)' : height + 'px' }"></div>
            </div>
        </div>

        <!-- 图片插入对话框 -->
        <ImageInsertDialog :show="showImageDialog" @close="showImageDialog = false" @confirm="handleImageInserted" />

        <!-- 表情选择对话框 -->
        <EmojiPicker :show="showEmojiPicker" @close="showEmojiPicker = false" @select="handleEmojiSelected" />
    </div>
</template>

<script>
import { marked } from 'marked'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// 导入常用语言支持
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-markdown'

import ImageInsertDialog from './ImageInsertDialog.vue'
import EmojiPicker from './EmojiPicker.vue'

export default {
    name: 'MarkdownEditor',
    components: {
        ImageInsertDialog,
        EmojiPicker
    },
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        height: {
            type: Number,
            default: 400
        },
        toolbars: {
            type: Array,
            default: () => []
        },
        placeholder: {
            type: String,
            default: '请输入 Markdown 内容...'
        }
    },
    emits: ['update:modelValue', 'focus', 'blur'],
    data() {
        return {
            content: '',
            viewMode: 'edit', // 'edit', 'preview', 'split'
            isFullscreen: false,
            // 图片对话框相关
            showImageDialog: false,
            // 表情对话框相关
            showEmojiPicker: false
        }
    },
    computed: {
        renderedMarkdown() {
            if (!this.content) return '<p class="placeholder">暂无内容，开始编写吧...</p>'

            try {
                // 配置 marked
                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    highlight: (code, lang) => {
                        if (lang && Prism.languages[lang]) {
                            return Prism.highlight(code, Prism.languages[lang], lang)
                        }
                        return code
                    }
                })

                return marked.parse(this.content)
            } catch (e) {
                console.error('Markdown 解析错误:', e)
                return '<p class="error">Markdown 解析失败</p>'
            }
        },
        toolbarList() {
            const list = this.toolbars && this.toolbars.length > 0 ? this.toolbars : [
                'bold', 'italic', 'strikethrough', '|',
                'h1', 'h2', 'h3', '|',
                'ul', 'ol', 'quote', '|',
                'link', 'code', 'image', 'emoji', '|',
                'preview', 'fullscreen'
            ]

            return list.map(item => {
                if (item === '|' || item === 'separator') {
                    return { type: 'separator' }
                }

                switch (item) {
                    case 'bold': return { type: 'button', icon: 'bold', title: '粗体 (Ctrl+B)', action: 'bold' }
                    case 'italic': return { type: 'button', icon: 'italic', title: '斜体 (Ctrl+I)', action: 'italic' }
                    case 'strikethrough': return { type: 'button', icon: 'strikethrough', title: '删除线', action: 'strikethrough' }
                    case 'h1': return { type: 'button', text: 'H1', title: '标题 1', action: 'h1' }
                    case 'h2': return { type: 'button', text: 'H2', title: '标题 2', action: 'h2' }
                    case 'h3': return { type: 'button', text: 'H3', title: '标题 3', action: 'h3' }
                    case 'ul': return { type: 'button', icon: 'list-ul', title: '无序列表', action: 'ul' }
                    case 'ol': return { type: 'button', icon: 'list-ol', title: '有序列表', action: 'ol' }
                    case 'quote': return { type: 'button', icon: 'quote-left', title: '引用', action: 'quote' }
                    case 'link': return { type: 'button', icon: 'link', title: '插入链接', action: 'link' }
                    case 'code': return { type: 'button', icon: 'code', title: '代码块', action: 'code' }
                    case 'image': return { type: 'button', icon: 'image', title: '插入图片', action: 'image' }
                    case 'emoji': return { type: 'button', icon: 'smile', title: '插入表情', action: 'emoji' }
                    case 'preview':
                        return {
                            type: 'button',
                            title: this.viewMode === 'edit' ? '预览' : this.viewMode === 'preview' ? '分屏' : '编辑',
                            icon: this.viewMode === 'edit' ? 'eye' : this.viewMode === 'preview' ? 'columns' : 'edit',
                            action: 'toggleMode',
                            class: 'mode-btn',
                            active: this.viewMode !== 'edit'
                        }
                    case 'fullscreen':
                        return {
                            type: 'button',
                            title: this.isFullscreen ? '退出全屏' : '全屏',
                            icon: this.isFullscreen ? 'compress' : 'expand',
                            action: 'toggleFullscreen',
                            active: this.isFullscreen
                        }
                    default: return null
                }
            }).filter(Boolean)
        },
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(newVal) {
                if (newVal !== this.content) {
                    this.content = newVal
                }
            }
        }
    },
    methods: {
        handleToolbarClick(item) {
            if (item.action === 'toggleMode') {
                this.toggleMode()
            } else if (item.action === 'toggleFullscreen') {
                this.toggleFullscreen()
            } else {
                this.insertMarkdown(item.action)
            }
        },

        handleInput() {
            this.$emit('update:modelValue', this.content)
        },

        handleKeyDown(e) {
            // Ctrl+B 粗体
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault()
                this.insertMarkdown('bold')
            }
            // Ctrl+I 斜体
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault()
                this.insertMarkdown('italic')
            }
            // Tab 键插入缩进
            if (e.key === 'Tab') {
                e.preventDefault()
                this.insertText('    ')
            }
        },

        insertMarkdown(type) {
            const textarea = this.$refs.textarea
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const selectedText = this.content.substring(start, end)
            let insertion = ''
            let cursorOffset = 0

            switch (type) {
                case 'bold':
                    insertion = `**${selectedText || '粗体文本'}**`
                    cursorOffset = selectedText ? insertion.length : -2
                    break
                case 'italic':
                    insertion = `*${selectedText || '斜体文本'}*`
                    cursorOffset = selectedText ? insertion.length : -1
                    break
                case 'strikethrough':
                    insertion = `~~${selectedText || '删除线文本'}~~`
                    cursorOffset = selectedText ? insertion.length : -2
                    break
                case 'h1':
                    insertion = `# ${selectedText || '一级标题'}`
                    cursorOffset = insertion.length
                    break
                case 'h2':
                    insertion = `## ${selectedText || '二级标题'}`
                    cursorOffset = insertion.length
                    break
                case 'h3':
                    insertion = `### ${selectedText || '三级标题'}`
                    cursorOffset = insertion.length
                    break
                case 'ul':
                    insertion = `- ${selectedText || '列表项'}\n- 列表项\n- 列表项`
                    cursorOffset = selectedText ? insertion.length : -14
                    break
                case 'ol':
                    insertion = `1. ${selectedText || '列表项'}\n2. 列表项\n3. 列表项`
                    cursorOffset = selectedText ? insertion.length : -16
                    break
                case 'quote':
                    insertion = `> ${selectedText || '引用内容'}`
                    cursorOffset = insertion.length
                    break
                case 'link': {
                    const url = selectedText || 'https://example.com'
                    insertion = `[链接文本](${url})`
                    cursorOffset = selectedText ? insertion.length : -url.length - 1
                    break
                }
                case 'code':
                    insertion = '```javascript\n' + (selectedText || '// 代码内容\n') + '\n```'
                    cursorOffset = selectedText ? insertion.length : -4
                    break
                case 'image': {
                    // 打开图片插入对话框
                    this.openImageDialog()
                    return // 不执行后续的插入逻辑
                }
                case 'emoji': {
                    this.openEmojiPicker()
                    return
                }
            }

            // 插入文本
            this.content = this.content.substring(0, start) + insertion + this.content.substring(end)
            this.$emit('update:modelValue', this.content)

            // 恢复光标位置
            this.$nextTick(() => {
                const newPosition = start + insertion.length + cursorOffset
                textarea.focus()
                textarea.setSelectionRange(newPosition, newPosition)
            })
        },

        insertText(text) {
            const textarea = this.$refs.textarea
            const start = textarea.selectionStart
            const end = textarea.selectionEnd

            this.content = this.content.substring(0, start) + text + this.content.substring(end)
            this.$emit('update:modelValue', this.content)

            this.$nextTick(() => {
                textarea.focus()
                textarea.setSelectionRange(start + text.length, start + text.length)
            })
        },

        toggleMode() {
            const modes = ['edit', 'preview', 'split']
            const currentIndex = modes.indexOf(this.viewMode)
            this.viewMode = modes[(currentIndex + 1) % modes.length]
        },

        toggleFullscreen() {
            this.isFullscreen = !this.isFullscreen
            if (this.isFullscreen) {
                document.body.style.overflow = 'hidden'
            } else {
                document.body.style.overflow = ''
            }
        },

        // 公共方法：获取编辑器内容
        getContent() {
            return this.content
        },

        // 公共方法：设置编辑器内容
        setContent(content) {
            this.content = content
            this.$emit('update:modelValue', content)
        },

        // 公共方法：清空编辑器
        clear() {
            this.content = ''
            this.$emit('update:modelValue', '')
        },

        // ========== 图片对话框相关方法 ==========

        // 打开图片对话框
        openImageDialog() {
            this.showImageDialog = true
        },

        // 处理图片插入
        handleImageInserted({ url, alt }) {
            // 插入图片 Markdown
            const textarea = this.$refs.textarea
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const insertion = `![${alt}](${url})`

            this.content = this.content.substring(0, start) + insertion + this.content.substring(end)
            this.$emit('update:modelValue', this.content)

            // 恢复光标位置
            this.$nextTick(() => {
                const newPosition = start + insertion.length
                textarea.focus()
                textarea.setSelectionRange(newPosition, newPosition)
            })
        },

        // ========== 表情对话框相关方法 ==========
        openEmojiPicker() {
            this.showEmojiPicker = true
        },

        handleEmojiSelected(emoji) {
            this.insertText(emoji)
        }
    }
}
</script>

<style scoped>
.markdown-editor {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--card-bg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.markdown-editor.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    border-radius: 0;
    border: none;
}

/* 工具栏 */
.editor-toolbar {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
    background: var(--hover-bg);
    flex-wrap: wrap;
    gap: 0.25rem;
}

.toolbar-btn {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    color: var(--text-color);
    font-size: 0.875rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    font-weight: 500;
}

.toolbar-btn:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.3);
}

.toolbar-btn:active {
    transform: translateY(0);
}

.toolbar-btn.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.toolbar-btn.mode-btn {
    margin-left: auto;
}

.toolbar-separator {
    width: 1px;
    height: 24px;
    background: var(--border-color);
    margin: 0 0.25rem;
}

/* 编辑器容器 */
.editor-container {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.editor-container.mode-edit .editor-pane {
    width: 100%;
}

.editor-container.mode-preview .preview-pane {
    width: 100%;
}

.editor-container.mode-split .editor-pane,
.editor-container.mode-split .preview-pane {
    width: 50%;
}

/* 编辑区 */
.mode-split .editor-pane {
    border-right: 1px solid var(--border-color);
}

.markdown-textarea {
    width: 100%;
    padding: 1.25rem;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-color);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 0.9375rem;
    line-height: 1.8;
    resize: none;
    overflow-y: auto;
}

.markdown-textarea::placeholder {
    color: var(--text-secondary);
    opacity: 0.5;
}

/* 预览区 */
.preview-pane {
    background: var(--card-bg);
    overflow: hidden;
}

.markdown-preview {
    padding: 1.25rem;
    overflow-y: auto;
    line-height: 1.8;
    color: var(--text-color);
}

/* Markdown 预览样式 */
.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
    margin: 1.5rem 0 0.75rem 0;
    color: var(--text-color);
    font-weight: 600;
    line-height: 1.4;
}

.markdown-preview h1 {
    font-size: 2rem;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
}

.markdown-preview h2 {
    font-size: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.4rem;
}

.markdown-preview h3 {
    font-size: 1.25rem;
}

.markdown-preview h4 {
    font-size: 1.125rem;
}

.markdown-preview p {
    margin: 0.75rem 0;
}

.markdown-preview ul,
.markdown-preview ol {
    margin: 0.75rem 0;
    padding-left: 2rem;
}

.markdown-preview li {
    margin: 0.25rem 0;
}

.markdown-preview blockquote {
    border-left: 4px solid var(--primary-color);
    margin: 1rem 0;
    padding: 0.5rem 0 0.5rem 1rem;
    color: var(--text-secondary);
    background: var(--hover-bg);
    border-radius: 0 4px 4px 0;
}

.markdown-preview pre {
    background: #2d2d2d;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 1rem;
    margin: 1rem 0;
    overflow-x: auto;
}

.markdown-preview code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 0.875rem;
}

.markdown-preview :not(pre)>code {
    background: var(--hover-bg);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    color: var(--primary-color);
    border: 1px solid var(--border-color);
}

.markdown-preview img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 1rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.markdown-preview a {
    color: var(--link-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
}

.markdown-preview a:hover {
    border-bottom-color: var(--link-color);
}

.markdown-preview table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
}

.markdown-preview th,
.markdown-preview td {
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    text-align: left;
}

.markdown-preview th {
    background: var(--hover-bg);
    font-weight: 600;
}

.markdown-preview hr {
    border: none;
    border-top: 2px solid var(--border-color);
    margin: 2rem 0;
}

.markdown-preview .placeholder,
.markdown-preview .error {
    color: var(--text-secondary);
    text-align: center;
    padding: 2rem;
    font-style: italic;
}

.markdown-preview .error {
    color: #e74c3c;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .editor-toolbar {
        padding: 0.5rem;
        gap: 0.25rem;
    }

    .toolbar-btn {
        padding: 0.4rem 0.6rem;
        font-size: 0.8125rem;
        min-width: 32px;
        height: 32px;
    }

    .toolbar-separator {
        display: none;
    }

    /* 移动端强制编辑/预览模式 */
    .editor-container.mode-split {
        flex-direction: column;
    }

    .editor-container.mode-split .editor-pane,
    .editor-container.mode-split .preview-pane {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border-color);
    }

    .markdown-textarea,
    .markdown-preview {
        padding: 1rem;
        font-size: 0.875rem;
    }

    .markdown-preview h1 {
        font-size: 1.5rem;
    }

    .markdown-preview h2 {
        font-size: 1.25rem;
    }

    .markdown-preview h3 {
        font-size: 1.125rem;
    }
}

/* 自定义滚动条 */
.markdown-textarea::-webkit-scrollbar,
.markdown-preview::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.markdown-textarea::-webkit-scrollbar-track,
.markdown-preview::-webkit-scrollbar-track {
    background: var(--hover-bg);
}

.markdown-textarea::-webkit-scrollbar-thumb,
.markdown-preview::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
}

.markdown-textarea::-webkit-scrollbar-thumb:hover,
.markdown-preview::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
}
</style>
