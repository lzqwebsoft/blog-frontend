<template>
    <div class="container article-detail">
        <!-- 面包屑导航 -->
        <nav class="breadcrumbs">
            <div class="breadcrumb">
                <template v-for="(item, index) in breadcrumbs" :key="index">
                    <RouterLink v-if="item.to" :to="item.to" :class="{ disabled: item.disabled }">
                        {{ item.text }}
                    </RouterLink>
                    <span v-else :class="{ disabled: item.disabled }">
                        {{ item.text }}
                    </span>
                </template>
            </div>
        </nav>

        <!-- 文章主体 -->
        <article class="article">
            <div v-if="loading" class="loading-container">
                <div class="spinner-large"></div>
                <p>加载中...</p>
            </div>

            <template v-else>
                <header class="article-header">
                    <h1 class="article-title">
                        <ArticleBadge :type="getPatternType(article.pattern_type_id)" />
                        <span>{{ article.title }}</span>
                        <ArticleBadge v-if="article.is_top" type="top" />
                    </h1>

                    <div class="article-meta">
                        <span>发表于：{{ formatDateTime(article.release_at) }}，已有{{
                            formatReadCount(article.readed_num) }}次阅读</span>

                        <div class="article-actions">
                            <button class="btn btn-secondary" @click="scrollToComments">评论</button>
                            <button v-if="isAuthenticated" class="btn btn-primary" @click="handleEdit">编辑</button>
                            <button v-if="isAuthenticated" class="btn btn-danger" @click="handleDelete">删除</button>
                        </div>
                    </div>
                </header>

                <div class="article-content" v-html="article.content"></div>

                <!-- 社交分享 -->
                <SNSShares :sns-info="snsInfo" />
            </template>

            <!-- 文章分页 -->
            <nav class="article-pager" v-if="!loading && (previousArticle || nextArticle)">
                <div v-if="previousArticle" class="pager-item prev" @click="navigateToArticle(previousArticle)">
                    <span class="pager-label">上一篇</span>
                    <span class="pager-title">{{ previousArticle.title }}</span>
                </div>
                <div v-else class="pager-item spacer"></div>

                <div v-if="nextArticle" class="pager-item next" @click="navigateToArticle(nextArticle)">
                    <span class="pager-label">下一篇</span>
                    <span class="pager-title">{{ nextArticle.title }}</span>
                </div>
                <div v-else class="pager-item spacer"></div>
            </nav>
        </article>

        <!-- 相关文章 -->
        <section class="related-articles" v-if="!loading && relatedArticles.length > 0">
            <h3>相关文章</h3>
            <div class="related-articles-list">
                <div class="related-article-item" v-for="rltArticle in relatedArticles" :key="rltArticle.id">
                    <RouterLink :to="rltArticle.url">{{ rltArticle.title }}</RouterLink>
                    <span class="article-date">({{ rltArticle.releaseAt }})</span>
                </div>
            </div>
        </section>

        <!-- 评论区域 -->
        <section class="comments" v-if="!loading">
            <h3 class="comment-list-title">网友评论 ({{ article.comment_count || 0 }})</h3>

            <div class="comments-list" v-if="comments.length > 0">
                <div class="comment" v-for="item in comments" :key="item.id">
                    <div class="comment-header">
                        <strong class="comment-author" :class="{ 'blogger-badge': item.isBlogger }">
                            {{ item.nickname }}
                            <span v-if="item.isBlogger" class="badge-text">博主</span>
                        </strong>
                        <div class="comment-actions">
                            <button class="btn btn-sm btn-secondary" @click="replyComment(item)">
                                回复
                            </button>
                            <button v-if="isAuthenticated" class="btn btn-sm btn-danger"
                                @click="deleteComment(item.id)">
                                删除
                            </button>
                        </div>
                    </div>

                    <div class="comment-content" v-html="item.content"></div>

                    <div class="comment-meta">{{ item.info }}</div>

                    <!-- 子评论 -->
                    <div class="comment-children" v-if="item.children?.length">
                        <div class="comment" v-for="child in item.children" :key="child.id">
                            <div class="comment-header">
                                <strong class="comment-author" :class="{ 'blogger-badge': child.isBlogger }">
                                    {{ child.nickname }}
                                    <span v-if="child.isBlogger" class="badge-text">博主</span>
                                </strong>
                                <div class="comment-actions">
                                    <button class="btn btn-sm btn-secondary" @click="replyComment(child)">
                                        回复
                                    </button>
                                    <button v-if="isAuthenticated" class="btn btn-sm btn-danger"
                                        @click="deleteComment(child.id)">
                                        删除
                                    </button>
                                </div>
                            </div>

                            <div class="comment-content" v-html="child.content"></div>

                            <div class="comment-meta">{{ child.info }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="empty-comments">
                <p>暂无评论，快来抢沙发吧~</p>
            </div>

            <!-- 评论表单 -->
            <form class="comment-form" @submit.prevent="submitComment">
                <div class="comment-head">
                    <h4>发表评论</h4>

                    <div class="comment-reply" v-if="replyTo">
                        <div class="reply-info">
                            <font-awesome-icon icon="reply" class="reply-icon" />
                            <span class="reply-text">回复 <strong class="reply-nickname">@{{ replyTo.nickname
                                    }}</strong></span>
                        </div>
                        <button type="button" class="btn-cancel-reply" @click="cancelReply">
                            <font-awesome-icon icon="xmark" class="cancel-icon" />
                            取消回复
                        </button>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 col-md-6" v-if="!isAuthenticated">
                        <div class="form-group">
                            <input type="text" class="form-control" v-model="nickname" placeholder="昵称" required />
                        </div>
                    </div>

                    <div class="col-12 col-md-6" v-if="!isAuthenticated">
                        <div class="form-group">
                            <input type="url" class="form-control" v-model="website" placeholder="个人网站（可选）" />
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="form-group">
                            <textarea class="form-control" rows="4" v-model="comment" placeholder="请输入评论内容..."
                                @focus="handleCommentFocus" required></textarea>
                        </div>
                    </div>

                    <div class="col-12" v-if="showCaptcha && !isAuthenticated">
                        <div class="form-group captcha-group">
                            <input type="text" class="form-control captcha-input" v-model="captchaCode"
                                placeholder="请输入验证码" required />
                            <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="captcha-image"
                                @click="refreshCaptcha" title="点击刷新验证码" />
                        </div>
                    </div>

                    <div class="col-12">
                        <button type="submit" class="btn btn-primary">确认发送</button>
                    </div>
                </div>
            </form>
        </section>

        <!-- 图片预览组件 -->
        <ImagePreview :visible="previewVisible" :image-url="previewImage" @close="previewVisible = false" />
    </div>
</template>

<script>
// PrismJS 代码高亮
import Prism from 'prismjs';
import ImagePreview from '@/components/ImagePreview.vue';
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/autolinker/prism-autolinker.css";
import "prismjs/plugins/autolinker/prism-autolinker.js";
import "prismjs/plugins/toolbar/prism-toolbar.css";
import "prismjs/plugins/toolbar/prism-toolbar.js";
import "prismjs/plugins/show-language/prism-show-language.js";
import "prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.js";

// PrismJS 语言组件批量导入
import "prismjs/components/prism-markup.min.js";
import "prismjs/components/prism-css.min.js";
import "prismjs/components/prism-clike.min.js";
import "prismjs/components/prism-javascript.min.js";
import "prismjs/components/prism-apacheconf.min.js";
import "prismjs/components/prism-c.min.js";
import "prismjs/components/prism-csharp.min.js";
import "prismjs/components/prism-bash.min.js";
import "prismjs/components/prism-basic.min.js";
import "prismjs/components/prism-cpp.min.js";
import "prismjs/components/prism-nasm.min.js";
import "prismjs/components/prism-ruby.min.js";
import "prismjs/components/prism-markup-templating.min.js";
import "prismjs/components/prism-git.min.js";
import "prismjs/components/prism-go.min.js";
import "prismjs/components/prism-groovy.min.js";
import "prismjs/components/prism-http.min.js";
import "prismjs/components/prism-hsts.min.js";
import "prismjs/components/prism-ini.min.js";
import "prismjs/components/prism-java.min.js";
import "prismjs/components/prism-json.min.js";
import "prismjs/components/prism-jsonp.min.js";
import "prismjs/components/prism-markdown.min.js";
import "prismjs/components/prism-nginx.min.js";
import "prismjs/components/prism-php.min.js";
import "prismjs/components/prism-sql.min.js";
import "prismjs/components/prism-python.min.js";
import "prismjs/components/prism-sass.min.js";
import "prismjs/components/prism-scss.min.js";
import "prismjs/components/prism-scala.min.js";
import "prismjs/components/prism-scheme.min.js";
import "prismjs/components/prism-swift.min.js";
import "prismjs/components/prism-vbnet.min.js";
import "prismjs/components/prism-vim.min.js";
import "prismjs/components/prism-visual-basic.min.js";
import "prismjs/components/prism-yaml.min.js";

import ArticleBadge from '../components/ArticleBadge.vue';
import SNSShares from '../components/SNSShares.vue';
import { getArticleDetail, submitComment as submitCommentApi, deleteComment as deleteCommentApi, deleteArticle as deleteArticleApi } from '@/api/article';
import { getCaptcha } from '@/api/user';
import { isAuthenticated } from '@/utils/auth';
import { formatDate, formatDateTime, formatReadCount, getPatternType } from '@/utils/tools';

export default {
    components: {
        ArticleBadge,
        SNSShares,
        ImagePreview,
    },
    data() {
        return {
            articleId: '',
            loading: true,
            breadcrumbs: [
                {
                    text: '首页',
                    disabled: false,
                    to: '/',
                },
                {
                    text: '分类',
                    disabled: false,
                    to: '/',
                },
                {
                    text: '博客正文',
                    disabled: true,
                },
            ],
            article: {},
            snsInfo: {},
            relatedArticles: [],
            previousArticle: null,
            nextArticle: null,
            nickname: '',
            website: '',
            comment: '',
            replyTo: null,
            comments: [],
            isAuthenticated: false,
            captchaImage: '',
            captchaId: '',
            captchaCode: '',
            showCaptcha: false,
            previewVisible: false,
            previewImage: '',
        }
    },
    mounted() {
        this.checkAuthStatus();
        this.articleId = this.getArticleIdFromRoute();
        this.fetchArticleDetail();
    },
    updated() {
        this.$nextTick(() => {
            Prism.highlightAll();
        });
    },
    watch: {
        $route(to, from) {
            if (to.params.id !== from.params.id) {
                this.articleId = this.getArticleIdFromRoute();
                this.fetchArticleDetail();
            }
        }
    },
    methods: {
        formatDate,
        formatDateTime,
        formatReadCount,
        getPatternType,

        checkAuthStatus() {
            this.isAuthenticated = isAuthenticated();
        },

        getArticleIdFromRoute() {
            const path = this.$route.path;
            const match = path.match(/\/show\/(\d+)/);
            return match ? match[1] : '';
        },

        async fetchArticleDetail() {
            if (!this.articleId) return;

            this.loading = true;
            try {
                const res = await getArticleDetail(this.articleId);
                const data = res.data;

                // 保存 viewer_uuid 到本地存储
                if (data.viewer_uuid) {
                    localStorage.setItem('viewer_uuid', data.viewer_uuid);
                }

                this.article = data.article;
                this.relatedArticles = (data.associates || []).map(item => ({
                    title: item.title,
                    url: `/show/${item.id}`,
                    releaseAt: formatDate(item.release_at),
                    id: item.id
                }));

                this.previousArticle = data.previous;
                this.nextArticle = data.next;

                // 处理评论
                this.comments = this.processComments(data.comments || []);

                // 更新面包屑
                if (data.article.type) {
                    this.breadcrumbs[1] = {
                        text: data.article.type.name,
                        disabled: false,
                        to: `/select/${data.article.type.id}`,
                    };
                }

                this.$nextTick(() => {
                    this.initCodeHighlight();
                    this.initImageProcessing();
                    this.initSNSShare();

                    // 动态设置页面标题
                    if (this.article.title) {
                        document.title = `${this.article.title} - 飘痕の博客`;
                    }

                    // 动态设置SEO描述
                    const descriptionMeta = document.querySelector('meta[name="description"]');
                    if (descriptionMeta) {
                        const desc = this.article.summary || this.article.title || 'zqluo\'s technical blog sharing programming knowledge and experiences.';
                        descriptionMeta.setAttribute('content', desc);
                    }
                });
            } catch (error) {
                console.error('获取文章详情失败:', error);
            } finally {
                this.loading = false;
            }
        },

        processComments(comments) {
            return comments.map(comment => {
                const processedComment = {
                    id: comment.id,
                    nickname: comment.reviewer,
                    website: comment.website,
                    content: comment.content,
                    info: `来自于：${comment.from_local || '未知'} 发表于：${formatDateTime(comment.created_at)}`,
                    isBlogger: comment.is_blogger,
                    children: []
                };

                // 递归处理子评论，将所有层级的子评论扁平化到一层
                if (comment.child_comments && comment.child_comments.length > 0) {
                    comment.child_comments.forEach(child => {
                        const processedChild = {
                            id: child.id,
                            nickname: child.reviewer,
                            website: child.website,
                            content: child.content,
                            info: `来自于：${child.from_local || '未知'} 发表于：${formatDateTime(child.created_at)}`,
                            isBlogger: child.is_blogger
                        };

                        // 将当前子评论添加到children数组
                        processedComment.children.push(processedChild);

                        // 如果子评论还有子评论，递归提取并添加到同一层级
                        if (child.child_comments && child.child_comments.length > 0) {
                            const flattenChildren = (childComments) => {
                                childComments.forEach(grandChild => {
                                    const processedGrandChild = {
                                        id: grandChild.id,
                                        nickname: grandChild.reviewer,
                                        website: grandChild.website,
                                        content: grandChild.content,
                                        info: `来自于：${grandChild.from_local || '未知'} 发表于：${formatDateTime(grandChild.created_at)}`,
                                        isBlogger: grandChild.is_blogger
                                    };
                                    processedComment.children.push(processedGrandChild);

                                    // 继续递归处理更深层的子评论
                                    if (grandChild.child_comments && grandChild.child_comments.length > 0) {
                                        flattenChildren(grandChild.child_comments);
                                    }
                                });
                            };
                            flattenChildren(child.child_comments);
                        }
                    });
                }

                return processedComment;
            });
        },

        scrollToComments() {
            document.querySelector('.comment-form')?.scrollIntoView({
                behavior: 'smooth',
            })
        },

        handleEdit() {
            this.$router.push(`/edit/${this.articleId}`);
        },

        async handleDelete() {
            if (!confirm(`确定要删除文章《${this.article.title}》吗？`)) {
                return;
            }

            try {
                await deleteArticleApi(this.articleId);
                alert('删除成功');
                this.$router.push('/');
            } catch (error) {
                console.error('删除文章失败:', error);
                alert('删除失败，请重试');
            }
        },

        navigateToArticle(article) {
            if (article && article.id) {
                this.$router.push(`/show/${article.id}.html`);
            }
        },

        initCodeHighlight() {
            // prism.js代码高亮显示
            let docPre = document.querySelectorAll('.article-content pre');
            if (docPre && docPre.length > 0) {
                docPre.forEach(function (item) {
                    let code = item.querySelector("code");
                    if (code) {
                        let classVal = code.getAttribute("class");
                        if (typeof classVal == typeof undefined || !classVal) {
                            code.setAttribute("class", "language-none line-numbers");
                        } else {
                            code.classList.add("line-numbers"); // 开启显示行号
                        }
                    } else {
                        let classValue = item.getAttribute("class");
                        if (classValue && classValue != "") {
                            let classArr = [];
                            classArr = classValue.split(";");
                            classArr = classArr[0].split(":");
                            var lan = classArr[1].trim();
                            var lanClass = "language-" + lan;
                            var preContent =
                                '<code class="' +
                                lanClass +
                                ' line-numbers">' +
                                item.innerHTML +
                                "</code>";
                            item.classList.add("my_pre");
                            item.innerHTML = preContent;
                        }
                    }
                });
            }
        },

        initImageProcessing() {
            const images = document.querySelectorAll('.article-content img');
            images.forEach(img => {
                if (!img.src.includes('/images/show/')) return;
                // 如果已经包裹了就不再处理
                if (img.parentElement.classList.contains('photo-card')) return;

                // 创建 figure 包装器
                const wrapper = document.createElement('figure');
                wrapper.className = 'photo-card';

                // 将 wrapper 插入到 img 前面
                img.parentNode.insertBefore(wrapper, img);

                // 将 img 移动到 wrapper 内部
                wrapper.appendChild(img);

                // 如果有 alt 或 title 属性，作为 figcaption 显示
                const captionText = img.getAttribute('alt') || img.getAttribute('title');
                if (captionText) {
                    const figcaption = document.createElement('figcaption');
                    figcaption.textContent = captionText;
                    wrapper.appendChild(figcaption);
                }

                // 添加点击预览
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.previewImage = img.src;
                    this.previewVisible = true;
                });
            });
        },

        initSNSShare() {
            const imgs = document.querySelectorAll('.article-content img')
            const shareTitle = this.article.title
            const sinaTitle = `分享文章 「${shareTitle}」 （分享自@-ZQLUO-）`
            const tqzoneTitle = shareTitle
            const tqzoneSummary = `分享文章 「${shareTitle}」（分享自@一迹飘痕）`
            const twitterTitle = `分享文章 「${shareTitle}」（分享自@lzqwebsoft）`
            const facebookTitle = `分享文章 「${shareTitle}」（分享自@lzqwebsoft）`
            const picShare = imgs.length > 0 ? imgs[0].src : ''

            this.snsInfo = {
                tsina: {
                    title: sinaTitle,
                    pic: picShare,
                },
                tqzone: {
                    title: tqzoneTitle,
                    pic: picShare,
                    summary: tqzoneSummary,
                },
                twitter: {
                    title: twitterTitle,
                    pic: picShare,
                },
                facebook: {
                    title: facebookTitle,
                    pic: picShare,
                },
            }
        },

        async handleCommentFocus() {
            if (!this.isAuthenticated && !this.captchaImage) {
                await this.loadCaptcha();
            }
        },

        async loadCaptcha() {
            try {
                const res = await getCaptcha();
                this.captchaImage = res.data.captcha;
                this.captchaId = res.data.captcha_id;
                this.showCaptcha = true;
            } catch (error) {
                console.error('获取验证码失败:', error);
            }
        },

        async refreshCaptcha() {
            this.captchaCode = '';
            await this.loadCaptcha();
        },

        async submitComment() {
            // 验证表单
            if (!this.isAuthenticated && !this.nickname.trim()) {
                alert('请输入昵称');
                return;
            }
            if (!this.comment.trim()) {
                alert('请输入评论内容');
                return;
            }
            if (!this.isAuthenticated && this.showCaptcha && !this.captchaCode.trim()) {
                alert('请输入验证码');
                return;
            }

            try {
                // 构建表单数据
                const formData = new URLSearchParams();
                formData.append('article_id', this.articleId);
                formData.append('content', this.comment);

                // 非登录用户需要提供昵称和验证码
                if (!this.isAuthenticated) {
                    formData.append('reviewer', this.nickname);
                    if (this.website) {
                        formData.append('website', this.website);
                    }
                    formData.append('captchaCode', this.captchaCode);
                    formData.append('captchaID', this.captchaId);
                }

                // 处理回复逻辑
                if (this.replyTo) {
                    formData.append('parent_comment_id', this.replyTo.id);
                    // 如果是回复子评论，需要找到根评论ID
                    // 这里假设顶级评论的parent_comment_id为空或0
                    // 如果replyTo有parent，说明它是子评论，需要找到根评论
                    formData.append('root_comment_id', this.replyTo.id);
                }

                const res = await submitCommentApi(formData);

                if (res.code === 0) {
                    alert('评论提交成功');

                    // 更新评论列表
                    if (res.data && res.data.comments) {
                        this.comments = this.processComments(res.data.comments);
                    } else {
                        // 如果返回数据中没有评论列表，重新加载文章详情
                        await this.fetchArticleDetail();
                    }

                    // 清空表单
                    this.comment = '';
                    this.captchaCode = '';
                    this.replyTo = null;

                    if (!this.isAuthenticated) {
                        this.nickname = '';
                        this.website = '';
                        this.showCaptcha = false;
                        this.captchaImage = '';
                        this.captchaId = '';
                    }
                } else {
                    alert(res.message || '评论提交失败，请重试');
                    // 刷新验证码
                    if (!this.isAuthenticated) {
                        await this.refreshCaptcha();
                    }
                }
            } catch (error) {
                console.error('提交评论失败:', error);
                alert(error.response?.data?.message || '评论提交失败，请重试');
                // 刷新验证码
                if (!this.isAuthenticated) {
                    await this.refreshCaptcha();
                }
            }
        },

        replyComment(comment) {
            this.replyTo = comment;
            this.scrollToComments();
        },

        cancelReply() {
            this.replyTo = null;
            this.comment = '';
        },

        async deleteComment(commentId) {
            if (!confirm('确定要删除这条评论吗？')) {
                return;
            }

            try {
                await deleteCommentApi(commentId);
                alert('删除成功');
                this.fetchArticleDetail();
            } catch (error) {
                console.error('删除评论失败:', error);
                alert('删除失败，请重试');
            }
        },
    },
}
</script>

