<template>
    <div class="link-list-view">
        <div class="panel-header">
            <h2 class="panel-title">友情链接</h2>
            <button class="btn-black" @click="handleAddLink">
                <font-awesome-icon :icon="['fas', 'link']" /> 添加链接
            </button>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="pl-4">网站名称</th>
                        <th>URL / 备注</th>
                        <th>创建时间</th>
                        <th class="text-right pr-4">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="link in links" :key="link.id" class="hover-row">
                        <td class="pl-4 font-bold">{{ link.name }}</td>
                        <td>
                            <div class="text-xs text-mono text-gray-dark">{{ link.path }}</div>
                            <div class="text-xs text-gray-light">{{ link.remark }}</div>
                        </td>
                        <td class="text-xs text-gray-light">{{ formatDate(link.created_at) }}</td>
                        <td class="text-right pr-4 action-col">
                            <button
                                class="action-btn edit"
                                title="编辑"
                                @click="handleEditLink(link)"
                            >
                                <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                            </button>
                            <button
                                class="action-btn delete"
                                title="删除"
                                @click="handleDeleteLink(link)"
                            >
                                <font-awesome-icon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-bar" v-if="links.length > 0">
            <span class="pagination-info">共 {{ pagination.total }} 个相关链接</span>
        </div>

        <!-- Link Edit Dialog -->
        <link-edit-dialog
            v-if="linkDialogVisible"
            :visible="linkDialogVisible"
            :link-data="currentLink"
            @save="handleSaveLink"
            @close="linkDialogVisible = false"
        />
    </div>
</template>

<script>
import LinkEditDialog from '@/components/LinkEditDialog.vue'
import { getLinkList, saveLink, deleteLink } from '@/api/link'
import { formatDate } from '@/utils/tools'

export default {
    name: 'LinkList',
    components: {
        LinkEditDialog,
    },
    data() {
        return {
            links: [],
            linkDialogVisible: false,
            currentLink: null,
            pagination: {
                total: 0,
                pageNo: 1,
                pageSize: 10,
            },
        }
    },
    mounted() {
        this.loadLinks()
    },
    methods: {
        formatDate,
        async loadLinks() {
            try {
                const res = await getLinkList(this.pagination.pageNo, this.pagination.pageSize)
                if (res.code === 0) {
                    this.links = res.data.data
                    this.pagination.total = res.data.totalCount
                }
            } catch (error) {
                console.error('加载链接失败:', error)
            }
        },
        handleAddLink() {
            this.currentLink = null
            this.linkDialogVisible = true
        },
        handleEditLink(link) {
            this.currentLink = link
            this.linkDialogVisible = true
        },
        async handleDeleteLink(link) {
            if (confirm(`确定要删除链接"${link.name}"吗？`)) {
                try {
                    await deleteLink(link.id)
                    await this.loadLinks()
                } catch (error) {
                    console.error('删除链接失败:', error)
                    alert(error.message || '删除失败')
                }
            }
        },
        async handleSaveLink(formData) {
            try {
                const params = new URLSearchParams()
                params.append('name', formData.name)
                params.append('path', formData.path)
                params.append('remark', formData.remark || '')

                if (formData.id) {
                    params.append('id', formData.id)
                }

                await saveLink(params)

                this.linkDialogVisible = false
                await this.loadLinks()
            } catch (error) {
                console.error('保存链接失败:', error)
                alert(error.message || '保存失败')
            }
        },
    },
}
</script>

<style scoped>
.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.panel-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    font-family: var(--font-serif);
}

.btn-black {
    background-color: #111827;
    color: white;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-black:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-black:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:root.dark-theme .btn-black {
    background-color: white;
    color: black;
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

.font-bold {
    font-weight: 700;
}

.text-xs {
    font-size: 0.75rem;
}

.text-mono {
    font-family: monospace;
}

.text-gray-dark {
    color: var(--text-color);
    opacity: 0.8;
}

.text-gray-light {
    color: var(--text-secondary);
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

.pagination-bar {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
}

.pagination-info {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}
</style>
