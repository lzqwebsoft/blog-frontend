<template>
    <Teleport to="body">
        <div v-if="visible" class="slide-captcha-dialog-overlay" @click.self="cancel">
            <div class="slide-captcha-dialog" role="dialog" aria-modal="true" aria-label="人机验证">
                <div class="slide-captcha-dialog-header">
                    <span>人机验证</span>
                    <button type="button" class="slide-captcha-dialog-close" aria-label="关闭" @click="cancel">
                        <font-awesome-icon icon="xmark" />
                    </button>
                </div>

                <div class="slide-captcha-dialog-body">
                    <Slide v-if="ready" :data="slideData" :config="slideConfig" :events="slideEvents" />
                    <div v-else class="slide-captcha-dialog-placeholder">
                        <span>{{ error || '验证加载中…' }}</span>
                        <button v-if="error" type="button" class="slide-captcha-dialog-retry" @click="load">重试</button>
                    </div>
                </div>

                <p class="slide-captcha-dialog-tip">拖动滑块完成验证后将自动继续提交</p>
            </div>
        </div>
    </Teleport>
</template>

<script>
import { Slide } from 'go-captcha-vue'
import 'go-captcha-vue/dist/style.css'
import { getSlideCaptcha } from '@/api/user'

/**
 * 弹框式滑块人机验证（登录 / 文章评论 / 说说评论共用）。
 *
 *   const ticket = await this.$refs.captchaDialog.verify('login')
 *   if (!ticket) return                       // 用户取消
 *   // ticket: { captchaID, slideX }
 *
 * 只在点击「确定」后由父组件调用 verify() 打开；滑块 confirm 即代表验证完成，
 * 弹框自行关闭并把凭证交给提交流程。凭证一次性，下次提交会重新取图。
 */
export default {
    name: 'SlideCaptchaDialog',
    components: { Slide },
    data() {
        return {
            visible: false,
            ready: false,
            error: '',
            action: '',
            captchaID: '',
            resolver: null,
            slideData: {
                thumbX: 0,
                thumbY: 0,
                thumbWidth: 0,
                thumbHeight: 0,
                image: '',
                thumb: ''
            },
            slideConfig: {
                width: 300,
                height: 220,
                title: '请拖动滑块完成验证'
            },
            slideEvents: {
                confirm: (point) => this.finish(Math.round(point.x)),
                refresh: () => this.load(),
                close: () => this.cancel()
            }
        }
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.onKeydown)
    },
    methods: {
        verify(action) {
            // 重复点击确定时先结束上一次等待，避免 Promise 永远悬着
            if (this.resolver) this.settle(null)
            this.action = action || ''
            this.visible = true
            document.addEventListener('keydown', this.onKeydown)
            this.load()
            return new Promise((resolve) => { this.resolver = resolve })
        },

        async load() {
            this.ready = false
            this.error = ''
            this.captchaID = ''
            await this.$nextTick()
            try {
                const res = await getSlideCaptcha(this.action)
                const data = res.data || {}
                if (!data.captcha_id || !data.image || !data.thumb) {
                    throw new Error('验证数据不完整')
                }
                this.captchaID = data.captcha_id
                this.slideData = {
                    image: data.image,
                    thumb: data.thumb,
                    thumbX: data.thumb_x || 0,
                    thumbY: data.thumb_y || 0,
                    thumbWidth: data.thumb_width || 0,
                    thumbHeight: data.thumb_height || 0
                }
                this.ready = true
            } catch (error) {
                console.error('获取滑动验证码失败:', error)
                this.error = '人机验证加载失败，请重试'
            }
        },

        finish(slideX) {
            this.settle({ captchaID: this.captchaID, slideX })
        },

        cancel() {
            this.settle(null)
        },

        settle(ticket) {
            if (!this.resolver) return
            const resolve = this.resolver
            this.resolver = null
            this.visible = false
            this.ready = false
            document.removeEventListener('keydown', this.onKeydown)
            resolve(ticket)
        },

        onKeydown(event) {
            if (event.key === 'Escape') this.cancel()
        }
    }
}
</script>

<style scoped>
.slide-captcha-dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.55);
}

.slide-captcha-dialog {
    width: 100%;
    max-width: 358px;
    padding: 16px;
    border-radius: 12px;
    background: var(--card-bg, #fff);
    color: var(--text-color, #333);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.slide-captcha-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 1rem;
    font-weight: 600;
}

.slide-captcha-dialog-close {
    border: none;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    cursor: pointer;
    padding: 4px 8px;
    opacity: 0.7;
}

.slide-captcha-dialog-close:hover {
    opacity: 1;
}

.slide-captcha-dialog-body {
    overflow-x: auto;
}

.slide-captcha-dialog-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 220px;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 8px;
    color: var(--text-secondary, #888);
    font-size: 0.9rem;
}

.slide-captcha-dialog-retry {
    border: 1px solid var(--border-color, #ddd);
    border-radius: 6px;
    background: transparent;
    color: inherit;
    padding: 6px 14px;
    cursor: pointer;
}

.slide-captcha-dialog-tip {
    margin: 12px 0 0;
    text-align: center;
    font-size: 0.8rem;
    color: var(--text-secondary, #888);
}
</style>

<!-- 非 scoped：vendor 的主题色挂在 :root 变量上，scoped 无法命中 html 元素 -->
<style>
:root.dark-theme {
    --go-captcha-theme-text-color: #e5e7eb;
    --go-captcha-theme-bg-color: #1f2937;
    --go-captcha-theme-border-color: #374151;
    --go-captcha-theme-icon-color: #9ca3af;
    --go-captcha-theme-drag-bar-color: #374151;
    --go-captcha-theme-round-color: #374151;
}
</style>
