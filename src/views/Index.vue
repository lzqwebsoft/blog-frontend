<template>
    <div class="page-container">
        <div class="main-column">
            <!-- Skeleton Loading -->
            <div v-if="loading" class="skeleton-list">
                <div class="skeleton-card" v-for="i in 5" :key="i">
                    <div class="skeleton-meta-row">
                        <div class="skeleton-item skeleton-badge"></div>
                        <div class="skeleton-item skeleton-date"></div>
                    </div>
                    <div class="skeleton-item skeleton-title"></div>
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text short"></div>
                    <div class="skeleton-footer-row">
                        <div class="skeleton-item skeleton-stats"></div>
                        <div class="skeleton-item skeleton-more"></div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="articles.length === 0" class="empty-state">
                <div class="empty-icon-wrapper">
                    <font-awesome-icon icon="folder" class="empty-icon" />
                </div>
                <h3 class="empty-title">暂无文章</h3>
                <p class="empty-desc">这里空空如也，博主可能正在闭关修炼中...</p>
                <button class="back-home-btn" @click="$router.push('/')"
                    v-if="$route.params.categoryId || $route.query.q">
                    返回首页
                </button>
            </div>

            <!-- Article List -->
            <template v-else>
                <article class="article-card" v-for="article in articles" :key="article.id">
                    <!-- Meta Header -->
                    <div class="article-meta-header">
                        <ArticleBadge :type="getPatternType(article.pattern_type_id)" />
                        <span class="meta-text">
                            <font-awesome-icon icon="calendar-day" class="mr-1" />
                            {{ formatDate(article.release_at) }}
                        </span>
                        <span class="meta-tag" v-if="article.category_name">
                            {{ article.category_name }}
                        </span>
                        <ArticleBadge v-if="article.is_top" type="top" />
                    </div>

                    <!-- Title -->
                    <h2 class="article-title">
                        <RouterLink :to="getArticleUrl(article)">
                            <span v-html="article.title"></span>
                        </RouterLink>
                    </h2>

                    <!-- Summary -->
                    <p class="article-summary" v-html="article.content"></p>

                    <!-- Footer -->
                    <div class="article-footer">
                        <div class="stats-group">
                            <span>
                                <font-awesome-icon icon="eye" class="mr-1" />
                                {{ formatReadCount(article.readed_num) }} 次阅读
                            </span>
                            <span>
                                <font-awesome-icon icon="comment-dots" class="mr-1" />
                                {{ article.comment_count || 0 }} 评论
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
                    <button class="page-btn nav-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                        <font-awesome-icon icon="chevron-left" class="mr-1" />
                    </button>
                    <div class="page-numbers">
                        <button v-for="pageNum in paginationPages()" :key="pageNum" class="page-btn number-btn"
                            :class="{ 'active': pageNum === currentPage }" @click="changePage(pageNum)">
                            {{ pageNum }}
                        </button>
                    </div>
                    <button class="page-btn nav-btn" @click="changePage(currentPage + 1)"
                        :disabled="currentPage === totalPages">
                        <font-awesome-icon icon="chevron-right" class="ml-1" />
                    </button>
                </div>
            </template>
        </div>

        <!-- Right: Sidebar -->
        <aside class="sidebar-column" :class="{ 'mobile-open': sidebarOpen }">

            <div class="sidebar-content">

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
                        <a href="https://github.com/lzqwebsoft" target="_blank" class="social-icon"><font-awesome-icon
                                :icon="['fab', 'github']" /></a>
                        <a href="https://twitter.com/lzqwebsoft" target="_blank" class="social-icon"><font-awesome-icon
                                :icon="['fab', 'x-twitter']" /></a>
                        <a :href="'mailto:' + blogInfo.email" class="social-icon"><font-awesome-icon
                                icon="envelope" /></a>
                    </div>
                </div>

            </div>
        </aside>

        <!-- Mobile Overlay -->
        <div class="sidebar-overlay" :class="{ 'visible': sidebarOpen }" @click="toggleSidebar"></div>
    </div>
</template>

