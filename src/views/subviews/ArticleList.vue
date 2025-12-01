<template>
    <div class="article-list">
        <!-- 搜索条件 -->
        <div class="search-conditions">
            <form class="search-form" @submit.prevent="handleSearch">
                <div class="form-item">
                    <label>类别：</label>
                    <select v-model="searchForm.articleType" @change="handleSearch">
                        <option value="0">全部</option>
                        <option v-for="type in articleTypes" :key="type.id" :value="type.id">
                            {{ type.name }}
                        </option>
                    </select>
                </div>

                <div class="form-item">
                    <label>标题：</label>
                    <input v-model="searchForm.title" type="text" placeholder="请输入标题" @input="handleSearch" />
                </div>
            </form>
        </div>

        <!-- 文章表格 -->
        <div class="article-table">
            <table>
                <thead>
                    <tr>
                        <th>标题</th>
                        <th width="80">阅读</th>
                        <th width="80">评论</th>
                        <th width="120">评论权限</th>
                        <th width="200">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="article in articles" :key="article.id">
                        <td>
                            <a :href="`/show/${article.id}.html`" target="_blank">{{ article.title }}</a>
                            <span class="create-time">({{ formatDate(article.createAt) }})</span>
                        </td>
                        <td class="text-center">{{ article.readedNum }}</td>
                        <td class="text-center">{{ article.commentCount }}</td>
                        <td class="text-center">
                            <label class="switch">
                                <input type="checkbox" v-model="article.allowComment"
                                    @change="handleAllowCommentChange(article)" />
                                <span class="slider"></span>
                            </label>
                            <span class="switch-label">{{ article.allowComment ? '允许' : '禁止' }}</span>
                        </td>
                        <td class="text-center">
                            <a :href="`/edit/${article.id}.html`" class="btn-link">编辑</a>
                            <button type="button" class="btn-link" @click="handleToggleTop(article)">
                                {{ article.isTop ? '取消置顶' : '置顶' }}
                            </button>
                            <button type="button" class="btn-link delete-btn" @click="handleDeleteArticle(article)">
                                删除
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="articles.length > 0">
            <div class="pagination">
                <button :disabled="pagination.currentPage === 1" @click="handlePageChange(pagination.currentPage - 1)">
                    上一页
                </button>
                <button v-for="page in totalPages" :key="page" :class="{ active: page === pagination.currentPage }"
                    @click="handlePageChange(page)">
                    {{ page }}
                </button>
                <button :disabled="pagination.currentPage === totalPages"
                    @click="handlePageChange(pagination.currentPage + 1)">
                    下一页
                </button>
            </div>
            <div class="page-description">
                {{ pagination.total }}篇文章, 共{{ totalPages }}页
            </div>
        </div>

        <div v-if="articles.length === 0" class="empty-state">
            <p>暂无内容</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ArticleList',
    data() {
        return {
            searchForm: {
                articleType: '0',
                title: ''
            },
            articles: [],
            articleTypes: [],
            pagination: {
                currentPage: 1,
                pageSize: 10,
                total: 0
            }
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.pagination.total / this.pagination.pageSize)
        }
    },
    mounted() {
        this.loadArticles()
        this.loadArticleTypes()
    },
    methods: {
        async loadArticles() {
            try {
                // 模拟API调用
                // const response = await this.$http.get('/api/articles', {
                //   params: {
                //     type: this.searchForm.articleType,
                //     title: this.searchForm.title,
                //     page: this.pagination.currentPage
                //   }
                // })
                // this.articles = response.data.data
                // this.pagination.total = response.data.totalCount

                // 模拟数据
                this.articles = [
                    {
                        id: 1,
                        title: 'Vue.js 入门教程',
                        createAt: new Date(),
                        readedNum: 100,
                        commentCount: 10,
                        allowComment: true,
                        isTop: false
                    }
                ]
                this.pagination.total = 1
            } catch {
                alert('加载文章失败')
            }
        },

        async loadArticleTypes() {
            try {
                // const response = await this.$http.get('/api/article-types')
                // this.articleTypes = response.data

                // 模拟数据
                this.articleTypes = [
                    { id: 1, name: '技术文章' },
                    { id: 2, name: '生活随笔' }
                ]
            } catch {
                alert('加载文章类别失败')
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
                // await this.$http.put(`/api/articles/${article.id}/comment-permission`, {
                //   allowComment: article.allowComment
                // })
                console.log('评论权限更新成功')
            } catch {
                article.allowComment = !article.allowComment
                alert('更新失败')
            }
        },

        async handleToggleTop(article) {
            try {
                // await this.$http.put(`/api/articles/${article.id}/top`, {
                //   isTop: !article.isTop
                // })
                article.isTop = !article.isTop
                console.log(article.isTop ? '置顶成功' : '取消置顶成功')
            } catch {
                alert('操作失败')
            }
        },

        handleDeleteArticle(article) {
            if (confirm(`确定要删除文章"${article.title}"吗？`)) {
                try {
                    // await this.$http.delete(`/api/articles/${article.id}`)
                    alert('删除成功')
                    this.loadArticles()
                } catch {
                    alert('删除失败')
                }
            }
        },

        formatDate(date) {
            return new Date(date).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).replace(/\//g, '-')
        }
    }
}
</script>

