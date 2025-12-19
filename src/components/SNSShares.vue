<script>
export default {
    props: {
        snsInfo: {
            type: Object,
            required: true,
            default: () => ({})
        }
    },
    methods: {
        shareToSina() {
            const info = this.snsInfo.tsina
            info.appkey = '1343713053'
            const url = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(info.title)}&appkey=${info.appkey || ''}&pic=${encodeURIComponent(info.pic || '')}`
            window.open(url, '_blank', 'width=600,height=400')
        },
        shareToQzone() {
            const info = this.snsInfo.tqzone
            const url = `http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${window.location.href}?title=${info.title}&summary=${info.summary}&pics=${info.pic}&desc=${info.summary}`
            window.open(url, '_blank', 'width=600,height=400')
        },
        shareToTwitter() {
            const info = this.snsInfo.twitter
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(info.title)}&url=${encodeURIComponent(window.location.href)}&pic=${encodeURIComponent(info.pic || '')}`
            window.open(url, '_blank', 'width=600,height=400')
        },
        shareToFacebook() {
            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
            window.open(url, '_blank', 'width=600,height=400')
        },
        copyLink() {
            navigator.clipboard.writeText(window.location.href)
            alert('链接已复制到剪贴板')
        }
    }
}
</script>

<template>
    <div class="sns-share">
        <div class="share-container">
            <h4 class="share-title">
                <font-awesome-icon icon="paper-plane" class="title-icon" />
                分享文章
            </h4>
            <div class="share-buttons">
                <button class="share-btn sina" @click="shareToSina" title="分享到新浪微博">
                    <font-awesome-icon :icon="['fab', 'weibo']" class="share-icon" />
                    <span class="btn-text">微博</span>
                </button>

                <button class="share-btn qzone" @click="shareToQzone" title="分享到QQ空间">
                    <font-awesome-icon :icon="['fab', 'qq']" class="share-icon" />
                    <span class="btn-text">QQ空间</span>
                </button>

                <button class="share-btn twitter" @click="shareToTwitter" title="分享到Twitter">
                    <font-awesome-icon :icon="['fab', 'x-twitter']" class="share-icon" />
                    <span class="btn-text">Twitter</span>
                </button>

                <button class="share-btn facebook" @click="shareToFacebook" title="分享到Facebook">
                    <font-awesome-icon :icon="['fab', 'facebook']" class="share-icon" />
                    <span class="btn-text">Facebook</span>
                </button>

                <button class="share-btn copy" @click="copyLink" title="复制链接">
                    <font-awesome-icon icon="copy" class="share-icon" />
                    <span class="btn-text">复制链接</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.sns-share {
    margin: 2.5rem 0;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
    border-radius: 8px;
    border: 1px solid rgba(99, 102, 241, 0.1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.share-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
}

.share-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color, #333);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
}

.title-icon {
    color: #6366f1;
    font-size: 1.2rem;
}

.share-buttons {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.share-btn {
    padding: 0.65rem 1.2rem;
    border: 2px solid;
    border-radius: 50px;
    background: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.share-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.2;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.share-btn:hover::before {
    width: 300px;
    height: 300px;
}

.share-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.share-btn:active {
    transform: translateY(-1px) scale(1.02);
}

.share-icon {
    font-size: 1.1rem;
    z-index: 1;
}

.btn-text {
    z-index: 1;
}

.share-btn.sina {
    border-color: #ff8200;
    color: #ff8200;
}

.share-btn.sina:hover {
    background: #ff8200;
    color: white;
    border-color: #ff8200;
}

.share-btn.qzone {
    border-color: #12b7f5;
    color: #12b7f5;
}

.share-btn.qzone:hover {
    background: #12b7f5;
    color: white;
    border-color: #12b7f5;
}

.share-btn.twitter {
    border-color: #000000;
    color: #000000;
}

.share-btn.twitter:hover {
    background: #000000;
    color: white;
    border-color: #000000;
}

.share-btn.facebook {
    border-color: #1877f2;
    color: #1877f2;
}

.share-btn.facebook:hover {
    background: #1877f2;
    color: white;
    border-color: #1877f2;
}

.share-btn.copy {
    border-color: #10b981;
    color: #10b981;
}

.share-btn.copy:hover {
    background: #10b981;
    color: white;
    border-color: #10b981;
}

/* 暗黑模式适配 */

:root.dark-theme .sns-share {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    border-color: rgba(99, 102, 241, 0.2);
}

:root.dark-theme .share-btn {
    background: rgba(30, 30, 30, 0.9);
}

:root.dark-theme .share-btn.twitter {
    border-color: #1da1f2;
    color: #1da1f2;
}

:root.dark-theme .share-btn.twitter:hover {
    background: #1da1f2;
    border-color: #1da1f2;
}

/* 平板适配 */
@media (max-width: 1024px) {
    .share-container {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.25rem;
    }

    .share-buttons {
        width: 100%;
        justify-content: center;
    }
}

/* 移动端适配 */
@media (max-width: 768px) {
    .sns-share {
        padding: 0.6rem 1.25rem;
        margin: 1.5rem 0;
    }

    .share-container {
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }

    .share-title {
        display: none;
    }

    .share-buttons {
        justify-content: center;
        gap: 0.5rem;
    }

    .share-btn {
        font-size: 0.85rem;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        justify-content: center;
        align-items: center;
        padding: 0;
    }

    .btn-text {
        display: none;
    }
}
</style>
