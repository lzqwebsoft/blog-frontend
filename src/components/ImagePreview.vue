<template>
    <Teleport to="body">
        <transition name="lightbox-zoom" @after-leave="onAfterLeave">
            <div v-if="visible" class="lightbox-overlay" :class="className" @click.self="close" @wheel.prevent="onWheel"
                @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
                <!-- 控制面板按钮 (阻止事件冒泡防止遮罩层关闭) -->
                <div class="lightbox-controls" @click.stop>
                    <button class="ctrl-btn" @click="zoomIn" title="放大" aria-label="放大">
                        <font-awesome-icon icon="magnifying-glass-plus" />
                    </button>
                    <button class="ctrl-btn" @click="zoomOut" title="缩小" aria-label="缩小">
                        <font-awesome-icon icon="magnifying-glass-minus" />
                    </button>
                    <button class="ctrl-btn" @click="rotateLeft" title="向左旋转" aria-label="向左旋转">
                        <font-awesome-icon icon="rotate-left" />
                    </button>
                    <button class="ctrl-btn" @click="rotateRight" title="向右旋转" aria-label="向右旋转">
                        <font-awesome-icon icon="rotate-right" />
                    </button>
                    <button class="ctrl-btn" @click="resetImage" title="重置" aria-label="重置">
                        <font-awesome-icon icon="arrows-rotate" />
                    </button>
                    <button class="ctrl-btn close-btn" @click="close" title="关闭" aria-label="关闭">
                        <font-awesome-icon icon="xmark" />
                    </button>
                </div>

                <!-- 大图显示区域 -->
                <div class="lightbox-stage" @click.self="close">
                    <img :src="currentImage" alt="全图预览" class="lightbox-img" :style="imgTransformStyle"
                        @mousedown.stop.prevent="startDrag" @click.stop @touchstart.prevent="onTouchStart"
                        @touchmove.prevent="onTouchMove" @touchend="onTouchEnd" />
                </div>

                <!-- 切换上一张/下一张按钮 (阻止冒泡) -->
                <button v-if="hasMultiple && index > 0" class="nav-arrow prev-arrow" @click.stop="step(-1)"
                    title="上一张" aria-label="上一张">
                    <font-awesome-icon icon="chevron-left" />
                </button>
                <button v-if="hasMultiple && index < images.length - 1" class="nav-arrow next-arrow"
                    @click.stop="step(1)" title="下一张" aria-label="下一张">
                    <font-awesome-icon icon="chevron-right" />
                </button>

                <!-- 当前页指示码（单图时隐藏，与后台 BlogLightbox 一致） -->
                <div v-if="hasMultiple" class="lightbox-indicator" @click.stop>
                    {{ index + 1 }} / {{ images.length }}
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script>
/**
 * 全屏图片查看器（共享灯箱组件）。
 *
 * 对应后台 SSG 的 partials/lightbox.tmpl + css/lightbox.css + js/lightbox.js：
 * 页面只负责收集图片，再调用本组件的 open(images, index, options)，
 * 不再各自维护预览 DOM / 缩放旋转状态。
 *
 *   this.$refs.imagePreview.open(images, index)
 *   this.$refs.imagePreview.open([url], 0, { className: 'mermaid-preview-dark' })
 *
 * options.className 只接受 mermaid-preview-light / mermaid-preview-dark，
 * 用于给 Mermaid SVG 大图按主题加白/深底。组件在关闭后会回收传入的 blob: URL。
 */
