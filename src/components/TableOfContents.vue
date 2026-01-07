<template>
    <div class="toc-container" :class="{ 'is-mobile': isMobile }" v-if="headings.length > 0">
        <!-- 悬浮按钮 -->
        <div class="toc-trigger" @click="toggleToc" title="文章目录" :class="{ active: visible }">目录</div>

        <!-- 目录面板 -->
        <transition name="fade-slide">
            <div v-show="visible" class="toc-panel" ref="tocPanel">
                <div class="toc-header">
                    <h3>目录</h3>
                    <span class="close-btn" @click="toggleToc">
                        <font-awesome-icon icon="times" />
                    </span>
                </div>

                <div class="toc-content">
                    <ul v-if="headings.length > 0">
                        <li v-for="(item, index) in headings" :key="index" :class="{
                            active: activeId === item.id,
                            [`toc-level-${item.level}`]: true,
                        }" @click.stop="scrollToHeading(item.id)">
                            <span class="toc-text" :title="item.text">{{ item.text }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'TableOfContents',
    props: {
        containerSelector: {
            type: String,
            required: true,
            default: '.article-content',
        },
        dependency: {
            type: [Object, String, Number],
            default: null,
        },
    },
    data() {
        return {
            visible: false,
            headings: [],
            activeId: '',
            isMobile: false,
            observer: null,
            scrollTimeout: null,
        }
    },
    mounted() {
        this.checkMobile()
        window.addEventListener('resize', this.checkMobile)
        window.addEventListener('scroll', this.handleScroll)

        // Initial generation if content might be ready
        this.$nextTick(() => {
            this.generateHeadings()
        })
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.checkMobile)
        window.removeEventListener('scroll', this.handleScroll)
        if (this.observer) {
            this.observer.disconnect()
        }
    },
    watch: {
        dependency: {
            handler() {
                this.$nextTick(() => {
                    setTimeout(this.generateHeadings, 300) // Wait a bit for v-html rendering
                })
            },
            immediate: true,
        },
    },
    methods: {
        checkMobile() {
            this.isMobile = window.innerWidth <= 768
        },
        toggleToc() {
            this.visible = !this.visible
        },
        generateHeadings() {
            const container = document.querySelector(this.containerSelector)
            if (!container) return

            const elements = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
            const headings = []

            // Find minimum level (highest rank) to normalize levels
            let minLevel = 10
            elements.forEach(el => {
                const level = parseInt(el.tagName.charAt(1))
                if (level < minLevel) minLevel = level
            })

            elements.forEach((el, index) => {
                // Ensure ID
                if (!el.id) {
                    el.id = `heading-${index}`
                }

                // Sanitize text
                const text = el.textContent.trim()
                if (!text) return

                const currentLevel = parseInt(el.tagName.charAt(1))
                // Normalize level: start from 1
                const normalizedLevel = currentLevel - minLevel + 1

                headings.push({
                    id: el.id,
                    text: text,
                    level: normalizedLevel,
                    top: el.offsetTop,
                })
            })

            this.headings = headings

            // Setup IntersectionObserver for active highlighting logic
            // Alternatively, use scroll event which is simpler for "current section" logic
        },
        scrollToHeading(id) {
            const el = document.getElementById(id)
            if (el) {
                // Offset for fixed header if exists, assume 60px
                const offset = 80
                const bodyRect = document.body.getBoundingClientRect().top
                const elementRect = el.getBoundingClientRect().top
                const elementPosition = elementRect - bodyRect
                const offsetPosition = elementPosition - offset

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                })

                if (this.isMobile) {
                    this.visible = false
                }

                this.activeId = id
            }
        },
        handleScroll() {
            if (this.scrollTimeout) return

            this.scrollTimeout = setTimeout(() => {
                // Find the heading that is currently in view
                // Iterating backwards to find the last header that is above the scroll position
                // or iterating forwards...

                // Re-query elements to get fresh offsets if needed, or use cached
                // For robustness, getting element positions dynamically is safer if layout changes (images load etc)

                let currentId = ''
                for (const item of this.headings) {
                    const el = document.getElementById(item.id)
                    if (el) {
                        const top = el.getBoundingClientRect().top
                        // If element top is somewhat near the top of viewport (e.g. < 150px)
                        if (top < 150) {
                            currentId = item.id
                        } else {
                            // Once we reach an element that is further down, we stop,
                            // because we want the *last* one that was above the threshold.
                            break
                        }
                    }
                }
                if (currentId) {
                    this.activeId = currentId
                } else if (this.headings.length > 0 && window.scrollY < 100) {
                    // At very top
                    this.activeId = ''
                }

                this.scrollTimeout = null
            }, 100)
        },
    },
}
</script>

