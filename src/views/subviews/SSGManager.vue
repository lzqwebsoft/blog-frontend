<template>
    <div class="ssg-manager">
        <div class="panel-header">
            <h2 class="panel-title">
                <font-awesome-icon :icon="['fas', 'server']" class="title-icon" />
                SSG 静态页面管理
            </h2>
            <div class="header-actions">
                <button class="btn-refresh" @click="refreshAll" :disabled="loading">
                    <font-awesome-icon :icon="loading ? ['fas', 'spinner'] : ['fas', 'arrows-rotate']"
                        :spin="loading" />
                    {{ loading ? '同步中...' : '刷新状态' }}
                </button>
            </div>
        </div>

        <!-- Major Pages Status -->
        <div class="status-overview">
            <div class="overview-card home">
                <div class="card-body">
                    <div class="card-info">
                        <div class="icon-box">
                            <font-awesome-icon :icon="['fas', 'house']" />
                        </div>
                        <div class="text-group">
                            <h3>首页静态缓存</h3>
                            <div class="status-indicator" :class="{ active: ssgStatus.homeCached }">
                                <span class="dot"></span>
                                {{ ssgStatus.homeCached ? '状态正常' : '未生成' }}
                            </div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="action-btn view" @click="handleView('home')" :disabled="!ssgStatus.homeCached">
                            <font-awesome-icon :icon="['fas', 'eye']" />
                            查看
                        </button>
                        <button class="action-btn delete" @click="handleRegenerate('home')"
                            :disabled="regenerating.home">
                            <font-awesome-icon :icon="regenerating.home ? ['fas', 'spinner'] : ['fas', 'trash-can']"
                                :spin="regenerating.home" />
                            清理缓存
                        </button>
                    </div>
                </div>
            </div>

            <div class="overview-card about">
                <div class="card-body">
                    <div class="card-info">
                        <div class="icon-box">
                            <font-awesome-icon :icon="['fas', 'circle-info']" />
                        </div>
                        <div class="text-group">
                            <h3>关于页静态缓存</h3>
                            <div class="status-indicator" :class="{ active: ssgStatus.aboutCached }">
                                <span class="dot"></span>
                                {{ ssgStatus.aboutCached ? '状态正常' : '未生成' }}
                            </div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="action-btn view" @click="handleView('about')" :disabled="!ssgStatus.aboutCached">
                            <font-awesome-icon :icon="['fas', 'eye']" />
                            查看
                        </button>
                        <button class="action-btn delete" @click="handleRegenerate('about')"
                            :disabled="regenerating.about">
                            <font-awesome-icon :icon="regenerating.about ? ['fas', 'spinner'] : ['fas', 'trash-can']"
                                :spin="regenerating.about" />
                            清理缓存
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Article Cache List -->
        <div class="article-section">
            <div class="section-header">
                <div class="header-left">
                    <h3 class="section-title">文章缓存列表</h3>
                    <span class="count-badge">{{ ssgStatus.articleCount || 0 }}</span>
                </div>
                <div class="header-right">
                    <div class="search-box">
                        <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="search-icon" />
                        <input v-model="searchQuery" type="text" placeholder="搜索文件或路径..." />
                    </div>
                </div>
            </div>

            <div class="table-container">
                <table class="ssg-table">
                    <thead>
                        <tr>
                            <th>文件名 / 文章ID</th>
                            <th>存储路径</th>
                            <th class="actions-col">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filteredList.length === 0">
                            <td colspan="3" class="empty-state">
                                <div class="empty-content">
                                    <font-awesome-icon :icon="['fas', 'folder-open']" />
                                    <p>{{ searchQuery ? '未找到匹配的缓存' : '暂无文章缓存' }}</p>
                                </div>
                            </td>
                        </tr>
                        <tr v-for="item in filteredList" :key="item.identifier">
                            <td>
                                <div class="article-id-cell">
                                    <font-awesome-icon :icon="['fas', 'file-lines']" class="type-icon" />
                                    <span class="id-text">{{ item.identifier }}</span>
                                </div>
                            </td>
                            <td class="path-cell"><code>{{ item.path }}</code></td>
                            <td class="actions-col">
                                <div class="table-actions">
                                    <button class="btn-icon view" title="查看内容"
                                        @click="handleView('article', item.identifier)">
                                        <font-awesome-icon :icon="['fas', 'eye']" />
                                    </button>
                                    <button class="btn-icon delete" title="删除"
                                        @click="handleRegenerate('article', item.identifier)"
                                        :disabled="isProcessing(item.identifier)">
                                        <font-awesome-icon
                                            :icon="isProcessing(item.identifier) ? ['fas', 'spinner'] : ['fas', 'trash-can']"
                                            :spin="isProcessing(item.identifier)" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Preview Modal -->
        <transition name="fade">
            <div v-if="preview.show" class="preview-overlay" @click.self="preview.show = false">
                <div class="preview-modal">
                    <div class="preview-header">
                        <h3>缓存预览: {{ preview.title }}</h3>
                        <button class="close-btn" @click="preview.show = false">
                            <font-awesome-icon :icon="['fas', 'xmark']" />
                        </button>
                    </div>
                    <div class="preview-content">
                        <iframe v-if="preview.html" :srcdoc="preview.html" class="preview-iframe"></iframe>
                        <div v-else class="preview-loading">
                            <font-awesome-icon :icon="['fas', 'spinner']" spin />
                            <span>载入中...</span>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Toast Notification -->
        <transition name="toast">
            <div v-if="toast.show" class="toast" :class="toast.type" @click="toast.show = false">
                <font-awesome-icon
                    :icon="toast.type === 'success' ? ['fas', 'circle-check'] : ['fas', 'circle-exclamation']"
                    class="toast-icon" />
                <span>{{ toast.message }}</span>
            </div>
        </transition>
    </div>
