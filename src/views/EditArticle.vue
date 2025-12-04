<template>
    <div class="edit-article-page container">
        <div class="blog-header">
            <h2>
                {{ isEdit ? '编辑博客' : '撰写博客' }}
                <small class="change-to">
                    <button type="button" class="btn-convert" @click="toggleEditorMode">
                        {{ useMarkdown ? '切换至富文本' : '切换至Markdown' }}
                    </button>
                </small>
            </h2>
        </div>

        <!-- 消息提示区域 -->
        <div class="message-container">
            <transition name="slide-fade">
                <div v-if="errorMessage" class="message-alert error">
                    <div class="message-icon">
                        <font-awesome-icon icon="circle-exclamation" />
                    </div>
                    <div class="message-content">{{ errorMessage }}</div>
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

            <transition name="slide-fade">
                <div v-if="lastSavedTime" class="message-alert info">
                    <div class="message-icon">
                        <font-awesome-icon icon="floppy-disk" />
                    </div>
                    <div class="message-content">最后保存: {{ formatTime(lastSavedTime) }}</div>
                </div>
            </transition>
        </div>

        <form @submit.prevent="handleSubmit" class="article-form">
            <div class="form-group">
                <label for="article_title">标题</label>
                <div class="input-group">
                    <select v-model="form.patternTypeId" class="form-control pattern-select">
                        <option value="-1">类型</option>
                        <option v-for="pattern in patterns" :key="pattern.id" :value="pattern.id">
                            {{ pattern.name }}
                        </option>
                    </select>
                    <input type="text" v-model="form.title" class="form-control title-input" id="article_title"
                        placeholder="请输入文章标题" required />
                </div>
                <input type="hidden" v-model="form.id" />
            </div>

            <div class="form-group">
                <label for="article_content">博客内容</label>
                <!-- 富文本编辑器 -->
                <div v-if="!useMarkdown" class="rich-text-editor-wrapper">
                    <RichTextEditor v-model="form.content" :height="500" />
                </div>
                <!-- Markdown编辑器 -->
                <div v-else class="markdown-editor-wrapper">
                    <MarkdownEditor v-model="form.contentMD" :height="500" />
                </div>
            </div>

            <div class="form-group">
                <label for="article_type">文章类别</label>
                <div class="type-selector-group">
                    <select v-if="!showNewType" v-model="form.typeId" id="type" class="form-control custom-select">
                        <option value="0">请选择分类</option>
                        <option v-for="type in articleTypes" :key="type.id" :value="type.id">
                            {{ type.name }}
                        </option>
                    </select>
                    <input v-else v-model="newTypeName" type="text" class="form-control" placeholder="请输入新的分类名称" />

                    <button type="button" class="btn-text" @click="toggleNewType">
                        {{ showNewType ? '取消新建' : '新建分类' }}
                    </button>
                </div>
            </div>

            <div class="form-group" style="display:none;">
                <label for="codeTheme">代码主题</label>
                <div class="input-group">
                    <select v-model="form.codeTheme" class="form-control custom-select">
                        <option v-for="theme in codeThemes" :key="theme.id" :value="theme.id">
                            {{ theme.name }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>评论设置</label>
                <div class="card-button-group">
                    <label class="card-btn" :class="{ active: form.allowComment === true }">
                        <input type="radio" v-model="form.allowComment" :value="true" />
                        <span class="btn-text">允许评论</span>
                        <div class="active-icon" v-if="form.allowComment === true">
                            <i class="icon-check"></i>
                        </div>
                    </label>
                    <label class="card-btn" :class="{ active: form.allowComment === false }">
                        <input type="radio" v-model="form.allowComment" :value="false" />
                        <span class="btn-text">禁止评论</span>
                        <div class="active-icon" v-if="form.allowComment === false">
                            <i class="icon-check"></i>
                        </div>
                    </label>
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" name="publish" value="1" class="btn btn-primary" :disabled="submitting">
                    {{ submitting ? '提交中...' : '发表' }}
                </button>
                <button type="button" name="save" value="1" class="btn btn-default" @click="saveAsDraft"
                    :disabled="submitting">
                    {{ submitting ? '保存中...' : '保存为草稿' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import RichTextEditor from '@/components/RichTextEditor.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import { getArticleTypes, saveArticle, getArticleDetail } from '@/api/article'

export default {
    name: 'EditArticle',
    components: {
        RichTextEditor,
        MarkdownEditor
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
    mounted() {
        this.loadArticleTypes()
        this.initializePage()
    },

    beforeUnmount() {
        // 清理自动保存定时器
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer)
        }
    },
    methods: {
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
            // 判断是编辑还是新建
            const articleId = this.$route.params.id
            this.isEdit = !!articleId

            if (this.isEdit) {
                // 如果是编辑模式，加载文章数据
                this.loadArticleData(articleId)
            } else {
                // 如果是新建模式，尝试加载草稿
                this.loadDraft()
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
            } catch (error) {
                console.error('加载文章失败:', error)
                this.errorMessage = '加载文章失败'
            }
        },

        loadDraft() {
            // 从localStorage加载草稿
            try {
                const draft = localStorage.getItem('article_draft')
                if (draft) {
                    const draftData = JSON.parse(draft)
                    this.form.title = draftData.title || ''
                    this.form.content = draftData.content || ''
                    this.form.contentMD = draftData.contentMD || ''
                    this.form.patternTypeId = draftData.patternTypeId || 1
                    this.form.typeId = draftData.typeId || '0'
                    this.lastSavedTime = draftData.savedAt || null
                    console.log('已加载草稿')
                }
            } catch (error) {
                console.error('加载草稿失败:', error)
            }
        },

        startAutoSave() {
            // 每30秒自动保存一次
            this.autoSaveTimer = setInterval(() => {
                this.autoSaveDraft()
            }, 30000)
        },

        autoSaveDraft() {
            // 只有有内容时才保存
            if (this.form.title.trim() || this.form.content.trim()) {
                const draftData = {
                    title: this.form.title,
                    content: this.form.content,
                    contentMD: this.form.contentMD,
                    patternTypeId: this.form.patternTypeId,
                    typeId: this.form.typeId,
                    savedAt: new Date().toISOString()
                }

                try {
                    localStorage.setItem('article_draft', JSON.stringify(draftData))
                    this.lastSavedTime = draftData.savedAt
                    console.log('自动保存草稿成功')
                } catch (error) {
                    console.error('自动保存草稿失败:', error)
                }
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
            if (this.form.patternTypeId === '0') {
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
                params.append('publish', '1')
                const res = await saveArticle(params)
                const newId = res.data ? res.data : this.form.id
                this.successMessage = this.isEdit ? '文章更新成功！' : '文章发表成功！'
                setTimeout(() => {
                    if (newId) {
                        this.$router.push(`/show/${newId}`)
                    } else {
                        this.$router.push('/')
                    }
                }, 1000)
            } catch (error) {
                console.error('提交文章失败:', error)
                this.errorMessage = '提交失败，请稍后重试'
            } finally {
                this.submitting = false
            }
        },

        async saveAsDraft() {
            if (!this.form.title.trim() && !this.form.content.trim() && !this.form.contentMD.trim()) {
                this.errorMessage = '请输入标题或内容以保存草稿'
                return
            }
            this.submitting = true
            this.errorMessage = ''
            try {
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
                const res = await saveArticle(params)
                const id = res.data && res.data.id ? String(res.data.id) : ''
                if (id) this.form.id = id
                this.successMessage = '草稿保存成功！'
            } catch (error) {
                console.error('保存草稿失败:', error)
                this.errorMessage = '保存草稿失败，请稍后重试'
            } finally {
                this.submitting = false
            }
        }
    }
}
</script>

<style scoped>
.edit-article-page {
    min-height: calc(100vh - 120px);
    padding: 2rem 0;
    max-width: 1200px;
    margin: 0 auto;
}

/* 消息提示样式 */
.message-container {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.message-alert {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1rem 1.25rem;
    border-radius: 10px;
    font-size: 0.95rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    animation: slideIn 0.3s ease-out;
    backdrop-filter: blur(10px);
}

.message-icon {
    font-size: 1.35rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.message-content {
    flex: 1;
    font-weight: 500;
    line-height: 1.5;
    word-break: break-word;
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

/* 信息消息 - 蓝色 */
.message-alert.info {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-left: 4px solid #3b82f6;
    color: #1d4ed8;
}

.message-alert.info .message-icon {
    color: #3b82f6;
}

/* 暗黑模式适配 */
:root.dark-theme .message-alert.error {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%);
    border-left: 4px solid #f87171;
    color: #fca5a5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:root.dark-theme .message-alert.error .message-icon {
    color: #f87171;
}

:root.dark-theme .message-alert.error .message-close {
    color: #fca5a5;
}

:root.dark-theme .message-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

:root.dark-theme .message-alert.success {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%);
    border-left: 4px solid #4ade80;
    color: #86efac;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:root.dark-theme .message-alert.success .message-icon {
    color: #4ade80;
}

:root.dark-theme .message-alert.success .message-close {
    color: #86efac;
}

:root.dark-theme .message-alert.info {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.1) 100%);
    border-left: 4px solid #60a5fa;
    color: #93c5fd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:root.dark-theme .message-alert.info .message-icon {
    color: #60a5fa;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .message-container {
        margin-bottom: 1rem;
        gap: 0.5rem;
    }

    .message-alert {
        padding: 0.875rem 1rem;
        font-size: 0.875rem;
        gap: 0.75rem;
        border-radius: 8px;
    }

    .message-icon {
        font-size: 1.15rem;
    }

    .message-content {
        font-size: 0.875rem;
        line-height: 1.4;
    }

    .message-close {
        font-size: 1rem;
        width: 20px;
        height: 20px;
    }
}

