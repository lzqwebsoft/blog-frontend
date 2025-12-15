<template>
    <transition name="fade">
        <div v-if="visible" class="image-preview-overlay" @click.self="handleClose">
            <div class="preview-container">
                <img :src="imageUrl" alt="Preview" class="preview-img"
                    :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale})` }"
                    @wheel.prevent="handleWheel" @mousedown="handleMouseDown" @touchstart="handleTouchStart"
                    @touchmove="handleTouchMove" @touchend="handleTouchEnd" @click.stop />
            </div>
            <button class="close-btn" @click="handleClose">
                <font-awesome-icon icon="xmark" />
            </button>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'ImagePreview',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        imageUrl: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            scale: 1,
            translateX: 0,
            translateY: 0,
            isDragging: false,
            startPoint: { x: 0, y: 0 },
            lastTranslate: { x: 0, y: 0 },
            initialDistance: 0,
            lastScale: 1,
        };
    },
    watch: {
        visible(val) {
            if (val) {
                this.resetState();
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    },
    methods: {
        resetState() {
            this.scale = 1;
            this.translateX = 0;
            this.translateY = 0;
            this.lastTranslate = { x: 0, y: 0 };
            this.lastScale = 1;
        },
        handleClose() {
            this.$emit('close');
        },
        handleWheel(e) {
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newScale = this.scale + delta;
            if (newScale >= 0.5 && newScale <= 5) {
                this.scale = newScale;
            }
        },
        handleMouseDown(e) {
            e.preventDefault();
            this.isDragging = true;
            this.startPoint = { x: e.clientX, y: e.clientY };
            this.lastTranslate = { x: this.translateX, y: this.translateY };

            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
        },
        handleMouseMove(e) {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.startPoint.x;
            const deltaY = e.clientY - this.startPoint.y;
            this.translateX = this.lastTranslate.x + deltaX;
            this.translateY = this.lastTranslate.y + deltaY;
        },
        handleMouseUp() {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
        },
        // Touch events for mobile
        handleTouchStart(e) {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.startPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                this.lastTranslate = { x: this.translateX, y: this.translateY };
            } else if (e.touches.length === 2) {
                this.isDragging = false;
                this.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                this.lastScale = this.scale;
            }
        },
        handleTouchMove(e) {
            e.preventDefault(); // Prevent scrolling
            if (e.touches.length === 1 && this.isDragging) {
                const deltaX = e.touches[0].clientX - this.startPoint.x;
                const deltaY = e.touches[0].clientY - this.startPoint.y;
                this.translateX = this.lastTranslate.x + deltaX;
                this.translateY = this.lastTranslate.y + deltaY;
            } else if (e.touches.length === 2) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scaleFactor = currentDistance / this.initialDistance;
                let newScale = this.lastScale * scaleFactor;
                // Limit scale
                if (newScale < 0.5) newScale = 0.5;
                if (newScale > 5) newScale = 5;
                this.scale = newScale;
            }
        },
        handleTouchEnd() {
            this.isDragging = false;
        },
        getDistance(touch1, touch2) {
            return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        }
    }
}
</script>

<style scoped>
.image-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.preview-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.preview-img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    cursor: grab;
    transition: transform 0.1s linear;
    user-select: none;
    -webkit-user-drag: none;
}

.preview-img:active {
    cursor: grabbing;
}

.close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    color: white;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
    z-index: 10000;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.4);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