<style lang="scss">
.article-detail {
    margin: 20px auto;
}

.breadcrumbs {
    margin-bottom: 2rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.breadcrumb a {
    color: #007bff;
    text-decoration: none;
}

.breadcrumb .disabled {
    color: #666;
    pointer-events: none;
}

.breadcrumb a:not(:last-child)::after {
    content: '/';
    color: #666;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
}

.article {
    background-color: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 4px 20px var(--shadow-color);
    padding: 2rem;
    margin-bottom: 2rem;
}

.article-header {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1rem;
    margin-bottom: 2rem;
}

.article-title {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.article-title span {
    font-size: 2rem;
    margin: 0;
    word-break: break-all;
}

.article-title span:not(.badge) {
    font-family: var(--font-serif);
}

.article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.article-actions {
    display: flex;
    gap: 0.5rem;
}

.article-content {
    line-height: 1.8;
    margin-bottom: 2rem;
    font-size: 1.125rem;
}

.article-content p {
    margin-bottom: 1rem;
}

.article-content p a,
.article-content strong,
.article-content a {
    word-break: break-all;
}

.article-content pre {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1rem 0;
    width: 100%;
}

.article-content code {
    background: #f8f9fa;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    word-break: break-all;
}

.article-content pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    color: inherit;
    white-space: pre-wrap;
}

:root.dark-theme .article-content code {
    background: #1a1a1a;
    color: #e6e6e6;
}

.article-content img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 4px;
}

