<template>
    <div class="found-password-wrapper">
        <div class="found-password-card">
            <!-- 成功图标 -->
            <div class="success-icon">
                <font-awesome-icon icon="circle-check" />
            </div>

            <!-- 标题 -->
            <div class="found-password-header">
                <h2>找回密码</h2>
            </div>

            <!-- 提示信息 -->
            <div class="message-content">
                <p class="main-message">
                    系统已经向您的邮箱
                    <span class="email-highlight">{{ email }}</span>
                    发送了一份确认邮件，请查收！
                </p>

                <div class="info-box">
                    <h4>
                        <font-awesome-icon icon="circle-info" />
                        温馨提示
                    </h4>
                    <ul class="info-list">
                        <li>请在24小时内点击邮件中的链接完成密码重置</li>
                        <li>如果未收到邮件，请检查垃圾邮件箱</li>
                        <li>链接仅可使用一次，使用后将自动失效</li>
                        <li>如有问题，请联系管理员</li>
                    </ul>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
                <button @click="goToLogin" class="btn btn-primary">
                    <font-awesome-icon icon="arrow-right-to-bracket" />
                    返回登录
                </button>
                <button @click="resendEmail" class="btn btn-secondary" :disabled="countdown > 0">
                    <font-awesome-icon icon="paper-plane" />
                    <span v-if="countdown > 0">重新发送 ({{ countdown }}s)</span>
                    <span v-else>重新发送邮件</span>
                </button>
            </div>

            <!-- 联系方式 -->
            <div class="contact-section">
                <p class="contact-text">
                    如果长时间未收到邮件，请联系我们：
                    <a href="mailto:lzqwebsoft@gmail.com" class="contact-link">
                        lzqwebsoft@gmail.com
                    </a>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { foundPwd } from '@/api/user'

export default {
    name: 'FoundPasswordView',
    data() {
        return {
            email: '',
            countdown: 60,
            countdownTimer: null
        }
    },
    created() {
        // 从路由参数或查询参数获取邮箱
        this.email = this.$route.query.email || this.$route.params.email || 'your@email.com'

        // 启动倒计时
        this.startCountdown()
    },
    beforeUnmount() {
        // 清除定时器
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer)
        }
    },
    methods: {
        goToLogin() {
            this.$router.push('/login')
        },

        startCountdown() {
            this.countdown = 60
            this.countdownTimer = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--
                } else {
                    clearInterval(this.countdownTimer)
                }
            }, 1000)
        },

        async resendEmail() {
            if (this.countdown > 0) return

            try {
                // API调用
                await foundPwd(this.email)

                // 显示成功消息
                this.$notify({
                    title: '发送成功',
                    message: '确认邮件已重新发送，请查收',
                    type: 'success'
                })

                // 重新启动倒计时
                this.startCountdown()

            } catch (err) {
                console.error('重新发送邮件失败:', err)

                let errorMessage = '邮件发送失败，请稍后重试'
                if (err.message) {
                    errorMessage = err.message
                }

                this.$notify({
                    title: '发送失败',
                    message: errorMessage,
                    type: 'error'
                })
            }
        }
    }
}
</script>

<style scoped>
.found-password-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 15px;
}

.found-password-card {
    background-color: var(--card-bg);
    border-radius: 16px;
    box-shadow: 0 4px 20px var(--shadow-color);
    padding: 50px 40px 40px;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    transition: var(--transition);
}

/* 成功图标 */
.success-icon {
    text-align: center;
    margin-bottom: 20px;
}

.success-icon svg {
    font-size: 64px;
    color: #4caf50;
    animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
    0% {
        transform: scale(0);
        opacity: 0;
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* 标题 */
.found-password-header {
    text-align: center;
    margin-bottom: 30px;
}

.found-password-header h2 {
    margin: 0;
    font-size: 28px;
    color: var(--text-color);
    font-weight: 600;
    transition: color 0.3s ease;
}

/* 消息内容 */
.message-content {
    margin-bottom: 30px;
}

.main-message {
    text-align: center;
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-color);
    margin: 0 0 25px 0;
    transition: color 0.3s ease;
}

.email-highlight {
    color: var(--primary-color);
    font-weight: 600;
    word-break: break-all;
}

/* 信息框 */
.info-box {
    background-color: var(--hover-bg);
    border-radius: 12px;
    padding: 20px;
    border-left: 4px solid var(--primary-color);
    transition: background-color 0.3s ease;
}

.info-box h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: var(--text-color);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.3s ease;
}

.info-box h4 svg {
    color: var(--primary-color);
}

.info-list {
    margin: 0;
    padding-left: 20px;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.8;
}

.info-list li {
    margin-bottom: 8px;
}

.info-list li:last-child {
    margin-bottom: 0;
}

/* 操作按钮 */
.action-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 25px;
    flex-wrap: wrap;
}

.btn {
    flex: 1;
    min-width: 140px;
    padding: 14px 20px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-primary {
    background-color: var(--primary-color);
    color: var(--text-on-primary);
}

.btn-primary:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
    background-color: var(--button-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
    background-color: var(--hover-bg);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
}

.btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn:active:not(:disabled) {
    transform: translateY(0);
}

/* 联系方式 */
.contact-section {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
    transition: border-color 0.3s ease;
}

.contact-text {
    margin: 0;
    font-size: 14px;
    color: var(--text-secondary);
    transition: color 0.3s ease;
}

.contact-link {
    color: var(--link-color);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

.contact-link:hover {
    color: var(--primary-hover);
    text-decoration: underline;
}

/* 响应式设计 - 平板 */
@media (max-width: 768px) {
    .found-password-wrapper {
        padding: 0 10px;
        margin: 1rem auto;
    }

    .found-password-card {
        padding: 40px 25px 30px;
        border-radius: 12px;
        max-width: 100%;
    }

    .success-icon svg {
        font-size: 56px;
    }

    .found-password-header h2 {
        font-size: 24px;
    }

    .main-message {
        font-size: 15px;
    }

    .info-box {
        padding: 16px;
    }

    .info-box h4 {
        font-size: 15px;
    }

    .info-list {
        font-size: 13px;
    }
}

/* 响应式设计 - 手机 */
@media (max-width: 576px) {
    .found-password-wrapper {
        padding: 0 10px;
        margin: 1rem auto;
    }

    .found-password-card {
        padding: 35px 20px 25px;
        box-shadow: 0 2px 10px var(--shadow-color);
    }

    .success-icon svg {
        font-size: 48px;
    }

    .found-password-header h2 {
        font-size: 22px;
    }

    .main-message {
        font-size: 14px;
    }

    .action-buttons {
        flex-direction: column;
        gap: 10px;
    }

    .btn {
        width: 100%;
        min-width: auto;
        padding: 12px 16px;
        font-size: 14px;
    }

    .info-box {
        padding: 14px;
    }

    .info-box h4 {
        font-size: 14px;
    }

    .info-list {
        font-size: 12px;
        padding-left: 18px;
    }

    .contact-text {
        font-size: 13px;
    }
}
</style>
