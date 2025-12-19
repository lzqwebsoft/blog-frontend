<template>
    <div class="fullscreen-page">
        <EditHeader :useMarkdown="useMarkdown" :isDark="isDark" :submitting="submitting"
            :autoSaveStatus="autoSaveStatus" :statusLabel="statusLabel" @toggle-mode="toggleEditorMode"
            @toggle-theme="toggleTheme" @save-draft="saveAsDraft" @publish="handleSubmit" @preview="handlePreview" />

        <div class="edit-article-page">
            <!-- 消息提示区域 -->
            <div class="message-container">
                <transition name="slide-fade">
                    <div v-if="errorMessage" class="message-alert error">
                        <div class="message-icon">
                            <font-awesome-icon icon="circle-exclamation" />
                        </div>
                        <div class="message-content">
                            <template v-if="errorMessageList.length">
                                <ul class="message-list">
                                    <li v-for="(msg, idx) in errorMessageList" :key="idx">{{ msg }}</li>
                                </ul>
                            </template>
                            <template v-else>
                                {{ errorMessage }}
                            </template>
                        </div>
                        <button class="message-close" @click="errorMessage = ''">
                            <font-awesome-icon icon="xmark" />
                        </button>
                    </div>
                </transition>

                <transition name="slide-fade">
                    <div v-if="successMessage" class="message-alert success">
                        <div class="message-icon">
                            <font-awesome-icon icon="circle-check" />
                        </div>
                        <div class="message-content">{{ successMessage }}</div>
                        <button class="message-close" @click="successMessage = ''">
                            <font-awesome-icon icon="xmark" />
                        </button>
                    </div>
                </transition>
            </div>

            <!-- 主内容区域 -->
            <div class="editor-layout">
                <!-- 左侧：写作区 -->
                <div class="editor-main">
                    <!-- 一体化编辑容器 -->
                    <div class="editor-wrapper">
                        <!-- 标题输入 -->
                        <div class="title-section">
                            <input type="text" v-model="form.title" class="title-input" id="article_title"
                                placeholder="请输入文章标题..." required />
                            <input type="hidden" v-model="form.id" />
                        </div>

                        <!-- 分割线 -->
                        <div class="editor-divider"></div>

                        <!-- 编辑器区域 -->
                        <div class="editor-content-area">
                            <div v-if="!useMarkdown" class="editor-component-wrapper">
                                <RichTextEditor v-model="form.content" :height="600" />
                            </div>
                            <div v-else class="editor-component-wrapper">
                                <MarkdownEditor v-model="form.contentMD" :height="600" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧：设置区 -->
                <aside class="editor-sidebar">
                    <!-- 文章设置卡片 -->
                    <div class="settings-card">
                        <h3 class="card-title">
                            <font-awesome-icon icon="gear" />
                            文章设置
                        </h3>

                        <!-- 模式选择 -->
                        <div class="setting-item">
                            <label class="setting-label">创作模式</label>
                            <div class="select-wrapper">
                                <select v-model="form.patternTypeId" class="setting-select">
                                    <option value="-1" disabled>请选择文章类型</option>
                                    <option v-for="pattern in patterns" :key="pattern.id" :value="pattern.id">
                                        {{ pattern.name }}
                                    </option>
                                </select>
                                <font-awesome-icon icon="chevron-down" class="select-arrow" />
                            </div>
                        </div>

                        <!-- 分类 -->
                        <div class="setting-item">
                            <label class="setting-label">文章分类</label>
                            <div class="category-selector">
                                <div class="select-wrapper" v-if="!showNewType">
                                    <select v-model="form.typeId" class="setting-select">
                                        <option value="0">请选择分类</option>
                                        <option v-for="type in articleTypes" :key="type.id" :value="type.id">
                                            {{ type.name }}
                                        </option>
                                    </select>
                                    <font-awesome-icon icon="chevron-down" class="select-arrow" />
                                </div>
                                <input v-else v-model="newTypeName" type="text" class="setting-input"
                                    placeholder="请输入新的分类名称" />
                                <button type="button" class="btn-link" @click="toggleNewType">
                                    {{ showNewType ? '取消' : '+ 新建' }}
                                </button>
                            </div>
                        </div>

                        <!-- 评论设置 -->
                        <div class="setting-item"
                            style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px dashed var(--border-color);">
                            <div class="toggle-item">
                                <span class="toggle-label">允许评论</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" v-model="form.allowComment" />
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>
</template>

