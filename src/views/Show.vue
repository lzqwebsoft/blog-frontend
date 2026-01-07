<template>
    <div class="article-detail">
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
            <div v-if="loading" class="skeleton-detail">
                <div class="skeleton-item skeleton-title"></div>
                <div class="skeleton-meta-row">
                    <div class="skeleton-item skeleton-meta"></div>
                    <div class="skeleton-item skeleton-actions"></div>
                </div>
                <div class="skeleton-content">
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text short"></div>
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text"></div>
                    <div class="skeleton-item skeleton-text short"></div>
                </div>
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
                            formatReadCount(article.readed_num)
                            }}次阅读</span>

                        <div class="article-actions">
                            <button class="action-btn comment-btn" @click="scrollToComments">
                                <font-awesome-icon icon="comment-dots" /> 评论
                            </button>
                            <button v-if="isAuthenticated" class="action-btn edit-btn" @click="handleEdit">
                                <font-awesome-icon icon="edit" /> 编辑
                            </button>
                            <button v-if="isAuthenticated" class="action-btn delete-btn" @click="handleDelete">
                                <font-awesome-icon icon="trash" /> 删除
                            </button>
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
                        <div class="comment-author-info">
                            <img v-if="item.isBlogger" src="@/assets/images/avatar.jpg" class="comment-avatar"
                                :alt="item.nickname" />
                            <img v-else-if="item.email" :src="item.avatarUrl" class="comment-avatar"
                                :alt="item.nickname" />
                            <div v-else class="comment-avatar placeholder-avatar"
                                :style="{ background: getAvatarColor(item.nickname) }">
                                {{ item.nickname.charAt(0).toUpperCase() }}
                            </div>


                            <strong class="comment-author" :class="{ 'blogger-badge': item.isBlogger }">
                                <template v-if="item.isBlogger">
                                    <span class="badge-text">博主</span>
                                </template>
                                <template v-else>
                                    {{ item.nickname }}
                                </template>
                            </strong>
                        </div>
                        <div class="comment-actions">
                            <button class="action-btn edit-btn" @click="replyComment(item)">
                                <font-awesome-icon icon="reply" />
                                <span>回复</span>
                            </button>
                            <button v-if="isAuthenticated" class="action-btn delete-btn"
                                @click="deleteComment(item.id)">
                                <font-awesome-icon icon="trash" />
                                <span>删除</span>
                            </button>
                        </div>
                    </div>

                    <div class="comment-content" v-html="item.content"></div>

                    <div class="comment-meta">{{ item.info }}</div>

                    <!-- 子评论 -->
                    <div class="comment-children" v-if="item.children?.length">
                        <div class="comment" v-for="child in item.children" :key="child.id">
                            <div class="comment-header">
                                <div class="comment-author-info">
                                    <img v-if="child.isBlogger" src="@/assets/images/avatar.jpg" class="comment-avatar"
                                        :alt="child.nickname" />
                                    <img v-else-if="child.email" :src="child.avatarUrl" class="comment-avatar"
                                        :alt="child.nickname" />
                                    <div v-else class="comment-avatar placeholder-avatar"
                                        :style="{ background: getAvatarColor(child.nickname) }">
                                        {{ child.nickname.charAt(0).toUpperCase() }}
                                    </div>

                                    <strong class="comment-author" :class="{ 'blogger-badge': child.isBlogger }">
                                        <template v-if="child.isBlogger">
                                            <span class="badge-text">博主</span>
                                        </template>
                                        <template v-else>
                                            {{ child.nickname }}
                                        </template>
                                    </strong>
                                </div>
                                <div class="comment-actions">
                                    <button class="action-btn edit-btn" @click="replyComment(child)">
                                        <font-awesome-icon icon="reply" />
                                        <span>回复</span>
                                    </button>
                                    <button v-if="isAuthenticated" class="action-btn delete-btn"
                                        @click="deleteComment(child.id)">
                                        <font-awesome-icon icon="trash" />
                                        <span>删除</span>
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
                    <h4 class="form-title">发表评论</h4>

                    <div class="comment-reply" v-if="replyTo">
                        <div class="reply-info">
                            <font-awesome-icon icon="reply" class="reply-icon" />
                            <span class="reply-text">回复
                                <strong class="reply-nickname">@{{ replyTo.nickname }}</strong></span>
                        </div>
                        <button type="button" class="btn-cancel-reply" @click="cancelReply">
                            <font-awesome-icon icon="xmark" class="cancel-icon" />
                            取消回复
                        </button>
                    </div>
                </div>

                <div class="form-body">
                    <div class="input-row" v-if="!isAuthenticated">
                        <div class="input-group">
                            <div class="input-wrapper">
                                <font-awesome-icon icon="user" class="input-icon" />
                                <input type="text" class="form-control" v-model="nickname" placeholder="您的昵称"
                                    required />
                            </div>
                        </div>

                        <div class="input-group">
                            <div class="input-wrapper">
                                <font-awesome-icon icon="envelope" class="input-icon" />
                                <input type="email" class="form-control" v-model="email" placeholder="邮箱（不对外显示）"
                                    required />
                            </div>
                        </div>

                        <div class="input-group">
                            <div class="input-wrapper">
                                <font-awesome-icon icon="link" class="input-icon" />
                                <input type="url" class="form-control" v-model="website" placeholder="个人网站 (可选)" />
                            </div>
                        </div>
                    </div>

                    <div class="input-group">
                        <div class="input-wrapper textarea-wrapper" style="padding: 0; overflow: hidden;">
                            <MarkdownEditor v-model="comment" :height="150" placeholder="说点什么吧..." :toolbars="['emoji']"
                                class="comment-editor" :class="{ focused: isCommentFocused }"
                                @focus="handleCommentFocus" @blur="handleCommentBlur" />
                        </div>
                    </div>

                    <div class="footer-row">
                        <div class="captcha-section" v-if="showCaptcha && !isAuthenticated">
                            <div class="input-wrapper captcha-wrapper">
                                <font-awesome-icon icon="shield-halved" class="input-icon" />
                                <input type="text" class="form-control captcha-input" v-model="captchaCode"
                                    placeholder="验证码" required />
                            </div>
                            <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="captcha-image"
                                @click="refreshCaptcha" title="点击刷新验证码" />
                        </div>

                        <div class="submit-section">
                            <button type="submit" class="action-btn submit-btn">
                                <font-awesome-icon icon="paper-plane" />
                                <span>提交评论</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </section>

        <!-- 图片预览组件 -->
        <ImagePreview :visible="previewVisible" :image-url="previewImage" @close="previewVisible = false" />

        <!-- 目录组件 -->
        <TableOfContents v-if="!loading" container-selector=".article-content" :dependency="article.content" />
    </div>