export default {
    name: 'ImagePreview',
    emits: ['close'],
    data() {
        return {
            visible: false,
            images: [],
            index: 0,
            className: '',
            scale: 1,
            rotateDeg: 0,
            translateX: 0,
            translateY: 0,
            isDragging: false,
            startX: 0,
            startY: 0,
            prevOverflow: '',
            // 移动端手势
            initialDistance: 0,
            lastScale: 1,
            blobUrls: [],
        }
    },
    computed: {
        currentImage() {
            return this.images[this.index] || ''
        },
        hasMultiple() {
            return this.images.length > 1
        },
        imgTransformStyle() {
            return {
                transform: `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale}) rotate(${this.rotateDeg}deg)`,
                cursor: this.isDragging ? 'grabbing' : 'grab',
                transition: this.isDragging ? 'none' : 'transform 0.15s ease-out',
            }
        },
    },
    mounted() {
        document.addEventListener('keydown', this.onKeydown)
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.onKeydown)
        document.body.style.overflow = this.prevOverflow
        this.releaseBlob()
    },
    methods: {
        open(list, start, options) {
            const urls = (Array.isArray(list) ? list : [list]).filter((url) => !!url)
            if (!urls.length) return
            this.releaseBlob()
            this.blobUrls = urls.filter((url) => String(url).indexOf('blob:') === 0)
            this.images = urls
            this.index = Math.max(0, Math.min(Number(start) || 0, urls.length - 1))
            const cls = options && options.className
            this.className =
                cls === 'mermaid-preview-light' || cls === 'mermaid-preview-dark' ? cls : ''
            this.resetImage()
            if (!this.visible) this.prevOverflow = document.body.style.overflow
            this.visible = true
            document.body.style.overflow = 'hidden'
        },
        close() {
            if (!this.visible) return
            this.visible = false
            this.isDragging = false
            document.body.style.overflow = this.prevOverflow
            this.$emit('close')
        },
        onAfterLeave() {
            // 离场动画结束后再清空，避免过渡期间图片变空白；期间若被重新打开则不清理
            if (this.visible) return
            this.images = []
            this.index = 0
            this.className = ''
            this.releaseBlob()
        },
        releaseBlob() {
            // blobUrls 只收集 blob: 前缀，且同一 URL 仅回收一次
            this.blobUrls.forEach((url) => URL.revokeObjectURL(url))
            this.blobUrls = []
        },
        step(delta) {
            const target = this.index + delta
            if (target < 0 || target >= this.images.length) return
            this.index = target
            this.resetImage()
        },
        onKeydown(e) {
            if (!this.visible) return
            if (e.key === 'Escape') this.close()
            else if (e.key === 'ArrowLeft') this.step(-1)
            else if (e.key === 'ArrowRight') this.step(1)
        },
        onWheel(e) {
            const zoomSpeed = 0.12
            const newScale = this.scale + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed)
            this.scale = Math.max(0.4, Math.min(newScale, 6))
        },
        startDrag(e) {
            if (e.button !== undefined && e.button !== 0) return
            this.isDragging = true
            this.startX = e.clientX - this.translateX
            this.startY = e.clientY - this.translateY
        },
        onDrag(e) {
            if (!this.isDragging) return
            this.translateX = e.clientX - this.startX
            this.translateY = e.clientY - this.startY
        },
        stopDrag() {
            this.isDragging = false
        },
        zoomIn() {
            this.scale = Math.min(this.scale + 0.3, 6)
        },
        zoomOut() {
            this.scale = Math.max(this.scale - 0.3, 0.4)
        },
        rotateLeft() {
            this.rotateDeg -= 90
        },
        rotateRight() {
            this.rotateDeg += 90
        },
        resetImage() {
            this.scale = 1
            this.rotateDeg = 0
            this.translateX = 0
            this.translateY = 0
            this.isDragging = false
        },
        // 单指拖动 / 双指缩放，沿用原 ImagePreview.vue 的移动端手势
        onTouchStart(e) {
            if (e.touches.length === 1) {
                this.isDragging = true
                this.startX = e.touches[0].clientX - this.translateX
                this.startY = e.touches[0].clientY - this.translateY
            } else if (e.touches.length === 2) {
                this.isDragging = false
                this.initialDistance = this.getDistance(e.touches[0], e.touches[1])
                this.lastScale = this.scale
            }
        },
        onTouchMove(e) {
            if (e.touches.length === 1 && this.isDragging) {
                this.translateX = e.touches[0].clientX - this.startX
                this.translateY = e.touches[0].clientY - this.startY
            } else if (e.touches.length === 2 && this.initialDistance > 0) {
                const factor = this.getDistance(e.touches[0], e.touches[1]) / this.initialDistance
                this.scale = Math.max(0.4, Math.min(this.lastScale * factor, 6))
            }
        },
        onTouchEnd() {
            this.isDragging = false
            this.initialDistance = 0
        },
        getDistance(touch1, touch2) {
            return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
        },
    },
}
</script>

<style scoped>
/* 与后台 css/lightbox.css 同源：说说九宫格、文章正文图片与 Mermaid 大图共用 */
.lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.88);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    z-index: 12000;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    user-select: none;
}

.lightbox-controls {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(0, 0, 0, 0.3);
    z-index: 12100;
}

.ctrl-btn {
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: rgba(255, 255, 255, 0.85);
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
}

.ctrl-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: scale(1.05);
}

.ctrl-btn.close-btn {
    background: rgba(220, 53, 69, 0.15);
    color: #ff4d4f;
}

.ctrl-btn.close-btn:hover {
    background: #ff4d4f;
    color: white;
}

.lightbox-stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
}

.lightbox-img {
    max-width: 90vw;
    max-height: 80vh;
    object-fit: contain;
    user-select: none;
    -webkit-user-drag: none;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    border-radius: 4px;
}

.nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.15rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 12200;
}

.nav-arrow:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%) scale(1.05);
}

.prev-arrow {
    left: 24px;
}

.next-arrow {
    right: 24px;
}

.lightbox-indicator {
    padding: 10px;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    background: rgba(0, 0, 0, 0.3);
    z-index: 12100;
}

/* Mermaid 流程图预览：SVG 转 blob 后按当前主题给白/深底 */
.lightbox-overlay.mermaid-preview-light .lightbox-img {
    background-color: #ffffff;
    padding: 24px;
    border-radius: 12px;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(0, 0, 0, 0.05);
}

.lightbox-overlay.mermaid-preview-dark .lightbox-img {
    background-color: #1e1e2e;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.8),
        0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* 灯箱淡入淡出动画 */
.lightbox-zoom-enter-active,
.lightbox-zoom-leave-active {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.lightbox-zoom-enter-from,
.lightbox-zoom-leave-to {
    opacity: 0;
    transform: scale(0.97);
}

@media (max-width: 768px) {
    .prev-arrow {
        left: 10px;
    }

    .next-arrow {
        right: 10px;
    }

    .nav-arrow {
        width: 38px;
        height: 38px;
        font-size: 1rem;
    }
}
</style>