.article-content .photo-card {
    margin: 0;
}

.article-content .photo-card img {
    width: 100%;
    height: auto;
    border-radius: 4px;
    margin-bottom: 0;
}

.article-content .photo-card figcaption {
    display: none;
}

@media (min-width: 768px) {

    /*
     * ----------------------------------------
     * PC端照片卡片样式 (Photo Card Style)
     * ----------------------------------------
     * 使用 JS 包裹的 .photo-card 容器来实现拍立得/照片效果
     * 包含: 白边、阴影、顶部胶带效果
     */
    .article-content .photo-card {
        display: block;
        margin: 3rem auto;
        width: fit-content;
        max-width: 50%;
        border-radius: 2px;
        padding: 22px 22px 25px 22px;
        background-color: #fff;
        border: 1px solid #e5e7eb;
        box-shadow:
            rgba(0, 0, 0, 0) 0px 0px 0px 0px,
            rgba(0, 0, 0, 0) 0px 0px 0px 0px,
            rgba(0, 0, 0, 0.15) 0px 10px 30px -10px;
        position: relative;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .article-content .photo-card::before {
        content: '';
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%) rotate(-1.5deg);
        width: 120px;
        height: 32px;

        background-color: rgba(232, 222, 198, 0.9);
        backdrop-filter: none;

        border-left: 2px solid rgba(255, 255, 255, 0.3);
        border-right: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        opacity: 0.9;
        z-index: 10;
    }

    .article-content .photo-card img {
        display: block;
        max-width: 100%;
        width: auto;
        height: auto;
        border-radius: 1px;
        margin: 0;
        box-shadow: none;
        border: none;
        padding: 0;
        background: none;
    }

    .article-content .photo-card figcaption {
        display: block;
        margin-top: 15px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #555;
        font-size: 1.5rem;
        line-height: 1.5;
        font-weight: 500;
    }

    /* 悬停效果 */
    .article-content .photo-card:hover {
        transform: scale(1.01) rotate(0.5deg);
        box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 5;
    }

    /*
     * 暗黑模式适配 (Dark Mode)
     */
    :root.dark-theme .article-content .photo-card {
        background-color: #252525;
        /* 更深的背景色，接近黑色但有区分 */
        border-color: #333;
        box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.3),
            0 10px 15px -3px rgba(0, 0, 0, 0.5),
            0 4px 6px -2px rgba(0, 0, 0, 0.3);
    }

    :root.dark-theme .article-content .photo-card::before {
        /* 暗黑模式下胶带降低亮度和饱和度 */
        background-color: rgba(180, 170, 150, 0.6);
        border-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    }

    :root.dark-theme .article-content .photo-card img {
        opacity: 0.85;
        filter: contrast(1.1);
    }

    :root.dark-theme .article-content .photo-card figcaption {
        color: #aaa;
    }
}