<style lang="scss" scoped>
.toc-container {
    position: fixed;
    right: 20px;
    top: 100px;
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    /* Light mode default variables */
    --toc-bg: rgba(255, 255, 255, 0.95);
    --toc-border: #e0e0e0;
    --toc-text: #333;
    --toc-hover: #f0f0f0;
    --toc-active: #007bff;
    --toc-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:root.dark-theme .toc-container {
    --toc-bg: rgba(30, 30, 30, 0.95);
    --toc-border: #444;
    --toc-text: #e0e0e0;
    --toc-hover: #333;
    --toc-active: #5ea1ff;
    --toc-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Explicit dark mode support if parent has specific class, fallback to media query above */
:deep([data-theme='dark']) .toc-container {
    --toc-bg: rgba(30, 30, 30, 0.95);
    --toc-border: #444;
    --toc-text: #e0e0e0;
    --toc-hover: #333;
    --toc-active: #5ea1ff;
    --toc-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toc-trigger {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--toc-bg);
    color: var(--toc-text);
    box-shadow: var(--toc-shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid var(--toc-border);
    font-size: 1rem;

    &:hover {
        background: var(--toc-active);
        color: #fff;
        border-color: var(--toc-active);
    }

    &.active {
        background: var(--toc-active);
        color: #fff;
        border-color: var(--toc-active);
    }
}

.toc-panel {
    position: absolute;
    top: 60px;
    /* Below the trigger */
    right: 0;
    width: 250px;
    max-height: 70vh;
    background: var(--toc-bg);
    border: 1px solid var(--toc-border);
    border-radius: 8px;
    box-shadow: var(--toc-shadow);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    backdrop-filter: blur(5px);
}

.toc-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--toc-border);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--toc-text);
    }

    .close-btn {
        cursor: pointer;
        color: var(--toc-text);
        opacity: 0.6;

        &:hover {
            opacity: 1;
        }
    }
}

.toc-content {
    overflow-y: auto;
    padding: 10px 0;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }
}

.toc-content ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.toc-content li {
    padding: 6px 16px;
    cursor: pointer;
    font-size: 14px;
    color: var(--toc-text);
    transition: all 0.2s;
    line-height: 1.4;

    &:hover {
        background: var(--toc-hover);
        color: var(--toc-active);
    }

    &.active {
        color: var(--toc-active);
        background: var(--toc-hover);
        border-right: 3px solid var(--toc-active);
    }

    .toc-text {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

/* Indentation levels */
.toc-level-1 {
    padding-left: 16px !important;
    font-weight: 600 !important;
}

.toc-level-2 {
    padding-left: 26px !important;
    font-weight: 600 !important;
}

.toc-level-3 {
    padding-left: 36px !important;
}

.toc-level-4 {
    padding-left: 46px !important;
}

.toc-level-5 {
    padding-left: 56px !important;
    font-size: 13px;
}

.toc-level-6 {
    padding-left: 66px !important;
    font-size: 12px;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Mobile responsive */
@media (max-width: 768px) {
    .toc-container {
        bottom: 80px;
        top: auto;
        right: 20px;
    }

    .toc-panel {
        bottom: 60px;
        top: auto;
        width: 280px;
        max-height: 50vh;
    }
}
</style>
