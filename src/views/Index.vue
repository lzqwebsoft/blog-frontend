<template>
    <div class="page-container">
        <div class="grid-layout">
            <div class="main-column space-y-8">
                <div v-if="loading" class="loading-container">
                    <div class="spinner-large"></div>
                    <p>加载中...</p>
                </div>

                <div v-else-if="articles.length === 0" class="empty-container">
                    <p>暂无文章</p>
                </div>

                <!-- Article List -->
                <template v-else>
                    <article class="article-card" v-for="article in articles" :key="article.id">
                        <!-- Meta Header -->
                        <div class="article-meta-header">
                            <ArticleBadge :type="getPatternType(article.pattern_type_id)" />
                            <span class="meta-text">
                                <font-awesome-icon icon="calendar-day" class="mr-1" />{{ formatDate(article.release_at)
                                }}
                            </span>
                            <span class="meta-tag" v-if="article.category_name">
                                {{ article.category_name }}
                            </span>
                            <ArticleBadge v-if="article.is_top" type="top" />
                        </div>

                        <!-- Title -->
                        <h2 class="article-title">
                            <RouterLink :to="getArticleUrl(article)">
                                {{ article.title }}
                            </RouterLink>
                        </h2>

                        <!-- Summary -->
                        <p class="article-summary">
                            {{ truncateContent(article.content) }}
                        </p>

                        <!-- Footer -->
                        <div class="article-footer">
                            <div class="stats-group">
                                <span>
                                    <font-awesome-icon icon="eye" class="mr-1" />
                                    {{ formatReadCount(article.readed_num) }}
                                </span>
                                <span>
                                    <font-awesome-icon icon="comment-dots" class="mr-1" />
                                    {{ article.comment_count || 0 }}
                                </span>
                            </div>
                            <RouterLink :to="getArticleUrl(article)" class="read-more-link">
                                阅读全文 &rarr;
                            </RouterLink>
                        </div>

                        <!-- Admin Controls -->
                        <div v-if="isAuthenticated" class="admin-controls">
                            <button class="action-btn edit-btn" @click="handleEdit(article)">
                                <font-awesome-icon icon="pen-to-square" /> 编辑
                            </button>
                            <button class="action-btn delete-btn" @click="handleDelete(article)">
                                <font-awesome-icon icon="trash" /> 删除
                            </button>
                        </div>
                    </article>

                    <!-- Pagination -->
                    <div class="page-label">{{ totalArticles }}篇文章, 共{{ totalPages }}页</div>

                    <div class="pagination-wrapper">
                        <button class="page-btn nav-btn" @click="changePage(currentPage - 1)"
                            :disabled="currentPage === 1">
                            &larr; 上一页
                        </button>
                        <div class="page-numbers">
                            <button v-for="pageNum in paginationPages()" :key="pageNum" class="page-btn number-btn"
                                :class="{ 'active': pageNum === currentPage }" @click="changePage(pageNum)">
                                {{ pageNum }}
                            </button>
                        </div>
                        <button class="page-btn nav-btn" @click="changePage(currentPage + 1)"
                            :disabled="currentPage === totalPages">
                            下一页 &rarr;
                        </button>
                    </div>
                </template>
            </div>

            <!-- Right: Sidebar (4/12) -->
            <aside class="sidebar-column" :class="{ 'mobile-open': sidebarOpen }">

                <div class="sidebar-content space-y-8">

                    <!-- Categories -->
                    <div class="sidebar-card" v-if="categories.length > 0">
                        <h3 class="sidebar-title"><font-awesome-icon icon="folder" class="sidebar-icon" />分类目录</h3>
                        <ul class="sidebar-list">
                            <li v-for="category in categories" :key="category.id" class="sidebar-item group">
                                <RouterLink :to="category.url" class="sidebar-link">
                                    {{ category.name }}
                                </RouterLink>
                                <span class="count-badge">{{ category.num }}</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Top 10 -->
                    <div class="sidebar-card" v-if="top10.length > 0">
                        <h3 class="sidebar-title"><font-awesome-icon icon="fire" class="sidebar-icon" />点击排行</h3>
                        <ul class="ranking-list">
                            <li v-for="(article, index) in top10" :key="article.id" class="ranking-item">
                                <span class="rank-number">{{ String(index + 1).padStart(2, '0') }}</span>
                                <RouterLink :to="article.url" class="rank-link line-clamp-2">
                                    <div>{{ article.title }}</div>
                                    <small>{{ article.read }}次阅读</small>
                                </RouterLink>
                            </li>
                        </ul>
                    </div>

                    <!-- Links -->
                    <div class="sidebar-card">
                        <h3 class="sidebar-title"><font-awesome-icon icon="link" class="sidebar-icon" />友情链接</h3>
                        <div class="tags-cloud">
                            <a v-for="(link, index) in links" :key="index" :href="link.path" target="_blank"
                                class="tag-link">
                                {{ link.name }}
                            </a>
                        </div>
                    </div>

                    <!-- Contact -->
                    <div class="sidebar-card">
                        <h3 class="sidebar-title"><font-awesome-icon icon="address-card" class="sidebar-icon" />联系我</h3>
                        <div class="social-links">
                            <a href="https://github.com/lzqwebsoft" target="_blank"
                                class="social-icon"><font-awesome-icon :icon="['fab', 'github']" /></a>
                            <a href="https://twitter.com/lzqwebsoft" target="_blank"
                                class="social-icon"><font-awesome-icon :icon="['fab', 'x-twitter']" /></a>
                            <a href="mailto:lzqwebsoft@gmail.com" class="social-icon"><font-awesome-icon
                                    icon="envelope" /></a>
                        </div>
                    </div>

                </div>
            </aside>

            <!-- Mobile Overlay -->
            <div class="sidebar-overlay" :class="{ 'visible': sidebarOpen }" @click="toggleSidebar"></div>
        </div>
    </div>