.article-content ul,
.article-content ol {
    margin-left: 2rem;
}

.article-content table {
    width: 100%;
    max-width: 100%;
    margin-bottom: 1.5rem;
    border-collapse: collapse;
    border-spacing: 0;
    border: 1px solid var(--border-color);
    font-size: 0.95rem;
}

.article-content table th,
.article-content table td {
    padding: 0.875rem 1rem;
    border: 1px solid var(--border-color);
    line-height: 1.6;
}

.article-content table th {
    background-color: rgba(0, 0, 0, 0.03);
    font-weight: 600;
    color: var(--text-color);
    text-align: left;
}

.article-content table tr {
    transition: background-color 0.2s ease;
}

.article-content table tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.015);
}

.article-content table tr:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

/* Dark mode table adaptations */
:root.dark-theme .article-content table th {
    background-color: rgba(255, 255, 255, 0.05);
}

:root.dark-theme .article-content table tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.02);
}

:root.dark-theme .article-content table tr:hover {
    background-color: rgba(255, 255, 255, 0.06);
}

.article-pager {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
}

.btn-outline {
    background: transparent;
    border: 1px solid #007bff;
    color: #007bff;
}

.btn-outline:hover {
    background: #007bff;
    color: white;
}

.related-articles {
    background: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow-color);
    padding: 2rem;
    margin-bottom: 2rem;
}

