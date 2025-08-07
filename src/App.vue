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
        }
    },
    methods: {
        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' })
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

        <button class="scroll-to-top" v-show="showTop" @click="scrollToTop">↑</button>
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
    margin-top: 80px;
    min-height: calc(100vh - 120px);
}

.scroll-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.scroll-to-top:hover {
    background: #0056b3;
}
</style>