<script>
import RichTextEditor from '@/components/RichTextEditor.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import EditHeader from '@/components/EditHeader.vue'
import { getArticleTypes, saveArticle, getArticleDetail } from '@/api/article'
import { formatDateTime } from '@/utils/tools'

export default {
    name: 'EditArticle',
    components: {
        RichTextEditor,
        MarkdownEditor,
        EditHeader
    },
    data() {
        return {
            isEdit: false,
            useMarkdown: true,
            showNewType: false,
            submitting: false,
            errorMessage: '',
            successMessage: '',
            newTypeName: '',
            typeModel: '0',
            autoSaveTimer: null,
            lastSavedTime: null,
            autoSaveStatus: null,
            autoSaveTime: null,
            autoSaveError: '',
            isDark: false, // Theme state
            form: {
                id: '',
                title: '',
                content: '',
                contentMD: '',
                patternTypeId: 1,
                typeId: '0',
                codeTheme: 'default',
                allowComment: true,
                isTop: false,
                readedNum: 0,
                contentType: 1
            },
            patterns: [
                { id: 1, name: '原创' },
                { id: 2, name: '转载' },
                { id: 3, name: '翻译' }
            ],
            articleTypes: [],
            codeThemes: [
                { id: 'default', name: '默认主题' },
                { id: 'dark', name: '暗黑主题' },
                { id: 'github', name: 'GitHub主题' }
            ]
        }
    },
    computed: {
        errorMessageList() {
            if (!this.errorMessage) return []
            const parts = String(this.errorMessage)
                .split(':')
                .map(s => s.trim())
                .filter(s => s)
            return parts.length > 1 ? parts : []
        },
        statusLabel() {
            switch (this.autoSaveStatus) {
                case 'saving': return '保存中...'
                case 'success': return '已自动保存'
                case 'error': return '保存失败'
                default: return ''
            }
        }
    },
    watch: {
        form: {
            handler() {
                if (this.autoSaveStatus === 'success' || this.autoSaveStatus === 'error') {
                    this.autoSaveStatus = null
                }
            },
            deep: true
        }
    },
    mounted() {
        this.initializeTheme()
        this.initializePage()
    },

    beforeUnmount() {
        // 清理自动保存定时器
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer)
        }
    },
    methods: {
        formatDateTime,
        buildSaveParams(publish = false, silent = false) {
            const params = new URLSearchParams()
            if (this.form.id) params.append('id', String(this.form.id))
            params.append('title', this.form.title)
            const ct = Number(this.form.contentType)
            params.append('contentType', String(ct))
            if (ct === 1) {
                params.append('contentMD', this.form.contentMD)
            } else {
                params.append('content', this.form.content)
            }
            params.append('allowComment', this.form.allowComment ? 'true' : 'false')
            params.append('patternTypeId', String(this.form.patternTypeId))
            if (this.form.codeTheme) params.append('codeTheme', this.form.codeTheme)
            const typeModel = this.showNewType ? 1 : 0
            params.append('type_model', String(typeModel))
            if (typeModel === 0) {
                params.append('typeID', String(this.form.typeId))
            } else {
                params.append('new_type', this.newTypeName.trim())
            }
            if (publish) params.append('publish', '1')
            if (silent) params.append('autoSave', 'true')
            return params
        },

        async performSave({ publish = false, silent = false } = {}) {
            const params = this.buildSaveParams(publish, silent)
            const res = await saveArticle(params)
            const returnedId = res && res.data !== undefined ? res.data : this.form.id
            if (returnedId) this.form.id = returnedId

            if (publish) {
                this.successMessage = this.isEdit ? '文章更新成功！' : '文章发表成功！'
                const targetId = returnedId || this.form.id
                setTimeout(() => {
                    if (targetId) {
                        this.$router.push(`/show/${targetId}`)
                    } else {
                        this.$router.push('/')
                    }
                }, 1000)
            } else {
                if (silent) {
                    this.autoSaveStatus = 'success'
                    this.autoSaveTime = new Date()
                    this.autoSaveError = ''
                } else {
                    this.successMessage = '草稿保存成功！'
                }
            }
        },
        async loadArticleTypes() {
            try {
                const res = await getArticleTypes()
                this.articleTypes = (res.data || []).map((item) => ({ id: String(item.id), name: item.name }))
            } catch (error) {
                console.error('加载文章分类失败:', error)
                this.errorMessage = '加载文章分类失败'
            }
        },
        initializePage() {
            // 加载文章分类
            this.loadArticleTypes()

            // 判断是编辑还是新建
            const articleId = this.$route.params.id
            this.isEdit = !!articleId

            if (this.isEdit) {
                // 如果是编辑模式，加载文章数据
                this.loadArticleData(articleId)
            }

            // 启动自动保存
            this.startAutoSave()
        },

        async loadArticleData(articleId) {
            try {
                const res = await getArticleDetail(articleId)
                const art = res.data && res.data.article ? res.data.article : null
                if (!art) return
                this.form.id = String(art.id || articleId)
                this.form.title = art.title || ''
                const ct = (art.content_type ?? art.contentType ?? (art.contentMD ? 1 : 0))
                this.form.contentType = Number(ct)
                this.useMarkdown = this.form.contentType === 1
                this.form.contentMD = art.content_md ?? art.contentMD ?? ''
                this.form.content = art.content ?? ''
                this.form.patternTypeId = Number(art.pattern_type_id ?? art.patternTypeId ?? 1)
                this.form.typeId = String((art.type && art.type.id) ? art.type.id : '0')

                // 动态设置页面标题
                if (this.form.title) {
                    document.title = `${this.form.title} - 飘痕の博客`;
                }
            } catch (error) {
                console.error('加载文章失败:', error)
                this.errorMessage = '加载文章失败'
            }
        },

        startAutoSave() {
            // 每30秒自动保存一次
            this.autoSaveTimer = setInterval(() => {
                this.autoSaveDraft()
            }, 30000)
        },

        async autoSaveDraft() {
            const hasTitle = this.form.title.trim()
            const hasContent = this.form.contentType === 1
                ? this.form.contentMD.trim()
                : this.form.content.trim()
            if (!hasTitle && !hasContent) return

            this.autoSaveStatus = 'saving'
            try {
                await this.performSave({ publish: false, silent: true })
            } catch (error) {
                console.error('自动保存失败:', error)
                this.autoSaveTime = new Date()
                this.autoSaveStatus = 'error'
                this.autoSaveError = error && error.message ? error.message : '请检查网络连接'
            }
        },

        toggleEditorMode() {
            this.useMarkdown = !this.useMarkdown
            this.form.contentType = this.useMarkdown ? 1 : 0
        },

        toggleNewType() {
            this.showNewType = !this.showNewType
            if (this.showNewType) {
                this.form.typeId = '0'
                this.newTypeName = ''
            }
        },

        validateForm() {
            this.errorMessage = ''

            // 验证标题
            if (!this.form.title.trim()) {
                this.errorMessage = '请输入文章标题'
                return false
            }

            if (this.form.title.trim().length < 2) {
                this.errorMessage = '文章标题至少需要2个字符'
                return false
            }

            if (this.form.title.trim().length > 200) {
                this.errorMessage = '文章标题不能超过200个字符'
                return false
            }

            // 验证内容
            if (this.form.contentType === 1) {
                if (!this.form.contentMD.trim()) {
                    this.errorMessage = '请输入文章内容'
                    return false
                }

                if (this.form.contentMD.trim().length < 10) {
                    this.errorMessage = '文章内容至少需要10个字符'
                    return false
                }
            } else {
                if (!this.form.content.trim()) {
                    this.errorMessage = '请输入文章内容'
                    return false
                }

                if (this.form.content.trim().length < 10) {
                    this.errorMessage = '文章内容至少需要10个字符'
                    return false
                }
            }

            // 验证文章模式
            if (this.form.patternTypeId <= 0 || this.form.patternTypeId > 3) {
                this.errorMessage = '请选择文章模式'
                return false
            }

            // 验证分类
            if (this.showNewType) {
                if (!this.newTypeName.trim()) {
                    this.errorMessage = '请输入新的分类名称'
                    return false
                }
                if (this.newTypeName.trim().length < 2) {
                    this.errorMessage = '分类名称至少需要2个字符'
                    return false
                }
                if (this.newTypeName.trim().length > 50) {
                    this.errorMessage = '分类名称不能超过50个字符'
                    return false
                }
            } else {
                if (this.form.typeId === '0') {
                    this.errorMessage = '请选择文章分类'
                    return false
                }
            }

            return true
        },

        async handleSubmit() {
            if (!this.validateForm()) {
                return
            }
            this.submitting = true
            this.errorMessage = ''
            try {
                await this.performSave({ publish: true, silent: false })
            } catch (error) {
                this.errorMessage = error.message ?? '提交失败，请稍后重试'
            } finally {
                this.submitting = false
            }
        },

        async saveAsDraft() {
            if (!this.validateForm()) {
                return
            }
            this.submitting = true
            this.errorMessage = ''
            try {
                await this.performSave({ publish: false, silent: false })
            } catch (error) {
                console.error('保存草稿失败:', error)
                this.errorMessage = error.message ?? '保存草稿失败，请稍后重试'
            } finally {
                this.submitting = false
            }
        },
        // Theme methods
        toggleTheme() {
            this.isDark = !this.isDark
            this.applyTheme()
            localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
        },
        initializeTheme() {
            const savedTheme = localStorage.getItem('theme')
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            this.isDark = savedTheme ? savedTheme === 'dark' : prefersDark
            this.applyTheme()
        },
        applyTheme() {
            if (this.isDark) {
                document.documentElement.classList.add('dark-theme')
            } else {
                document.documentElement.classList.remove('dark-theme')
            }
        },
        handlePreview() {
            this.successMessage = '预览功能开发中...';
            setTimeout(() => {
                this.successMessage = '';
            }, 2000);
        }
    }
}
</script>

