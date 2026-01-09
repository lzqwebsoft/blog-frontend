<template>
    <div class="blog-settings-view">
        <h2 class="panel-title">基本信息设置</h2>

        <div class="settings-container">
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Blog Name -->
                <div class="form-group">
                    <label class="form-label">博客名称</label>
                    <input v-model="formData.head" type="text" class="form-input" />
                </div>

                <!-- Blog Slogan -->
                <div class="form-group">
                    <label class="form-label">博客标语 (Slogan)</label>
                    <input v-model="formData.descriptions" type="text" class="form-input" />
                </div>

                <!-- Email -->
                <div class="form-group">
                    <label class="form-label">关联邮箱</label>
                    <input v-model="formData.email" type="email" class="form-input" />
                </div>

                <!-- About HTML -->
                <div class="form-group">
                    <label class="form-label">关于页面内容 (HTML)</label>
                    <RichTextEditor v-model="formData.about" :height="400" />
                </div>

                <div class="form-footer">
                    <button type="submit" class="btn-black" :disabled="saving">
                        {{ saving ? '正在保存...' : '保存更改' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { updateBlogInfo } from '@/api/common'
import RichTextEditor from '@/components/RichTextEditor.vue'

export default {
    name: 'BlogSettings',
    components: {
        RichTextEditor,
    },
    data() {
        return {
            formData: {
                id: 0,
                head: '',
                descriptions: '',
                email: '',
                about: '',
            },
            saving: false,
        }
    },
    created() {
        this.initFormData()
    },
    watch: {
        blogInfo: {
            handler() {
                this.initFormData()
            },
            deep: true,
        },
    },
    methods: {
        initFormData() {
            if (this.blogInfo && Object.keys(this.blogInfo).length > 0) {
                this.formData = {
                    id: this.blogInfo.id || 0,
                    head: this.blogInfo.head || '',
                    descriptions: this.blogInfo.descriptions || '',
                    email: this.blogInfo.email || '',
                    about: this.blogInfo.about || '',
                }
            }
        },
        async handleSubmit() {
            if (this.saving) return

            this.saving = true
            try {
                const res = await updateBlogInfo(this.formData)
                if (res.code === 0) {
                    // Update global store
                    await this.$blog.fetchBlogInfo()
                    alert('设置已保存！')
                } else {
                    alert(res.message || '保存失败')
                }
            } catch (error) {
                console.error('Failed to save blog settings:', error)
                alert('保存出错：' + error.message)
            } finally {
                this.saving = false
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

.settings-container {
    max-width: 42rem;
    /* max-w-2xl */
}

.space-y-6 > * + * {
    margin-top: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
}

.form-input {
    width: 100%;
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

.form-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
    background-color: var(--bg-color);
}

.form-input:hover {
    border-color: var(--text-secondary);
}

.form-footer {
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

.btn-black {
    background-color: #111827;
    color: white;
    padding: 0.625rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid transparent;
    cursor: pointer;
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

.btn-black:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

:root.dark-theme .btn-black {
    background-color: white;
    color: black;
}
</style>
