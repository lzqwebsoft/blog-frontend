<template>
    <div class="draft-list">
        <!-- 草稿表格 -->
        <div class="draft-table">
            <table>
                <thead>
                    <tr>
                        <th>标题</th>
                        <th width="80">阅读</th>
                        <th width="80">评论</th>
                        <th width="140">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="draft in drafts" :key="draft.id">
                        <td>
                            <a :href="`/show/${draft.id}.html`" target="_blank">
                                {{ draft.title || '无标题' }}
                            </a>
                            <span class="create-time">({{ formatDate(draft.createAt) }})</span>
                        </td>
                        <td class="text-center">{{ draft.readedNum }}</td>
                        <td class="text-center">{{ draft.commentCount }}</td>
                        <td class="text-center">
                            <a :href="`/edit/${draft.id}.html`" class="btn-link">编辑</a>
                            <button type="button" class="btn-link delete-btn" @click="handleDeleteDraft(draft)">
                                删除
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="drafts.length > 0">
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

        <div v-if="drafts.length === 0" class="empty-state">
            <p>暂无内容</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DraftList',
    data() {
        return {
            drafts: [],
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
        this.loadDrafts()
    },
    methods: {
        async loadDrafts() {
            try {
                // 模拟数据
                this.drafts = [
                    {
                        id: 1,
                        title: 'Vue 3 新特性探索',
                        createAt: new Date('2024-01-15'),
                        readedNum: 5,
                        commentCount: 0
                    },
                    {
                        id: 2,
                        title: '',
                        createAt: new Date('2024-01-10'),
                        readedNum: 2,
                        commentCount: 0
                    }
                ]
                this.pagination.total = 2
            } catch {
                alert('加载草稿失败')
            }
        },

        handlePageChange(page) {
            this.pagination.currentPage = page
            this.loadDrafts()
        },

        handleDeleteDraft(draft) {
            const title = draft.title || '无标题'
            if (confirm(`确定要删除草稿"${title}"吗？`)) {
                try {
                    // await this.$http.delete(`/api/drafts/${draft.id}`)
                    alert('删除成功')
                    this.loadDrafts()
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
.draft-list {
    padding: 0;
}

.draft-table table {
    width: 100%;
    border-collapse: collapse;
    background: var(--card-bg);
    border-radius: 8px;
    overflow: hidden;
}

.draft-table th,
.draft-table td {
    padding: 12px;
    border: 1px solid var(--border-color);
    text-align: left;
}

.draft-table th {
    background: var(--hover-bg);
    font-weight: 500;
    color: var(--text-color);
}

.draft-table td {
    color: var(--text-color);
}

.draft-table td.text-center,
.draft-table th[width] {
    text-align: center;
}

.draft-table a {
    color: var(--link-color);
    text-decoration: none;
}

.draft-table a:hover {
    text-decoration: underline;
}

.create-time {
    color: var(--text-secondary);
    font-size: 12px;
    margin-left: 8px;
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
    .draft-table {
        overflow-x: auto;
    }
}
</style>
