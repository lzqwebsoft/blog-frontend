<template>
    <div class="blog-management">
        <h2>博客管理</h2>

        <!-- 标签页导航 -->
        <div class="tabs-container">
            <div class="tabs">
                <button v-for="tab in tabs" :key="tab.name" :class="['tab-item', { active: activeTab === tab.name }]"
                    @click="handleTabClick(tab.name)">
                    {{ tab.label }}
                </button>
            </div>
        </div>

        <!-- 标签页内容 -->
        <div class="tab-content">
            <!-- 文章列表 -->
            <div v-show="activeTab === 'articles'">
                <article-list />
            </div>

            <!-- 类别管理 -->
            <div v-show="activeTab === 'types'">
                <article-type-list />
            </div>

            <!-- 草稿箱 -->
            <div v-show="activeTab === 'drafts'">
                <draft-list />
            </div>

            <!-- 相关链接 -->
            <div v-show="activeTab === 'links'">
                <link-list />
            </div>

            <!-- 博客用图 -->
            <div v-show="activeTab === 'images'">
                <image-list />
            </div>

            <!-- 信息设置 -->
            <div v-show="activeTab === 'settings'">
                <blog-settings />
            </div>
        </div>

        <!-- 链接编辑对话框 -->
        <link-edit-dialog v-if="linkDialogVisible" :visible="linkDialogVisible" :link-data="currentLink"
            @save="handleSaveLink" @close="linkDialogVisible = false" />
    </div>
</template>

<script>
import ArticleList from './subviews/ArticleList.vue'
import ArticleTypeList from './subviews/ArticleTypeList.vue'
import DraftList from './subviews/DraftList.vue'
import LinkList from './subviews/LinkList.vue'
import ImageList from './subviews/ImageList.vue'
import BlogSettings from './subviews/BlogSettings.vue'
import LinkEditDialog from '../components/LinkEditDialog.vue'

export default {
    name: 'BlogManagement',
    components: {
        ArticleList,
        ArticleTypeList,
        DraftList,
        LinkList,
        ImageList,
        BlogSettings,
        LinkEditDialog
    },
    data() {
        return {
            activeTab: 'articles',
            linkDialogVisible: false,
            currentLink: null,
            tabs: [
                { name: 'articles', label: '文章列表' },
                { name: 'types', label: '类别管理' },
                { name: 'drafts', label: '草稿箱' },
                { name: 'links', label: '相关链接' },
                { name: 'images', label: '博客用图' },
                { name: 'settings', label: '信息设置' }
            ]
        }
    },
    provide() {
        return {
            openLinkDialog: this.openLinkDialog
        }
    },
    methods: {
        handleTabClick(tabName) {
            this.activeTab = tabName
            console.log('切换到标签:', tabName)
        },
        handleSaveLink(linkData) {
            // 保存链接逻辑
            console.log('保存链接:', linkData)
            this.linkDialogVisible = false
        },
        openLinkDialog(link = null) {
            this.currentLink = link
            this.linkDialogVisible = true
        }
    }
}
</script>

<style scoped>
.blog-management {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

.blog-management h2 {
    margin-bottom: 20px;
    color: var(--text-color);
    font-size: 24px;
    font-weight: 600;
}

.tabs-container {
    margin-bottom: 20px;
    border-bottom: 2px solid var(--border-color);
    background: var(--card-bg);
    border-radius: 8px 8px 0 0;
}

.tabs {
    display: flex;
    gap: 0;
    flex-wrap: wrap;
}

.tab-item {
    padding: 12px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-secondary);
    transition: var(--transition);
    position: relative;
    bottom: -2px;
}

.tab-item:hover {
    color: var(--primary-color);
    background: var(--hover-bg);
}

.tab-item.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    font-weight: 500;
}

.tab-content {
    background: var(--card-bg);
    border-radius: 0 0 8px 8px;
    min-height: 400px;
    padding: 20px;
    box-shadow: 0 4px 20px var(--shadow-color);
}

@media (max-width: 768px) {
    .blog-management {
        padding: 10px;
    }

    .blog-management h2 {
        font-size: 20px;
        margin-bottom: 15px;
    }

    .tabs {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .tab-item {
        padding: 10px 15px;
        font-size: 13px;
        white-space: nowrap;
    }

    .tab-content {
        padding: 15px;
    }
}
</style>