</template>

<script>
// PrismJS 代码高亮
import Prism from 'prismjs'
import ImagePreview from '@/components/ImagePreview.vue'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
import 'prismjs/plugins/autolinker/prism-autolinker.css'
import 'prismjs/plugins/autolinker/prism-autolinker.js'
import 'prismjs/plugins/toolbar/prism-toolbar.css'
import 'prismjs/plugins/toolbar/prism-toolbar.js'
import 'prismjs/plugins/show-language/prism-show-language.js'
import 'prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.js'
import md5 from 'blueimp-md5'

// PrismJS 语言组件批量导入
import 'prismjs/components/prism-markup.min.js'
import 'prismjs/components/prism-css.min.js'
import 'prismjs/components/prism-clike.min.js'
import 'prismjs/components/prism-javascript.min.js'
import 'prismjs/components/prism-apacheconf.min.js'
import 'prismjs/components/prism-c.min.js'
import 'prismjs/components/prism-csharp.min.js'
import 'prismjs/components/prism-bash.min.js'
import 'prismjs/components/prism-basic.min.js'
import 'prismjs/components/prism-cpp.min.js'
import 'prismjs/components/prism-nasm.min.js'
import 'prismjs/components/prism-ruby.min.js'
import 'prismjs/components/prism-markup-templating.min.js'
import 'prismjs/components/prism-git.min.js'
import 'prismjs/components/prism-go.min.js'
import 'prismjs/components/prism-groovy.min.js'
import 'prismjs/components/prism-http.min.js'
import 'prismjs/components/prism-hsts.min.js'
import 'prismjs/components/prism-ini.min.js'
import 'prismjs/components/prism-java.min.js'
import 'prismjs/components/prism-json.min.js'
import 'prismjs/components/prism-jsonp.min.js'
import 'prismjs/components/prism-markdown.min.js'
import 'prismjs/components/prism-nginx.min.js'
import 'prismjs/components/prism-php.min.js'
import 'prismjs/components/prism-sql.min.js'
import 'prismjs/components/prism-python.min.js'
import 'prismjs/components/prism-sass.min.js'
import 'prismjs/components/prism-scss.min.js'
import 'prismjs/components/prism-scala.min.js'
import 'prismjs/components/prism-scheme.min.js'
import 'prismjs/components/prism-swift.min.js'
import 'prismjs/components/prism-vbnet.min.js'
import 'prismjs/components/prism-vim.min.js'
import 'prismjs/components/prism-visual-basic.min.js'
import 'prismjs/components/prism-yaml.min.js'