<style scoped>
.edit-article-page {
    max-width: 1440px;
    margin: 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 64px);
    margin-top: 64px;
}

/* 布局结构 - Flexbox */
.editor-layout {
    display: flex;
    gap: 2.5rem;
    align-items: flex-start;
}

.editor-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.editor-sidebar {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 2rem;
}

/* 头部样式 */
.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
}

.header-title {
    display: flex;
    align-items: baseline;
    gap: 1rem;
}

.header-title h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
    line-height: 1.2;
}

.header-divider {
    color: var(--text-secondary);
    font-size: 1.25rem;
    font-weight: 300;
}

.btn-mode-switch {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-mode-switch:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

/* 自动保存状态 */
.auto-save-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.save-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--text-secondary);
}

.auto-save-indicator.saving .save-dot {
    background-color: var(--primary-color);
    animation: pulse 1.5s infinite;
}

.auto-save-indicator.success .save-dot {
    background-color: #10b981;
}

.auto-save-indicator.error .save-dot {
    background-color: #ef4444;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.5);
        opacity: 0.5;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* 一体化编辑器容器 */
.editor-wrapper {
    background: var(--card-bg);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* 标题输入区 */
.title-section {
    padding: 1.5rem 2rem 1rem;
}

.title-input {
    width: 100%;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.3;
    color: var(--text-color);
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
}

.title-input::placeholder {
    color: var(--text-secondary);
    opacity: 0.4;
    font-weight: 400;
}

/* 分割线 */
.editor-divider {
    height: 1px;
    background: var(--border-color);
    margin: 0 2rem;
    opacity: 0.6;
}

/* 编辑器组件区域 */
.editor-content-area {
    flex: 1;
    min-height: 500px;
    display: flex;
    flex-direction: column;
}

.editor-component-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* 覆盖子组件样式以实现一体化 */
:deep(.markdown-editor),
:deep(.rich-text-editor) {
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
    flex: 1;
}

:deep(.editor-toolbar) {
    border-bottom: 1px solid var(--border-color);
    background: transparent !important;
    padding: 0.75rem 2rem !important;
}

:deep(.markdown-textarea),
:deep(.markdown-preview),
:deep(.editor-content),
:deep(.content-preview) {
    padding: 1.5rem 2rem !important;
}

:deep(.editor-pane),
:deep(.preview-pane) {
    background: transparent !important;
}

/* 修复全屏模式下的样式 */
:deep(.markdown-editor.fullscreen),
:deep(.rich-text-editor.fullscreen) {
    background: var(--card-bg) !important;
    border-radius: 0 !important;
}

:deep(.markdown-editor.fullscreen .editor-toolbar),
:deep(.rich-text-editor.fullscreen .editor-toolbar) {
    background: var(--bg-secondary) !important;
    padding: 0.75rem !important;
}

:deep(.markdown-editor.fullscreen .editor-pane),
:deep(.markdown-editor.fullscreen .preview-pane),
:deep(.rich-text-editor.fullscreen .editor-pane),
:deep(.rich-text-editor.fullscreen .preview-pane) {
    background: var(--card-bg) !important;
}


/* 侧边栏卡片 */
.settings-card {
    background: var(--card-bg);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 0 0 1.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

/* 设置项通用 */
.setting-item {
    margin-bottom: 1.25rem;
}

.setting-item:last-child {
    margin-bottom: 0;
}

.setting-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}

/* 下拉框和输入框美化 */
.select-wrapper {
    position: relative;
}

.setting-select,
.setting-input {
    width: 100%;
    padding: 0.6rem 0.75rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-color);
    font-size: 0.9rem;
    appearance: none;
    outline: none;
    transition: all 0.2s;
}

.setting-select:focus,
.setting-input:focus {
    border-color: var(--primary-color);
    background: var(--card-bg);
}

.select-arrow {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    pointer-events: none;
    font-size: 0.8rem;
}

.category-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.btn-link {
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 0.85rem;
    cursor: pointer;
    text-align: right;
    padding: 0;
}

.btn-link:hover {
    text-decoration: underline;
}

/* Toggle Switch */
.toggle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.toggle-label {
    font-size: 0.9rem;
    color: var(--text-color);
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    transition: .4s;
    border-radius: 24px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked+.toggle-slider {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
}

input:checked+.toggle-slider:before {
    transform: translateX(20px);
}

/* 发布区域 */
.publish-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
}

.btn-publish,
.btn-draft {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.btn-publish {
    background: var(--primary-color);
    color: white;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-publish:hover:not(:disabled) {
    background: var(--primary-hover, #2563eb);
    transform: translateY(-1px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.btn-draft {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.btn-draft:hover:not(:disabled) {
    background: var(--bg-secondary);
    color: var(--text-color);
}

.btn-publish:disabled,
.btn-draft:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

/* 消息提示 (保留部分原有逻辑) */
.message-container {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: auto;
    min-width: 300px;
    max-width: 90%;
}

.message-alert {
    padding: 1rem 1.5rem;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 500;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}

.message-close {
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.2s;
    padding: 0.25rem;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 4px;
}

.message-close:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.05);
}

/* 错误消息 - 红色 */
.message-alert.error {
    background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
    border-left: 4px solid #ef4444;
    color: #dc2626;
}

.message-alert.error .message-icon {
    color: #ef4444;
}

.message-alert.error .message-close {
    color: #dc2626;
}

/* 成功消息 - 绿色 */
.message-alert.success {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-left: 4px solid #22c55e;
    color: #16a34a;
}

.message-alert.success .message-icon {
    color: #22c55e;
}

.message-alert.success .message-close {
    color: #16a34a;
}

/* 响应式布局 */
@media (max-width: 1024px) {
    .editor-layout {
        flex-direction: column;
    }

    .editor-sidebar {
        width: 100%;
        position: static;
        order: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
    }
}

@media (max-width: 768px) {
    .edit-article-page {
        padding: 1rem;
    }

    .editor-sidebar {
        grid-template-columns: 1fr;
    }

    .title-input {
        font-size: 1.5rem;
    }

    .title-section {
        padding: 1.25rem 1.5rem 0.75rem;
    }

    .editor-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .header-actions {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }

    :deep(.editor-toolbar) {
        padding: 0.75rem 1rem !important;
    }

    :deep(.markdown-textarea),
    :deep(.markdown-preview),
    :deep(.editor-content),
    :deep(.content-preview) {
        padding: 1rem 1rem !important;
    }
}
</style>
