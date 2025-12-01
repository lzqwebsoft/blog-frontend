<template>
    <div class="blog-settings">
        <div class="settings-form">
            <div v-if="errorMessage" class="alert alert-error">
                {{ errorMessage }}
                <button class="close-btn" @click="errorMessage = ''">×</button>
            </div>
            <div v-if="successMessage" class="alert alert-success">
                {{ successMessage }}
                <button class="close-btn" @click="successMessage = ''">×</button>
            </div>

            <form @submit.prevent="handleSubmit">
                <div class="form-item">
                    <label class="required">博客名</label>
                    <input v-model="formData.head" type="text" placeholder="请输入博客名" required />
                    <span v-if="errors.head" class="error-text">{{ errors.head }}</span>
                </div>

                <div class="form-item">
                    <label class="required">博客签名</label>
                    <input v-model="formData.descriptions" type="text" placeholder="请输入博客签名" required />
                    <span v-if="errors.descriptions" class="error-text">{{ errors.descriptions }}</span>
                </div>

                <div class="form-item">
                    <label class="required">关联邮箱</label>
                    <input v-model="formData.email" type="email" placeholder="请输入关联邮箱" required />
                    <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
                </div>

                <div class="form-item">
                    <label>关于</label>
                    <textarea v-model="formData.about" rows="6" placeholder="请输入关于内容"></textarea>
                    <div class="editor-tips">
                        <small>支持富文本编辑，您可以在这里介绍您的博客</small>
                    </div>
                </div>

                <div class="form-item">
                    <button type="submit" class="btn-primary" :disabled="loading">
                        {{ loading ? '保存中...' : '保存' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BlogSettings',
    data() {
        return {
            loading: false,
            errorMessage: '',
            successMessage: '',
            errors: {},
            formData: {
                id: null,
                head: '',
                descriptions: '',
                email: '',
                about: ''
            }
        }
    },
    mounted() {
        this.loadBlogInfo()
    },
    methods: {
        async loadBlogInfo() {
            try {
                // 模拟API调用
                // const response = await this.$http.get('/api/blog-info')
                // this.formData = response.data

                // 模拟数据
                this.formData = {
                    id: 1,
                    head: '我的技术博客',
                    descriptions: '分享前端开发、Vue、React等技术文章',
                    email: 'admin@example.com',
                    about: '<p>欢迎来到我的技术博客！这里主要分享前端开发相关的内容。</p>'
                }
            } catch {
                alert('加载博客信息失败')
            }
        },

        validateForm() {
            this.errors = {}
            let isValid = true

            if (!this.formData.head || this.formData.head.length < 2 || this.formData.head.length > 50) {
                this.errors.head = '博客名长度在 2 到 50 个字符'
                isValid = false
            }

            if (!this.formData.descriptions || this.formData.descriptions.length < 5 || this.formData.descriptions.length > 200) {
                this.errors.descriptions = '博客签名长度在 5 到 200 个字符'
                isValid = false
            }

            if (!this.formData.email || !this.validateEmail(this.formData.email)) {
                this.errors.email = '请输入正确的邮箱地址'
                isValid = false
            }

            return isValid
        },

        async handleSubmit() {
            if (!this.validateForm()) {
                return
            }

            this.loading = true
            this.errorMessage = ''
            this.successMessage = ''

            try {
                // 模拟API调用
                // const response = await this.$http.post('/api/blog-info/save', this.formData)

                // 模拟成功响应
                this.successMessage = '博客信息保存成功'
            } catch {
                this.errorMessage = '保存失败，请检查网络连接或稍后重试'
            } finally {
                this.loading = false
            }
        },

        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return re.test(email)
        }
    }
}
</script>

<style scoped>
.blog-settings {
    padding: 0;
}

.settings-form {
    max-width: 600px;
}

.alert {
    padding: 12px 16px;
    margin-bottom: 20px;
    border-radius: 8px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--border-color);
}

.alert-error {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border-color: #dc3545;
}

.alert-success {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
    border-color: #28a745;
}

:root.dark-theme .alert-error {
    background: rgba(220, 53, 69, 0.2);
}

:root.dark-theme .alert-success {
    background: rgba(40, 167, 69, 0.2);
}

.close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    line-height: 1;
    color: inherit;
    transition: var(--transition);
}

.close-btn:hover {
    opacity: 0.7;
}

.form-item {
    margin-bottom: 20px;
}

.form-item label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-color);
}

.form-item label.required::before {
    content: '*';
    color: #dc3545;
    margin-right: 4px;
}

.form-item input[type='text'],
.form-item input[type='email'],
.form-item textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    background: var(--card-bg);
    color: var(--text-color);
    transition: var(--transition);
}

.form-item textarea {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    resize: vertical;
}

.form-item input:focus,
.form-item textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-text {
    display: block;
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
}

.editor-tips {
    margin-top: 8px;
    color: var(--text-secondary);
    font-size: 12px;
}

.btn-primary {
    padding: 10px 20px;
    background: var(--primary-color);
    color: var(--text-on-primary);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: var(--transition);
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .settings-form {
        max-width: 100%;
    }
}
</style>
