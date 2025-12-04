<template>
    <div class="change-password-page container">
        <!-- 页面标题 -->
        <div class="page-header">
            <h2>修改密码</h2>
        </div>

        <!-- 主内容卡片 -->
        <div class="password-card">
            <!-- 消息提示区域 -->
            <transition name="slide-fade">
                <div v-if="errorMessage" class="message-alert error">
                    <div class="message-icon">
                        <font-awesome-icon icon="circle-exclamation" />
                    </div>
                    <div class="message-content">{{ errorMessage }}</div>
                    <button class="message-close" @click="errorMessage = ''">
                        <font-awesome-icon icon="xmark" />
                    </button>
                </div>
            </transition>

            <transition name="slide-fade">
                <div v-if="successMessage" class="message-alert success">
                    <div class="message-icon">
                        <font-awesome-icon icon="circle-check" />
                    </div>
                    <div class="message-content">{{ successMessage }}</div>
                    <button class="message-close" @click="successMessage = ''">
                        <font-awesome-icon icon="xmark" />
                    </button>
                </div>
            </transition>

            <!-- 修改密码表单 -->
            <form @submit.prevent="handleSubmit" class="password-form">
                <div class="form-group">
                    <label for="password">当前密码</label>
                    <div class="input-wrapper">
                        <input :type="showPassword ? 'text' : 'password'" v-model="form.password" id="password"
                            class="form-control" placeholder="请输入当前密码" required autofocus />
                        <button type="button" class="toggle-password" @click="showPassword = !showPassword"
                            tabindex="-1">
                            <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" />
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label for="newPassword">新密码</label>
                    <div class="input-wrapper">
                        <input :type="showNewPassword ? 'text' : 'password'" v-model="form.newPassword" id="newPassword"
                            class="form-control" placeholder="请输入新密码（至少6位）" required />
                        <button type="button" class="toggle-password" @click="showNewPassword = !showNewPassword"
                            tabindex="-1">
                            <font-awesome-icon :icon="showNewPassword ? 'eye-slash' : 'eye'" />
                        </button>
                    </div>
                    <div class="password-strength" v-if="form.newPassword">
                        <div class="strength-bar">
                            <div class="strength-fill" :class="passwordStrength.level"
                                :style="{ width: passwordStrength.width }"></div>
                        </div>
                        <span class="strength-text" :class="passwordStrength.level">
                            {{ passwordStrength.text }}
                        </span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">确认新密码</label>
                    <div class="input-wrapper">
                        <input :type="showConfirmPassword ? 'text' : 'password'" v-model="form.confirmPassword"
                            id="confirmPassword" class="form-control" placeholder="请再次输入新密码" required />
                        <button type="button" class="toggle-password"
                            @click="showConfirmPassword = !showConfirmPassword" tabindex="-1">
                            <font-awesome-icon :icon="showConfirmPassword ? 'eye-slash' : 'eye'" />
                        </button>
                    </div>
                    <div v-if="form.confirmPassword && form.newPassword !== form.confirmPassword"
                        class="field-hint error">
                        <font-awesome-icon icon="triangle-exclamation" />
                        两次输入的密码不一致
                    </div>
                    <div v-else-if="form.confirmPassword && form.newPassword === form.confirmPassword"
                        class="field-hint success">
                        <font-awesome-icon icon="circle-check" />
                        密码匹配
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary" :disabled="submitting || !isFormValid">
                        <font-awesome-icon v-if="submitting" icon="spinner" spin />
                        {{ submitting ? '提交中...' : '确定修改' }}
                    </button>
                    <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="submitting">
                        取消
                    </button>
                </div>
            </form>
        </div>

        <!-- 安全提示 -->
        <div class="security-tips">
            <h3>
                <font-awesome-icon icon="lightbulb" />
                密码安全建议
            </h3>
            <ul>
                <li>密码长度至少6位，建议8位以上</li>
                <li>包含大小写字母、数字和特殊字符</li>
                <li>不要使用生日、电话等容易被猜到的信息</li>
                <li>定期更换密码，保护账户安全</li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ChangePassword',
    data() {
        return {
            form: {
                password: '',
                newPassword: '',
                confirmPassword: ''
            },
            showPassword: false,
            showNewPassword: false,
            showConfirmPassword: false,
            submitting: false,
            errorMessage: '',
            successMessage: ''
        }
    },
    computed: {
        isFormValid() {
            return (
                this.form.password.trim() &&
                this.form.newPassword.trim().length >= 6 &&
                this.form.confirmPassword.trim() &&
                this.form.newPassword === this.form.confirmPassword
            )
        },
        passwordStrength() {
            const password = this.form.newPassword
            if (!password) return { level: '', width: '0%', text: '' }

            let strength = 0
            const checks = {
                length: password.length >= 8,
                lowercase: /[a-z]/.test(password),
                uppercase: /[A-Z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[^A-Za-z0-9]/.test(password)
            }

            strength = Object.values(checks).filter(Boolean).length

            if (strength <= 2) {
                return { level: 'weak', width: '33%', text: '弱' }
            } else if (strength <= 3) {
                return { level: 'medium', width: '66%', text: '中等' }
            } else {
                return { level: 'strong', width: '100%', text: '强' }
            }
        }
    },
    methods: {
        validateForm() {
            this.errorMessage = ''

            if (!this.form.password.trim()) {
                this.errorMessage = '请输入当前密码'
                return false
            }

            if (!this.form.newPassword.trim()) {
                this.errorMessage = '请输入新密码'
                return false
            }

            if (this.form.newPassword.length < 6) {
                this.errorMessage = '新密码长度至少为6位'
                return false
            }

            if (this.form.password === this.form.newPassword) {
                this.errorMessage = '新密码不能与当前密码相同'
                return false
            }

            if (!this.form.confirmPassword.trim()) {
                this.errorMessage = '请确认新密码'
                return false
            }

            if (this.form.newPassword !== this.form.confirmPassword) {
                this.errorMessage = '两次输入的密码不一致'
                return false
            }

            return true
        },

        async handleSubmit() {
            if (!this.validateForm()) {
                return
            }

            this.submitting = true
            this.errorMessage = ''
            this.successMessage = ''

            try {
                // 模拟API调用
                console.log('提交修改密码请求:', {
                    password: this.form.password,
                    newPassword: this.form.newPassword
                })

                // 这里应该调用实际的API
                // await this.$api.user.changePassword({
                //     password: this.form.password,
                //     newPassword: this.form.newPassword
                // })

                // 模拟延迟
                await new Promise(resolve => setTimeout(resolve, 1000))

                this.successMessage = '密码修改成功！即将跳转到登录页面...'

                // 清空表单
                this.form = {
                    password: '',
                    newPassword: '',
                    confirmPassword: ''
                }

                // 跳转到登录页面
                setTimeout(() => {
                    this.$router.push('/login')
                }, 2000)

            } catch (error) {
                this.errorMessage = error.message || '密码修改失败，请检查当前密码是否正确'
                console.error('修改密码失败:', error)
            } finally {
                this.submitting = false
            }
        },

        handleCancel() {
            // 返回上一页或首页
            if (window.history.length > 1) {
                this.$router.go(-1)
            } else {
                this.$router.push('/')
            }
        }
    }
}
</script>

