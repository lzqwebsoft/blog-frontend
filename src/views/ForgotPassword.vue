<template>
    <div class="forgot-password-wrapper">
        <div class="forgot-password-card">
            <div class="forgot-password-header">
                <h2>找回密码</h2>
                <p>请输入您的注册邮箱，我们将发送密码重置链接到您的邮箱</p>
            </div>

            <!-- 错误提示 -->
            <div v-if="errorInfo" class="alert alert-danger">
                {{ errorInfo }}
            </div>

            <!-- 成功提示 -->
            <div v-if="successInfo" class="alert alert-success">
                {{ successInfo }}
            </div>

            <!-- 找回密码表单 -->
            <form @submit.prevent="handleSubmit" class="forgot-password-form">
                <!-- 邮箱输入 -->
                <div class="form-group">
                    <label for="email" class="form-label">邮箱地址</label>
                    <div class="input-group">
                        <span class="input-icon">
                            <font-awesome-icon icon="envelope" />
                        </span>
                        <input v-model="formData.email" type="email" id="email" class="form-control"
                            placeholder="请输入您的注册邮箱" required autofocus @focus="clearMessages" />
                    </div>
                    <div v-if="fieldError" class="field-error">{{ fieldError }}</div>
                </div>

                <!-- 提交按钮 -->
                <button type="submit" class="submit-btn" :disabled="isSubmitting">
                    <span v-if="isSubmitting">
                        <span class="spinner-btn"></span> 发送中...
                    </span>
                    <span v-else>确定</span>
                </button>

                <!-- 返回登录链接 -->
                <div class="back-to-login">
                    <router-link to="/login" class="back-link">
                        <font-awesome-icon icon="arrow-left" />
                        返回登录
                    </router-link>
                </div>
            </form>

            <!-- 提示信息 -->
            <div class="info-section">
                <h4>温馨提示</h4>
                <ul class="info-list">
                    <li>请确保输入的邮箱地址是您注册时使用的邮箱</li>
                    <li>密码重置链接将在24小时内有效</li>
                    <li>如果未收到邮件，请检查垃圾邮件箱</li>
                    <li>如有问题，请联系管理员</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { foundPwd } from '@/api/user'

export default {
    name: 'ForgotPasswordView',
    data() {
        return {
            formData: {
                email: ''
            },
            fieldError: '',
            errorInfo: '',
            successInfo: '',
            isSubmitting: false
        }
    },
    methods: {
        clearMessages() {
            this.fieldError = ''
            this.errorInfo = ''
            this.successInfo = ''
        },

        validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailRegex.test(email)
        },

        validateForm() {
            this.clearMessages()
            let isValid = true

            // 邮箱验证
            if (!this.formData.email.trim()) {
                this.fieldError = '邮箱地址不能为空'
                this.errorInfo = '请输入您的邮箱地址'
                isValid = false
            } else if (!this.validateEmail(this.formData.email)) {
                this.fieldError = '请输入有效的邮箱地址'
                this.errorInfo = '邮箱格式不正确'
                isValid = false
            }

            return isValid
        },

        async handleSubmit() {
            // 表单验证
            if (!this.validateForm()) {
                return
            }

            this.isSubmitting = true
            this.clearMessages()

            try {
                // API调用
                await foundPwd(this.formData.email)

                // 跳转到成功提示页面，并传递邮箱参数
                this.$router.push({
                    path: '/found_pwd',
                    query: { email: this.formData.email }
                })

            } catch (err) {
                console.error('Forgot password error:', err)

                // 显示错误消息
                if (err.message) {
                    this.errorInfo = err.message
                } else {
                    this.errorInfo = '发送失败，请检查邮箱地址是否正确或稍后重试'
                }

            } finally {
                this.isSubmitting = false
            }
        }
    }
}
</script>

<style scoped>
.forgot-password-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 15px;
}