.related-articles h3 {
    margin-bottom: 1rem;
    color: var(--text-color);
}

.related-articles-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.related-article-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
}

.related-article-item:last-child {
    border-bottom: none;
}

.related-article-item a {
    color: #007bff;
    text-decoration: none;
}

.related-article-item a:hover {
    text-decoration: underline;
}

.article-date {
    color: #666;
    font-size: 0.875rem;
}

.comments {
    background: var(--card-bg);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow-color);
    padding: 2rem;
    margin-bottom: 2rem;
}

.comment-list-title {
    margin-bottom: 1.5rem;
    color: var(--text-color);
}

.comments-list {
    margin-bottom: 2rem;
}

.comment {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.comment-author {
    font-weight: bold;
    color: var(--text-color);
}

.comment-actions {
    display: flex;
    gap: 0.5rem;
}

.comment-content {
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

.comment-meta {
    font-size: 0.875rem;
    color: #666;
}

.comment-children {
    margin-left: 2rem;
    margin-top: 1rem;
    border-left: 2px solid var(--border-color);
    padding-left: 1rem;
}

.blogger-badge {
    color: var(--primary-color);
}

.badge-text {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    font-size: 0.75rem;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    margin-left: 0.5rem;
}

.empty-comments {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
}

.loading-container {
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

.comment-form {
    background: var(--bg-color);
    border-radius: 8px;
    padding: 2rem;
}

.comment-head {
    margin-bottom: 1.5rem;
}

.comment-reply {
    margin-top: 1rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-left: 4px solid #3b82f6;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
    animation: slideDown 0.3s ease-out;
}

.comment-reply:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%);
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.reply-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
}

.reply-icon {
    width: 20px;
    height: 20px;
    color: #3b82f6;
    flex-shrink: 0;
}

.reply-text {
    font-size: 0.95rem;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.reply-nickname {
    color: #3b82f6;
    font-weight: 600;
    word-break: break-word;
}

.btn-cancel-reply {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
}

.btn-cancel-reply:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.btn-cancel-reply:active {
    transform: translateY(0);
}

.cancel-icon {
    width: 16px;
    height: 16px;
    stroke-width: 2.5;
}

/* 暗黑模式适配 */
:root.dark-theme .comment-reply {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%);
    border-color: rgba(59, 130, 246, 0.3);
}

:root.dark-theme .comment-reply:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(147, 51, 234, 0.18) 100%);
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

