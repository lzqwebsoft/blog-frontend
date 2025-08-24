<script>
import ArticleBadge from '../components/ArticleBadge.vue'

export default {
    components: {
        ArticleBadge,
    },
    data() {
        return {
            articles: [
                {
                    title: '欢迎造访本博客',
                    isTop: true,
                    url: '/show/20130119074245.html',
                    content:
                        '2016-03-02更新：本站已转为VPS，Heroku云免费的太慢，收费的太贵~ 本站点是基于Heroku云平台建立的轻巧型个人博客，纯属自娱自乐。 其实在早些时候，就一直有编写一个自己的个人博客的想法，但由于种种原因而搁浅，一方面是由于早些时候个人的技术还不过关,另一方面就是没有找到免费且服务器稳定的空间提供商。直到去年实习学习RUBY的时候在网页上知道了HEROKU这个平台，渐而燃起了希望。 一直有人问我为什么对做博客这样的感兴趣，CSDN，博客园，开源中国等不是提供了现成的了吗？我想说的是，作为一个程序员如果连一个完全属于自己的博客都没有是一件很遗憾的事，那些现成的博客不能正真让你感觉那个博客就是你的，因为出于一些安全考虑会有很多的限制。 最初本来打算使用RUBY来做的，而且也己经做成了一个初步的版本，但由于HEORKU上提供的RAILS框架是3.0以上的，而我学习使用的是2.3...',
                },
                {
                    title: '《被讨厌的勇气》讲了什么',
                    isTop: false,
                    url: '/show/20190421031312.html',
                    content: `最近读了一本书《被讨厌的勇气》，觉得很有必要写一篇读后总结，个人认为其中的一些观点值得被分享。当然了制造这篇文章并不是为了强调它有多么的好或者说它绝对的正确，而只是觉得可以为我们提供另外的一个视角去看待或处理一些小情绪，从而更加全面的思考小情绪的本质。由于每个人的身处环境，积累的经验与知识都不一样，势必形成的认知不同，很难做到让每一个人都认同。但如果有哪本书能够引发部分读者的共鸣，那么它就应该值得被称为一本好书，这本书对于我而言就是这样。特别是根据他的"目地论"来推导我自己的某些想法时，感觉后脊梁会有一身冷汗。废话不多说，言归正传。 打下基调 世界是我们的主观感受 在全书的开头就提出了一个"井水"推论：人并不是住在客观的世界里，而是住在自我营造的主观世界里，即我们看到世界的样子都是我们的主观感受。 提出这个推论的依据是说，井水的温度是恒定的，长年在18度左右，无论谁测都是一样，但是夏天喝到...`,
                },
            ],
            page: 1,
            totalPages: 4,
            totalArticles: 51,
            categories: [
                { name: '杂谈', num: 10, url: '/select/1' },
                { name: 'PHP', num: 9, url: '/select/2' },
                { name: 'Linux', num: 8, url: '/select/3' },
                { name: 'Java', num: 7, url: '/select/4' },
                { name: 'JavaScript', num: 6, url: '/select/5' },
                { name: 'Python', num: 5, url: '/select/6' },
            ],
            top10: [
                {
                    title: '欢迎访问本博客',
                    read: '60k+',
                    url: '/show/20130119074245.html',
                },
                {
                    title: '解决近期heroku push timeout错误',
                    read: '33k+',
                    url: '/show/20130119074245.html',
                },
                {
                    title: 'Spring Boot 2.x 新特性',
                    read: '25k+',
                    url: '/show/20130119074245.html',
                },
                {
                    title: 'Vue3 迁移指南',
                    read: '18k+',
                    url: '/show/20130119074245.html',
                },
                {
                    title: 'Docker 入门实践',
                    read: '15k+',
                    url: '/show/20130119074245.html',
                },
            ],
            links: [
                { path: 'http://blog.csdn.net/lzqwebsoft', name: 'CSDN' },
                { path: 'https://twitter.com/lzqwebsoft', name: 'Twitter' },
                { path: 'https://github.com/lzqwebsoft', name: 'GitHub' },
                { path: 'https://stackoverflow.com/users/lzqwebsoft', name: 'StackOverflow' },
            ],
            currentPage: 1,
            visiblePages: 6,
            sidebarOpen: false,
        }
    },
    methods: {
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
            if (pageNum >= 1 && pageNum <= this.totalPages) {
                this.currentPage = pageNum
            }
        },
        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    },
}
</script>

