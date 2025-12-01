<template>
    <transition name="dialog-fade">
        <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
            <div class="dialog-container">
                <div class="dialog-header">
                    <h3>{{ formData.id ? '编辑链接' : '新建链接' }}</h3>
                    <button class="close-btn" @click="handleClose">×</button>
                </div>

                <div class="dialog-body">
                    <form @submit.prevent="handleSave">
                        <div class="form-item">
                            <label class="required">链接名称</label>
                            <input v-model="formData.name" type="text" placeholder="请输入链接名称" required />
                            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
                        </div>

                        <div class="form-item">
                            <label class="required">链接地址</label>
                            <input v-model="formData.path" type="url" placeholder="请输入URL" required />
                            <span v-if="errors.path" class="error-text">{{ errors.path }}</span>
                        </div>

                        <div class="form-item">
                            <label>备注</label>
                            <input v-model="formData.remark" type="text" placeholder="备注" />
                        </div>
                    </form>
                </div>

                <div class="dialog-footer">
                    <button type="button" class="btn btn-default" @click="handleClose">取消</button>
                    <button type="button" class="btn btn-primary" @click="handleSave" :disabled="loading">
                        {{ loading ? '保存中...' : '确认' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'LinkEditDialog',
    props: {
        visible: Boolean,
        linkData: Object
    },
    emits: ['save', 'close'],
    data() {
        return {
            loading: false,
            errors: {},
            formData: {
                id: null,
                name: '',
                path: '',
                remark: ''
            }
        }
    },
    watch: {
        linkData: {
            handler(newVal) {
                if (newVal) {
                    this.formData = { ...newVal }
                } else {
                    this.resetForm()
                }
            },
            immediate: true
        },
        visible(newVal) {
            if (newVal) {
                this.errors = {}
                // 阻止背景滚动
                document.body.style.overflow = 'hidden'
            } else {
                // 恢复背景滚动
                document.body.style.overflow = ''
            }
        }
    },
    methods: {
        resetForm() {
            this.formData = {
                id: null,
                name: '',
                path: '',
                remark: ''
            }
            this.errors = {}
        },

        validateForm() {
            this.errors = {}
            let isValid = true

            if (!this.formData.name || !this.formData.name.trim()) {
                this.errors.name = '请输入链接名称'
                isValid = false
            }

            if (!this.formData.path || !this.formData.path.trim()) {
                this.errors.path = '请输入链接地址'
                isValid = false
            } else if (!this.isValidUrl(this.formData.path)) {
                this.errors.path = '请输入正确的URL格式'
                isValid = false
            }

            return isValid
        },

        isValidUrl(url) {
            try {
                new URL(url)
                return true
            } catch {
                return false
            }
        },

        handleClose() {
            this.$emit('close')
            this.resetForm()
        },

        async handleSave() {
            if (!this.validateForm()) {
                return
            }

            this.loading = true
            try {
                // const url = this.formData.id ? `/api/links/${this.formData.id}` : '/api/links'
                // const method = this.formData.id ? 'put' : 'post'
                // await this.$http[method](url, this.formData)

                console.log('保存链接:', this.formData)
                this.$emit('save', this.formData)
                this.handleClose()
            } catch {
                alert('保存失败')
            } finally {
                this.loading = false
            }
        }
    },
    beforeUnmount() {
        // 组件销毁时恢复滚动
        document.body.style.overflow = ''
    }
}
</script>

<style scoped>
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.dialog-container {
    background: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 4px 20px var(--shadow-color);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.dialog-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dialog-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color);
}

.close-btn {
    background: none;
    border: none;
    font-size: 28px;
    line-height: 1;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: var(--transition);
}

.close-btn:hover {
    background: var(--hover-bg);
    color: var(--text-color);
}

.dialog-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
}

.form-item {
    margin-bottom: 20px;
}

.form-item:last-child {
    margin-bottom: 0;
}

.form-item label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-color);
    font-size: 14px;
}

.form-item label.required::before {
    content: '*';
    color: #dc3545;
    margin-right: 4px;
}

.form-item input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    background: var(--card-bg);
    color: var(--text-color);
    transition: var(--transition);
    box-sizing: border-box;
}

.form-item input:focus {
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

.dialog-footer {
    padding: 15px 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition);
    border: 1px solid transparent;
}

.btn-default {
    background: var(--button-bg);
    color: var(--text-color);
    border-color: var(--border-color);
}

.btn-default:hover {
    background: var(--hover-bg);
}

.btn-primary {
    background: var(--primary-color);
    color: var(--text-on-primary);
    border: none;
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* 动画效果 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
    transition: opacity 0.3s ease;
}

.dialog-fade-enter-active .dialog-container,
.dialog-fade-leave-active .dialog-container {
    transition: transform 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
    opacity: 0;
}

.dialog-fade-enter-from .dialog-container,
.dialog-fade-leave-to .dialog-container {
    transform: scale(0.9);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .dialog-overlay {
        padding: 10px;
    }

    .dialog-container {
        max-width: 100%;
    }

    .dialog-header {
        padding: 15px;
    }

    .dialog-header h3 {
        font-size: 16px;
    }

    .dialog-body {
        padding: 15px;
    }

    .dialog-footer {
        padding: 12px 15px;
        flex-direction: column-reverse;
    }

    .btn {
        width: 100%;
    }
}
</style>