:root.dark-theme .reply-text {
    color: #e5e7eb;
}

:root.dark-theme .reply-nickname {
    color: #60a5fa;
}

:root.dark-theme .btn-cancel-reply {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border-color: rgba(239, 68, 68, 0.4);
}

:root.dark-theme .btn-cancel-reply:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.6);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* 响应式设计 - 平板 */
@media (max-width: 768px) {
    .comment-reply {
        padding: 0.875rem 1rem;
        gap: 0.75rem;
    }

    .reply-text {
        font-size: 0.9rem;
    }

    .btn-cancel-reply {
        padding: 0.45rem 0.875rem;
        font-size: 0.8125rem;
    }
}

/* 响应式设计 - 手机 */
@media (max-width: 480px) {
    .comment-reply {
        flex-direction: column;
        align-items: flex-start;
        padding: 0.75rem;
        gap: 0.75rem;
    }

    .reply-info {
        width: 100%;
    }

    .reply-text {
        font-size: 0.875rem;
    }

    .btn-cancel-reply {
        width: 100%;
        justify-content: center;
        padding: 0.5rem;
    }

    .reply-icon {
        width: 18px;
        height: 18px;
    }

    .cancel-icon {
        width: 14px;
        height: 14px;
    }
}

.captcha-group {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.captcha-input {
    flex: 1;
    max-width: 200px;
}

.captcha-image {
    height: 40px;
    cursor: pointer;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    transition: opacity 0.2s;
}

.captcha-image:hover {
    opacity: 0.8;
}

@media (max-width: 768px) {
    .breadcrumbs {
        margin-bottom: 1rem;
    }

    .article-detail {
        margin: 10px;
    }

    .breadcrumb {
        padding: 0 10px;
    }

    .article {
        padding: 1rem;
    }

    .article-meta {
        flex-direction: column;
        align-items: flex-start;
    }

    .related-articles,
    .comments,
    .comment-form {
        padding: 1rem;
    }

    .comment-children {
        margin-left: 1rem;
    }
}

/* PrismJS 代码高亮样式 */
/* Light theme */
.article-content {

    code[class*="language-"],
    pre[class*="language-"] {
        color: black;
        background: none;
        text-shadow: 0 1px white;
        font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
        font-size: 1em;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        word-wrap: normal;
        line-height: 1.5;

        -moz-tab-size: 4;
        -o-tab-size: 4;
        tab-size: 4;

        -webkit-hyphens: none;
        -moz-hyphens: none;
        -ms-hyphens: none;
        hyphens: none;
    }

    pre[class*="language-"]::-moz-selection,
    pre[class*="language-"] ::-moz-selection,
    code[class*="language-"]::-moz-selection,
    code[class*="language-"] ::-moz-selection {
        text-shadow: none;
        background: #b3d4fc;
    }

    pre[class*="language-"]::selection,
    pre[class*="language-"] ::selection,
    code[class*="language-"]::selection,
    code[class*="language-"] ::selection {
        text-shadow: none;
        background: #b3d4fc;
    }

    @media print {

        code[class*="language-"],
        pre[class*="language-"] {
            text-shadow: none;
        }
    }

    /* Code blocks */
    pre[class*="language-"] {
        // padding: 1em;
        margin: .5em 0;
        overflow: auto;
    }

    :not(pre)>code[class*="language-"],
    pre[class*="language-"] {
        background: #f5f2f0;
    }

    /* Inline code */
    :not(pre)>code[class*="language-"] {
        padding: .1em;
        border-radius: .3em;
        white-space: normal;
    }

    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
        color: slategray;
    }

    .token.comment {
        border-width: 0;
        border-radius: 0;
        padding: auto;
        margin-bottom: auto;
    }

    .token.punctuation {
        color: #999;
    }

    .token.namespace {
        opacity: .7;
    }

    .token.property,
    .token.tag,
    .token.boolean,
    .token.number,
    .token.constant,
    .token.symbol,
    .token.deleted {
        color: #905;
    }

    .token.selector,
    .token.attr-name,
    .token.string,
    .token.char,
    .token.builtin,
    .token.inserted {
        color: #690;
    }

    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string {
        color: #9a6e3a;
        /* This background color was intended by the author of this theme. */
        background: hsla(0, 0%, 100%, .5);
    }

    .token.atrule,
    .token.attr-value,
    .token.keyword {
        color: #07a;
    }

    .token.function,
    .token.class-name {
        color: #DD4A68;
    }

    .token.regex,
    .token.important,
    .token.variable {
        color: #e90;
    }

    .token.important,
    .token.bold {
        font-weight: bold;
    }

    .token.italic {
        font-style: italic;
    }

    .token.entity {
        cursor: help;
    }
}

