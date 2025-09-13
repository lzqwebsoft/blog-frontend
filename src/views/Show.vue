<script>
// PrismJS 代码高亮
import Prism from 'prismjs';
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

export default {
    components: {
        ArticleBadge,
        SNSShares,
    },
    data() {
        return {
            breadcrumbs: [
                {
                    text: '首页',
                    disabled: false,
                    to: '/',
                },
                {
                    text: '杂谈',
                    disabled: false,
                    to: '/select/1',
                },
                {
                    text: '博客正文',
                    disabled: true,
                },
            ],
            article: {
                title: '欢迎造访本博客',
                content: `
          <p>
            <span style="font-size:18px;color:#E53333;"><strong>2016-03-02更新：本站已转为VPS，Heroku云免费的太慢，收费的太贵~</strong></span>
          </p>
          <p>本站点是基于<a href="http://www.heroku.com">Heroku</a>云平台建立的轻巧型个人博客，纯属自娱自乐。</p>
          <p>其实在早些时候，就一直有编写一个自己的个人博客的想法，但由于种种原因而搁浅，一方面是由于早些时候个人的技术还不过关,另一方面就是没有找到免费且服务器稳定的空间提供商。直到去年实习学习RUBY的时候在网页上知道了HEROKU这个平台，渐而燃起了希望。</p>
          <p>一直有人问我为什么对做博客这样的感兴趣，CSDN，博客园，开源中国等不是提供了现成的了吗？我想说的是，作为一个程序员如果连一个完全属于自己的博客都没有是一件很遗憾的事，那些现成的博客不能正真让你感觉那个博客就是你的，因为出于一些安全考虑会有很多的限制。</p>
          <p>最初本来打算使用RUBY来做的，而且也己经做成了一个初步的版本，但由于HEORKU上提供的RAILS框架是3.0以上的，而我学习使用的是2.3的(代码在：<a href="https://github.com/lzqwebsoft/websoft-blog">https://github.com/lzqwebsoft/websoft-blog</a>)，这样改动会很大，从而被迫改用版本较稳定的JAVA重做。</p>
          <p>本博客使用Spring MVC 与 Hibernate编写(<span style="color: rgb(249, 150, 59);">2018-08-20 更新Spring与Hibernate的版本从3至5</span>)，前台使用Bootstrap3.3。并且还整合了优秀的开源网页编辑器wangEditor 3 (html)/<span>SimpleMDE(markdown)</span><span>与代码高亮插件PrismJS 1.14.0，从而实现了代码高亮：</span></p>
          <pre><code class="language-java">public class Test {
               public static void main(String[] args) {
                       System.out.println("Hello Blog!");
               }
          }</code></pre>
          <p>博文的高级编辑功能，如插入图片，字体大小，颜色等：</p>
          <p><img src="http://lzqwebsoft.net/images/show/20130119083249101b4a824b421f977db6da08581c7d.jpg" title="风景" alt="风景"></p>
          <p><span style="background-color:#009900;color:#e53333;font-size:24px;">颜色</span></p>
          <p><input value="点击我" id="aaaa" onclick="click_me()" type="button"></p>
          <p>当前是本系统的第三个版本，如果你对本应用感兴趣可以到<a href="https://github.com/lzqwebsoft/heroku-blog">https://github.com/lzqwebsoft/heroku-blog</a>下载源码，或直接联系我，让我们一起开发！</p>
          <p>同时如果你想获取以前的版本请到<a href="https://github.com/lzqwebsoft/heroku-blog/releases">https://github.com/lzqwebsoft/heroku-blog/releases</a>处下载。</p>
        `,
            },
            snsInfo: {},
            relatedArticles: [
                {
                    title: '《被讨厌的勇气》讲了什么',
                    url: '/show/20130119074245.html',
                    createdAt: '2019-04-21 15:13:12',
                },
                {
                    title: '2018回顾与感想',
                    url: '/show/20130119074245.html',
                    createdAt: '2019-04-21 15:13:12',
                },
                {
                    title: '一株绿萝',
                    url: '/show/20130119074245.html',
                    createdAt: '2019-04-21 15:13:12',
                },
            ],
            nickname: '',
            website: '',
            comment: '',
            replyTo: null,
            comments: [
                {
                    id: 1,
                    nickname: 'Brunch',
                    content: '添加语音短信触发回调报告日志记录',
                    info: '来自于：中国上海 发表于：2019-01-04 14:55:21',
                    children: [
                        {
                            id: 2,
                            nickname: 'Brunch',
                            content: '添加语音短信触发回调报告日志记录',
                            info: '来自于：中国上海 发表于：2019-01-04 14:55:21',
                        },
                        {
                            id: 3,
                            nickname: 'Brunch',
                            content: '添加语音短信触发回调报告日志记录',
                            info: '来自于：中国上海 发表于：2019-01-04 14:55:21',
                        },
                    ],
                },
                {
                    id: 4,
                    nickname: 'Summer BBQ',
                    content: "Wish I could come, but I'm out of town this weekend.",
                    info: '来自于：中国上海 发表于：2019-01-04 14:55:21',
                },
                {
                    id: 5,
                    nickname: 'Oui oui',
                    content: 'Do you have Paris recommendations? Have you ever been?',
                    info: '来自于：中国上海 发表于：2019-01-04 14:13:21',
                    children: [
                        {
                            id: 6,
                            nickname: 'Brunch',
                            content: '添加语音短信触发回调报告日志记录',
                            info: '来自于：中国上海 发表于：2019-01-04 14:55:21',
                        },
                    ],
                },
            ],
        }
    },
    mounted() {
        this.initCodeHighlight();
        this.initSNSShare();
    },
    updated() {
        Prism.highlightAll();
    },
    methods: {
        scrollToComments() {
            document.querySelector('.comment-form')?.scrollIntoView({
                behavior: 'smooth',
            })
        },

        initCodeHighlight() {
            // prism.js代码高亮显示
            let docPre = document.querySelectorAll('.article-content pre');
            if (docPre && docPre.length > 0) {
                console.log('文章中有代码块', Prism);
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

        submitComment() {
            if (!this.nickname.trim()) {
                alert('请输入昵称')
                return
            }
            if (!this.comment.trim()) {
                alert('请输入评论内容')
                return
            }

            // 添加新评论逻辑
            console.log('提交评论:', {
                nickname: this.nickname,
                website: this.website,
                comment: this.comment,
            })

            // 清空表单
            this.nickname = ''
            this.website = ''
            this.comment = ''
            this.replyTo = null
        },

        replyComment(comment) {
            this.replyTo = comment
            this.scrollToComments()
        },

        cancelReply() {
            this.replyTo = null
        },

        deleteComment(commentId) {
            if (confirm('确定要删除这条评论吗？')) {
                console.log('删除评论:', commentId)
            }
        },
    },
}
</script>

<template>
    <div class="container article-detail">
        <!-- 面包屑导航 -->
        <nav class="breadcrumbs">
            <div class="breadcrumb">
                <RouterLink v-for="(item, index) in breadcrumbs" :key="index" :to="item.to"
                    :class="{ disabled: item.disabled }">
                    {{ item.text }}
                </RouterLink>
            </div>
        </nav>

        <!-- 文章主体 -->
        <article class="article">
            <header class="article-header">
                <h1 class="article-title">
                    <ArticleBadge type="original" />
                    <span>{{ article.title }}</span>
                    <ArticleBadge type="top" />
                </h1>

                <div class="article-meta">
                    <span>发表于：2013-01-20 08:42:45，已有61394次阅读</span>

                    <div class="article-actions">
                        <button class="btn btn-secondary" @click="scrollToComments">评论</button>
                        <button class="btn btn-primary">编辑</button>
                        <button class="btn btn-danger">删除</button>
                    </div>
                </div>
            </header>

            <div class="article-content" v-html="article.content"></div>

            <!-- 社交分享 -->
            <SNSShares :sns-info="snsInfo" />

            <!-- 文章分页 -->
            <nav class="article-pager">
                <div style="display: flex; justify-content: space-between; align-items: center">
                    <button class="btn btn-outline">← 上篇文章</button>
                    <button class="btn btn-outline">下篇文章 →</button>
                </div>
            </nav>
        </article>

        <!-- 相关文章 -->
        <section class="related-articles">
            <h3>相关文章</h3>
            <div class="related-articles-list">
                <div class="related-article-item" v-for="(rltArticle, index) in relatedArticles" :key="index">
                    <RouterLink :to="rltArticle.url">{{ rltArticle.title }}</RouterLink>
                    <span class="article-date">({{ rltArticle.createdAt }})</span>
                </div>
            </div>
        </section>

        <!-- 评论区域 -->
        <section class="comments">
            <h3 class="comment-list-title">网友评论</h3>

            <div class="comments-list">
                <div class="comment" v-for="(item, index) in comments" :key="item.id">
                    <div class="comment-header">
                        <strong class="comment-author">{{ item.nickname }}</strong>
                        <div class="comment-actions">
                            <button class="btn btn-sm btn-secondary" @click="replyComment(item)">
                                回复
                            </button>
                            <button class="btn btn-sm btn-danger" @click="deleteComment(item.id)">
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
                                <strong class="comment-author">{{ child.nickname }}</strong>
                                <div class="comment-actions">
                                    <button class="btn btn-sm btn-secondary" @click="replyComment(child)">
                                        回复
                                    </button>
                                    <button class="btn btn-sm btn-danger" @click="deleteComment(child.id)">
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

            <!-- 评论表单 -->
            <form class="comment-form" @submit.prevent="submitComment">
                <div class="comment-head">
                    <h4>发表评论</h4>

                    <div class="comment-reply" v-if="replyTo">
                        <p>
                            回复 <strong>@{{ replyTo.nickname }}</strong>
                            <button type="button" class="btn btn-sm btn-danger" @click="cancelReply">
                                取消回复
                            </button>
                        </p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <input type="text" class="form-control" v-model="nickname" placeholder="昵称" required />
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <div class="form-group">
                            <input type="url" class="form-control" v-model="website" placeholder="个人网站（可选）" />
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="form-group">
                            <textarea class="form-control" rows="4" v-model="comment" placeholder="请输入评论内容..."
                                required></textarea>
                        </div>
                    </div>

                    <div class="col-12">
                        <button type="submit" class="btn btn-primary">确认发送</button>
                    </div>
                </div>
            </form>
        </section>
    </div>
</template>

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

.breadcrumb a.disabled {
    color: #666;
    pointer-events: none;
}

.breadcrumb a:not(:last-child)::after {
    content: ' / ';
    color: #666;
    margin-left: 0.5rem;
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

.article-title h1 {
    font-size: 2rem;
    margin: 0;
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
}

.article-content p {
    margin-bottom: 1rem;
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
}

.article-content img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 4px;
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

.comment-form {
    background: var(--bg-color);
    border-radius: 8px;
    padding: 2rem;
}

.comment-head {
    margin-bottom: 1.5rem;
}

.comment-reply {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: var(--card-bg);
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
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
</style>