import ArticleBadge from '../components/ArticleBadge.vue'
import SNSShares from '../components/SNSShares.vue'
import {
    getArticleDetail,
    submitComment as submitCommentApi,
    deleteComment as deleteCommentApi,
    deleteArticle as deleteArticleApi,
} from '@/api/article'
import { getCaptcha } from '@/api/user'
import { isAuthenticated } from '@/utils/auth'
import { formatDate, formatDateTime, formatReadCount, getPatternType, removePathSuffix } from '@/utils/tools'
import TableOfContents from '../components/TableOfContents.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'

export default {
    components: {
        ArticleBadge,
        SNSShares,
        ImagePreview,
        TableOfContents,
        MarkdownEditor
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
            email: '',
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
            isCommentFocused: false,
        }
    },
    mounted() {
        this.checkAuthStatus()
        this.articleId = this.getArticleIdFromRoute()
        this.fetchArticleDetail()
    },
    updated() {
        this.$nextTick(() => {
            Prism.highlightAll()
        })
    },
    watch: {
        $route(to, from) {
            if (to.params.id !== from.params.id) {
                this.articleId = this.getArticleIdFromRoute()
                this.fetchArticleDetail()
            }
        },
    },
    methods: {
        formatDate,
        formatDateTime,
        formatReadCount,
        getPatternType,
        removePathSuffix,

        getAvatarColor(nickname) {
            if (!nickname) return '#ccc'
            const colors = [
                'linear-gradient(135deg, #ABDCFF 10%, #0396FF 100%)',
                'linear-gradient(135deg, #FEB692 10%, #EA5455 100%)',
                'linear-gradient(135deg, #CE9FFC 10%, #7367F0 100%)',
                'linear-gradient(135deg, #90F7EC 10%, #32CCBC 100%)',
                'linear-gradient(135deg, #FFF6B7 10%, #F6416C 100%)',
                'linear-gradient(135deg, #81FBB8 10%, #28C76F 100%)',
                'linear-gradient(135deg, #E2B0FF 10%, #9F44D3 100%)',
                'linear-gradient(135deg, #FDEB71 10%, #F8D800 100%)',
                'linear-gradient(135deg, #FCCF31 10%, #F55555 100%)',
                'linear-gradient(135deg, #5EFCE8 10%, #736EFE 100%)'
            ]
            let hash = 0
            for (let i = 0; i < nickname.length; i++) {
                hash = nickname.charCodeAt(i) + ((hash << 5) - hash)
            }
            const index = Math.abs(hash % colors.length)
            return colors[index]
        },

        checkAuthStatus() {
            this.isAuthenticated = isAuthenticated()
        },

        getArticleIdFromRoute() {
            const path = this.$route.params.id
            return path ? removePathSuffix(path) : path
        },

        async fetchArticleDetail() {
            if (!this.articleId) return

            this.loading = true
            try {
                const res = await getArticleDetail(this.articleId)
                const data = res.data

                // 保存 viewer_uuid 到本地存储
                if (data.viewer_uuid) {
                    localStorage.setItem('viewer_uuid', data.viewer_uuid)
                }

                this.article = data.article
                this.relatedArticles = (data.associates || []).map((item) => ({
                    title: item.title,
                    url: `/show/${item.id}`,
                    releaseAt: formatDate(item.release_at),
                    id: item.id,
                }))

                this.previousArticle = data.previous
                this.nextArticle = data.next

                // 处理评论
                this.comments = this.processComments(data.comments || [])

                // 更新面包屑
                if (data.article.type) {
                    this.breadcrumbs[1] = {
                        text: data.article.type.name,
                        disabled: false,
                        to: `/select/${data.article.type.id}`,
                    }
                }

                this.$nextTick(() => {
                    this.initCodeHighlight()
                    this.initImageProcessing()
                    this.initSNSShare()

                    // 动态设置页面标题
                    if (this.article.title) {
                        document.title = `${this.article.title} - 飘痕の博客`
                    }

                    // 动态设置SEO描述
                    const descriptionMeta = document.querySelector('meta[name="description"]')
                    if (descriptionMeta) {
                        const desc =
                            this.article.summary ||
                            this.article.title ||
                            "zqluo's technical blog sharing programming knowledge and experiences."
                        descriptionMeta.setAttribute('content', desc)
                    }
                })
            } catch (error) {
                console.error('获取文章详情失败:', error)
            } finally {
                this.loading = false
            }
        },

        processComments(comments) {
            return comments.map((comment) => {
                const processedComment = {
                    id: comment.id,
                    nickname: comment.reviewer,
                    website: comment.website,
                    content: comment.content,
                    info: `来自于：${comment.from_local || '未知'} 发表于：${formatDateTime(comment.created_at)}`,
                    isBlogger: comment.is_blogger,
                    email: comment.email,
                    avatarUrl: comment.email ? `https://www.gravatar.com/avatar/${md5(comment.email.trim().toLowerCase())}?d=mp` : '',
                    children: [],
                }

                // 递归处理子评论，将所有层级的子评论扁平化到一层
                if (comment.child_comments && comment.child_comments.length > 0) {
                    comment.child_comments.forEach((child) => {
                        const processedChild = {
                            id: child.id,
                            nickname: child.reviewer,
                            website: child.website,
                            content: child.content,
                            info: `来自于：${child.from_local || '未知'} 发表于：${formatDateTime(child.created_at)}`,
                            isBlogger: child.is_blogger,
                            email: child.email,
                            avatarUrl: child.email ? `https://www.gravatar.com/avatar/${md5(child.email.trim().toLowerCase())}?d=mp` : '',
                        }

                        // 将当前子评论添加到children数组
                        processedComment.children.push(processedChild)

                        // 如果子评论还有子评论，递归提取并添加到同一层级
                        if (child.child_comments && child.child_comments.length > 0) {
                            const flattenChildren = (childComments) => {
                                childComments.forEach((grandChild) => {
                                    const processedGrandChild = {
                                        id: grandChild.id,
                                        nickname: grandChild.reviewer,
                                        website: grandChild.website,
                                        content: grandChild.content,
                                        info: `来自于：${grandChild.from_local || '未知'} 发表于：${formatDateTime(grandChild.created_at)}`,
                                        isBlogger: grandChild.is_blogger,
                                        email: grandChild.email,
                                        avatarUrl: grandChild.email ? `https://www.gravatar.com/avatar/${md5(grandChild.email.trim().toLowerCase())}?d=mp` : '',
                                    }
                                    processedComment.children.push(processedGrandChild)

                                    // 继续递归处理更深层的子评论
                                    if (
                                        grandChild.child_comments &&
                                        grandChild.child_comments.length > 0
                                    ) {
                                        flattenChildren(grandChild.child_comments)
                                    }
                                })
                            }
                            flattenChildren(child.child_comments)
                        }
                    })
                }

                return processedComment
            })
        },

        scrollToComments() {
            document.querySelector('.comment-form')?.scrollIntoView({
                behavior: 'smooth',
            })
        },

        handleEdit() {
            this.$router.push(`/edit/${this.articleId}`)
        },

        async handleDelete() {
            if (!confirm(`确定要删除文章《${this.article.title}》吗？`)) {
                return
            }

            try {
                await deleteArticleApi(this.articleId)
                alert('删除成功')
                this.$router.push('/')
            } catch (error) {
                console.error('删除文章失败:', error)
                alert('删除失败，请重试')
            }
        },

        navigateToArticle(article) {
            if (article && article.id) {
                this.$router.push(`/show/${article.id}.html`)
            }
        },

        initCodeHighlight() {
            // prism.js代码高亮显示
            let docPre = document.querySelectorAll('.article-content pre')
            if (docPre && docPre.length > 0) {
                docPre.forEach(function (item) {
                    let code = item.querySelector('code')
                    if (code) {
                        let classVal = code.getAttribute('class')
                        if (typeof classVal == typeof undefined || !classVal) {
                            code.setAttribute('class', 'language-none line-numbers')
                        } else {
                            code.classList.add('line-numbers') // 开启显示行号
                        }
                    } else {
                        let classValue = item.getAttribute('class')
                        if (classValue && classValue != '') {
                            let classArr = []
                            classArr = classValue.split(';')
                            classArr = classArr[0].split(':')
                            var lan = classArr[1].trim()
                            var lanClass = 'language-' + lan
                            var preContent =
                                '<code class="' +
                                lanClass +
                                ' line-numbers">' +
                                item.innerHTML +
                                '</code>'
                            item.classList.add('my_pre')
                            item.innerHTML = preContent
                        }
                    }
                })
            }
        },

        initImageProcessing() {
            const images = document.querySelectorAll('.article-content img')
            images.forEach((img) => {
                if (!img.src.includes('/images/show/')) return
                // 如果已经包裹了就不再处理
                if (img.parentElement.classList.contains('photo-card')) return

                // 创建 figure 包装器
                const wrapper = document.createElement('figure')
                wrapper.className = 'photo-card'

                // 将 wrapper 插入到 img 前面
                img.parentNode.insertBefore(wrapper, img)

                // 将 img 移动到 wrapper 内部
                wrapper.appendChild(img)

                // 如果有 alt 或 title 属性，作为 figcaption 显示
                const captionText = img.getAttribute('alt') || img.getAttribute('title')
                if (captionText) {
                    const figcaption = document.createElement('figcaption')
                    figcaption.textContent = captionText
                    wrapper.appendChild(figcaption)
                }

                // 添加点击预览
                img.style.cursor = 'zoom-in'
                img.addEventListener('click', (e) => {
                    e.stopPropagation()
                    this.previewImage = img.src
                    this.previewVisible = true
                })
            })
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
            this.isCommentFocused = true
            if (!this.isAuthenticated && !this.captchaImage) {
                await this.loadCaptcha()
            }
        },

        handleCommentBlur() {
            this.isCommentFocused = false
        },

        async loadCaptcha() {
            try {
                const res = await getCaptcha()
                this.captchaImage = res.data.captcha
                this.captchaId = res.data.captcha_id
                this.showCaptcha = true
            } catch (error) {
                console.error('获取验证码失败:', error)
            }
        },

        async refreshCaptcha() {
            this.captchaCode = ''
            await this.loadCaptcha()
        },

        async submitComment() {
            // 验证表单
            if (!this.isAuthenticated && !this.nickname.trim()) {
                alert('请输入昵称')
                return
            }
            if (!this.isAuthenticated && !this.email.trim()) {
                alert('请输入邮箱')
                return
            }
            if (!this.comment.trim()) {
                alert('请输入评论内容')
                return
            }
            if (!this.isAuthenticated && this.showCaptcha && !this.captchaCode.trim()) {
                alert('请输入验证码')
                return
            }

            try {
                // 构建表单数据
                const formData = new URLSearchParams()
                formData.append('article_id', this.articleId)
                formData.append('content', this.comment)

                // 非登录用户需要提供昵称和验证码
                if (!this.isAuthenticated) {
                    formData.append('reviewer', this.nickname)
                    if (this.website) {
                        formData.append('website', this.website)
                    }
                    if (this.email) {
                        formData.append('email', this.email)
                    }
                    formData.append('captchaCode', this.captchaCode)
                    formData.append('captchaID', this.captchaId)
                }

                // 处理回复逻辑
                if (this.replyTo) {
                    formData.append('parent_comment_id', this.replyTo.id)
                    // 如果是回复子评论，需要找到根评论ID
                    // 这里假设顶级评论的parent_comment_id为空或0
                    // 如果replyTo有parent，说明它是子评论，需要找到根评论
                    formData.append('root_comment_id', this.replyTo.id)
                }

                const res = await submitCommentApi(formData)

                if (res.code === 0) {
                    alert('评论提交成功')

                    // 更新评论列表
                    if (res.data && res.data.comments) {
                        this.comments = this.processComments(res.data.comments)
                    } else {
                        // 如果返回数据中没有评论列表，重新加载文章详情
                        await this.fetchArticleDetail()
                    }

                    // 清空表单
                    this.comment = ''
                    this.captchaCode = ''
                    this.replyTo = null

                    if (!this.isAuthenticated) {
                        this.nickname = ''
                        this.email = ''
                        this.website = ''
                        this.showCaptcha = false
                        this.captchaImage = ''
                        this.captchaId = ''
                    }
                } else {
                    alert(res.message || '评论提交失败，请重试')
                    // 刷新验证码
                    if (!this.isAuthenticated) {
                        await this.refreshCaptcha()
                    }
                }
            } catch (error) {
                console.error('提交评论失败:', error)
                alert(error.response?.data?.message || '评论提交失败，请重试')
                // 刷新验证码
                if (!this.isAuthenticated) {
                    await this.refreshCaptcha()
                }
            }
        },

        replyComment(comment) {
            this.replyTo = comment
            this.scrollToComments()
        },

        cancelReply() {
            this.replyTo = null
            this.comment = ''
        },

        async deleteComment(commentId) {
            if (!confirm('确定要删除这条评论吗？')) {
                return
            }

            try {
                const res = await deleteCommentApi(commentId)
                if (res.code == 0) {
                    alert('删除成功')
                    // 更新评论列表
                    if (res.data && res.data.comments) {
                        this.comments = this.processComments(res.data.comments)
                    } else {
                        // 如果返回数据中没有评论列表，重新加载文章详情
                        await this.fetchArticleDetail()
                    }
                } else {
                    alert(res.message || '删除失败，请重试')
                }
            } catch (error) {
                console.error('删除评论失败:', error)
                alert('删除失败，请重试')
            }
        },
    },
}
</script>

