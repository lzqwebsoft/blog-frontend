<template>
    <div class="reset-password-wrapper">
        <div class="reset-password-card">
            <div class="reset-password-header">
                <h2>重置密码</h2>
                <p>请输入您的新密码</p>
            </div>

            <!-- 错误提示 -->
            <div v-if="errorInfos.length > 0" class="alert alert-danger">
                <ul class="error-list">
                    <li v-for="(error, index) in errorInfos" :key="index">{{ error }}</li>
                </ul>
            </div>

            <!-- 成功提示 -->
            <div v-if="successInfo" class="alert alert-success">
                {{ successInfo }}
            </div>

            <!-- 重置密码表单 -->
            <form @submit.prevent="handleSubmit" class="reset-password-form">
                <!-- 新密码输入 -->
                <div class="form-group">
                    <label for="newPassword" class="form-label">新密码</label>
                    <div class="input-group">
                        <span class="input-icon">
                            <font-awesome-icon icon="lock" />
                        </span>
                        <input
                            v-model="formData.newPassword"
                            :type="showNewPassword ? 'text' : 'password'"
                            id="newPassword"
                            class="form-control"
                            placeholder="请输入新密码（6-20位）"
                            maxlength="20"
                            required
                            autofocus
                            @focus="clearError('newPassword')"
                        />
                        <span class="password-toggle" @click="showNewPassword = !showNewPassword">
                            <font-awesome-icon :icon="showNewPassword ? 'eye' : 'eye-slash'" />
                        </span>
                    </div>
                    <div v-if="fieldErrors.newPassword" class="field-error">{{ fieldErrors.newPassword }}</div>
                    <div class="password-strength">
                        <div class="strength-bar">
                            <div
                                class="strength-fill"
                                :class="'strength-' + passwordStrength.level"
                                :style="{ width: passwordStrength.percent + '%' }"
                            ></div>
                        </div>
                        <span class="strength-text" :class="'strength-' + passwordStrength.level">
                            {{ passwordStrength.text }}
                        </span>
                    </div>
                </div>

                <!-- 确认密码输入 -->
                <div class="form-group">
                    <label for="confirmPassword" class="form-label">确认密码</label>
                    <div class="input-group">
                        <span class="input-icon">
                            <font-awesome-icon icon="lock" />
                        </span>
                        <input
                            v-model="formData.confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            id="confirmPassword"
                            class="form-control"
                            placeholder="请再次输入新密码"
                            maxlength="20"
                            required
                            @focus="clearError('confirmPassword')"
                        />
                        <span class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                            <font-awesome-icon :icon="showConfirmPassword ? 'eye' : 'eye-slash'" />
                        </span>
                    </div>
                    <div v-if="fieldErrors.confirmPassword" class="field-error">{{ fieldErrors.confirmPassword }}</div>
                </div>

                <!-- 密码要求提示 -->
                <div class="password-requirements">
                    <h4>
                        <font-awesome-icon icon="circle-info" />
                        密码要求
                    </h4>
                    <ul class="requirements-list">
                        <li :class="{ 'valid': validations.length }">
                            <font-awesome-icon :icon="validations.length ? 'circle-check' : 'circle'" />
                            长度为 6-20 个字符
                        </li>
                        <li :class="{ 'valid': validations.hasLetter }">
                            <font-awesome-icon :icon="validations.hasLetter ? 'circle-check' : 'circle'" />
                            至少包含一个字母
                        </li>
                        <li :class="{ 'valid': validations.hasNumber }">
                            <font-awesome-icon :icon="validations.hasNumber ? 'circle-check' : 'circle'" />
                            至少包含一个数字
                        </li>
                        <li :class="{ 'valid': validations.match }">
                            <font-awesome-icon :icon="validations.match ? 'circle-check' : 'circle'" />
                            两次密码输入一致
                        </li>
                    </ul>
                </div>

                <!-- 提交按钮 -->
                <button type="submit" class="submit-btn" :disabled="isSubmitting">
                    <span v-if="isSubmitting">
                        <span class="spinner-btn"></span> 提交中...
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
        </div>
    </div>
