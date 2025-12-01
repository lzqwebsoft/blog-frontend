<template>
    <div class="login-wrapper">
        <div class="login-card">
            <div class="login-header">
                <h2>博主登录</h2>
                <p>请输入您的账号信息进行登录</p>
            </div>

            <!-- 错误提示 -->
            <div v-if="loginErrors.length > 0" class="alert alert-danger">
                <ul class="error-list">
                    <li v-for="error in loginErrors" :key="error">{{ error }}</li>
                </ul>
            </div>

            <!-- 登录表单 -->
            <form @submit.prevent="handleSubmit" class="login-form">
                <!-- 用户名输入 -->
                <div class="form-group">
                    <div class="input-group">
                        <span class="input-icon">
                            <font-awesome-icon icon="user" />
                        </span>
                        <input v-model="formData.userName" type="text" class="form-control" placeholder="请输入账号" required
                            autofocus @focus="clearError('userName')" />
                    </div>
                    <div v-if="fieldErrors.userName" class="field-error">{{ fieldErrors.userName }}</div>
                </div>

                <!-- 密码输入 -->
                <div class="form-group">
                    <div class="input-group">
                        <span class="input-icon">
                            <font-awesome-icon icon="lock" />
                        </span>
                        <input v-model="formData.password" :type="showPassword ? 'text' : 'password'"
                            class="form-control" placeholder="请输入密码" required @focus="clearError('password')" />
                        <span class="password-toggle" @click="showPassword = !showPassword">
                            <font-awesome-icon :icon="showPassword ? 'eye' : 'eye-slash'" />
                        </span>
                    </div>
                    <div v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</div>
                </div>

                <!-- 验证码区域（错误登录次数≥3时显示） -->
                <div v-if="errorLoginCount >= 3" class="form-group captcha-section">
                    <div class="input-group">
                        <span class="input-icon">
                            <font-awesome-icon icon="shield-halved" />
                        </span>
                        <input v-model="formData.captchaCode" type="text" class="form-control" placeholder="请输入验证码"
                            required @focus="clearError('captchaCode')" />
                    </div>
                    <div class="captcha-display">
                        <div class="captcha-image" @click="refreshCaptcha">
                            <div v-if="captchaLoading" class="captcha-loading">
                                <div class="spinner"></div>
                            </div>
                            <img v-else :src="captchaImageSrc" alt="验证码" title="点击刷新验证码" />
                        </div>
                        <button type="button" class="refresh-btn" @click="refreshCaptcha">
                            看不清，换一张
                        </button>
                    </div>
                    <div v-if="fieldErrors.captchaCode" class="field-error">{{ fieldErrors.captchaCode }}</div>
                </div>

                <!-- 忘记密码链接 -->
                <div class="form-group forgot-password">
                    <router-link to="/forget_pwd" class="forgot-link">忘记密码？</router-link>
                </div>

                <!-- 提交按钮 -->
                <button type="submit" class="submit-btn" :disabled="isSubmitting">
                    <span v-if="isSubmitting">
                        <span class="spinner-btn"></span> 登录中...
                    </span>
                    <span v-else>登 录</span>
                </button>

                <!-- 登录状态提示 -->
                <div v-if="errorLoginCount > 0 && errorLoginCount < 3" class="login-attempts">
                    <p class="warning-text">
                        登录失败 {{ errorLoginCount }} 次，失败 {{ 3 - errorLoginCount }} 次后将需要验证码
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { signIn, getCaptcha } from '@/api/user'
import { saveAuthData } from '@/utils/auth'

