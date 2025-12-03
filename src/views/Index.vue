<template>
    <div class="container">
        <div class="main-content">
            <div class="article-list">
                <div v-if="loading" class="loading-container">
                    <div class="spinner-large"></div>
                    <p>加载中...</p>
                </div>

                <div v-else-if="articles.length === 0" class="empty-container">
                    <p>暂无文章</p>
                </div>

                <div v-else class="article-card" v-for="article in articles" :key="article.id">
                    <div class="article-card-header">
                        <h3 class="article-title">
                            <ArticleBadge :type="getPatternType(article.pattern_type_id)" />
                            <RouterLink :to="getArticleUrl(article)">{{ article.title }}</RouterLink>
                            <ArticleBadge v-if="article.is_top" type="top" />
                        </h3>
                        <div class="article-info">
                            <div class="article-info-item">
                                <font-awesome-icon icon="calendar-day" />
                                {{ formatDate(article.create_at) }}
                            </div>
                            <div class="article-info-item">
                                <font-awesome-icon icon="eye" />
                                {{ formatReadCount(article.readed_num) }} 阅读
                            </div>
                            <div class="article-info-item">
                                <font-awesome-icon icon="comment-dots" />
                                {{ article.comment_count || 0 }} 评论
                            </div>
                        </div>
                    </div>

                    <div class="article-card-body">
                        <p class="article-excerpt">
                            {{ truncateContent(article.content) }}
                        </p>
                    </div>

                    <div v-if="isAuthenticated" class="article-card-footer">
                        <div>
                            <button class="btn btn-primary" @click="handleEdit(article)">
                                <font-awesome-icon icon="pen-to-square" />
                                编辑
                            </button>
                            <button class="btn btn-danger" style="margin-left: 0.5rem" @click="handleDelete(article)">
                                <font-awesome-icon icon="trash" />
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pagination">
                <button class="btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                    上一页
                </button>

                <button v-for="pageNum in paginationPages()" :key="pageNum" class="btn"
                    :class="{ 'active': pageNum === currentPage }" @click="changePage(pageNum)">
                    {{ pageNum }}
                </button>

                <button class="btn" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                    下一页
                </button>
            </div>

            <div class="page-label">{{ totalArticles }}篇文章, 共{{ totalPages }}页</div>
        </div>

        <!-- 小屏时顶部显示 -->
        <div class="sidebar-navigation-button" :class="{ 'sidebar-open': sidebarOpen }" @click="toggleSidebar">
            <span>分类导航</span>
        </div>

        <!-- 移动端侧边栏遮罩 -->
        <div class="sidebar-backdrop" :class="{ 'backdrop-visible': sidebarOpen }" @click="toggleSidebar"></div>

        <div class="sidebar-wrapper" :class="{ 'sidebar-open': sidebarOpen }">
            <div class="sidebar" v-if="categories.length > 0">
                <h3><font-awesome-icon icon="folder" class="sidebar-icon" />文章分类</h3>
                <div class="list-group">
                    <div class="sidebar-item" v-for="category in categories" :key="category.id">
                        <RouterLink :to="category.url">{{ category.name }}</RouterLink>
                        <span>{{ category.num }}篇</span>
                    </div>
                </div>
            </div>

            <div class="sidebar" v-if="top10.length > 0">
                <h3><font-awesome-icon icon="fire" class="sidebar-icon" />阅读排行</h3>
                <div class="list-group">
                    <div class="sidebar-item" v-for="article in top10" :key="article.id">
                        <RouterLink :to="article.url">{{ article.title }}</RouterLink>
                        <span>{{ article.read }}</span>
                    </div>
                </div>
            </div>

            <div class="sidebar">
                <h3><font-awesome-icon icon="link" class="sidebar-icon" />相关链接</h3>
                <div class="list-group">
                    <div class="sidebar-item" v-for="(link, index) in links" :key="index">
                        <a :href="link.path" target="_blank" rel="noopener noreferrer">
                            {{ link.name }}
                        </a>
                    </div>
                </div>
            </div>

            <div class="sidebar">
                <h3><font-awesome-icon icon="address-card" class="sidebar-icon" />联系我</h3>
                <div class="list-group">
                    <div class="sidebar-item">
                        <a href="mailto:lzqwebsoft@gmail.com">lzqwebsoft@gmail.com</a>
                    </div>
                    <div class="sidebar-item">
                        <a href="mailto:751939573@qq.com">751939573@qq.com</a>
                    </div>
                </div>
            </div>

            <div class="sidebar">
                <!-- <iframe
                        frameborder="no"
                        border="0"
                        marginwidth="0"
                        marginheight="0"
                        width="100%"
                        height="110"
                        src="//music.163.com/outchain/player?type=0&id=75000240&auto=1&height=90"
                    ></iframe> -->
            </div>
        </div>
    </div>
</template>