</template>

<script>
export default {
    name: 'ResetPasswordView',
    data() {
        return {
            formData: {
                newPassword: '',
                confirmPassword: '',
                sid: '',
                uid: ''
            },
            fieldErrors: {
                newPassword: '',
                confirmPassword: ''
            },
            errorInfos: [],
            successInfo: '',
            showNewPassword: false,
            showConfirmPassword: false,
            isSubmitting: false
        }
    },
    computed: {
        // 密码强度计算
        passwordStrength() {
            const password = this.formData.newPassword
            if (!password) {
                return { level: 'none', percent: 0, text: '' }
            }

            let strength = 0

            // 长度检查
            if (password.length >= 6) strength += 25
            if (password.length >= 10) strength += 25

            // 包含小写字母
            if (/[a-z]/.test(password)) strength += 15

            // 包含大写字母
            if (/[A-Z]/.test(password)) strength += 15

            // 包含数字
            if (/\d/.test(password)) strength += 10

            // 包含特殊字符
            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10

            if (strength < 40) {
                return { level: 'weak', percent: strength, text: '弱' }
            } else if (strength < 70) {
                return { level: 'medium', percent: strength, text: '中等' }
            } else {
                return { level: 'strong', percent: strength, text: '强' }
            }
        },

        // 密码验证状态
        validations() {
            const password = this.formData.newPassword
            const confirm = this.formData.confirmPassword

            return {
                length: password.length >= 6 && password.length <= 20,
                hasLetter: /[a-zA-Z]/.test(password),
                hasNumber: /\d/.test(password),
                match: password && confirm && password === confirm
            }
        }
    },
    created() {
        // 从 URL 参数获取 sid 和 uid
        this.formData.sid = this.$route.query.sid || ''
        this.formData.uid = this.$route.query.uid || ''

        // 验证参数是否存在
        if (!this.formData.sid || !this.formData.uid) {
            this.errorInfos.push('重置密码链接无效或已过期')
        }
    },
    methods: {
        clearError(fieldName) {
            this.fieldErrors[fieldName] = ''
            this.errorInfos = []
            this.successInfo = ''
        },

        validateForm() {
            this.errorInfos = []
            this.fieldErrors = { newPassword: '', confirmPassword: '' }
            let isValid = true

            const password = this.formData.newPassword
            const confirm = this.formData.confirmPassword

            // 新密码验证
            if (!password) {
                this.fieldErrors.newPassword = '新密码不能为空'
                this.errorInfos.push('新密码不能为空')
                isValid = false
            } else if (password.length < 6) {
                this.fieldErrors.newPassword = '密码长度至少为6位'
                this.errorInfos.push('密码长度至少为6位')
                isValid = false
            } else if (password.length > 20) {
                this.fieldErrors.newPassword = '密码长度不能超过20位'
                this.errorInfos.push('密码长度不能超过20位')
                isValid = false
            } else if (!/[a-zA-Z]/.test(password)) {
                this.fieldErrors.newPassword = '密码必须包含至少一个字母'
                this.errorInfos.push('密码必须包含至少一个字母')
                isValid = false
            } else if (!/\d/.test(password)) {
                this.fieldErrors.newPassword = '密码必须包含至少一个数字'
                this.errorInfos.push('密码必须包含至少一个数字')
                isValid = false
            }

            // 确认密码验证
            if (!confirm) {
                this.fieldErrors.confirmPassword = '确认密码不能为空'
                this.errorInfos.push('确认密码不能为空')
                isValid = false
            } else if (password !== confirm) {
                this.fieldErrors.confirmPassword = '两次输入的密码不一致'
                this.errorInfos.push('两次输入的密码不一致')
                isValid = false
            }

            // 验证 sid 和 uid
            if (!this.formData.sid || !this.formData.uid) {
                this.errorInfos.push('重置密码链接无效或已过期')
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

            try {
                // 准备提交的数据
                const resetData = {
                    newPassword: this.formData.newPassword,
                    confirmPassword: this.formData.confirmPassword,
                    sid: this.formData.sid,
                    uid: this.formData.uid
                }

                // 模拟API调用
                // const response = await this.$http.post('/api/reset-password', resetData)

                // 模拟网络延迟
                await new Promise(resolve => setTimeout(resolve, 1500))

                // 模拟成功响应
                console.log('重置密码数据:', resetData)

                // 显示成功消息
                this.successInfo = '密码重置成功！正在跳转到登录页面...'

                // 清空表单
                this.formData.newPassword = ''
                this.formData.confirmPassword = ''

                // 3秒后跳转到登录页
                setTimeout(() => {
                    this.$router.push('/login')
                }, 3000)

            } catch (err) {
                // 模拟错误响应
                console.error('Reset password error:', err)

                // 显示错误消息
                this.errorInfos.push('密码重置失败，请稍后重试或重新申请重置密码')

            } finally {
                this.isSubmitting = false
            }
        }
    }
}
</script>

<style scoped>
.reset-password-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 15px;
}

