<template>
    <div class="link-list">
        <!-- 操作栏 -->
        <div class="operation-bar">
            <button type="button" class="btn-primary" @click="handleAddLink">添加链接</button>
        </div>

        <!-- 链接表格 -->
        <div class="link-table">
            <table>
                <thead>
                    <tr>
                        <th>名称</th>
                        <th>地址</th>
                        <th>备注</th>
                        <th>创建时间</th>
                        <th width="140">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="link in links" :key="link.id">
                        <td>{{ link.name }}</td>
                        <td class="text-center">
                            <a :href="link.path" target="_blank">{{ link.path }}</a>
                        </td>
                        <td class="text-center">{{ link.remark }}</td>
                        <td class="text-center">{{ formatDate(link.createAt) }}</td>
                        <td class="text-center">
                            <button type="button" class="btn-link" @click="handleEditLink(link)">编辑</button>
                            <button type="button" class="btn-link delete-btn" @click="handleDeleteLink(link)">
                                删除
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="links.length > 0">
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
                {{ pagination.total }}个相关链接, 共{{ totalPages }}页
            </div>
        </div>

        <div v-if="links.length === 0" class="empty-state">
            <p>暂无内容</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LinkList',
    inject: ['openLinkDialog'],
    data() {
        return {
            links: [],
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
        this.loadLinks()
    },
    methods: {
        async loadLinks() {
            try {
                // 模拟数据
                this.links = [
                    {
                        id: 1,
                        name: 'Vue.js 官网',
                        path: 'https://vuejs.org',
                        remark: '前端框架',
                        createAt: new Date()
                    }
                ]
                this.pagination.total = 1
            } catch {
                alert('加载链接失败')
            }
        },

        handlePageChange(page) {
            this.pagination.currentPage = page
            this.loadLinks()
        },

        handleAddLink() {
            this.openLinkDialog()
        },

        handleEditLink(link) {
            this.openLinkDialog(link)
        },

        handleDeleteLink(link) {
            if (confirm(`确定要删除链接"${link.name}"吗？`)) {
                try {
                    // await this.$http.delete(`/api/links/${link.id}`)
                    alert('删除成功')
                    this.loadLinks()
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
.link-list {
    padding: 0;
}

.operation-bar {
    margin-bottom: 20px;
}

.btn-primary {
    padding: 8px 16px;
    background: var(--primary-color);
    color: var(--text-on-primary);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: var(--transition);
}

.btn-primary:hover {
    background: var(--primary-hover);
}

.link-table table {
    width: 100%;
    border-collapse: collapse;
    background: var(--card-bg);
    border-radius: 8px;
    overflow: hidden;
}

.link-table th,
.link-table td {
    padding: 12px;
    border: 1px solid var(--border-color);
    text-align: left;
}

.link-table th {
    background: var(--hover-bg);
    font-weight: 500;
    color: var(--text-color);
}

.link-table td {
    color: var(--text-color);
}

.link-table td.text-center,
.link-table th[width] {
    text-align: center;
}

.link-table a {
    color: var(--link-color);
    text-decoration: none;
}

.link-table a:hover {
    color: var(--primary-hover);
    text-decoration: underline;
}

.btn-link {
    background: none;
    border: none;
    color: var(--link-color);
    cursor: pointer;
    padding: 0 8px;
    font-size: 14px;
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
    .link-table {
        overflow-x: auto;
    }
}
</style>
