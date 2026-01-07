<template>
    <div class="rich-text-editor" :class="{ 'fullscreen': isFullscreen }">
        <!-- 工具栏 -->
        <div class="editor-toolbar">
            <template v-for="(item, index) in toolbarList" :key="index">
                <div v-if="item.type === 'separator'" class="toolbar-separator"></div>
                <div v-else-if="item.type === 'mode-group'" class="mode-group-control" :class="item.class">
                    <button v-for="(subItem, subIndex) in item.items" :key="subIndex" type="button"
                        @click="setViewMode(subItem.value)" :title="subItem.title" class="mode-group-btn"
                        :class="{ active: viewMode === subItem.value }">
                        <font-awesome-icon :icon="subItem.icon" />
                    </button>
                </div>
                <button v-else type="button" @click="handleToolbarClick(item)" :title="item.title" class="toolbar-btn"
                    :class="[item.class, { active: item.active }]" :disabled="item.disabled">
                    <font-awesome-icon v-if="item.icon" :icon="item.icon" />
                    <span v-else>{{ item.text }}</span>
                </button>
            </template>
        </div>

        <!-- 编辑器内容区 -->
        <div class="editor-container">
            <!-- 编辑区 -->
            <div v-show="viewMode === 'edit'" class="editor-pane">
                <div ref="editor" class="editor-content" contenteditable="true" @input="handleInput"
                    @paste="handlePaste" @keydown="handleKeyDown"
                    :style="{ height: isFullscreen ? 'calc(100vh - 60px)' : height + 'px' }"></div>
            </div>

            <!-- 源代码区 -->
            <div v-show="viewMode === 'code'" class="code-pane">
                <textarea v-model="internalValue" @input="handleCodeInput" placeholder="在此输入 HTML 源代码..."
                    class="code-editor"
                    :style="{ height: isFullscreen ? 'calc(100vh - 60px)' : height + 'px' }"></textarea>
            </div>

            <!-- 预览区 -->
            <div v-show="viewMode === 'preview'" class="preview-pane">
                <div class="content-preview" v-html="internalValue"
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
import ImageInsertDialog from './ImageInsertDialog.vue'
import EmojiPicker from './EmojiPicker.vue'

