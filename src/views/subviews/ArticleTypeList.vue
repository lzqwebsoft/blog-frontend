<template>
    <div class="category-manager">
        <h2 class="panel-title">类型管理</h2>

        <!-- Add Category Form -->
        <div class="add-category-wrapper">
            <input v-model="newType.name" type="text" placeholder="输入新分类名称..." class="form-input"
                @keyup.enter="handleAddType">
            <button @click="handleAddType" class="btn-black">添加分类</button>
        </div>

        <!-- Categories Grid -->
        <div class="categories-grid">
            <div v-for="row in articleTypes" :key="row.id" class="category-card"
                :class="{ 'disabled-card': row.disable }">
                <div class="card-content">
                    <div v-if="!row.editing">
                        <h4 class="category-name">{{ row.name }} <span v-if="row.disable" class="text-xs">(隐藏)</span>
                        </h4>
                        <span class="category-count">{{ row.article_count || 0 }} 篇文章</span>
                    </div>
                    <div v-else class="edit-mode">
                        <input v-model="row.editName" ref="editInput" class="edit-input"
                            @keyup.enter="handleSaveEdit(row)" @blur="handleSaveEdit(row)">
                    </div>
                </div>

                <div class="card-actions">
                    <button class="action-icon" title="编辑" @click="handleEdit(row)">
                        <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                    </button>
                    <button class="action-icon" :class="row.disable ? 'text-green' : 'text-gray'"
                        :title="row.disable ? '点击显示' : '点击隐藏'" @click="handleToggleDisable(row)">
                        <font-awesome-icon :icon="row.disable ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
                    </button>
                    <button class="action-icon delete" title="删除" @click="handleDeleteType(row)">
                        <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                </div>
            </div>
        </div>

        <transition name="toast">
            <div v-if="errorInfo" class="error-toast" @click="errorInfo = ''">
                <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="error-icon" />
                <span>{{ errorInfo }}</span>
            </div>
        </transition>
    </div>
</template>

<script>
import { getArticleTypes, addArticleType, deleteArticleType, toggleArticleTypeDisable, updateArticleType } from '@/api/article'

export default {
    name: 'ArticleTypeList',
    data() {
        return {
            articleTypes: [],
            newType: { name: '' },
            errorInfo: ''
        }
    },
    mounted() {
        this.loadArticleTypes()
    },
    methods: {
        async loadArticleTypes() {
            try {
                const res = await getArticleTypes()
                this.articleTypes = (res.data || []).map(item => ({
                    ...item,
                    editing: false,
                    editName: item.name
                }))
            } catch (err) {
                console.error('加载分类失败:', err)
                this.errorInfo = '加载分类失败'
            }
        },
        handleEdit(row) {
            row.editing = true
            row.editName = row.name
            this.$nextTick(() => {

            })
        },
        async handleSaveEdit(row) {
            if (!row.editing) return
            const newName = row.editName.trim()

            if (!newName || newName === row.name) {
                row.editName = row.name
                row.editing = false
                return
            }

            try {
                await updateArticleType(row.id, newName)
                row.name = newName
                row.editing = false
                this.errorInfo = ''
            } catch (err) {
                console.error('更新分类名称失败:', err)
                this.errorInfo = err.message || '更新失败'

                row.editName = row.name
                row.editing = false

                setTimeout(() => {
                    if (this.errorInfo === (err.message || '更新失败')) {
                        this.errorInfo = ''
                    }
                }, 3000)
            }
        },
        async handleDeleteType(row) {
            if (confirm(`确定要删除类别"${row.name}"吗？`)) {
                // 检查当前类型下是否文章数不为0，如果不为0，则禁止删除
                if (row.article_count > 0) {
                    this.errorInfo = '当前类别下有文章，无法删除'
                    return
                }
                try {
                    await deleteArticleType(row.id)
                    await this.loadArticleTypes()
                    this.errorInfo = ''
                } catch (err) {
                    console.error('删除分类失败:', err)
                    this.errorInfo = err.message || '删除分类失败'
                    setTimeout(() => {
                        if (this.errorInfo === (err.message || '删除分类失败')) {
                            this.errorInfo = ''
                        }
                    }, 3000)
                }
            }
        },
        async handleToggleDisable(row) {
            const newStatus = !row.disable
            try {
                await toggleArticleTypeDisable(row.id, newStatus)
                row.disable = newStatus
                this.errorInfo = ''
            } catch (err) {
                console.error('切换分类状态失败:', err)
                this.errorInfo = err.message || '操作失败'
                setTimeout(() => {
                    if (this.errorInfo === (err.message || '操作失败')) {
                        this.errorInfo = ''
                    }
                }, 3000)
            }
        },
        async handleAddType() {
            const name = this.newType.name.trim()
            if (!name) return

            try {
                const params = new URLSearchParams()
                params.append('type_name', name)
                await addArticleType(params)
                this.newType.name = ''
                await this.loadArticleTypes()
                this.errorInfo = ''
            } catch (err) {
                console.error('添加分类失败:', err)
                this.errorInfo = err.message || '添加分类失败'
                // 3秒后自动清除错误信息
                setTimeout(() => {
                    if (this.errorInfo === (err.message || '添加分类失败')) {
                        this.errorInfo = ''
                    }
                }, 3000)
            }
        }
    }
}
</script>

<style scoped>
.category-manager {
    max-width: 100%;
}

.panel-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    font-family: var(--font-serif);
    margin-bottom: 1.5rem;
}

.add-category-wrapper {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background-color: var(--bg-color);
    /* Light gray usually */
    padding: 1rem;
    /* p-4 */
    border-radius: 0.5rem;
}

.form-input {
    flex-grow: 1;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 0.25rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--text-color);
    outline: none;
}

.form-input:focus {
    border-color: var(--text-secondary);
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
    transition: opacity 0.2s;
}

.btn-black:hover {
    opacity: 0.9;
}

:root.dark-theme .btn-black {
    background-color: white;
    color: black;
}

/* Grid */
.categories-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 768px) {
    .categories-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.category-card {
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: box-shadow 0.2s;
    background-color: var(--card-bg);
}

.category-card:hover {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.disabled-card {
    opacity: 0.6;
    background-color: var(--hover-bg);
}

.card-content {
    flex-grow: 1;
    padding-right: 1rem;
}

.category-name {
    font-weight: 700;
    color: var(--text-color);
    font-size: 1rem;
    margin-bottom: 0.25rem;
}

.category-count {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.text-xs {
    font-size: 0.75rem;
}

.card-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.action-icon {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 0.875rem;
    padding: 0.25rem;
    transition: color 0.2s;
}

.action-icon:hover {
    color: var(--link-color);
}

.action-icon.delete:hover {
    color: #ef4444;
}

.text-green {
    color: #16a34a;
}

.text-green:hover {
    color: #15803d;
}

.edit-input {
    width: 100%;
    padding: 4px;
    font-size: 1rem;
    font-weight: bold;
    border: 1px solid var(--primary-color);
    border-radius: 4px;
}

/* Error Toast */
.error-toast {
    position: fixed;
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fee2e2;
    color: #dc2626;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 1000;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid #fecaca;
}

.error-icon {
    font-size: 1rem;
}

:root.dark-theme .error-toast {
    background-color: #450a0a;
    color: #f87171;
    border-color: #7f1d1d;
}

/* Toast Transition */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translate(-50%, -20px);
}
</style>
