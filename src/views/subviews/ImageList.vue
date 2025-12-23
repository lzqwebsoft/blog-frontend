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

        <div class="pagination-bar" v-if="images.length > 0 && currentPage < totalPageCount">
            <button class="load-more-btn" @click="handleLoadMore" :disabled="loading">
                <font-awesome-icon v-if="loading" icon="spinner" spin />
                {{ loading ? '加载中...' : '加载更多...' }}
            </button>
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
            lightboxVisible: false,
            lightboxSrc: ''
        }
    },
    mounted() {
        this.loadImages()
    },
    methods: {
        async loadImages(isLoadMore = false) {
            if (this.loading) return

            this.loading = true
            if (!isLoadMore) {
                this.currentPage = 1
            }

            try {
                const result = await getImageList(this.currentPage, this.pageSize)
                if (result.code === 0 && result.data) {
                    const newImages = result.data.data || []
                    if (isLoadMore) {
                        this.images = [...this.images, ...newImages]
                    } else {
                        this.images = newImages
                    }
                    this.totalPageCount = result.data.totalPageCount || 0
                } else {
                    if (!isLoadMore) this.images = []
                    this.totalPageCount = 0
                }
            } catch (error) {
                console.error('获取图片列表失败:', error)
                if (!isLoadMore) this.images = []
            } finally {
                this.loading = false
            }
        },
        handleLoadMore() {
            if (this.currentPage < this.totalPageCount) {
                this.currentPage++
                this.loadImages(true)
            }
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
                    this.images = this.images.filter(i => i.id !== image.id)
                    // 如果删除后当前页没数据了，且不是第一页，尝试重新加载
                    if (this.images.length === 0 && this.currentPage > 1) {
                        this.currentPage--
                        this.loadImages()
                    }
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
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
}

.load-more-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    background: var(--hover-bg);
    border: 1px solid var(--border-color);
    padding: 0.625rem 1.5rem;
    border-radius: 2rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
    color: var(--text-color);
    border-color: var(--text-color);
    background: var(--border-color);
}

.load-more-btn:disabled {
    opacity: 0.6;
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