<style lang="scss" scoped>
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

@media (max-width: 768px) {
    .article {
        padding: 1rem;
    }
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
    font-size: 3rem;
}

@media (max-width: 768px) {
    .article-title span:not(.badge) {
        font-size: 2rem;
    }
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
    gap: 0.75rem;
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
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%);
    color: #2563eb;
    border: 1px solid rgba(37, 99, 235, 0.2);
}

.edit-btn:hover {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(29, 78, 216, 0.2) 100%);
    border-color: rgba(37, 99, 235, 0.3);
    transform: translateY(-1px);
}

.delete-btn {
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.2);
}

.delete-btn:hover {
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.2) 0%, rgba(185, 28, 28, 0.2) 100%);
    border-color: rgba(220, 53, 69, 0.3);
    transform: translateY(-1px);
}

.comment-btn {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.2);
}

.comment-btn:hover {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-1px);
}

.submit-btn {
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    color: white;
    padding: 0.6rem 1.8rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.submit-btn:hover {
    background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
    transform: translateY(-2px);
}
</style>

<style lang="scss">
/* ==========================================================================
   Global Styles (for v-html content)
   ========================================================================== */
.article-content {
    line-height: 1.8;
    margin-bottom: 2rem;
    font-size: 1.125rem;
}

.article-content h1,
.article-content h2,
.article-content h3,
.article-content h4,
.article-content h5 {
    font-family: var(--font-serif, 'Noto Serif SC', serif);
    font-weight: 700;
    line-height: 1.4;
    color: var(--text-color);
}

.article-content h1 {
    font-size: 2.25rem;
    margin-top: 2em;
    margin-bottom: 1em;
    padding-bottom: 0.5em;
    border-bottom: 2px solid var(--border-color, #e5e7eb);
}

.article-content h2 {
    font-size: 1.875rem;
    margin-top: 2.5em;
    margin-bottom: 1em;
    padding-bottom: 0.5em;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.article-content h3 {
    font-size: 1.5rem;
    margin-top: 2em;
    margin-bottom: 0.8em;
    padding-left: 0.75rem;
    border-left: 4px solid var(--primary-color, #007bff);
}

.article-content h4 {
    font-size: 1.25rem;
    margin-top: 1.5em;
    margin-bottom: 0.6em;
}

.article-content h5 {
    font-size: 1.1rem;
    margin-top: 1.2em;
    margin-bottom: 0.5em;
    color: var(--text-secondary, #666);
}

@media (max-width: 768px) {
    .article-content h1 {
        font-size: 1.75rem;
        margin-top: 1.5em;
        margin-bottom: 0.8em;
    }

    .article-content h2 {
        font-size: 1.5rem;
        margin-top: 1.8em;
        margin-bottom: 0.8em;
    }

    .article-content h3 {
        font-size: 1.25rem;
        margin-top: 1.5em;
        margin-bottom: 0.6em;
        padding-left: 0.5rem;
        border-left-width: 3px;
    }

    .article-content h4 {
        font-size: 1.1rem;
        margin-top: 1.2em;
        margin-bottom: 0.5em;
    }

    .article-content h5 {
        font-size: 1rem;
        margin-top: 1em;
        margin-bottom: 0.4em;
    }
}

.article-content p {
    margin-bottom: 1rem;
}

.article-content,
.article-content a,
.article-content strong,
.article-content em {
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
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
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
        font-family:
            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
            sans-serif;
        color: #555;
        font-size: 1.1rem;
        line-height: 1.1;
        font-weight: bold;
    }

    .article-content .photo-card:hover {
        transform: scale(1.01) rotate(0.5deg);
        box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 5;
    }

    :root.dark-theme .article-content .photo-card {
        background-color: #252525;
        border-color: #333;
        box-shadow:
            0 1px 2px rgba(0, 0, 0, 0.3),
            0 10px 15px -3px rgba(0, 0, 0, 0.5),
            0 4px 6px -2px rgba(0, 0, 0, 0.3);
    }

    :root.dark-theme .article-content .photo-card::before {
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

.comment-content {
    margin-bottom: 0.5rem;
    line-height: 1.6;
}
</style>

<style lang="scss" scoped>
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
    margin-left: 0.5rem;
    font-weight: bold;
    color: var(--text-color);
}

.comment-actions {
    display: flex;
    gap: 0.5rem;
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

.badge-text {
    display: inline-block;
    background: linear-gradient(135deg, #FDEB71 10%, #F8D800 100%);
    color: #8B4513;
    font-size: 0.7rem;
    padding: 0.05rem 0.35rem;
    border-radius: 4px;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(218, 165, 32, 0.3);
    margin-left: 0.5rem;
    vertical-align: middle;
}

.comment-author-info {
    display: flex;
    align-items: center;
}

.comment-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
    flex-shrink: 0;
    box-shadow: 0 2px 8px var(--shadow-color);
}

:root.dark-theme .comment-avatar {
    border-color: #333;
}

.placeholder-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1.1rem;
    text-transform: uppercase;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.empty-comments {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
}

/* Skeleton Loading */
.skeleton-detail {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shine 1.5s infinite linear;
}

:root.dark-theme .skeleton-item::after {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
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
    width: 70%;
    height: 3rem;
    margin-bottom: 1rem;
}

.skeleton-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.skeleton-meta {
    width: 300px;
    height: 1.25rem;
}

.skeleton-actions {
    width: 150px;
    height: 2.5rem;
}

.skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.skeleton-text {
    width: 100%;
    height: 1.125rem;
}

.skeleton-text.short {
    width: 60%;
}

.comment-form {
    margin-top: 3rem;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    transition: all 0.3s ease;
}

.comment-head {
    margin-bottom: 1.5rem;
}

.form-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    color: var(--text-color);
    font-weight: 600;

    .title-icon {
        color: var(--primary-color);
    }
}

.comment-reply {
    margin-bottom: 1.5rem;
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

    &:hover {
        background: linear-gradient(135deg,
                rgba(59, 130, 246, 0.12) 0%,
                rgba(147, 51, 234, 0.12) 100%);
        border-color: rgba(59, 130, 246, 0.3);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
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

    &:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.5);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
    }

    &:active {
        transform: translateY(0);
    }
}

.form-body {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.input-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.input-group {
    width: 100%;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    .input-icon {
        position: absolute;
        left: 1rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
        pointer-events: none;
        transition: color 0.3s ease;
    }

    .form-control {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.75rem;
        background: var(--bg-color);
        border: 1.5px solid var(--border-color);
        border-radius: 8px;
        font-size: 0.95rem;
        color: var(--text-color);
        transition: all 0.3s ease;

        &::placeholder {
            color: var(--text-secondary);
            opacity: 0.6;
        }

        &:focus {
            background: var(--card-bg);
            border-color: var(--primary-color);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
            outline: none;

            &+.input-icon {
                color: var(--primary-color);
            }
        }
    }

    &.textarea-wrapper {
        align-items: flex-start;

        .input-icon {
            top: 1rem;
        }

        .form-control {
            padding: 1rem;
            min-height: 120px;
            resize: vertical;
        }
    }
}

.footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    margin-top: 0.5rem;

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: stretch;
    }
}

.captcha-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;

    .captcha-wrapper {
        max-width: 160px;

        .form-control {
            padding-left: 2.75rem;
        }
    }

    .captcha-image {
        height: 42px;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;

        &:hover {
            opacity: 0.8;
            border-color: var(--primary-color);
        }
    }
}

.submit-section {
    margin-left: auto;

    .submit-btn {
        display: flex;
        gap: 0.6rem;
        padding: 0.75rem 2rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);

        &:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }

        &:active {
            transform: translateY(0);
        }

        span {
            font-size: 0.95rem;
        }
    }
}