.reset-password-card {
    background-color: var(--card-bg);
    border-radius: 16px;
    box-shadow: 0 4px 20px var(--shadow-color);
    padding: 40px;
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    transition: var(--transition);
}

.reset-password-header {
    text-align: center;
    margin-bottom: 30px;
}

.reset-password-header h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    color: var(--text-color);
    font-weight: 600;
    transition: color 0.3s ease;
}

.reset-password-header p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    transition: color 0.3s ease;
}

/* 表单样式 */
.reset-password-form {
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

/* 密码强度指示器 */
.password-strength {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.strength-bar {
    flex: 1;
    height: 6px;
    background-color: var(--hover-bg);
    border-radius: 3px;
    overflow: hidden;
}

.strength-fill {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
    border-radius: 3px;
}

.strength-fill.strength-weak {
    background-color: #f44336;
}

.strength-fill.strength-medium {
    background-color: #ff9800;
}

.strength-fill.strength-strong {
    background-color: #4caf50;
}

.strength-text {
    font-size: 12px;
    font-weight: 600;
    min-width: 40px;
}

.strength-text.strength-weak {
    color: #f44336;
}

.strength-text.strength-medium {
    color: #ff9800;
}

.strength-text.strength-strong {
    color: #4caf50;
}

/* 密码要求提示 */
.password-requirements {
    background-color: var(--hover-bg);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    transition: background-color 0.3s ease;
}

.password-requirements h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: var(--text-color);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.3s ease;
}

.password-requirements h4 svg {
    color: var(--primary-color);
}

.requirements-list {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
    color: var(--text-secondary);
}

.requirements-list li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    transition: color 0.3s ease;
}

.requirements-list li:last-child {
    margin-bottom: 0;
}

.requirements-list li svg {
    font-size: 14px;
    color: var(--text-secondary);
}

.requirements-list li.valid {
    color: #4caf50;
}

.requirements-list li.valid svg {
    color: #4caf50;
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
}

.error-list {
    margin: 0;
    padding-left: 20px;
}

.error-list li {
    margin-bottom: 5px;
    font-size: 14px;
}

.error-list li:last-child {
    margin-bottom: 0;
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

/* 响应式设计 - 平板 */
@media (max-width: 768px) {
    .reset-password-wrapper {
        padding: 0 10px;
        margin: 1rem auto;
    }

    .reset-password-card {
        padding: 30px 20px;
        border-radius: 12px;
        max-width: 100%;
    }

    .reset-password-header h2 {
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

    .password-requirements {
        padding: 12px;
    }

    .password-requirements h4 {
        font-size: 13px;
    }

    .requirements-list {
        font-size: 12px;
    }
}

/* 响应式设计 - 手机 */
@media (max-width: 576px) {
    .reset-password-wrapper {
        padding: 0 10px;
        margin: 1rem auto;
    }

    .reset-password-card {
        padding: 25px 15px;
        box-shadow: 0 2px 10px var(--shadow-color);
    }

    .reset-password-header h2 {
        font-size: 22px;
    }

    .submit-btn {
        padding: 14px;
        font-size: 15px;
    }

    .password-requirements {
        padding: 10px;
    }
}
</style>
