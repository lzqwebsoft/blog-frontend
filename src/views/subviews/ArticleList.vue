<template>
    <div class="article-list-view">
        <div class="panel-header">
            <h2 class="panel-title">文章列表</h2>
            <div class="panel-actions">
                <select v-model="searchForm.articleType" @change="handleSearch" class="form-select">
                    <option value="0">全部分类</option>
                    <option v-for="type in articleTypes" :key="type.id" :value="type.id">
                        {{ type.name }}
                    </option>
                </select>
                <div class="search-input-wrapper">
                    <input v-model="searchForm.title" type="text" placeholder="搜索标题..." class="form-input"
                        @input="handleSearch" />
                    <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="search-icon" />
                </div>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="pl-4">标题</th>
                        <th>数据</th>
                        <th>分类</th>
                        <th>权限/状态</th>
                        <th class="text-right pr-4">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="article in articles" :key="article.id" class="hover-row">
                        <td class="pl-4 max-w-title">
                            <span v-if="article.is_top" class="badge-top">置顶</span>
                            <a :href="`/show/${article.id}.html`" target="_blank" class="article-link">{{ article.title
                                }}</a>
                        </td>
                        <td class="text-gray">
                            <div class="data-col">
                                <span>阅: {{ article.readed_num }}</span>
                                <span>评: {{ article.comment_count }}</span>
                            </div>
                        </td>
                        <td class="text-gray">{{ getTypeName(article.type_id) }}</td>
                        <td>
                            <button class="perm-btn" :class="article.allow_comment ? 'perm-allow' : 'perm-deny'"
                                @click="handleAllowCommentChange(article)"
                                :title="article.allow_comment ? '点击禁止评论' : '点击允许评论'">
                                {{ article.allow_comment ? '允许评论' : '禁止评论' }}
                            </button>
                        </td>
                        <td class="text-right pr-4 action-col">
                            <button class="action-btn edit" title="编辑" @click="goEdit(article.id)">
                                <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                            </button>
                            <button class="action-btn top" :class="{ active: article.is_top }"
                                :title="article.is_top ? '取消置顶' : '置顶'" @click="handleToggleTop(article)">
                                <font-awesome-icon :icon="['fas', 'arrow-up']" />
                            </button>
                            <button class="action-btn delete" title="删除" @click="handleDeleteArticle(article)">
                                <font-awesome-icon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <AppPagination :current-page="pagination.currentPage" :total-pages="totalPages" :total-items="pagination.total"
            @page-change="handlePageChange" />
    </div>
</template>

<script>
import {
    selectArticles,
    getArticleTypes,
    deleteArticle,
    toggleAllowComment,
    toggleTop,
} from '@/api/article'
import AppPagination from '@/components/AppPagination.vue'

export default {
    name: 'ArticleList',
    components: {
        AppPagination,
    },
    data() {
        return {
            searchForm: {
                articleType: '0',
                title: '',
            },
            articles: [],
            articleTypes: [],
            pagination: {
                currentPage: 1,
                pageSize: 10,
                total: 0,
            },
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.pagination.total / this.pagination.pageSize) || 1
        },
    },
    mounted() {
        this.loadArticleTypes() // Load types first
        this.loadArticles()
    },
    methods: {
        getTypeName(id) {
            const type = this.articleTypes.find((t) => t.id === id)
            return type ? type.name : '未分类'
        },
        goEdit(id) {
            this.$router.push(`/edit/${id}`)
        },
        async loadArticles() {
            try {
                const params = {
                    pageNo: this.pagination.currentPage,
                    pageSize: this.pagination.pageSize,
                    title: this.searchForm.title || undefined,
                }

                if (this.searchForm.articleType && this.searchForm.articleType !== '0') {
                    params.articleTypeId = parseInt(this.searchForm.articleType)
                }

                const res = await selectArticles(params)
                // request.js already handles res.code !== 0 by throwing
                const pageResult = res.data.page
                this.articles = pageResult.data
                this.pagination.total = pageResult.totalCount
            } catch (err) {
                console.error('加载文章详情失败:', err)
                alert(err.message || '加载文章失败')
            }
        },
        async loadArticleTypes() {
            try {
                const res = await getArticleTypes()
                this.articleTypes = res.data
            } catch (err) {
                console.error('加载文章分类失败:', err)
            }
        },
        handleSearch() {
            this.pagination.currentPage = 1
            this.loadArticles()
        },
        handlePageChange(page) {
            this.pagination.currentPage = page
            this.loadArticles()
        },
        async handleAllowCommentChange(article) {
            try {
                const newStatus = !article.allow_comment
                await toggleAllowComment(article.id, newStatus)
                article.allow_comment = newStatus
            } catch (err) {
                alert('操作失败: ' + (err.message || '未知错误'))
            }
        },
        async handleToggleTop(article) {
            try {
                const newStatus = !article.is_top
                await toggleTop(article.id, newStatus)
                // 由于置顶后会引起更表顺序变更，这里需要刷新一下文章列表
                this.loadArticles()
            } catch (err) {
                alert('操作失败: ' + (err.message || '未知错误'))
            }
        },
        async handleDeleteArticle(article) {
            if (confirm(`确定要删除文章"${article.title}"吗？`)) {
                try {
                    await deleteArticle(article.id)
                    alert('删除成功')
                    this.loadArticles() // 重新加载列表
                } catch (err) {
                    alert('删除失败: ' + (err.message || '未知错误'))
                }
            }
        },
    },
}
</script>