:root.dark-theme {
    .comment-form {
        background: #1e1e1e;
        border-color: #333;

        .form-control {
            background: #2d2d2d;
            border-color: #444;

            &:focus {
                background: #252525;
            }
        }
    }

    .comment-reply {
        background: linear-gradient(135deg,
                rgba(59, 130, 246, 0.12) 0%,
                rgba(147, 51, 234, 0.12) 100%);
        border-color: rgba(59, 130, 246, 0.3);

        &:hover {
            background: linear-gradient(135deg,
                    rgba(59, 130, 246, 0.18) 0%,
                    rgba(147, 51, 234, 0.18) 100%);
            border-color: rgba(59, 130, 246, 0.4);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }
    }

    .reply-text {
        color: #e5e7eb;
    }

    .reply-nickname {
        color: #60a5fa;
    }

    .btn-cancel-reply {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border-color: rgba(239, 68, 68, 0.4);

        &:hover {
            background: rgba(239, 68, 68, 0.25);
            border-color: rgba(239, 68, 68, 0.6);
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }
    }
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
    .comments {
        padding: 1rem;
    }

    .comment-form {
        padding: 1.5rem 1rem;
    }

    .comment-children {
        margin-left: 1rem;
    }

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
</style>

<style lang="scss">
/* PrismJS Styles (for global v-html content) */
.article-content {

    code[class*='language-'],
    pre[class*='language-'] {
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

    pre[class*='language-']::-moz-selection,
    pre[class*='language-'] ::-moz-selection,
    code[class*='language-']::-moz-selection,
    code[class*='language-'] ::-moz-selection {
        text-shadow: none;
        background: #b3d4fc;
    }

    pre[class*='language-']::selection,
    pre[class*='language-'] ::selection,
    code[class*='language-']::selection,
    code[class*='language-'] ::selection {
        text-shadow: none;
        background: #b3d4fc;
    }

    @media print {

        code[class*='language-'],
        pre[class*='language-'] {
            text-shadow: none;
        }
    }

    /* Code blocks */
    pre[class*='language-'] {
        // padding: 1em;
        margin: 0.5em 0;
        overflow: auto;
    }

    :not(pre)>code[class*='language-'],
    pre[class*='language-'] {
        background: #f5f2f0;
    }

    /* Inline code */
    :not(pre)>code[class*='language-'] {
        padding: 0.1em;
        border-radius: 0.3em;
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
        opacity: 0.7;
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
        background: hsla(0, 0%, 100%, 0.5);
    }

    .token.atrule,
    .token.attr-value,
    .token.keyword {
        color: #07a;
    }

    .token.function,
    .token.class-name {
        color: #dd4a68;
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

    code[class*='language-'],
    pre[class*='language-'] {
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
    pre[class*='language-'] {
        // padding: 1em;
        margin: 0.5em 0;
        overflow: auto;
    }

    :not(pre)>code[class*='language-'],
    pre[class*='language-'] {
        background: #1a1a1a;
    }

    /* Inline code */
    :not(pre)>code[class*='language-'] {
        padding: 0.1em;
        border-radius: 0.3em;
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
</style>

<style lang="scss" scoped>
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
        box-shadow: 0 8px 25px var(--shadow-color);
        border-color: transparent;
        background: linear-gradient(var(--card-bg), var(--card-bg)) padding-box,
            linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%) border-box;
        border: 1px solid transparent;
        transform: translateY(-3px);
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

    @media (max-width: 768px) {
        display: block;
        width: 100%;
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

@media (max-width: 768px) {
    .comment-actions .action-btn span {
        display: none;
    }
}

.comment-editor {
    width: 100%;
    border: 1.5px solid var(--border-color) !important;
    border-radius: 8px;
    background: var(--bg-color) !important;
    transition: all 0.3s ease;

    .editor-toolbar {
        background: transparent !important;
        border-bottom: 1px dashed var(--border-color);
        padding: 0.5rem 1rem;

        /* Makes the toolbar items look a bit more subtle */
        .toolbar-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);

            &:hover {
                color: var(--primary-color);
                background: rgba(var(--primary-rgb), 0.1);
            }
        }
    }

    .editor-container {
        .markdown-textarea {
            background: transparent !important;
            padding: 1rem;
            min-height: 120px;
        }
    }

    &.focused {
        background: var(--card-bg) !important;
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
}

:root.dark-theme {
    .comment-editor {
        background: #2d2d2d !important;
        border-color: #444 !important;

        &:focus {
            background: #252525 !important;
        }
    }
}
</style>
