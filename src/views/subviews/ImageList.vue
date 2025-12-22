<template>
    <div class="image-list-view">
        <h2 class="panel-title">博客图片管理</h2>

        <div class="image-grid" v-if="images.length > 0">
            <div class="image-card" v-for="image in images" :key="image.id">
                <div class="img-wrapper" @click="openLightbox(getImageUrl(image.id))">
                    <img :src="getImageUrl(image.id)" :alt="image.descriptions || 'Image'" class="grid-img" />

                    <div class="overlay">
                        <p class="overlay-text">{{ image.fileName || 'image.jpg' }}</p>
                        <button class="btn-delete-sm" @click.stop="handleDeleteImage(image)">
                            删除
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="pagination-bar">
            <button class="load-more-btn">加载更多...</button>
        </div>

        <!-- Lightbox -->
        <div v-if="lightboxVisible" class="lightbox" @click="closeLightbox">
            <img :src="lightboxSrc" class="lightbox-img"
                :class="{ 'zoom-in': zoomLevel > 1, 'zoom-out': zoomLevel === 1 }"
                :style="{ transform: `scale(${zoomLevel})` }" @click.stop="toggleZoom">
            <button class="close-btn" @click="closeLightbox">
                <font-awesome-icon :icon="['fas', 'times']" />
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ImageList',
    data() {
        return {
            images: [],
            pagination: { total: 0 },
            lightboxVisible: false,
            lightboxSrc: '',
            zoomLevel: 1
        }
    },
    mounted() {
        this.loadImages()
    },
    methods: {
        async loadImages() {
            // Mock Data - using some external placeholders for visual test if real ids provided, matching set.html
            this.images = [
                { id: '1498050108023-c5249f4df085', fileName: 'coding-setup.jpg' },
                { id: '1555066931-4365d14bab8c', fileName: 'screen-code.jpg' },
                { id: '1555066931-4365d14bab8d', fileName: 'screen-code-2.jpg' }
            ]
        },
        getImageUrl(id) {
            // Using ID to generate unsplash url as in set.html for demo, or local
            if (id.length > 20 || id.includes('-')) return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=300&q=80`;
            return `/images/show/${id}.jpg`
        },
        openLightbox(src) {
            // Use high res for lightbox
            this.lightboxSrc = src.replace('w=300', 'w=1200');
            this.lightboxVisible = true;
            this.zoomLevel = 1;
            document.body.style.overflow = 'hidden';
        },
        closeLightbox() {
            this.lightboxVisible = false;
            this.lightboxSrc = '';
            document.body.style.overflow = '';
        },
        toggleZoom() {
            this.zoomLevel = this.zoomLevel === 1 ? 1.5 : 1;
        },
        handleDeleteImage(image) {
            if (confirm('Delete?')) {
                this.images = this.images.filter(i => i.id !== image.id)
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
    color: var(--text-secondary);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
}

.load-more-btn:hover {
    color: var(--text-color);
}

/* Lightbox */
.lightbox {
    position: fixed;
    inset: 0;
    z-index: 60;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.lightbox-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
    cursor: zoom-in;
}

.lightbox-img.zoom-in {
    cursor: zoom-out;
}

.close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: white;
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
}
</style>
