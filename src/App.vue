<script>
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

export default {
    components: {
        RouterView,
        AppHeader,
        AppFooter,
    },
    data() {
        return {
            showTop: false,
            scrolling: false,
        }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    unmounted() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        handleScroll() {
            this.showTop = window.scrollY > 200;

            if (!this.scrolling) {
                this.scrolling = true

                window.requestAnimationFrame
                    ? requestAnimationFrame(this.autoHideHeader)
                    : setTimeout(this.autoHideHeader, 250);
            }
        },
        autoHideHeader() {
            this.scrolling = false;
        },
    },
}
</script>

<template>
    <div class="app">
        <AppHeader />

        <main class="main">
            <RouterView />
        </main>

        <AppFooter />

        <button class="scroll-to-top" :class="{ 'show': showTop }" @click="scrollToTop">
            <font-awesome-icon icon="arrow-up" />
        </button>
    </div>
</template>

<style scoped>
.app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}


.main {
    flex: 1;
    min-height: calc(100vh - 120px);
    max-width: 1750px;
    margin: 80px auto 0;
    width: 100%;
    box-sizing: border-box;
}

.scroll-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--scroll-to-top-button-bg, #f5f5f5);
    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
    color: var(--text-color, rgba(0, 0, 0, 0.87));
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    z-index: 1000;
    opacity: 0;
    transform: scale(0) rotate(180deg);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.scroll-to-top.show {
    opacity: 1;
    transform: scale(1) rotate(0deg);
}

.scroll-to-top:hover {
    background: var(--scroll-to-top-button-hover-bg, #dddddd);
    transform: scale(1.1) rotate(0deg);
}

@media (max-width: 1800px) {
    .main {
        max-width: 1550px;
    }
}

@media (max-width: 1550px) {
    .main {
        max-width: 1300px;
    }
}

@media (max-width: 1300px) {
    .main {
        max-width: 1100px;
    }
}

@media (max-width: 1024px) {
    .main {
        max-width: 900px;
    }
}

/* 手机 - 关键变化 */
@media (max-width: 768px) {
    .main {
        max-width: 100%;
        width: 100%;
    }
}
</style>