export default {
    name: 'LoginView',
    data() {
        return {
            formData: {
                userName: '',
                password: '',
                captchaCode: ''
            },
            captchaID: '',
            captchaImageSrc: '',
            captchaLoading: false,
            showPassword: false,
            isSubmitting: false,
            errorLoginCount: 0,
            fieldErrors: {
                userName: '',
                password: '',
                captchaCode: ''
            },
            loginErrors: []
        }
    },
    mounted() {
        const savedCount = localStorage.getItem('login_error_count')
        if (savedCount) {
            this.errorLoginCount = parseInt(savedCount, 10)
            if (this.errorLoginCount >= 3) {
                this.refreshCaptcha()
            }
        }
    },
    methods: {
        async refreshCaptcha() {
            if (this.captchaLoading) return

            this.captchaLoading = true
            try {
                const res = await getCaptcha()
                this.captchaImageSrc = res.data.captcha
                this.captchaID = res.data.captcha_id
            } catch (error) {
                console.error('获取验证码失败:', error)
            } finally {
                this.captchaLoading = false
            }
        },

        clearError(fieldName) {
            this.fieldErrors[fieldName] = ''
            const index = this.loginErrors.findIndex((err) => err.includes(fieldName))
            if (index !== -1) {
                this.loginErrors.splice(index, 1)
            }
        },

        validateForm() {
            let isValid = true

            this.fieldErrors = { userName: '', password: '', captchaCode: '' }
            this.loginErrors = []

            if (!this.formData.userName.trim()) {
                this.fieldErrors.userName = '用户名不能为空'
                this.loginErrors.push('用户名不能为空')
                isValid = false
            } else if (this.formData.userName.length < 3) {
                this.fieldErrors.userName = '用户名至少3个字符'
                this.loginErrors.push('用户名至少3个字符')
                isValid = false
            }

            if (!this.formData.password) {
                this.fieldErrors.password = '密码不能为空'
                this.loginErrors.push('密码不能为空')
                isValid = false
            } else if (this.formData.password.length < 6) {
                this.fieldErrors.password = '密码至少6个字符'
                this.loginErrors.push('密码至少6个字符')
                isValid = false
            }

            if (this.errorLoginCount >= 3 && !this.formData.captchaCode) {
                this.fieldErrors.captchaCode = '验证码不能为空'
                this.loginErrors.push('验证码不能为空')
                isValid = false
            }

            return isValid
        },

        async handleSubmit() {
            if (!this.validateForm()) return

            this.isSubmitting = true
            this.loginErrors = []

            try {
                const loginData = {
                    userName: this.formData.userName,
                    password: this.formData.password
                }

                if (this.errorLoginCount >= 3) {
                    loginData.captchaCode = this.formData.captchaCode
                    loginData.captchaID = this.captchaID
                }

                const res = await signIn(loginData)

                saveAuthData(res.data)

                this.errorLoginCount = 0
                localStorage.removeItem('login_error_count')

                const redirect = this.$route.query.redirect || '/'
                this.$router.push(redirect)
            } catch (error) {
                this.errorLoginCount++
                localStorage.setItem('login_error_count', this.errorLoginCount.toString())

                this.loginErrors.push(error.message || '用户名或密码错误，请检查您的登录信息')

                if (this.errorLoginCount >= 3) {
                    this.refreshCaptcha()
                }
            } finally {
                this.isSubmitting = false
            }
        }
    }
}
</script>

<style scoped>
.login-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 15px;
}

.login-card {
    background-color: var(--card-bg);
    border-radius: 16px;
    box-shadow: 0 4px 20px var(--shadow-color);
    padding: 40px;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    transition: var(--transition);
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-header h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    color: var(--text-color);
    font-weight: 600;
    transition: color 0.3s ease;
}

.login-header p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    transition: color 0.3s ease;
}

/* 表单样式 */
.login-form {
    width: 100%;
}

.form-group {
    margin-bottom: 20px;
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

.password-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background-color: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    flex-shrink: 0;
    transition: color 0.3s ease;
    font-size: 18px;
}

.password-toggle:hover {
    color: var(--primary-color);
}

.field-error {
    color: #f44336;
    font-size: 13px;
    margin-top: 5px;
    margin-left: 5px;
}

/* 验证码区域 */
.captcha-section {
    background-color: var(--hover-bg);
    padding: 20px;
    border-radius: 8px;
    margin-top: 25px;
    transition: background-color 0.3s ease;
}

.captcha-display {
    display: flex;
    align-items: center;
    margin-top: 15px;
    flex-wrap: wrap;
    gap: 10px;
}

.captcha-image {
    width: 150px;
    height: 50px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.3s ease;
}

.captcha-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.captcha-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(59, 130, 246, 0.2);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.refresh-btn {
    background-color: transparent;
    border: none;
    color: var(--primary-color);
    font-size: 14px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.refresh-btn:hover {
    background-color: var(--hover-bg);
}

/* 忘记密码链接 */
.forgot-password {
    text-align: right;
    margin-top: 10px;
}

.forgot-link {
    color: var(--link-color);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s;
}

.forgot-link:hover {
    color: var(--primary-hover);
    text-decoration: underline;
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

/* 错误提示 */
.alert-danger {
    background-color: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    color: #f44336;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.error-list {
    margin: 0;
    padding-left: 20px;
}

.error-list li {
    margin-bottom: 5px;
}

/* 登录尝试提示 */
.login-attempts {
    margin-top: 20px;
    text-align: center;
}

.warning-text {
    color: #ff9800;
    font-size: 14px;
    margin: 0;
    padding: 10px;
    background-color: rgba(255, 152, 0, 0.1);
    border-radius: 6px;
}

/* 响应式设计 - 小屏模式 */
@media (max-width: 768px) {
    .login-wrapper {
        padding: 0 10px;
        margin: 1rem auto;
    }

    .login-card {
        padding: 30px 20px;
        border-radius: 12px;
        max-width: 100%;
    }

    .login-header h2 {
        font-size: 24px;
    }

    .input-icon,
    .password-toggle {
        width: 45px;
        height: 45px;
    }

    .form-control {
        padding: 12px;
        font-size: 15px;
    }
}

@media (max-width: 576px) {
    .login-wrapper {
        padding: 0 10px;
        margin: 1rem auto;
    }

    .login-card {
        padding: 25px 15px;
        box-shadow: 0 2px 10px var(--shadow-color);
    }

    .login-header h2 {
        font-size: 22px;
    }

    .captcha-display {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .captcha-image {
        width: 100%;
        max-width: 200px;
    }

    .refresh-btn {
        margin-left: 0;
        width: 100%;
        max-width: 200px;
    }

    .submit-btn {
        padding: 14px;
        font-size: 15px;
    }
}
</style>
