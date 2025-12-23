<template>
    <div class="about-page">
        <!-- Hero Section -->
        <section class="about-hero">
            <div class="page-container hero-content animate-fade-in">
                <h1 class="about-title">关于本站</h1>
                <p class="about-subtitle">
                    在这个信息爆炸的时代，我希望构建一个安静的角落。
                    这里没有算法推荐，没有繁杂的广告，只有纯粹的文字与代码。
                </p>
            </div>
        </section>

        <div class="page-container content-wrapper">
            <!-- Main Content Card -->
            <article class="about-card" v-if="blogInfo && blogInfo.about">
                <div class="about-content" v-html="blogInfo.about"></div>
            </article>

            <!-- Loading State -->
            <div v-else class="skeleton-list">
                <div class="skeleton-card">
                    <div class="skeleton-item skeleton-title"></div>
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text short"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Prism from 'prismjs';

export default {
    name: 'AboutView',
    updated() {
        this.$nextTick(() => {
            Prism.highlightAll();
        });
    },
    methods: {
        initCodeHighlight() {
            let docPre = document.querySelectorAll('.about-content pre');
            if (docPre && docPre.length > 0) {
                docPre.forEach(function (item) {
                    let code = item.querySelector("code");
                    if (code) {
                        code.classList.add("line-numbers");
                    }
                });
            }
        }
    }
};
</script>

<style scoped>
.about-page {
    min-height: 100vh;
    background-color: var(--bg-color);
}

.page-container {
    margin: 0 auto;
    width: 100%;
    max-width: 900px;
    padding: 0 1.5rem;
}

.content-wrapper {
    margin-top: -4rem;
    padding-bottom: 5rem;
    position: relative;
    z-index: 2;
}

/* Hero Section */
.about-hero {
    padding: 1.5rem 0 5.5rem;
    text-align: center;
}

.about-title {
    font-family: var(--font-serif);
    font-size: 2.75rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-color);
}

.about-subtitle {
    font-size: 1.15rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
    color: var(--text-secondary);
}

/* Main Content Card */
.about-card {
    background-color: var(--card-bg);
    border-radius: 0.75rem;
    padding: 3rem;
    box-shadow: 0 4px 20px var(--shadow-color);
    border: 1px solid var(--border-color);
    width: 100%;
    animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.about-content {
    line-height: 1.8;
    font-size: 1.05rem;
    color: var(--text-color);
}

/* Skeleton Styles */
.skeleton-list {
    width: 100%;
    max-width: 900px;
}

.skeleton-card {
    background-color: var(--card-bg);
    border-radius: 0.75rem;
    padding: 3rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 20px var(--shadow-color);
    width: 100%;
}

.skeleton-item {
    background: var(--hover-bg);
    border-radius: 4px;
    margin-bottom: 1.25rem;
    position: relative;
    overflow: hidden;
}

.skeleton-item::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: shine 2s infinite;
}

@keyframes shine {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.skeleton-title {
    width: 30%;
    height: 2.2rem;
    margin-bottom: 2.5rem;
}

.skeleton-text {
    width: 100%;
    height: 1.1rem;
}

.skeleton-text.short {
    width: 60%;
}

/* Animations */
@keyframes slide-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 1s ease-out;
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .about-hero {
        padding: 1rem 0 5rem;
    }

    .about-title {
        font-size: 2.25rem;
    }

    .about-card,
    .skeleton-card {
        padding: 2rem 1.25rem;
    }

    .content-wrapper {
        margin-top: -3.5rem;
        padding: 0 10px;
        margin-bottom: 3.5rem;
    }
}
</style>
