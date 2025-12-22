<template>
    <div class="page-container">
        <div class="main-column">
            <!-- 页面标题 -->
            <div class="page-header">
                <h1 class="page-title">修改密码</h1>
                <p class="page-desc">建议定期更换密码，以保障您的账户安全</p>
            </div>

            <!-- 主内容卡片 -->
            <div class="password-card card-style">
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
                            <input :type="showNewPassword ? 'text' : 'password'" v-model="form.newPassword"
                                id="newPassword" class="form-control" placeholder="请输入新密码（至少6位）" required />
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
                        <button type="submit" class="action-btn submit-btn" :disabled="submitting || !isFormValid">
                            <font-awesome-icon v-if="submitting" icon="spinner" spin />
                            <font-awesome-icon v-else icon="circle-check" />
                            {{ submitting ? '提交中...' : '确定修改' }}
                        </button>
                        <button type="button" class="action-btn cancel-btn" @click="handleCancel"
                            :disabled="submitting">
                            <font-awesome-icon icon="xmark" />
                            取消
                        </button>
                    </div>
                </form>
            </div>

            <!-- 安全提示 -->
            <div class="security-tips card-style">
                <h3 class="sidebar-title">
                    <font-awesome-icon icon="lightbulb" class="sidebar-icon" />
                    密码安全建议
                </h3>
                <ul class="tips-list">
                    <li>
                        <span class="dot"></span>
                        密码长度至少6位，建议8位以上
                    </li>
                    <li>
                        <span class="dot"></span>
                        包含大小写字母、数字和特殊字符
                    </li>
                    <li>
                        <span class="dot"></span>
                        不要使用生日、电话等容易被猜到的信息
                    </li>
                    <li>
                        <span class="dot"></span>
                        定期更换密码，保护账户安全
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { changePassword } from '@/api/user'

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
                await changePassword({
                    password: this.form.password,
                    newPassword: this.form.newPassword,
                    confirmPassword: this.form.confirmPassword
                })

                this.successMessage = '修改成功，下次登录后生效'

                // 清空表单
                this.form = {
                    password: '',
                    newPassword: '',
                    confirmPassword: ''
                }
            } catch (error) {
                this.errorMessage = error.message || '密码修改失败'
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
/* Page Layout aligned with Index.vue */
.page-container {
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    max-width: 1750px;
    padding: 2rem 1rem;
    display: flex;
    justify-content: center;
}

.main-column {
    flex-grow: 1;
    max-width: 800px;
}

/* Page Header Styling */
.page-header {
    margin-bottom: 2rem;
    padding-left: 0.5rem;
}

.page-title {
    font-family: var(--font-serif);
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 0.5rem;
    letter-spacing: -0.025em;
}

.page-desc {
    color: var(--text-secondary);
    font-size: 1rem;
}

/* Card Styling synchronized with Index.vue cards */
.card-style {
    background-color: var(--card-bg);
    border-radius: 0.75rem;
    padding: 2rem;
    box-shadow: var(--shadow-color) 0px 4px 20px -2px;
    border: 1px solid transparent;
    margin-bottom: 2rem;
    transition: box-shadow 0.3s ease;
}

:root.dark-theme .card-style {
    border-color: var(--border-color);
}

.card-style:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Message Alert Styling */
.message-alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
    border: 1px solid transparent;
}

.message-alert.error {
    background-color: rgba(220, 53, 69, 0.1);
    border-color: rgba(220, 53, 69, 0.2);
    color: #dc3545;
}

.message-alert.success {
    background-color: rgba(22, 163, 74, 0.1);
    border-color: rgba(22, 163, 74, 0.2);
    color: #16a34a;
}

.message-icon {
    font-size: 1.1rem;
}

.message-content {
    flex: 1;
    line-height: 1.5;
}

.message-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
    padding: 0.25rem;
}

.message-close:hover {
    opacity: 1;
}

/* Form Styling */
.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.6rem;
    font-weight: 500;
    color: var(--text-color);
    font-size: 0.95rem;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.form-control {
    width: 100%;
    padding: 0.75rem 3rem 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    background-color: var(--bg-color);
    color: var(--text-color);
    font-size: 1rem;
    transition: all 0.3s;
}

.form-control:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Toggle Password Icon */
.toggle-password {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    font-size: 1.1rem;
    transition: color 0.2s;
}

.toggle-password:hover {
    color: var(--primary-color);
}

/* Password Strength Indicator */
.password-strength {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.strength-bar {
    flex: 1;
    height: 6px;
    background: var(--hover-bg);
    border-radius: 3px;
    overflow: hidden;
}

.strength-fill {
    height: 100%;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.strength-fill.weak {
    background-color: #ef4444;
}

.strength-fill.medium {
    background-color: #f59e0b;
}

.strength-fill.strong {
    background-color: #22c55e;
}

.strength-text {
    font-size: 0.875rem;
    font-weight: 600;
    min-width: 40px;
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

/* Field Hints */
.field-hint {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.field-hint.error {
    color: #dc3545;
}

.field-hint.success {
    color: #16a34a;
}

/* Actions & Buttons aligned with Index/Show styles */
.form-actions {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 1.25rem;
    justify-content: flex-end;
}

.action-btn {
    font-size: 1rem;
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-btn {
    background-color: var(--primary-color);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.submit-btn:hover:not(:disabled) {
    background-color: var(--primary-hover, #2563eb);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
}

.cancel-btn {
    background-color: var(--hover-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

.cancel-btn:hover:not(:disabled) {
    background-color: #e5e7eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
}

:root.dark-theme .cancel-btn:hover:not(:disabled) {
    background-color: #374151;
}

.cancel-btn:active {
    transform: translateY(0);
}

/* Security Tips aligned with Sidebar Style */
.sidebar-title {
    font-family: var(--font-serif);
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--text-color);
    margin-bottom: 1.5rem;
    padding-bottom: 0.8rem;
    border-bottom: 2px solid var(--text-secondary);
    display: flex;
    align-items: center;
}

.sidebar-icon {
    margin-right: 0.6rem;
    color: #f59e0b;
}

.tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.tips-list li {
    color: var(--text-secondary);
    font-size: 0.95rem;
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    line-height: 1.6;
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--primary-color);
    flex-shrink: 0;
}

/* Transitions */
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

/* Responsive adjustments */
@media (max-width: 768px) {
    .page-container {
        padding: 1rem;
    }

    .card-style {
        padding: 1.5rem;
    }

    .page-title {
        font-size: 1.75rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>