<style scoped>
.change-password-page {
    margin: 20px auto;
    max-width: 800px;
}

.page-header {
    margin-bottom: 1.5rem;
}

.page-header h2 {
    color: var(--text-color);
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0;
}

.password-card {
    background: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 4px 20px var(--shadow-color);
    padding: 2rem;
    margin-bottom: 2rem;
}

/* 消息提示样式 */
.message-alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-bottom: 1.25rem;
    border: 1px solid;
}

.message-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
}

.message-content {
    flex: 1;
    line-height: 1.5;
}

.message-close {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
    padding: 0.25rem;
    color: inherit;
}

.message-close:hover {
    opacity: 1;
}

.message-alert.error {
    background: #fef2f2;
    border-color: #fecaca;
    color: #991b1b;
}

.message-alert.error .message-icon {
    color: #dc2626;
}

.message-alert.success {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;
}

.message-alert.success .message-icon {
    color: #16a34a;
}

:root.dark-theme .message-alert.error {
    background: rgba(220, 38, 38, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
}

:root.dark-theme .message-alert.success {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
    color: #86efac;
}

/* 表单样式 */
.password-form {
    margin: 0;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color);
    font-size: 0.9rem;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.form-control {
    width: 100%;
    padding: 0.75rem 3rem 0.75rem 0.875rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background-color: var(--bg-color);
    color: var(--text-color);
    font-size: 0.95rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.toggle-password {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    font-size: 1rem;
    transition: color 0.2s;
}

.toggle-password:hover {
    color: #007bff;
}

/* 密码强度指示器 */
.password-strength {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.strength-bar {
    flex: 1;
    height: 4px;
    background: var(--border-color);
    border-radius: 2px;
    overflow: hidden;
}

.strength-fill {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 2px;
}

.strength-fill.weak {
    background: #ef4444;
}

.strength-fill.medium {
    background: #f59e0b;
}

.strength-fill.strong {
    background: #22c55e;
}

.strength-text {
    font-size: 0.8125rem;
    font-weight: 500;
    min-width: 35px;
}

.strength-text.weak {
    color: #ef4444;
}

.strength-text.medium {
    color: #f59e0b;
}

.strength-text.strong {
    color: #22c55e;
}

/* 字段验证提示 */
.field-hint {
    margin-top: 0.375rem;
    font-size: 0.8125rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
}

.field-hint.error {
    color: #dc2626;
}

.field-hint.success {
    color: #16a34a;
}

/* 按钮样式 */
.form-actions {
    margin-top: 1.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 0.75rem;
}

.btn {
    padding: 0.625rem 1.5rem;
    border-radius: 4px;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-primary {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
    background: #0056b3;
    border-color: #0056b3;
}

.btn-primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.btn-secondary {
    background: transparent;
    color: var(--text-color);
    border-color: var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
    background: var(--hover-bg);
}

/* 安全提示 */
.security-tips {
    background: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow-color);
    padding: 1.5rem 2rem;
}

.security-tips h3 {
    color: var(--text-color);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.security-tips h3 svg {
    color: #f59e0b;
}

.security-tips ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.security-tips li {
    color: var(--text-secondary);
    font-size: 0.875rem;
    padding: 0.375rem 0;
    padding-left: 1.25rem;
    position: relative;
    line-height: 1.6;
}

.security-tips li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #007bff;
    font-weight: bold;
}

/* 动画 */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
    transform: translateY(-10px);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateY(-5px);
    opacity: 0;
}

@keyframes slideIn {
    from {
        transform: translateY(-10px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .change-password-page {
        margin: 10px;
    }

    .password-card,
    .security-tips {
        padding: 1.5rem;
    }

    .page-header h2 {
        font-size: 1.5rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}

@media (max-width: 480px) {

    .password-card,
    .security-tips {
        padding: 1.25rem;
    }

    .page-header h2 {
        font-size: 1.35rem;
    }

    .form-control {
        padding: 0.625rem 2.75rem 0.625rem 0.75rem;
        font-size: 0.9rem;
    }

    .security-tips li {
        font-size: 0.8125rem;
    }
}
</style>
