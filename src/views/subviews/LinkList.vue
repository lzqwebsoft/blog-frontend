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
                            <button class="action-btn edit" title="编辑" @click="handleEditLink(link)">
                                <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                            </button>
                            <button class="action-btn delete" title="删除" @click="handleDeleteLink(link)">
                                <font-awesome-icon :icon="['fas', 'trash']" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-bar" v-if="links.length > 0">
            <span class="page-info">共 {{ pagination.total }} 个相关链接</span>
        </div>

        <!-- Link Edit Dialog -->
        <link-edit-dialog v-if="linkDialogVisible" :visible="linkDialogVisible" :link-data="currentLink"
            @save="handleSaveLink" @close="linkDialogVisible = false" />
    </div>
</template>

<script>
import LinkEditDialog from '@/components/LinkEditDialog.vue'
import { getLinkList, saveLink, deleteLink } from '@/api/link'
import { formatDate } from '@/utils/tools'

export default {
    name: 'LinkList',
    components: {
        LinkEditDialog
    },
    data() {
        return {
            links: [],
            linkDialogVisible: false,
            currentLink: null,
            pagination: {
                total: 0,
                pageNo: 1,
                pageSize: 10
            }
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
        }
    }
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
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-black:hover {
    opacity: 0.9;
}

:root.dark-theme .btn-black {
    background-color: white;
    color: black;
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
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px;
    margin-left: 4px;
    transition: color 0.2s;
}

.action-btn:hover {
    color: var(--link-color);
}

.action-btn.delete:hover {
    color: #ef4444;
}

.pagination-bar {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
}
</style>