@media (max-width: 480px) {
    .message-alert {
        padding: 0.75rem 0.875rem;
        font-size: 0.8125rem;
        gap: 0.625rem;
    }

    .message-icon {
        font-size: 1rem;
    }

    .message-content {
        font-size: 0.8125rem;
    }
}

/* 动画效果 */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
    transform: translateY(-10px);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateY(-5px);
    opacity: 0;
}

@keyframes slideIn {
    from {
        transform: translateY(-10px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.blog-header {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.blog-header h2 {
    color: var(--text-color);
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-convert {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-convert:hover {
    background: var(--primary-color);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.2);
}

.article-form {
    background: var(--card-bg);
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border-color);
}

.form-group {
    margin-bottom: 2rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: var(--text-color);
    font-size: 1rem;
}

.input-group {
    display: flex;
    gap: 1rem;
}

.pattern-select {
    width: 120px !important;
    flex-shrink: 0;
}

.title-input {
    flex-grow: 1;
}

.custom-select {
    width: 200px;
}

.form-control {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-color);
    color: var(--text-color);
    font-size: 1rem;
    transition: all 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
    background-color: var(--card-bg);
}

.type-selector-group {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.btn-text {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    font-size: 0.9rem;
    white-space: nowrap;
    padding: 0.5rem;
}

.btn-text:hover {
    text-decoration: underline;
}

/* Card Button Styles */
.card-button-group {
    display: flex;
    gap: 1rem;
    width: 100%;
}

.card-btn {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 1.5rem;
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: var(--bg-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    user-select: none;
    text-align: center;
    overflow: hidden;
}

.card-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-btn.active {
    background-color: rgba(var(--primary-rgb), 0.05);
    border-color: var(--primary-color);
    color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.15);
}

.card-btn input {
    display: none;
}

.card-btn .btn-text {
    font-size: 1rem;
    font-weight: 600;
    z-index: 1;
}

.card-btn.active .btn-text {
    color: var(--primary-color);
}

.active-icon {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 24px;
    height: 24px;
    background: var(--primary-color);
    border-radius: 10px 0 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
}

.active-icon::before {
    content: '✓';
    font-weight: bold;
}

@media (max-width: 480px) {
    .card-button-group {
        gap: 0.75rem;
    }

    .card-btn {
        width: 100%;
        padding: 0.875rem;
    }
}

/* Form Actions */
.form-actions {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 1.5rem;
    justify-content: flex-end;
}

.btn {
    padding: 0.875rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    border: none;
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.35);
}

.btn-default {
    background: transparent;
    border: 1px solid var(--border-color);
}

.btn-default:hover:not(:disabled) {
    background: var(--bg-color);
    border-color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
    .edit-article-page {
        padding: 1rem;
    }

    .article-form {
        padding: 1.5rem;
    }

    .type-selector-group {
        flex-direction: column;
        align-items: flex-start;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>