<script>
import ArticleBadge from '../components/ArticleBadge.vue'
import { getHomeData, deleteArticle } from '@/api/article'
import { isAuthenticated } from '@/utils/auth'
import eventBus from '@/utils/eventBus'
import { formatDate, formatReadCount, getPatternType } from '@/utils/tools'

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
            visiblePages: 4,
            sidebarOpen: false,
            loading: false,
            isAuthenticated: false,
        }
    },
    mounted() {
        this.checkAuthStatus()
        this.currentPage = parseInt(this.$route.query.page) || 1
        this.fetchHomeData()
        eventBus.on('toggle-sidebar', this.toggleSidebar)
    },
    unmounted() {
        if (this.sidebarOpen) this.toggleSidebar()
        eventBus.off('toggle-sidebar', this.toggleSidebar)
    },
    watch: {
        '$route': {
            handler(to, from) {
                // 当分类 ID 改变、关键字搜索改变或页码改变时，重新获取数据
                if (to.params.categoryId !== from.params.categoryId ||
                    to.query.q !== from.query.q ||
                    to.query.page !== from.query.page) {
                    this.currentPage = parseInt(to.query.page) || 1
                    this.fetchHomeData()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }
            }
        }
    },
    methods: {
        formatDate,
        formatReadCount,
        getPatternType,

        checkAuthStatus() {
            this.isAuthenticated = isAuthenticated()
        },

        async fetchHomeData() {
            this.loading = true
            try {
                const categoryId = this.$route.params.categoryId || null
                const q = this.$route.query.q || null
                const res = await getHomeData(q, this.currentPage, this.pageSize, categoryId)
                const { articleTypes, page, top10Articles, links } = res.data

                this.categories = (articleTypes || []).filter((type) => type.article_count > 0).map((type) => ({
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
                this.$router.push({
                    query: { ...this.$route.query, page: pageNum }
                })
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
    display: flex;
    justify-content: center;
    flex-direction: row;
}

.main-column {
    flex-grow: 4;
    margin-right: 1rem;
}

.sidebar-column {
    margin-left: 1rem;
}

/* Article Card */
.article-card {
    background-color: var(--card-bg);
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: var(--shadow-color) 0px 4px 20px -2px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid transparent;
    margin-bottom: 2rem;
}

.article-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

:root.dark-theme .article-card {
    border-color: var(--border-color);
}

.article-meta-header {
    display: flex;
    flex-wrap: wrap;
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
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-color);
}

.stats-group {
    display: flex;
    flex-wrap: wrap;
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
    font-size: 1rem;
    padding: 0.4rem 1rem;
    border-radius: 0.4rem;
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

.page-label {
    margin: 2rem 0 1rem;
    color: var(--text-secondary);
    font-size: 1rem;
    font-weight: 500;
}

/* Pagination */
.pagination-wrapper {
    padding-top: 3rem;
    margin-top: 2rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.page-btn {
    height: 2.5rem;
    min-width: 2.5rem;
    padding: 0 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
    background: var(--card-bg);
    color: var(--text-color);
    cursor: pointer;
    font-size: 0.9375rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px var(--shadow-color);
}

.page-btn:hover:not(:disabled) {
    background-color: var(--hover-bg);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-color);
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
}

.page-btn.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.page-btn.nav-btn {
    padding: 0 1.25rem;
}

.page-numbers {
    display: flex;
    gap: 0.5rem;
}

.number-btn {
    padding: 0;
}

/* Sidebar Styling */
.sidebar-card {
    background-color: var(--card-bg);
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: var(--shadow-color) 0px 4px 20px -2px;
    border: 1px solid transparent;
    margin-bottom: 2rem;
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

/* Loading & Empty */
/* Skeleton Loading & Animation */
.skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.skeleton-card {
    background-color: var(--card-bg);
    border-radius: 0.75rem;
    padding: 2rem;
    box-shadow: var(--shadow-color) 0px 4px 20px -2px;
    border: 1px solid transparent;
}

:root.dark-theme .skeleton-card {
    border-color: var(--border-color);
}

.skeleton-item {
    background: #e5e7eb;
    border-radius: 0.375rem;
    position: relative;
    overflow: hidden;
}

:root.dark-theme .skeleton-item {
    background: #1f2937;
}

.skeleton-item::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent);
    animation: shine 1.5s infinite linear;
}

:root.dark-theme .skeleton-item::after {
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.05),
            transparent);
}

@keyframes shine {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

.skeleton-meta-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.skeleton-badge {
    width: 60px;
    height: 1.5rem;
}

.skeleton-date {
    width: 100px;
    height: 1.5rem;
}

.skeleton-title {
    width: 80%;
    height: 2rem;
    margin-bottom: 1.5rem;
}

.skeleton-text {
    width: 100%;
    height: 1rem;
    margin-bottom: 0.75rem;
}

.skeleton-text.short {
    width: 40%;
}

.skeleton-footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
}

.skeleton-stats {
    width: 120px;
    height: 1.25rem;
}

.skeleton-more {
    width: 80px;
    height: 1.25rem;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
}

:root.dark-theme .empty-state {
    border-color: var(--border-color);
}

.empty-icon-wrapper {
    color: var(--text-secondary);
    font-size: 5rem;
}

.empty-icon {
    animation: float 3s ease-in-out infinite;
    opacity: 0.4;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-20px);
    }
}

.empty-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 1rem;
    font-family: var(--font-serif);
}

.empty-desc {
    color: var(--text-secondary);
    font-size: 1.125rem;
    max-width: 400px;
    margin-bottom: 2.5rem;
}

.back-home-btn {
    padding: 0.75rem 2rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.back-home-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    background-color: var(--primary-hover);
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

    .main-column {
        margin-right: 0.5rem;
    }

    .sidebar-column {
        margin-left: 0.5rem;
    }
}

/* Mobile Sidebar Drawer */
@media (max-width: 768px) {
    .page-container {
        max-width: 100%;
        width: 100%;
        padding: 10px;
        display: block;
    }

    .main-column {
        margin-right: 0;
        width: 100%;
        margin-bottom: 2rem;
    }

    .sidebar-column {
        margin-left: 0;
    }

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
        padding: 80px 0 0;
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
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
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

    .sidebar-content {
        width: 300px;
    }
}

/* Search Highlight */
:deep(mark) {
    background-color: transparent;
    color: #ef4444 !important;
    padding: 0 2px;
}

:deep(.article-summary mark) {
    font-weight: 600;
}
</style>
