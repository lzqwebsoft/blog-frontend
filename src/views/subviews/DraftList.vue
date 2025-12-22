<template>
    <div class="draft-list-view">
        <h2 class="panel-title">草稿箱</h2>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="pl-4">标题</th>
                        <th>数据</th>
                        <th>最后修改</th>
                        <th class="text-right pr-4">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="draft in drafts" :key="draft.id" class="hover-row">
                        <td class="pl-4 font-medium">
                            <span class="icon-draft"><font-awesome-icon :icon="['fas', 'pen-to-square']" /></span>
                            {{ draft.title || '无标题草稿' }}
                        </td>
                        <td class="text-gray">
                            <div class="data-col">
                                <span>阅: {{ draft.readed_num }}</span>
                                <span>评: {{ draft.comment_count }}</span>
                            </div>
                        </td>
                        <td class="text-xs text-gray">{{ formatDateTime(draft.update_at) }}</td>
                        <td class="text-right pr-4 action-col">
                            <button class="btn-black-small" @click="goEdit(draft.id)">继续编辑</button>
                            <button class="action-btn delete" title="删除" @click="handleDeleteDraft(draft)">
                                <font-awesome-icon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-bar" v-if="drafts.length > 0">
            <span class="page-info">共 {{ pagination.total }} 篇草稿，当前 {{ pagination.currentPage }}/{{ totalPages }}
                页</span>
            <div class="page-btns">
                <button class="page-btn" :disabled="pagination.currentPage === 1"
                    @click="handlePageChange(pagination.currentPage - 1)">上一页</button>
                <button class="page-btn" :disabled="pagination.currentPage === totalPages"
                    @click="handlePageChange(pagination.currentPage + 1)">下一页</button>
            </div>
        </div>
    </div>
</template>

<script>
import { getDrafts, deleteArticle } from '@/api/article'
import { formatDateTime } from '@/utils/tools';

export default {
    name: 'DraftList',
    data() {
        return {
            drafts: [],
            pagination: {
                currentPage: 1,
                pageSize: 15,
                total: 0
            }
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.pagination.total / this.pagination.pageSize) || 1
        }
    },
    mounted() {
        this.loadDrafts()
    },
    methods: {
        formatDateTime,

        async loadDrafts() {
            try {
                const res = await getDrafts(this.pagination.currentPage, this.pagination.pageSize)
                const pageResult = res.data.page
                this.drafts = pageResult.data || []
                this.pagination.total = pageResult.totalCount
            } catch (err) {
                console.error('加载草稿失败:', err)
                alert(err.message || '加载草稿失败')
            }
        },
        handlePageChange(page) {
            this.pagination.currentPage = page
            this.loadDrafts()
        },
        goEdit(id) {
            this.$router.push(`/edit/${id}`)
        },
        async handleDeleteDraft(draft) {
            if (confirm(`确认删除草稿"${draft.title || '无标题'}"?`)) {
                try {
                    await deleteArticle(draft.id)
                    alert('删除成功')
                    this.loadDrafts()
                } catch (err) {
                    alert('删除失败: ' + (err.message || '未知错误'))
                }
            }
        }
    }
}
</script>

<style scoped>
.panel-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    font-family: var(--font-serif);
    margin-bottom: 1.5rem;
}

.table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.data-table th {
    text-align: left;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    font-size: 0.75rem;
}

.data-table td {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
    color: var(--text-color);
}

.hover-row:hover {
    background-color: var(--hover-bg);
}

.pl-4 {
    padding-left: 1rem;
}

.pr-4 {
    padding-right: 1rem;
}

.text-right {
    text-align: right;
}

.text-gray {
    color: var(--text-secondary);
}

.text-xs {
    font-size: 0.75rem;
}

.font-medium {
    font-weight: 500;
}

.icon-draft {
    color: #f97316;
    /* Orange */
    margin-right: 0.5rem;
}

.btn-black-small {
    background-color: #111827;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    border: none;
    cursor: pointer;
    margin-right: 0.5rem;
}

.btn-black-small:hover {
    opacity: 0.9;
}

:root.dark-theme .btn-black-small {
    background-color: white;
    color: black;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px;
    transition: color 0.2s;
}

.action-btn:hover {
    color: #ef4444;
}

.data-col {
    display: flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 2px;
}

.pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

.page-info {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.page-btns {
    display: flex;
    gap: 0.5rem;
}

.page-btn {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    border: 1px solid var(--border-color);
    background: var(--card-bg);
    border-radius: 0.25rem;
    cursor: pointer;
    color: var(--text-color);
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background-color: var(--hover-bg);
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