<style scoped>
.panel-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
    .panel-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
}

.panel-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    font-family: var(--font-serif);
}

.panel-actions {
    display: flex;
    gap: 0.5rem;
    width: 100%;
}

@media (min-width: 768px) {
    .panel-actions {
        width: auto;
    }
}

.form-select,
.form-input {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    color: var(--text-color);
    outline: none;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-select:focus,
.form-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
    background-color: var(--bg-color);
}

.form-select:hover,
.form-input:hover {
    border-color: var(--text-secondary);
}

.search-input-wrapper {
    position: relative;
    flex-grow: 1;
}

.form-input {
    width: 100%;
    padding-left: 2.25rem;
}

.search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-size: 0.75rem;
}

/* Table */
.table-container {
    overflow-x: auto;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.data-table thead {
    background-color: var(--hover-bg);
}

.data-table th {
    text-align: left;
    padding: 0.875rem 1rem;
    border-bottom: 2px solid var(--border-color);
    color: var(--text-color);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
}

.data-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
    color: var(--text-color);
}

.data-table tbody tr:last-child td {
    border-bottom: none;
}

.data-table tbody tr {
    transition: background-color 0.2s ease;
}

.hover-row:hover {
    background-color: var(--hover-bg);
}

.text-right {
    text-align: right;
}

.text-gray {
    color: var(--text-secondary);
}

.max-w-title {
    max-width: 200px;
}

@media (min-width: 640px) {
    .max-w-title {
        max-width: 300px;
    }
}

.article-link {
    font-weight: 500;
    color: var(--text-color);
    transition: color 0.2s;
}

.article-link:hover {
    color: var(--link-color);
}

.badge-top {
    background-color: #ef4444;
    color: white;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 4px;
    margin-right: 6px;
    vertical-align: middle;
}

.data-col {
    display: flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 2px;
}

.perm-btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
}

.perm-allow {
    background-color: #dcfce7;
    color: #15803d;
    border-color: #bbf7d0;
}

.perm-allow:hover {
    background-color: #bbf7d0;
}

.perm-deny {
    background-color: #fee2e2;
    color: #dc2626;
    border-color: #fecaca;
}

.perm-deny:hover {
    background-color: #fecaca;
}

.action-col {
    white-space: nowrap;
}

.action-btn {
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0.5rem;
    margin-left: 0.25rem;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
    font-size: 0.875rem;
}

.action-btn:hover {
    background-color: var(--hover-bg);
    border-color: var(--border-color);
}

.action-btn.edit:hover {
    color: var(--primary-color);
    background-color: rgba(var(--primary-color-rgb), 0.1);
}

.action-btn.delete:hover {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
}

.action-btn.top:hover {
    color: #eab308;
    background-color: rgba(234, 179, 8, 0.1);
    border-color: rgba(234, 179, 8, 0.2);
}

.action-btn.top.active {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
}
</style>