<script>
import ArticleBadge from '../components/ArticleBadge.vue'
import { getHomeData, deleteArticle } from '@/api/article'
import { isAuthenticated } from '@/utils/auth'
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
            links: [
                { path: 'http://blog.csdn.net/lzqwebsoft', name: 'CSDN' },
                { path: 'https://twitter.com/lzqwebsoft', name: 'Twitter' },
                { path: 'https://github.com/lzqwebsoft', name: 'GitHub' },
                { path: 'https://stackoverflow.com/users/lzqwebsoft', name: 'StackOverflow' },
            ],
            currentPage: 1,
            totalPages: 1,
            totalArticles: 0,
            pageSize: 15,
            visiblePages: 6,
            sidebarOpen: false,
            loading: false,
            isAuthenticated: false,
        }
    },
    mounted() {
        this.checkAuthStatus()
        this.fetchHomeData()
    },
    watch: {
        '$route.params.categoryId': {
            handler() {
                this.currentPage = 1
                this.fetchHomeData()
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

                // 处理文章列表
                this.articles = page.data || []
                this.currentPage = page.pageNo || 1
                this.totalArticles = page.totalCount || 0
                this.totalPages = Math.ceil(this.totalArticles / this.pageSize)

                // 处理分类
                this.categories = (articleTypes || []).map((type) => ({
                    name: type.name,
                    num: type.article_count,
                    url: `/select/${type.id}`,
                    id: type.id
                }))

                // 处理阅读排行
                this.top10 = (top10Articles || []).map((article) => ({
                    title: article.title,
                    read: formatReadCount(article.readed_num),
                    url: `/show/${article.id}.html`,
                    id: article.id
                }))

                // 处理相关链接
                this.links = (links || [
                    { path: 'http://blog.csdn.net/lzqwebsoft', name: 'CSDN' },
                    { path: 'https://twitter.com/lzqwebsoft', name: 'Twitter' },
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
        },
        getArticleUrl(article) {
            return `/show/${article.id}`
        },
        handleEdit(article) {
            this.$router.push(`/article/edit/${article.id}`)
        },
        async handleDelete(article) {
            if (!confirm(`确定要删除文章《${article.title}》吗？`)) {
                return
            }

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
.article-list {
    padding-bottom: 10px;
}

.article-card {
    background-color: var(--card-bg);
    border-radius: 16px;
    box-shadow: 0 4px 20px var(--shadow-color);
    transition: var(--transition);
    position: relative;
    overflow: hidden;
    margin-bottom: 1rem;
}

.article-card-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    transition: border-color 0.3s ease;
}

.article-card-body {
    padding: 1rem;
}

.article-card-footer {
    clear: both;
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    background-color: var(--hover-bg);
    transition:
        border-color 0.3s ease,
        background-color 0.3s ease;
    overflow: hidden;
}

.article-card-footer div {
    float: right;
}

.article-title {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.4rem;
}

.article-title a {
    color: #007bff;
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.article-title a:hover {
    color: #0056b3;
    text-decoration: underline;
}

.article-info {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    flex-direction: row;
}

.article-info-item {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

.article-excerpt {
    color: var(--text-color);
    line-height: 1.6;
}

.sidebar-item a {
    color: var(--text-color);
    text-decoration: none;
    flex: 1;
}

.container {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    gap: 20px;
}

.main-content {
    flex: 1;
    width: 70%;
}

.sidebar-navigation-button {
    display: none;
    flex-direction: column;
    writing-mode: vertical-lr;
    text-orientation: mixed;
    position: fixed;
    top: 23%;
    right: 0;
    transform: translateY(-50%);
    width: 50px;
    height: auto;
    padding: 16px 12px;
    border-radius: 8px 0 0 8px;
    border: 1px solid var(--border-color);
    border-right: none;
    background-color: var(--header-bg);
    box-shadow: -2px 2px 8px var(--shadow-color);
    z-index: 899;
    gap: 6px;
    font-size: 0.9rem;
    letter-spacing: 1px;
}

.sidebar-navigation-button:hover {
    background-color: var(--hover-bg);
}

.nav-button-icon {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
}

.sidebar-backdrop {
    display: none;
    position: fixed;
    top: var(--sidebar-nav-top, 68px);
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 799;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    backdrop-filter: blur(2px);
}

.sidebar-backdrop.backdrop-visible {
    opacity: 1;
    visibility: visible;
}

.sidebar-wrapper {
    width: 30%;
    position: sticky;
    top: 20px;
}


/* Sidebar styles */

.sidebar {
    background: var(--card-bg);
    border-radius: 16px;
    box-shadow: 0 4px 20px var(--shadow-color);
    margin-bottom: 1rem;
    transition:
        background-color 0.3s ease,
        box-shadow 0.3s ease;
    overflow: hidden;
}

.sidebar h3 {
    color: var(--text-color);
    padding: 1rem 1rem 0.5rem;
    border-bottom: 1px solid var(--border-color);
    font-size: 1.1rem;
    transition: border-color 0.3s ease;
    background-color: var(--hover-bg);
}

.sidebar-icon {
    margin-right: 0.5rem;
}

.sidebar-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--border-color);
    transition: border-color 0.3s ease;
}

.sidebar-item:last-child {
    border-bottom: none;
}

/* 加载状态 */
.loading-container,
.empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
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

@media (max-width: 768px) {
    .container {
        flex-direction: row;
        flex-wrap: wrap;
        margin-top: 0px;
    }

    .main-content {
        flex: 1 1 65%;
        width: 100%;
    }

    .article-list {
        margin: 0 10px;
    }

    .sidebar-navigation-button {
        display: flex;
        transition: all 0.3s ease;
        background-color: var(--header-bg);
        border: 1px solid var(--border-color);
        border-right: none;
    }

    .sidebar-navigation-button.sidebar-open {
        transform: translateY(-50%) translateX(-275px);
        background-color: var(--bg-color);
        border-color: transparent;
        box-shadow: none;
    }

    .sidebar-wrapper {
        position: fixed;
        top: 0;
        right: -280px;
        width: 280px;
        height: 100vh;
        background: var(--bg-color);
        z-index: 800;
        transition: transform 0.3s ease;
        overflow-y: auto;
        box-shadow: -2px 0 8px var(--shadow-color);
        padding: calc(var(--sidebar-nav-top, 68px) + 60px) 16px 16px;
    }

    .sidebar-wrapper.sidebar-open {
        transform: translateX(-280px);
    }

    .sidebar {
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px var(--shadow-color);
    }

    .hidden-sm {
        display: none;
    }

    .sidebar-backdrop {
        display: block;
    }
}
</style>
