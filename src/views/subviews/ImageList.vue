<template>
    <div class="image-list">
        <div class="image-grid" v-if="images.length > 0">
            <div class="image-item" v-for="(image, index) in images" :key="image.id">
                <div class="image-container">
                    <img :src="getImageUrl(image.id)" :alt="`图片${index + 1}`" @click="previewImage(image.id)" />
                </div>
                <div class="image-info">
                    <a :href="getImageUrl(image.id)" target="_blank">图片{{ index + 1 }}</a>
                    <button type="button" class="btn-link delete-btn" @click="handleDeleteImage(image)">
                        删除
                    </button>
                </div>
            </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container" v-if="images.length > 0">
            <div class="pagination">
                <button :disabled="pagination.currentPage === 1" @click="handlePageChange(pagination.currentPage - 1)">
                    上一页
                </button>
                <button v-for="page in totalPages" :key="page" :class="{ active: page === pagination.currentPage }"
                    @click="handlePageChange(page)">
                    {{ page }}
                </button>
                <button :disabled="pagination.currentPage === totalPages"
                    @click="handlePageChange(pagination.currentPage + 1)">
                    下一页
                </button>
            </div>
            <div class="page-description">
                {{ pagination.total }}张图片,共{{ totalPages }}页
            </div>
        </div>

        <div v-if="images.length === 0" class="empty-state">
            <p>暂无内容</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ImageList',
    data() {
        return {
            images: [],
            pagination: {
                currentPage: 1,
                pageSize: 12,
                total: 0
            }
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.pagination.total / this.pagination.pageSize)
        }
    },
    mounted() {
        this.loadImages()
    },
    methods: {
        async loadImages() {
            try {
                // 模拟数据
                this.images = [
                    {
                        id: 1,
                        fileName: 'example.jpg',
                        descriptions: '示例图片'
                    }
                ]
                this.pagination.total = 1
            } catch {
                alert('加载图片失败')
            }
        },

        handlePageChange(page) {
            this.pagination.currentPage = page
            this.loadImages()
        },

        getImageUrl(imageId) {
            return `/images/show/${imageId}.jpg`
        },

        previewImage(imageId) {
            window.open(this.getImageUrl(imageId), '_blank')
        },

        handleDeleteImage() {
            if (confirm('确定要删除这张图片吗？')) {
                try {
                    // await this.$http.delete(`/api/images/${image.id}`)
                    alert('删除成功')
                    this.loadImages()
                } catch {
                    alert('删除失败')
                }
            }
        }
    }
}
</script>

<style scoped>
.image-list {
    padding: 0;
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.image-item {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    transition: var(--transition);
    background: var(--card-bg);
}

.image-item:hover {
    box-shadow: 0 4px 20px var(--shadow-color);
    transform: translateY(-2px);
}

.image-container {
    height: 200px;
    overflow: hidden;
    background: var(--hover-bg);
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.3s;
}

.image-container img:hover {
    transform: scale(1.05);
}

.image-info {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.image-info a {
    color: var(--link-color);
    text-decoration: none;
}

.image-info a:hover {
    color: var(--primary-hover);
    text-decoration: underline;
}

.btn-link {
    background: none;
    border: none;
    color: var(--link-color);
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    transition: var(--transition);
}

.btn-link:hover {
    color: var(--primary-hover);
    text-decoration: underline;
}

.delete-btn {
    color: #dc3545;
}

.delete-btn:hover {
    color: #c82333;
}

.pagination-container {
    margin-top: 20px;
    text-align: center;
}

.pagination {
    display: inline-flex;
    gap: 5px;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.pagination button {
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    background: var(--button-bg);
    color: var(--text-color);
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
    transition: var(--transition);
}

.pagination button:hover:not(:disabled) {
    color: var(--primary-color);
    border-color: var(--primary-color);
}

.pagination button.active {
    background: var(--primary-color);
    color: var(--text-on-primary);
    border-color: var(--primary-color);
}

.pagination button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.page-description {
    margin-top: 10px;
    color: var(--text-secondary);
    font-size: 14px;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
}

@media (max-width: 768px) {
    .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
    }
}
</style>
