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
                            <span class="icon-draft"
                                ><font-awesome-icon :icon="['fas', 'pen-to-square']"
                            /></span>
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
                            <button class="btn-black-small" @click="goEdit(draft.id)">
                                继续编辑
                            </button>
                            <button
                                class="action-btn delete"
                                title="删除"
                                @click="handleDeleteDraft(draft)"
                            >
                                <font-awesome-icon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Pagination
            v-if="drafts.length > 0"
            :current-page="pagination.currentPage"
            :total-pages="totalPages"
            :total-items="pagination.total"
            @page-change="handlePageChange"
        />
    </div>
</template>

<script>
import { getDrafts, deleteArticle } from '@/api/article'
import { formatDateTime } from '@/utils/tools'
import Pagination from '@/components/Pagination.vue'

export default {
    name: 'DraftList',
    components: {
        Pagination,
    },
    data() {
        return {
            drafts: [],
            pagination: {
                currentPage: 1,
                pageSize: 15,
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
        },
    },
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
    padding: 0.375rem 0.875rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid transparent;
    cursor: pointer;
    margin-right: 0.5rem;
    transition: all 0.2s ease;
}

.btn-black-small:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:root.dark-theme .btn-black-small {
    background-color: white;
    color: black;
}

.action-btn {
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
    font-size: 0.875rem;
}

.action-btn:hover {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
}

.data-col {
    display: flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 2px;
}
</style>