.forgot-password-card {
    background-color: var(--card-bg);
    border-radius: 16px;
    box-shadow: 0 4px 20px var(--shadow-color);
    padding: 40px;
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    transition: var(--transition);
}

.forgot-password-header {
    text-align: center;
    margin-bottom: 30px;
}

.forgot-password-header h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    color: var(--text-color);
    font-weight: 600;
    transition: color 0.3s ease;
}

.forgot-password-header p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.6;
    transition: color 0.3s ease;
}

/* 表单样式 */
.forgot-password-form {
    width: 100%;
}

.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-color);
    font-size: 14px;
    font-weight: 500;
    transition: color 0.3s ease;
}

.input-group {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    transition: border-color 0.3s, box-shadow 0.3s;
    background-color: var(--card-bg);
}

.input-group:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background-color: var(--hover-bg);
    color: var(--text-secondary);
    flex-shrink: 0;
    transition: background-color 0.3s ease;
    font-size: 18px;
}

.form-control {
    flex: 1;
    border: none;
    outline: none;
    padding: 15px;
    font-size: 16px;
    background: transparent;
    color: var(--text-color);
    transition: color 0.3s ease;
}

.form-control::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
}

input.form-control:focus {
    outline: none;
    box-shadow: none;
}

.field-error {
    color: #f44336;
    font-size: 13px;
    margin-top: 5px;
    margin-left: 5px;
}

/* 提交按钮 */
.submit-btn {
    width: 100%;
    background-color: var(--primary-color);
    color: var(--text-on-primary);
    border: none;
    border-radius: 8px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
    margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
}

.submit-btn:active:not(:disabled) {
    transform: translateY(0);
}

.submit-btn:disabled {
    background-color: var(--button-disable-color);
    cursor: not-allowed;
    opacity: 0.7;
}

.spinner-btn {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 返回登录链接 */
.back-to-login {
    text-align: center;
    margin-top: 20px;
}

.back-link {
    color: var(--link-color);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.back-link:hover {
    color: var(--primary-hover);
    text-decoration: underline;
}

/* 错误和成功提示 */
.alert-danger {
    background-color: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    color: #f44336;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    font-size: 14px;
}

.alert-success {
    background-color: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
    color: #4caf50;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    font-size: 14px;
}

/* 提示信息区域 */
.info-section {
    margin-top: 30px;
    padding: 20px;
    background-color: var(--hover-bg);
    border-radius: 8px;
    transition: background-color 0.3s ease;
}

.info-section h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: var(--text-color);
    font-weight: 600;
    transition: color 0.3s ease;
}

.info-list {
    margin: 0;
    padding-left: 20px;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.8;
}

.info-list li {
    margin-bottom: 6px;
}

/* 响应式设计 - 小屏模式 */
@media (max-width: 768px) {
    .forgot-password-wrapper {
        padding: 0 10px;
        margin: 1rem auto;
    }

    .forgot-password-card {
        padding: 30px 20px;
        border-radius: 12px;
        max-width: 100%;
    }

    .forgot-password-header h2 {
        font-size: 24px;
    }

    .forgot-password-header p {
        font-size: 13px;
    }

    .input-icon {
        width: 45px;
        height: 45px;
    }

    .form-control {
        padding: 12px;
        font-size: 15px;
    }

    .info-section {
        padding: 15px;
    }

    .info-section h4 {
        font-size: 15px;
    }

    .info-list {
        font-size: 12px;
    }
}

@media (max-width: 576px) {
    .forgot-password-wrapper {
        padding: 0 10px;
        margin: 1rem auto;
    }

    .forgot-password-card {
        padding: 25px 15px;
        box-shadow: 0 2px 10px var(--shadow-color);
    }

    .forgot-password-header h2 {
        font-size: 22px;
    }

    .forgot-password-header p {
        font-size: 12px;
    }

    .submit-btn {
        padding: 14px;
        font-size: 15px;
    }

    .info-section {
        padding: 12px;
        margin-top: 20px;
    }
}
</style>