</template>

<script>
import { getSSGStatus, regenerateSSG, listSSGCache, validateSSG } from '@/api/common'

export default {
    name: 'SSGManager',
    data() {
        return {
            ssgStatus: {
                cacheDir: '',
                homeCached: false,
                aboutCached: false,
                articleCount: 0,
            },
            cacheList: [],
            searchQuery: '',
            loading: false,
            regenerating: {
                home: false,
                about: false,
            },
            processingIds: new Set(),
            toast: {
                show: false,
                message: '',
                type: 'success',
            },
            preview: {
                show: false,
                title: '',
                html: null
            }
        }
    },
    computed: {
        filteredList() {
            if (!this.searchQuery) return this.cacheList
            const q = this.searchQuery.toLowerCase()
            return this.cacheList.filter(item =>
                item.identifier.toLowerCase().includes(q) ||
                item.path.toLowerCase().includes(q)
            )
        }
    },
    mounted() {
        this.refreshAll()
    },
    methods: {
        async refreshAll() {
            this.loading = true
            try {
                await Promise.all([this.loadSSGStatus(), this.loadCacheList()])
            } finally {
                this.loading = false
            }
        },
        async loadSSGStatus() {
            try {
                const res = await getSSGStatus()
                if (res.code === 0) {
                    this.ssgStatus = res.data
                }
            } catch {
                this.showToast('获取状态失败', 'error')
            }
        },
        async loadCacheList() {
            try {
                const res = await listSSGCache()
                if (res.code === 0) {
                    this.cacheList = (res.data || []).filter(item => item.type === 'article')
                }
            } catch {
                console.error('获取缓存列表失败')
            }
        },
        async handleRegenerate(type, id = '') {
            if (type === 'home') this.regenerating.home = true
            else if (type === 'about') this.regenerating.about = true
            else if (id) this.processingIds.add(id)

            try {
                const res = await regenerateSSG(type, id)
                if (res.code === 0) {
                    this.showToast(`${type === 'article' ? '文章' : '页面'}缓存已失效`, 'success')
                    await this.refreshAll()
                } else {
                    this.showToast(res.message || '操作失败', 'error')
                }
            } catch {
                this.showToast('操作失败', 'error')
            } finally {
                if (type === 'home') this.regenerating.home = false
                else if (type === 'about') this.regenerating.about = false
                else if (id) this.processingIds.delete(id)
            }
        },
        async handleView(type, id = '') {
            this.preview.title = type === 'article' ? `文章 ${id}` : type === 'home' ? '首页' : '关于页'
            this.preview.html = null
            this.preview.show = true

            try {
                const res = await validateSSG(type, id)
                let html = typeof res === 'string' ? res : (res.data || '')

                // 探测当前是否处于黑暗模式
                const isDark = document.documentElement.classList.contains('dark-theme')
                if (isDark) {
                    // 为 iframe 内容注入黑暗模式样式
                    const darkStyle = `
                    <style>
                        :root { color-scheme: dark; }
                        body {
                            background-color: #171717 !important;
                            color: #FFFFFF !important;
                            font-family: -apple-system, "Microsoft Yahei", "微软雅黑", sans-serif;
                        }
                        a { color: #66b3ff !important; }
                        pre, code { background: #262626 !important; border: 1px solid #404040; border-radius: 4px; padding: 2px 4px; }
                        blockquote { border-left: 4px solid #404040 !important; color: #adb5bd !important; padding-left: 1rem; margin: 1rem 0; }
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #404040 !important; padding: 8px; }
                        img { max-width: 100%; height: auto; border-radius: 8px; }
                    </style>
                    `
                    if (html.includes('</head>')) {
                        html = html.replace('</head>', darkStyle + '</head>')
                    } else {
                        html = darkStyle + html
                    }
                }

                this.preview.html = html
            } catch (err) {
                console.error('预览加载失败:', err)
                this.showToast('预览加载失败', 'error')
                this.preview.show = false
            }
        },
        isProcessing(id) {
            return this.processingIds.has(id)
        },
        showToast(message, type = 'success') {
            this.toast = {
                show: true,
                message,
                type,
            }
            setTimeout(() => {
                this.toast.show = false
            }, 3000)
        }
    },
}
</script>

