<template>
    <div class="article-type-list">
        <!-- 类别表格 -->
        <div class="type-table">
            <table>
                <thead>
                    <tr>
                        <th>类别</th>
                        <th width="120">文章数量</th>
                        <th width="200">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in articleTypes" :key="row.id">
                        <td>
                            <span v-if="!row.editing" :id="`article_type_${row.id}`">{{ row.name }}</span>
                            <input v-else v-model="row.editName" type="text" @blur="handleSaveEdit(row)"
                                @keyup.enter="handleSaveEdit(row)" />
                        </td>
                        <td class="text-center">
                            {{ row.articles ? row.articles.length : 0 }}
                        </td>
                        <td class="text-center">
                            <button type="button" class="btn-link" @click="handleEdit(row)">编辑</button>
                            <button type="button" class="btn-link delete-btn" @click="handleDeleteType(row)">
                                删除
                            </button>
                            <br />
                            <button type="button" class="btn-link btn-small" @click="handleToggleDisable(row)">
                                {{ row.disable ? '显示' : '隐藏' }}
                            </button>
                            <span class="status-text"> | {{ row.disable ? '隐藏' : '显示' }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 添加类别 -->
        <div class="add-type-form">
            <form @submit.prevent="handleAddType">
                <input v-model="newType.name" type="text" placeholder="请输入新的类别名称" />
                <button type="submit" class="btn-primary">添加分类</button>
            </form>
            <div v-if="errorInfo" class="error-info">{{ errorInfo }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ArticleTypeList',
    data() {
        return {
            articleTypes: [],
            newType: {
                name: ''
            },
            errorInfo: ''
        }
    },
    mounted() {
        this.loadArticleTypes()
    },
    methods: {
        async loadArticleTypes() {
            try {
                // 模拟API调用
                // const response = await this.$http.get('/api/article-types')
                // this.articleTypes = response.data.map(type => ({
                //   ...type,
                //   editing: false,
                //   editName: type.name
                // }))

                // 模拟数据
                this.articleTypes = [
                    {
                        id: 1,
                        name: '技术文章',
                        articles: [{}, {}],
                        disable: false,
                        editing: false,
                        editName: '技术文章'
                    },
                    {
                        id: 2,
                        name: '生活随笔',
                        articles: [{}],
                        disable: true,
                        editing: false,
                        editName: '生活随笔'
                    }
                ]
            } catch {
                alert('加载文章类别失败')
            }
        },

        handleEdit(row) {
            row.editing = true
        },

        async handleSaveEdit(row) {
            if (!row.editName.trim()) {
                alert('类别名称不能为空')
                row.editName = row.name
                row.editing = false
                return
            }

            try {
                // 模拟API调用
                // await this.$http.put(`/api/article-types/${row.id}`, { name: row.editName })
                row.name = row.editName
                row.editing = false
                console.log('更新成功')
            } catch {
                alert('更新失败')
            }
        },

        handleDeleteType(row) {
            if (confirm(`确定要删除类别"${row.name}"吗？`)) {
                try {
                    // await this.$http.delete(`/api/article-types/${row.id}`)
                    alert('删除成功')
                    this.loadArticleTypes()
                } catch {
                    alert('删除失败')
                }
            }
        },

        async handleToggleDisable(row) {
            try {
                // 模拟API调用
                // await this.$http.put(`/api/article-types/${row.id}/disable`, { disable: !row.disable })
                row.disable = !row.disable
                console.log(row.disable ? '已隐藏' : '已显示')
            } catch {
                alert('操作失败')
            }
        },

        async handleAddType() {
            if (!this.newType.name.trim()) {
                this.errorInfo = '请输入类别名称'
                return
            }

            try {
                // 模拟API调用
                // await this.$http.post('/api/article-types', { name: this.newType.name })
                alert('添加成功')
                this.newType.name = ''
                this.errorInfo = ''
                this.loadArticleTypes()
            } catch {
                this.errorInfo = '添加失败，请重试'
            }
        }
    }
}
</script>

<style scoped>
.article-type-list {
    padding: 0;
}

.type-table table {
    width: 100%;
    border-collapse: collapse;
    background: var(--card-bg);
    margin-bottom: 20px;
    border-radius: 8px;
    overflow: hidden;
}

.type-table th,
.type-table td {
    padding: 12px;
    border: 1px solid var(--border-color);
    text-align: left;
}

.type-table th {
    background: var(--hover-bg);
    font-weight: 500;
    color: var(--text-color);
}

.type-table td {
    color: var(--text-color);
}

.type-table td.text-center,
.type-table th[width] {
    text-align: center;
}

.type-table input[type='text'] {
    padding: 4px 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    width: 200px;
    background: var(--card-bg);
    color: var(--text-color);
}

.type-table input[type='text']:focus {
    outline: none;
    border-color: var(--primary-color);
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

.btn-small {
    font-size: 12px;
}

.delete-btn {
    color: #dc3545;
}

.delete-btn:hover {
    color: #c82333;
}

.status-text {
    font-size: 12px;
    color: var(--text-secondary);
}

.add-type-form {
    padding: 15px;
    background: var(--hover-bg);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.add-type-form form {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
}

.add-type-form input[type='text'] {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    flex: 1;
    max-width: 300px;
    background: var(--card-bg);
    color: var(--text-color);
}

.add-type-form input[type='text']:focus {
    outline: none;
    border-color: var(--primary-color);
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

.error-info {
    color: #dc3545;
    margin-top: 10px;
    font-size: 14px;
}

@media (max-width: 768px) {
    .type-table {
        overflow-x: auto;
    }

    .add-type-form form {
        flex-direction: column;
        align-items: stretch;
    }

    .add-type-form input[type='text'] {
        max-width: 100%;
    }
}
</style>