export default {
    name: 'RichTextEditor',
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
        }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            internalValue: '',
            viewMode: 'edit', // 'edit', 'code', 'preview'
            isFullscreen: false,
            showImageDialog: false,
            showEmojiPicker: false
        }
    },
    computed: {
        toolbarList() {
            const list = this.toolbars && this.toolbars.length > 0 ? this.toolbars : [
                'bold', 'italic', 'underline', 'strikeThrough', '|',
                'h1', 'h2', 'h3', '|',
                'ul', 'ol', 'quote', '|',
                'link', 'unlink', 'code', 'image', 'emoji', '|',
                'mode-group', 'fullscreen'
            ]

            return list.map(item => {
                if (item === '|' || item === 'separator') {
                    return { type: 'separator' }
                }

                switch (item) {
                    case 'bold': return { type: 'button', icon: 'bold', title: '粗体 (Ctrl+B)', action: 'execCommand', args: ['bold'], disabled: this.viewMode !== 'edit' }
                    case 'italic': return { type: 'button', icon: 'italic', title: '斜体 (Ctrl+I)', action: 'execCommand', args: ['italic'], disabled: this.viewMode !== 'edit' }
                    case 'underline': return { type: 'button', icon: 'underline', title: '下划线', action: 'execCommand', args: ['underline'], disabled: this.viewMode !== 'edit' }
                    case 'strikeThrough': return { type: 'button', icon: 'strikethrough', title: '删除线', action: 'execCommand', args: ['strikeThrough'], disabled: this.viewMode !== 'edit' }

                    case 'h1': return { type: 'button', text: 'H1', title: '标题 1', action: 'execCommand', args: ['formatBlock', '<h1>'], disabled: this.viewMode !== 'edit' }
                    case 'h2': return { type: 'button', text: 'H2', title: '标题 2', action: 'execCommand', args: ['formatBlock', '<h2>'], disabled: this.viewMode !== 'edit' }
                    case 'h3': return { type: 'button', text: 'H3', title: '标题 3', action: 'execCommand', args: ['formatBlock', '<h3>'], disabled: this.viewMode !== 'edit' }

                    case 'ul': return { type: 'button', icon: 'list-ul', title: '无序列表', action: 'execCommand', args: ['insertUnorderedList'], disabled: this.viewMode !== 'edit' }
                    case 'ol': return { type: 'button', icon: 'list-ol', title: '有序列表', action: 'execCommand', args: ['insertOrderedList'], disabled: this.viewMode !== 'edit' }
                    case 'quote': return { type: 'button', icon: 'quote-left', title: '引用', action: 'execCommand', args: ['formatBlock', '<blockquote>'], disabled: this.viewMode !== 'edit' }

                    case 'link': return { type: 'button', icon: 'link', title: '插入链接', action: 'insertLink', disabled: this.viewMode !== 'edit' }
                    case 'unlink': return { type: 'button', icon: 'unlink', title: '移除链接', action: 'execCommand', args: ['unlink'], disabled: this.viewMode !== 'edit' }
                    case 'code': return { type: 'button', icon: 'code', title: '代码块', action: 'insertCodeBlock', disabled: this.viewMode !== 'edit' }
                    case 'image': return { type: 'button', icon: 'image', title: '插入图片', action: 'insertImage', disabled: this.viewMode !== 'edit' }
                    case 'emoji': return { type: 'button', icon: 'smile', title: '插入表情', action: 'openEmojiPicker', disabled: this.viewMode !== 'edit' }

                    case 'mode-group': return {
                        type: 'mode-group',
                        class: 'mode-group',
                        items: [
                            { icon: 'edit', title: '可视化编辑', value: 'edit' },
                            { icon: 'file-code', title: '源代码', value: 'code' },
                            { icon: 'eye', title: '预览', value: 'preview' }
                        ]
                    }

                    case 'fullscreen': return { type: 'button', icon: this.isFullscreen ? 'compress' : 'expand', title: this.isFullscreen ? '退出全屏' : '全屏', action: 'toggleFullscreen', active: this.isFullscreen }

                    default: return null
                }
            }).filter(Boolean)
        }
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(newVal) {
                if (newVal !== this.internalValue) {
                    this.internalValue = newVal
                    this.updateEditorContent()
                }
            }
        }
    },
    mounted() {
        this.updateEditorContent()
    },
    methods: {
        handleToolbarClick(item) {
            if (item.action === 'execCommand') {
                this.execCommand(...(item.args || []))
            } else if (item.action === 'setViewMode') {
                this.setViewMode(...(item.args || []))
            } else if (typeof this[item.action] === 'function') {
                this[item.action]()
            }
        },

        updateEditorContent() {
            if (this.$refs.editor && this.viewMode === 'edit') {
                this.$refs.editor.innerHTML = this.internalValue
            }
        },

        handleInput() {
            this.internalValue = this.$refs.editor.innerHTML
            this.$emit('update:modelValue', this.internalValue)
        },

        handleCodeInput() {
            this.$emit('update:modelValue', this.internalValue)
        },

        handleKeyDown(e) {
            if (this.viewMode !== 'edit') return

            // Ctrl+B 粗体
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault()
                this.execCommand('bold')
            }
            // Ctrl+I 斜体
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault()
                this.execCommand('italic')
            }
            // Ctrl+U 下划线
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault()
                this.execCommand('underline')
            }
        },

        // 获取当前选区
        getSelection() {
            const selection = window.getSelection()
            if (!selection.rangeCount) return null
            return selection
        },

        // 保存选区
        saveSelection() {
            const selection = this.getSelection()
            if (selection && selection.rangeCount > 0) {
                return selection.getRangeAt(0)
            }
            return null
        },

        // 恢复选区
        restoreSelection(range) {
            if (range) {
                const selection = window.getSelection()
                selection.removeAllRanges()
                selection.addRange(range)
            }
        },

        // 包裹选中文本
        wrapSelection(tagName) {
            const selection = this.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)
            const selectedText = range.toString()

            if (selectedText) {
                const wrapper = document.createElement(tagName)
                try {
                    range.surroundContents(wrapper)
                } catch {
                    // 如果选区跨越多个节点，使用另一种方法
                    wrapper.appendChild(range.extractContents())
                    range.insertNode(wrapper)
                }
                this.handleInput()
            }
        },

        // 切换格式
        toggleFormat(tagName) {
            const selection = this.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)
            let node = range.commonAncestorContainer

            // 查找是否已经在该标签内
            while (node && node !== this.$refs.editor) {
                if (node.nodeType === 1 && node.tagName.toLowerCase() === tagName.toLowerCase()) {
                    // 已存在，移除格式
                    const parent = node.parentNode
                    while (node.firstChild) {
                        parent.insertBefore(node.firstChild, node)
                    }
                    parent.removeChild(node)
                    this.handleInput()
                    return
                }
                node = node.parentNode
            }

            // 不存在，添加格式
            this.wrapSelection(tagName)
        },

        // 插入 HTML
        insertHTML(html) {
            const selection = this.getSelection()
            if (!selection || selection.rangeCount === 0) {
                // 如果没有选区，在末尾插入
                this.$refs.editor.insertAdjacentHTML('beforeend', html)
            } else {
                const range = selection.getRangeAt(0)
                range.deleteContents()

                const fragment = range.createContextualFragment(html)
                range.insertNode(fragment)

                // 移动光标到插入内容之后
                range.collapse(false)
                selection.removeAllRanges()
                selection.addRange(range)
            }
            this.handleInput()
            this.$refs.editor.focus()
        },

        // 插入文本
        insertText(text) {
            const selection = this.getSelection()
            if (!selection || selection.rangeCount === 0) {
                this.$refs.editor.textContent += text
            } else {
                const range = selection.getRangeAt(0)
                range.deleteContents()
                const textNode = document.createTextNode(text)
                range.insertNode(textNode)
                range.collapse(false)
                selection.removeAllRanges()
                selection.addRange(range)
            }
            this.handleInput()
        },

        // 设置块级格式
        setBlockFormat(tagName) {
            const selection = this.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)
            let node = range.commonAncestorContainer

            // 找到块级父元素
            while (node && node !== this.$refs.editor) {
                if (node.nodeType === 1 && ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'].includes(node.tagName)) {
                    const newElement = document.createElement(tagName)
                    newElement.innerHTML = node.innerHTML
                    node.parentNode.replaceChild(newElement, node)
                    this.handleInput()
                    return
                }
                node = node.parentNode
            }

            // 如果没找到块级元素，包裹选中内容
            const wrapper = document.createElement(tagName)
            try {
                range.surroundContents(wrapper)
            } catch {
                wrapper.appendChild(range.extractContents())
                range.insertNode(wrapper)
            }
            this.handleInput()
        },

        // 切换列表
        toggleList(listType) {
            const selection = this.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)
            let node = range.commonAncestorContainer

            // 查找是否已在列表中
            while (node && node !== this.$refs.editor) {
                if (node.nodeType === 1 && (node.tagName === 'UL' || node.tagName === 'OL')) {
                    // 已在列表中，移除列表
                    const parent = node.parentNode
                    while (node.firstChild) {
                        const li = node.firstChild
                        const p = document.createElement('p')
                        p.innerHTML = li.innerHTML
                        parent.insertBefore(p, node)
                        node.removeChild(li)
                    }
                    parent.removeChild(node)
                    this.handleInput()
                    return
                }
                node = node.parentNode
            }

            // 创建新列表
            const list = document.createElement(listType)
            const li = document.createElement('li')

            if (range.toString()) {
                li.appendChild(range.extractContents())
            } else {
                li.textContent = '列表项'
            }

            list.appendChild(li)
            range.insertNode(list)
            this.handleInput()
        },

        execCommand(command, value = null) {
            switch (command) {
                case 'bold':
                    this.toggleFormat('strong')
                    break
                case 'italic':
                    this.toggleFormat('em')
                    break
                case 'underline':
                    this.toggleFormat('u')
                    break
                case 'strikeThrough':
                    this.toggleFormat('s')
                    break
                case 'formatBlock':
                    if (value) {
                        const tagName = value.replace(/<|>/g, '')
                        this.setBlockFormat(tagName)
                    }
                    break
                case 'insertUnorderedList':
                    this.toggleList('ul')
                    break
                case 'insertOrderedList':
                    this.toggleList('ol')
                    break
                case 'unlink':
                    this.removeLink()
                    break
            }
            this.$refs.editor.focus()
        },

        removeLink() {
            const selection = this.getSelection()
            if (!selection || selection.rangeCount === 0) return

            let node = selection.getRangeAt(0).commonAncestorContainer

            while (node && node !== this.$refs.editor) {
                if (node.nodeType === 1 && node.tagName === 'A') {
                    const parent = node.parentNode
                    while (node.firstChild) {
                        parent.insertBefore(node.firstChild, node)
                    }
                    parent.removeChild(node)
                    this.handleInput()
                    return
                }
                node = node.parentNode
            }
        },

        insertLink() {
            const url = prompt('请输入链接地址:')
            if (url) {
                const selection = this.getSelection()
                if (!selection || selection.rangeCount === 0) return

                const range = selection.getRangeAt(0)
                const selectedText = range.toString()

                const link = document.createElement('a')
                link.href = url
                link.textContent = selectedText || '链接文本'

                range.deleteContents()
                range.insertNode(link)

                this.handleInput()
                this.$refs.editor.focus()
            }
        },

        insertCodeBlock() {
            const codeBlock = '<pre><code class="language-javascript">// 在这里输入代码\n</code></pre><p><br></p>'
            this.insertHTML(codeBlock)
        },

        insertImage() {
            this.showImageDialog = true
        },

        handleImageInserted({ url, alt }) {
            const img = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 6px; margin: 1rem 0;">`
            this.insertHTML(img)
        },

        handlePaste(event) {
            event.preventDefault()
            const text = event.clipboardData.getData('text/plain')
            this.insertText(text)
        },

        setViewMode(mode) {
            this.viewMode = mode
            if (mode === 'edit') {
                this.$nextTick(() => {
                    this.updateEditorContent()
                })
            }
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
            return this.internalValue
        },

        // 公共方法：设置编辑器内容
        setContent(content) {
            this.internalValue = content
            this.$emit('update:modelValue', content)
            this.updateEditorContent()
        },

        // 公共方法：清空编辑器
        clear() {
            this.internalValue = ''
            this.$emit('update:modelValue', '')
            this.updateEditorContent()
        },

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
.rich-text-editor {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--card-bg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.rich-text-editor.fullscreen {
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

.toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: transparent;
    border-color: var(--border-color);
    color: var(--text-secondary);
}

.toolbar-btn:disabled:hover {
    background: transparent;
    transform: none;
    box-shadow: none;
    color: var(--text-secondary);
}

.toolbar-btn.mode-btn {
    margin-left: auto;
    /* Optional: push to right if desired, though behavior with multiple buttons with this class depends on flex */
}

.toolbar-separator {
    width: 1px;
    height: 24px;
    background: var(--border-color);
    margin: 0 0.25rem;
}

/* Mode Group Control */
.mode-group-control {
    display: flex;
    background: var(--hover-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 3px;
    margin-left: auto;
    gap: 2px;
}

.mode-group-btn {
    background: transparent;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 32px;
    height: 30px;
}

.mode-group-btn:hover {
    color: var(--text-color);
    background: rgba(128, 128, 128, 0.1);
}

.mode-group-btn.active {
    background: var(--card-bg);
    color: var(--primary-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 编辑器容器 */
.editor-container {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.editor-pane,
.preview-pane {
    width: 100%;
    background: var(--card-bg);
}

/* 编辑区 */
.editor-content {
    width: 100%;
    padding: 1.25rem;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-color);
    font-size: 0.9375rem;
    line-height: 1.8;
    overflow-y: auto;
}

.editor-content:focus {
    outline: none;
}

/* 源代码区 */
.code-pane {
    width: 100%;
}

.code-editor {
    width: 100%;
    padding: 1.25rem;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-color);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 0.9375rem;
    line-height: 1.6;
    resize: none;
    display: block;
}

/* 预览区 */
.content-preview {
    padding: 1.25rem;
    overflow-y: auto;
    line-height: 1.8;
    color: var(--text-color);
}

/* 内容样式 */
.editor-content h1,
.editor-content h2,
.editor-content h3,
.editor-content h4,
.editor-content h5,
.editor-content h6,
.content-preview h1,
.content-preview h2,
.content-preview h3,
.content-preview h4,
.content-preview h5,
.content-preview h6 {
    margin: 1.5rem 0 0.75rem 0;
    color: var(--text-color);
    font-weight: 600;
    line-height: 1.4;
}

.editor-content h1,
.content-preview h1 {
    font-size: 2rem;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
}

.editor-content h2,
.content-preview h2 {
    font-size: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.4rem;
}

.editor-content h3,
.content-preview h3 {
    font-size: 1.25rem;
}

.editor-content h4,
.content-preview h4 {
    font-size: 1.125rem;
}

.editor-content p,
.content-preview p {
    margin: 0.75rem 0;
}

.editor-content ul,
.editor-content ol,
.content-preview ul,
.content-preview ol {
    margin: 0.75rem 0;
    padding-left: 2rem;
}

.editor-content li,
.content-preview li {
    margin: 0.25rem 0;
}

.editor-content blockquote,
.content-preview blockquote {
    border-left: 4px solid var(--primary-color);
    margin: 1rem 0;
    padding: 0.5rem 0 0.5rem 1rem;
    color: var(--text-secondary);
    background: var(--hover-bg);
    border-radius: 0 4px 4px 0;
}

.editor-content pre,
.content-preview pre {
    background: #2d2d2d;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 1rem;
    margin: 1rem 0;
    overflow-x: auto;
}

.editor-content code,
.content-preview code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 0.875rem;
}

.editor-content :not(pre)>code,
.content-preview :not(pre)>code {
    background: var(--hover-bg);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    color: var(--primary-color);
    border: 1px solid var(--border-color);
}

.editor-content img,
.content-preview img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin: 1rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.editor-content a,
.content-preview a {
    color: var(--link-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
}

.editor-content a:hover,
.content-preview a:hover {
    border-bottom-color: var(--link-color);
}

.editor-content table,
.content-preview table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
}

.editor-content th,
.editor-content td,
.content-preview th,
.content-preview td {
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    text-align: left;
}

.editor-content th,
.content-preview th {
    background: var(--hover-bg);
    font-weight: 600;
}

.editor-content hr,
.content-preview hr {
    border: none;
    border-top: 2px solid var(--border-color);
    margin: 2rem 0;
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

    .editor-content,
    .content-preview {
        padding: 1rem;
        font-size: 0.875rem;
    }

    .editor-content h1,
    .content-preview h1 {
        font-size: 1.5rem;
    }

    .editor-content h2,
    .content-preview h2 {
        font-size: 1.25rem;
    }

    .editor-content h3,
    .content-preview h3 {
        font-size: 1.125rem;
    }
}

/* 自定义滚动条 */
.editor-content::-webkit-scrollbar,
.content-preview::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.editor-content::-webkit-scrollbar-track,
.content-preview::-webkit-scrollbar-track {
    background: var(--hover-bg);
}

.editor-content::-webkit-scrollbar-thumb,
.content-preview::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
}

.editor-content::-webkit-scrollbar-thumb:hover,
.content-preview::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
}
</style>
