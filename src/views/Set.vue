<template>
    <div class="set-page responsive-container">
        <div class="layout-grid">
            <!-- Sidebar Navigation -->
            <aside class="sidebar">
                <nav class="sidebar-nav">
                    <button v-for="tab in tabs" :key="tab.name" @click="handleTabClick(tab.name)"
                        :class="['nav-item', { active: activeTab === tab.name }]">
                        <font-awesome-icon :icon="tab.icon" class="nav-icon" />
                        <span class="nav-label">{{ tab.label }}</span>
                        <span v-if="tab.count" class="badge">{{ tab.count }}</span>
                    </button>
                </nav>
            </aside>

            <!-- Main Content Area -->
            <main class="content-area">
                <div class="panel-container">
                    <keep-alive>
                        <component :is="currentTabComponent" />
                    </keep-alive>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
import ArticleList from './subviews/ArticleList.vue'
import ArticleTypeList from './subviews/ArticleTypeList.vue'
import DraftList from './subviews/DraftList.vue'
import LinkList from './subviews/LinkList.vue'
import ImageList from './subviews/ImageList.vue'
import BlogSettings from './subviews/BlogSettings.vue'

export default {
    name: 'SettingsView',
    components: {
        ArticleList,
        ArticleTypeList,
        DraftList,
        LinkList,
        ImageList,
        BlogSettings
    },
    data() {
        return {
            activeTab: 'articles',
            tabs: [
                { name: 'articles', label: '文章列表', icon: ['fas', 'list-ul'] },
                { name: 'types', label: '类型管理', icon: ['fas', 'folder'] },
                { name: 'drafts', label: '草稿箱', icon: ['fas', 'pen-to-square'] },
                { name: 'links', label: '友情链接', icon: ['fas', 'link'] },
                { name: 'images', label: '博客用图', icon: ['fas', 'images'] },
                { name: 'settings', label: '信息设置', icon: ['fas', 'sliders'] }
            ]
        }
    },
    created() {
        // Initialize active tab from URL query
        const queryTab = this.$route.query.tab
        if (queryTab && this.tabs.some(tab => tab.name === queryTab)) {
            this.activeTab = queryTab
        }
    },
    watch: {
        // Sync active tab when URL changes (e.g., browser back/forward)
        '$route.query.tab'(newTab) {
            if (newTab && this.tabs.some(tab => tab.name === newTab)) {
                this.activeTab = newTab
            } else if (!newTab) {
                this.activeTab = 'articles'
            }
        }
    },
    computed: {
        currentTabComponent() {
            const map = {
                'articles': 'ArticleList',
                'types': 'ArticleTypeList',
                'drafts': 'DraftList',
                'links': 'LinkList',
                'images': 'ImageList',
                'settings': 'BlogSettings'
            }
            return map[this.activeTab]
        }
    },

    methods: {
        handleTabClick(tabName) {
            if (this.activeTab === tabName) return
            this.activeTab = tabName
            this.$router.push({
                query: { ...this.$route.query, tab: tabName }
            })
        }
    }
}
</script>

<style scoped>
/* Page Layout */
.set-page {
    padding: 2rem 1rem;
    min-height: calc(100vh - 64px);
}

.responsive-container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    max-width: 1400px;
}

.layout-grid {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 2rem;
    min-height: 600px;
}

/* Sidebar */
.sidebar {
    position: relative;
}

.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: sticky;
    top: 6rem;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
}

.nav-item:hover {
    background-color: var(--hover-bg);
    color: var(--text-color);
}

.nav-item.active {
    background-color: #111827;
    color: white;
}

:root.dark-theme .nav-item.active {
    background-color: white;
    color: #000;
}

.nav-icon {
    width: 1.25rem;
    text-align: center;
}

.badge {
    margin-left: auto;
    background-color: #fee2e2;
    color: #dc2626;
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
    border-radius: 9999px;
    font-weight: 600;
}

/* Content Area */
.content-area {
    min-width: 0;
    /* Prevent overflow */
}

.panel-container {
    background: var(--card-bg);
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--border-color);
    padding: 1.5rem;
    /* Reduced from 2rem for better mobile fit */
    min-height: 100%;
}

/* Responsive */
@media (max-width: 1024px) {
    .layout-grid {
        grid-template-columns: 200px 1fr;
        gap: 1.5rem;
    }
}

@media (max-width: 768px) {
    .set-page {
        padding: 1rem;
    }

    .layout-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .sidebar-nav {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 0.5rem;
        position: static;
        width: 100%;
    }

    .nav-item {
        flex-shrink: 0;
        width: auto;
        white-space: nowrap;
        padding: 0.5rem 1rem;
    }

    .panel-container {
        padding: 1rem;
    }
}
</style>
