<template>
    <div class="image-list-view">
        <h2 class="panel-title">博客图片管理</h2>

        <div class="image-grid" v-if="images.length > 0">
            <div class="image-card" v-for="image in images" :key="image.id">
                <div class="img-wrapper" @click="openLightbox(getImageUrl(image.id))">
                    <img :src="getImageUrl(image.id)" :alt="image.descriptions || 'Image'" class="grid-img" />

                    <div class="overlay">
                        <p class="overlay-text">{{ image.descriptions || image.filename }}</p>
                        <button class="btn-delete-sm" @click.stop="handleDeleteImage(image)">
                            删除
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="pagination-bar" v-if="images.length > 0">
            <div class="pagination-info">
                共 {{ totalPageCount }} 页
            </div>
            <div class="pagination-controls">
                <button class="page-nav-btn" :disabled="currentPage === 1 || loading"
                    @click="handlePageChange(currentPage - 1)">
                    <font-awesome-icon icon="chevron-left" />
                </button>

                <div class="page-numbers">
                    <button v-for="page in visiblePages" :key="page" class="page-num-btn"
                        :class="{ active: currentPage === page }" @click="handlePageChange(page)">
                        {{ page }}
                    </button>
                </div>

                <button class="page-nav-btn" :disabled="currentPage === totalPageCount || loading"
                    @click="handlePageChange(currentPage + 1)">
                    <font-awesome-icon icon="chevron-right" />
                </button>
            </div>
        </div>

        <div v-else-if="images.length === 0 && !loading" class="empty-state">
            <font-awesome-icon icon="image" class="empty-icon" />
            <p>暂无图片</p>
        </div>

        <!-- Image Preview -->
        <ImagePreview :visible="lightboxVisible" :imageUrl="lightboxSrc" @close="closeLightbox" />
    </div>
</template>

<script>
import { getImageList, deleteImage } from '@/api/image'
import ImagePreview from '@/components/ImagePreview.vue'

export default {
    name: 'ImageList',
    components: {
        ImagePreview
    },
    data() {
        return {
            images: [],
            loading: false,
            currentPage: 1,
            pageSize: 12,
            totalPageCount: 0,
            totalCount: 0,
            lightboxVisible: false,
            lightboxSrc: ''
        }
    },
    computed: {
        visiblePages() {
            const pages = []
            const maxVisible = 5
            let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
            let end = Math.min(this.totalPageCount, start + maxVisible - 1)

            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1)
            }

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
            return pages
        }
    },
    mounted() {
        this.loadImages()
    },
    methods: {
        async loadImages() {
            if (this.loading) return

            this.loading = true
            try {
                const result = await getImageList(this.currentPage, this.pageSize)
                if (result.code === 0 && result.data) {
                    this.images = result.data.data || []
                    this.totalPageCount = result.data.totalPageCount || 0
                    this.totalCount = result.data.totalCount || 0
                } else {
                    this.images = []
                    this.totalPageCount = 0
                    this.totalCount = 0
                }
            } catch (error) {
                console.error('获取图片列表失败:', error)
                this.images = []
            } finally {
                this.loading = false
            }
        },
        handlePageChange(page) {
            if (page < 1 || page > this.totalPageCount) return
            this.currentPage = page
            this.loadImages()
            // Optional: scroll to top of list
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },
        getImageUrl(id) {
            if (!id) return ''
            return `/images/show/${id}.jpg`
        },
        openLightbox(src) {
            this.lightboxSrc = src;
            this.lightboxVisible = true;
        },
        closeLightbox() {
            this.lightboxVisible = false;
            this.lightboxSrc = '';
        },
        async handleDeleteImage(image) {
            if (!confirm('确定要删除这张图片吗？')) return

            try {
                const result = await deleteImage(image.id)
                if (result.code === 0) {
                    // Check if we need to go back a page
                    if (this.images.length === 1 && this.currentPage > 1) {
                        this.currentPage--
                    }
                    this.loadImages()
                } else {
                    alert('删除失败：' + (result.message || '未知错误'))
                }
            } catch (error) {
                console.error('删除图片失败:', error)
                alert('删除图片失败，请稍后重试')
            }
        }
    }
}
</script>

<style scoped>
.panel-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    font-family: var(--font-serif);
    margin-bottom: 1.5rem;
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

@media (min-width: 768px) {
    .image-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 1024px) {
    .image-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

.image-card {
    aspect-ratio: 1 / 1;
    background-color: var(--hover-bg);
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--border-color);
    position: relative;
}

.img-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: zoom-in;
}

.grid-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    opacity: 0;
    transition: opacity 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0.75rem;
}

.img-wrapper:hover .overlay {
    opacity: 1;
}

.overlay-text {
    color: white;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.5rem;
}

.btn-delete-sm {
    background-color: #ef4444;
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    border: none;
    cursor: pointer;
    align-self: flex-start;
}

.btn-delete-sm:hover {
    background-color: #dc2626;
}

.pagination-bar {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

@media (min-width: 640px) {
    .pagination-bar {
        flex-direction: row;
        justify-content: space-between;
    }
}

.pagination-info {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.page-numbers {
    display: flex;
    gap: 0.25rem;
}

.page-num-btn,
.page-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.25rem;
    height: 2.25rem;
    padding: 0 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
    background: var(--card-bg);
    color: var(--text-color);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.page-num-btn:hover:not(.active),
.page-nav-btn:hover:not(:disabled) {
    background-color: var(--hover-bg);
    border-color: var(--text-secondary);
}

.page-num-btn.active {
    background-color: var(--text-color);
    color: var(--bg-color);
    border-color: var(--text-color);
    font-weight: 600;
}

.page-nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: var(--text-secondary);
    background: var(--hover-bg);
    border-radius: 0.75rem;
    border: 2px dashed var(--border-color);
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.3;
}
</style>