<style scoped>
.ssg-manager {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
}

/* Panel Header */
.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.panel-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.title-icon {
    color: var(--primary-color);
}

.btn-refresh {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-refresh:hover:not(:disabled) {
    background: var(--hover-bg);
    border-color: var(--text-secondary);
}

/* Status Overview Cards */
.status-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
}

.overview-card {
    padding: 1.5rem;
    border-radius: 1rem;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    transition: transform 0.2s, box-shadow 0.2s;
}

.overview-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.icon-box {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: var(--bg-color);
    color: var(--primary-color);
}

.text-group h3 {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
}

.status-indicator .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #cbd5e1;
}

.status-indicator.active {
    color: #10b981;
}

.status-indicator.active .dot {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.card-actions {
    display: flex;
    gap: 0.75rem;
}

.action-btn {
    flex: 1;
    padding: 0.625rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.8125rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.action-btn.view {
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    color: var(--text-color);
}

.action-btn.view:hover:not(:disabled) {
    background: var(--hover-bg);
}

.action-btn.delete {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #ef4444;
}

.action-btn.delete:hover:not(:disabled) {
    background: #fecaca;
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Article Section */
.article-section {
    background: var(--card-bg);
    border-radius: 1rem;
    border: 1px solid var(--border-color);
    padding: 1.5rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.section-title {
    font-size: 1.125rem;
    font-weight: 700;
}

.count-badge {
    background: var(--hover-bg);
    color: var(--text-secondary);
    padding: 0.125rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
}

.search-box {
    position: relative;
    width: 240px;
}

.search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-size: 0.8125rem;
}

.search-box input {
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 2.25rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
    background: var(--bg-color);
    font-size: 0.8125rem;
    outline: none;
    transition: border-color 0.2s;
}

.search-box input:focus {
    border-color: var(--primary-color);
}

/* SSG Table */
.table-container {
    overflow-x: auto;
}

.ssg-table {
    width: 100%;
    border-collapse: collapse;
}

.ssg-table th {
    padding: 0.75rem 1rem;
    background: var(--bg-color);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.ssg-table td {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.875rem;
}

.article-id-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.type-icon {
    color: #10b981;
    font-size: 0.8125rem;
}

.id-text {
    font-weight: 600;
}

.path-cell code {
    background: var(--bg-color);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.actions-col {
    text-align: right;
}

.table-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

.btn-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.btn-icon.view {
    background: var(--bg-color);
    color: var(--text-secondary);
}

.btn-icon.view:hover {
    color: var(--primary-color);
    background: var(--hover-bg);
}

.btn-icon.delete {
    background: var(--bg-color);
    color: var(--text-secondary);
}

.btn-icon.delete:hover {
    color: #ef4444;
    background: #fee2e2;
}

.empty-state {
    padding: 3rem 0;
    text-align: center;
}

.empty-content {
    color: var(--text-secondary);
    opacity: 0.5;
}

.empty-content .fa-folder-open {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

/* Preview Modal */
.preview-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
}

.preview-modal {
    background: var(--card-bg);
    width: 100%;
    height: 90%;
    max-width: 1100px;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
}

.preview-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-header h3 {
    font-size: 1rem;
    font-weight: 700;
}

.close-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--bg-color);
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #fee2e2;
    color: #ef4444;
}

.preview-content {
    flex: 1;
    background: var(--bg-color);
}

.preview-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
}

.preview-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
}

/* Toast Notification */
.toast {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 0.75rem;
    background: var(--card-bg);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 3000;
    font-size: 0.875rem;
    font-weight: 600;
    border: 1px solid var(--border-color);
}

.toast.success {
    color: #10b981;
    border-left: 3px solid #10b981;
}

.toast.error {
    color: #ef4444;
    border-left: 3px solid #ef4444;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

:root.dark-theme .preview-content {
    background: var(--bg-color);
}

:root.dark-theme .preview-iframe {
    color-scheme: dark;
}

:root.dark-theme .action-btn.delete {
    background: #451a1a;
    border-color: #7f1d1d;
    color: #f87171;
}

:root.dark-theme .action-btn.delete:hover:not(:disabled) {
    background: #7f1d1d;
}

:root.dark-theme .btn-icon.delete:hover,
:root.dark-theme .close-btn:hover {
    background: #451a1a;
    color: #f87171;
}

@media (max-width: 768px) {
    .panel-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .status-overview {
        grid-template-columns: 1fr;
    }

    .search-box {
        width: 100%;
    }
}
</style>
