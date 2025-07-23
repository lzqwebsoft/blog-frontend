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
            const url = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(info.title)}&appkey=${info.appkey || ''}&pic=${encodeURIComponent(info.pic || '')}`
            window.open(url, '_blank', 'width=600,height=400')
        },
        shareToQzone() {
            const info = this.snsInfo.tqzone
            const url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(info.title)}${info.summary ? `&summary=${encodeURIComponent(info.summary)}` : ''}${info.pic ? `&pics=${encodeURIComponent(info.pic)}` : ''}`
            window.open(url, '_blank', 'width=600,height=400')
        },
        shareToTwitter() {
            const info = this.snsInfo.twitter
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(info.title)}&url=${encodeURIComponent(window.location.href)}`
            window.open(url, '_blank', 'width=600,height=400')
        },
        shareToFacebook() {
            const info = this.snsInfo.facebook
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
        <h4 class="share-title">分享到：</h4>
        <div class="share-buttons">
            <button class="share-btn sina" @click="shareToSina" title="分享到新浪微博">
                <span class="share-icon">📱</span>
                微博
            </button>

            <button class="share-btn qzone" @click="shareToQzone" title="分享到QQ空间">
                <span class="share-icon">📘</span>
                QQ空间
            </button>

            <button class="share-btn twitter" @click="shareToTwitter" title="分享到Twitter">
                <span class="share-icon">🐦</span>
                Twitter
            </button>

            <button class="share-btn facebook" @click="shareToFacebook" title="分享到Facebook">
                <span class="share-icon">📘</span>
                Facebook
            </button>

            <button class="share-btn copy" @click="copyLink" title="复制链接">
                <span class="share-icon">📋</span>
                复制链接
            </button>
        </div>
    </div>
</template>

<style scoped>
.sns-share {
    margin: 2rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.share-title {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: #333;
}

.share-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.share-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    transition: all 0.3s ease;
}

.share-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.share-btn.sina {
    border-color: #ff8200;
    color: #ff8200;
}

.share-btn.sina:hover {
    background: #ff8200;
    color: white;
}

.share-btn.qzone {
    border-color: #12b7f5;
    color: #12b7f5;
}

.share-btn.qzone:hover {
    background: #12b7f5;
    color: white;
}

.share-btn.twitter {
    border-color: #1da1f2;
    color: #1da1f2;
}

.share-btn.twitter:hover {
    background: #1da1f2;
    color: white;
}

.share-btn.facebook {
    border-color: #1877f2;
    color: #1877f2;
}

.share-btn.facebook:hover {
    background: #1877f2;
    color: white;
}

.share-btn.copy {
    border-color: #28a745;
    color: #28a745;
}

.share-btn.copy:hover {
    background: #28a745;
    color: white;
}

.share-icon {
    font-size: 1rem;
}

@media (max-width: 768px) {
    .share-buttons {
        justify-content: center;
    }

    .share-btn {
        font-size: 0.75rem;
        padding: 0.4rem 0.8rem;
    }
}
</style>