<style scoped>
.article-list {
    padding: 0;
}

.search-conditions {
    margin-bottom: 20px;
    padding: 15px;
    background: var(--hover-bg);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.search-form {
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
}

.form-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.form-item label {
    font-weight: 500;
    color: var(--text-color);
}

.form-item select,
.form-item input {
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    background: var(--card-bg);
    color: var(--text-color);
    transition: var(--transition);
}

.form-item select:focus,
.form-item input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.form-item input {
    width: 200px;
}

.article-table table {
    width: 100%;
    border-collapse: collapse;
    background: var(--card-bg);
    border-radius: 8px;
    overflow: hidden;
}

.article-table th,
.article-table td {
    padding: 12px;
    border: 1px solid var(--border-color);
    text-align: left;
}

.article-table th {
    background: var(--hover-bg);
    font-weight: 500;
    color: var(--text-color);
}

.article-table td {
    color: var(--text-color);
}

.article-table td.text-center,
.article-table th[width] {
    text-align: center;
}

.article-table a {
    color: var(--link-color);
    text-decoration: none;
}

.article-table a:hover {
    text-decoration: underline;
}

.create-time {
    color: var(--text-secondary);
    font-size: 12px;
    margin-left: 8px;
}

.switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    vertical-align: middle;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--border-color);
    transition: 0.3s;
    border-radius: 20px;
}

.slider:before {
    position: absolute;
    content: '';
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: var(--card-bg);
    transition: 0.3s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: var(--primary-color);
}

input:checked+.slider:before {
    transform: translateX(20px);
}

.switch-label {
    margin-left: 8px;
    font-size: 14px;
    color: var(--text-color);
}

.btn-link {
    background: none;
    border: none;
    color: var(--link-color);
    cursor: pointer;
    padding: 0 8px;
    font-size: 14px;
    text-decoration: none;
    transition: var(--transition);
}

.btn-link:hover {
    color: var(--primary-hover);
    text-decoration: underline;
}

.delete-btn {
    color: #dc3545;
}

.delete-btn:hover {
    color: #c82333;
}

.pagination-container {
    margin-top: 20px;
    text-align: center;
}

.pagination {
    display: inline-flex;
    gap: 5px;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.pagination button {
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    background: var(--button-bg);
    color: var(--text-color);
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
    transition: var(--transition);
}

.pagination button:hover:not(:disabled) {
    color: var(--primary-color);
    border-color: var(--primary-color);
}

.pagination button.active {
    background: var(--primary-color);
    color: var(--text-on-primary);
    border-color: var(--primary-color);
}

.pagination button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.page-description {
    margin-top: 10px;
    color: var(--text-secondary);
    font-size: 14px;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
}

@media (max-width: 768px) {
    .article-list {
        padding: 0;
    }

    .search-form {
        flex-direction: column;
        align-items: stretch;
    }

    .form-item {
        flex-direction: column;
        align-items: stretch;
    }

    .form-item input {
        width: 100%;
    }

    .article-table {
        overflow-x: auto;
    }
}
</style>