</template>

<script>
import ArticleBadge from '../components/ArticleBadge.vue'
import { getHomeData, deleteArticle } from '@/api/article'
import { isAuthenticated } from '@/utils/auth'
import eventBus from '@/utils/eventBus'
import { formatDate, formatReadCount, truncateContent, getPatternType } from '@/utils/tools'

export default {
    components: {
        ArticleBadge,
    },
    data() {
        return {
            articles: [],
            categories: [],
            top10: [],
            links: [],
            currentPage: 1,
            totalPages: 1,
            totalArticles: 0,
            pageSize: 10,
            visiblePages: 5,
            sidebarOpen: false,
            loading: false,
            isAuthenticated: false,
        }
    },
    mounted() {
        this.checkAuthStatus()
        this.fetchHomeData()
        eventBus.on('toggle-sidebar', this.toggleSidebar)
    },
    unmounted() {
        eventBus.off('toggle-sidebar', this.toggleSidebar)
    },
    watch: {
        '$route.params.categoryId': {
            handler() {
                this.currentPage = 1
                this.fetchHomeData()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        }
    },
    methods: {
        formatDate,
        formatReadCount,
        truncateContent,
        getPatternType,

        checkAuthStatus() {
            this.isAuthenticated = isAuthenticated()
        },

        async fetchHomeData() {
            this.loading = true
            try {
                const categoryId = this.$route.params.categoryId || null
                const res = await getHomeData(this.currentPage, this.pageSize, categoryId)
                const { articleTypes, page, top10Articles, links } = res.data

                this.categories = (articleTypes || []).map((type) => ({
                    name: type.name,
                    num: type.article_count,
                    url: `/select/${type.id}`,
                    id: type.id
                }))
                // 由类型ID与类型列表得到文章类型名称
                const categoryMap = this.categories.reduce((acc, cur) => {
                    acc[cur.id] = cur.name;
                    return acc;
                }, {});

                this.articles = (page.data || []).map(article => ({
                    ...article,
                    category_name: categoryMap[article.type_id]
                }))
                this.currentPage = page.pageNo || 1
                this.totalArticles = page.totalCount || 0
                this.totalPages = Math.ceil(this.totalArticles / this.pageSize)

                this.top10 = (top10Articles || []).map((article) => ({
                    title: article.title,
                    read: formatReadCount(article.readed_num),
                    url: `/show/${article.id}.html`,
                    id: article.id
                }))

                this.links = (links || [
                    { path: 'https://github.com/lzqwebsoft', name: 'GitHub' },
                    { path: 'https://stackoverflow.com/users/lzqwebsoft', name: 'StackOverflow' }
                ]);
            } catch (error) {
                console.error('获取首页数据失败:', error)
            } finally {
                this.loading = false
            }
        },

        paginationPages() {
            const pages = []
            const start = Math.max(1, this.currentPage - Math.floor(this.visiblePages / 2))
            const end = Math.min(this.totalPages, start + this.visiblePages - 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
            return pages
        },

        changePage(pageNum) {
            if (pageNum >= 1 && pageNum <= this.totalPages && pageNum !== this.currentPage) {
                this.currentPage = pageNum
                this.fetchHomeData()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        },

        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen
            if (this.sidebarOpen) {
                document.body.style.overflow = 'hidden'
            } else {
                document.body.style.overflow = ''
            }
        },

        getArticleUrl(article) {
            return `/show/${article.id}`
        },

        handleEdit(article) {
            this.$router.push(`/edit/${article.id}`)
        },

        async handleDelete(article) {
            if (!confirm(`确定要删除文章《${article.title}》吗？`)) return
            try {
                await deleteArticle(article.id)
                this.fetchHomeData()
            } catch (error) {
                console.error('删除文章失败:', error)
                alert('删除失败，请重试')
            }
        }
    },
}
</script>

<style scoped>
/* Layout */
.page-container {
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    max-width: 1750px;
    padding: 2rem 1rem;
}

.grid-layout {
    display: flex;
    flex-direction: row;
    gap: 2rem;
}

/* Utilities */
.space-y-8>*+* {
    margin-top: 2rem;
}

/* Article Card */
.article-card {
    background-color: var(--card-bg);
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: var(--shadow-color) 0px 4px 20px -2px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid transparent;
}

.article-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

:root.dark-theme .article-card {
    border-color: var(--border-color);
}

.article-meta-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    font-size: 1.0rem;
}

.badge {
    padding: 0.4rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
}

.meta-text {
    color: var(--text-secondary);
}

.meta-tag {
    background-color: var(--hover-bg);
    color: var(--text-secondary);
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    transition: color 0.3s;
}

.meta-tag:hover {
    color: var(--text-color);
}

.article-title {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 1rem;
    line-height: 1.25;
    letter-spacing: -0.025em;
}

.article-title a {
    color: inherit;
    text-decoration: none;
    transition: color 0.3s;
}

.article-title a:hover {
    color: var(--primary-color);
}

.article-summary {
    color: var(--text-color);
    font-size: 1rem;
    line-height: 1.625;
    margin-bottom: 1.5rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.article-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    color: var(--text-color);
}

.stats-group {
    display: flex;
    gap: 1.25rem;
    color: var(--text-secondary);
}

.read-more-link {
    font-size: 1rem;
    /* text-base */
    font-weight: 500;
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.read-more-link:hover {
    color: var(--primary-color);
    text-decoration: underline;
}

.admin-controls {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: background-color 0.3s;
}

.edit-btn {
    background-color: rgba(37, 99, 235, 0.1);
    color: #2563eb;
}

.edit-btn:hover {
    background-color: rgba(37, 99, 235, 0.2);
}

.delete-btn {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

.delete-btn:hover {
    background-color: rgba(220, 53, 69, 0.2);
}

/* Pagination */
.pagination-wrapper {
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
}

.page-btn {
    height: 2rem;
    min-width: 2rem;
    padding: 0 0.5rem;
    border-radius: 0.25rem;
    border: none;
    background: transparent;
    color: var(--text-color);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background-color: var(--hover-bg);
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-btn.active {
    background-color: var(--link-color);
    color: var(--bg-color);
}

.page-btn.nav-btn {
    color: var(--text-secondary);
}

.page-numbers {
    display: flex;
    gap: 0.25rem;
}

/* Sidebar Styling */
.sidebar-card {
    background-color: var(--card-bg);
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: var(--shadow-color) 0px 4px 20px -2px;
    border: 1px solid transparent;
}

:root.dark-theme .sidebar-card {
    border-color: var(--border-color);
}

.sidebar-title {
    font-family: var(--font-serif);
    font-weight: 700;
    font-size: 1.25rem;
    /* text-xl */
    color: var(--text-color);
    margin-bottom: 1.25rem;
    padding-bottom: 0.8rem;
    border-bottom: 2px solid var(--text-secondary);
}

.sidebar-title .sidebar-icon {
    margin-right: 0.5rem;
}

.sidebar-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 1rem;
    cursor: pointer;
}

.sidebar-link {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s;
}

.group:hover .sidebar-link {
    color: var(--primary-color);
}

.count-badge {
    background-color: var(--hover-bg);
    color: var(--text-color);
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
}

/* Ranking List */
.ranking-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.ranking-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.rank-number {
    font-size: 1.25rem;
    /* text-xl */
    font-weight: 700;
    font-style: italic;
    color: #d1d5db;
    line-height: 1;
}

.rank-link {
    font-size: 1rem;
    color: var(--text-color);
    text-decoration: none;
    line-height: 1.4;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.rank-link:hover {
    text-decoration: underline;
}

.rank-link small {
    color: var(--text-secondary);
}

.rank-link small:hover {
    text-decoration: none;
}

/* Tags Cloud */
.tags-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tag-link {
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
    background-color: var(--hover-bg);
    color: var(--text-color);
    border-radius: 0.25rem;
    text-decoration: none;
    transition: background-color 0.3s;
}

.tag-link:hover {
    background-color: #e5e7eb;
}

:root.dark-theme .tag-link:hover {
    background-color: #374151;
}

/* Social Icons */
.social-links {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
}

.social-icon {
    font-size: 1.5rem;
    color: var(--text-secondary);
    transition: color 0.3s;
}

.social-icon:hover {
    color: var(--text-color);
}

/* Mobile Sidebar Drawer */
@media (max-width: 1023px) {
    .sidebar-column {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 16rem;
        background-color: var(--bg-color);
        z-index: 50;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
        overflow-y: auto;
        box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
        padding: 0;
    }

    .mobile-open {
        transform: translateX(0);
    }

    .sidebar-content {
        padding: 1.5rem;
    }

    .sidebar-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 40;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s;
        backdrop-filter: blur(2px);
    }

    .sidebar-overlay.visible {
        opacity: 1;
        visibility: visible;
    }

    .mobile-toggle-btn {
        position: fixed;
        bottom: 1.5rem;
        left: 1.5rem;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background-color: var(--primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        z-index: 45;
        border: none;
    }
}

/* Loading & Empty */
.loading-container,
.empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: var(--text-secondary);
}

.spinner-large {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(59, 130, 246, 0.2);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive Breakpoints - Desktop Enhancements */
@media (max-width: 1800px) {
    .page-container {
        max-width: 1750px;
    }
}

@media (max-width: 1550px) {
    .page-container {
        max-width: 1300px;
    }
}

@media (max-width: 1300px) {
    .page-container {
        max-width: 1100px;
    }
}

@media (max-width: 1024px) {
    .page-container {
        max-width: 900px;
    }
}

@media (max-width: 768px) {
    .page-container {
        max-width: 100%;
        width: 100%;
        padding: 1rem;
    }

    .grid-layout {
        display: block;
        flex-direction: initial;
        gap: initial;
    }
}

@media (min-width: 768px) {
    .article-card {
        padding: 2rem;
    }

    .article-title {
        font-size: 1.875rem;
    }

    .article-summary {
        font-size: 1.125rem;
    }
}

@media (min-width: 1024px) {
    .sidebar-column {
        display: block;
    }

    .mobile-toggle-btn {
        display: none;
    }

    .sidebar-content {
        width: 300px;
    }
}
</style>