<template>
    <div class="container">
        <div class="main-content">
            <div class="article-list">
                <div class="article-card" v-for="(article, index) in articles" :key="index">
                    <div class="article-card-header">
                        <h3 class="article-title">
                            <ArticleBadge type="original" />
                            <RouterLink :to="article.url">{{ article.title }}</RouterLink>
                            <ArticleBadge v-if="article.isTop" type="top" />
                        </h3>
                        <div class="article-info">
                            <div class="article-info-item">
                                <font-awesome-icon icon="calendar-day" />
                                {{ formatDate('2013-01-20 08:42:45') }}
                            </div>
                            <div class="article-info-item">
                                <font-awesome-icon icon="eye" />
                                11K 阅读
                            </div>
                            <div class="article-info-item">
                                <font-awesome-icon icon="comment-dots" />
                                0 评论
                            </div>
                        </div>
                    </div>

                    <div class="article-card-body">
                        <p class="article-excerpt">
                            {{ article.content }}...
                        </p>
                    </div>

                    <div class="article-card-footer">
                        <div>
                            <button class="btn btn-primary">
                                <font-awesome-icon icon="pen-to-square" />
                                编辑
                            </button>
                            <button class="btn btn-danger" style="margin-left: 0.5rem">
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
        <div class="sidebar-navigation-button" @click="toggleSidebar">
            <span>分类&排行&友链</span>
            <font-awesome-icon icon="angle-right" class="nav-button-icon" :class="{ 'arrow-show': sidebarOpen }" />
        </div>

        <!-- 移动端侧边栏遮罩 -->
        <div class="sidebar-backdrop" :class="{ 'backdrop-visible': sidebarOpen }" @click="toggleSidebar"></div>

        <div class="sidebar-wrapper" :class="{ 'sidebar-open': sidebarOpen }">
            <div class="sidebar">
                <h3><font-awesome-icon icon="folder" class="sidebar-icon" />文章分类</h3>
                <div class="list-group">
                    <div class="sidebar-item" v-for="(category, index) in categories" :key="index">
                        <RouterLink :to="category.url">{{ category.name }}</RouterLink>
                        <span>{{ category.num }}篇</span>
                    </div>
                </div>
            </div>

            <div class="sidebar">
                <h3><font-awesome-icon icon="fire" class="sidebar-icon" />阅读排行</h3>
                <div class="list-group">
                    <div class="sidebar-item" v-for="(top, index) in top10" :key="index">
                        <RouterLink :to="top.url">{{ top.title }}</RouterLink>
                        <span>{{ top.read }}</span>
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
    position: fixed;
    top: var(--sidebar-nav-top, 68px);
    left: 0;
    right: 0;
    z-index: 900;
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500;
    color: var(--text-color);
    box-shadow: 0 2px 8px var(--shadow-color);
    filter: blur(1px);
}

.sidebar-navigation-button:hover {
    background-color: var(--hover-bg);
}

.nav-button-icon {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
}

.nav-button-icon.arrow-show {
    transform: rotate(90deg);
}

.sidebar-backdrop {
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

@media (max-width: 768px) {
    .container {
        flex-direction: row;
        flex-wrap: wrap;
        margin-top: 50px;
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

/* 桌面端隐藏遮罩 */
@media (min-width: 769px) {
    .sidebar-backdrop {
        display: none;
    }
}
</style>
