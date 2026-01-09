<template>
    <div class="image-list-view">
        <h2 class="panel-title">博客图片管理</h2>

        <div class="image-grid" v-if="images.length > 0">
            <div class="image-card" v-for="image in images" :key="image.id">
                <div class="img-wrapper" @click="openLightbox(getImageUrl(image.id))">
                    <img
                        :src="getImageUrl(image.id)"
                        :alt="image.descriptions || 'Image'"
                        class="grid-img"
                    />

                    <div class="overlay">
                        <p class="overlay-text">{{ image.descriptions || image.filename }}</p>
                        <button class="btn-delete-sm" @click.stop="handleDeleteImage(image)">
                            删除
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <Pagination
            v-if="images.length > 0"
            :current-page="currentPage"
            :total-pages="totalPageCount"
            :total-items="totalCount"
            :disabled="loading"
            @page-change="handlePageChange"
        />

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
import Pagination from '@/components/Pagination.vue'

export default {
    name: 'ImageList',
    components: {
        ImagePreview,
        Pagination,
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
            lightboxSrc: '',
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
            this.lightboxSrc = src
            this.lightboxVisible = true
        },
        closeLightbox() {
            this.lightboxVisible = false
            this.lightboxSrc = ''
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
        },
    },
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
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: pointer;
    align-self: flex-start;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(239, 68, 68, 0.2);
}

.btn-delete-sm:hover {
    background-color: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}

.btn-delete-sm:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(239, 68, 68, 0.2);
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