/* Dark theme */
:root.dark-theme .article-content {

    code[class*="language-"],
    pre[class*="language-"] {
        color: #ccc;
        background: none;
        text-shadow: none;
        font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
        font-size: 1em;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        word-wrap: normal;
        line-height: 1.5;

        -moz-tab-size: 4;
        -o-tab-size: 4;
        tab-size: 4;

        -webkit-hyphens: none;
        -moz-hyphens: none;
        -ms-hyphens: none;
        hyphens: none;

    }

    /* Code blocks */
    pre[class*="language-"] {
        // padding: 1em;
        margin: .5em 0;
        overflow: auto;
    }

    :not(pre)>code[class*="language-"],
    pre[class*="language-"] {
        background: #1a1a1a;
    }

    /* Inline code */
    :not(pre)>code[class*="language-"] {
        padding: .1em;
        border-radius: .3em;
        white-space: normal;
    }

    .token.comment,
    .token.block-comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
        color: #999;
    }

    .token.punctuation {
        color: #ccc;
    }

    .token.tag,
    .token.attr-name,
    .token.namespace,
    .token.deleted {
        color: #e2777a;
    }

    .token.function-name {
        color: #6196cc;
    }

    .token.boolean,
    .token.number,
    .token.function {
        color: #f08d49;
    }

    .token.property,
    .token.class-name,
    .token.constant,
    .token.symbol {
        color: #f8c555;
    }

    .token.selector,
    .token.important,
    .token.atrule,
    .token.keyword,
    .token.builtin {
        color: #cc99cd;
    }

    .token.string,
    .token.char,
    .token.attr-value,
    .token.regex,
    .token.variable {
        color: #7ec699;
    }

    .token.operator,
    .token.entity,
    .token.url {
        color: #67cdcc;
    }

    .token.important,
    .token.bold {
        font-weight: bold;
    }

    .token.italic {
        font-style: italic;
    }

    .token.entity {
        cursor: help;
    }

    .token.inserted {
        color: green;
    }
}

/* Article Pager */
.article-pager {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 10px;
    }
}

.pager-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 15px 20px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    background-color: var(--card-bg);
    transition: all 0.3s ease;
    width: 48%;
    min-height: 80px;
    justify-content: center;

    &:hover {
        box-shadow: 0 4px 15px var(--shadow-color);
        border-color: var(--link-color);
    }

    &.prev {
        align-items: flex-start;
        text-align: left;
    }

    &.next {
        align-items: flex-end;
        text-align: right;
    }

    &.spacer {
        display: flex;
        visibility: hidden;
        pointer-events: none;
        border: none;
        background: transparent;
        cursor: default;

        @media (max-width: 768px) {
            display: none;
        }
    }
}

.pager-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 8px;
}

.pager-title {
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 700;
    font-family: var(--font-serif);
    color: var(--text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.pager-title:hover {
    color: var(--link-color);
}
</style>
