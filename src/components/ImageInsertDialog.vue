<template>
    <div v-if="show" class="image-dialog-overlay" @click.self="closeDialog">
        <div class="image-dialog">
            <div class="dialog-header">
                <h3>插入图片</h3>
                <button type="button" class="close-btn" @click="closeDialog">
                    <font-awesome-icon icon="times" />
                </button>
            </div>

            <!-- Tab 切换 -->
            <div class="dialog-tabs">
                <button type="button" class="tab-btn" :class="{ active: activeTab === 'upload' }"
                    @click="activeTab = 'upload'">
                    <font-awesome-icon icon="upload" />
                    上传图片
                </button>
                <button type="button" class="tab-btn" :class="{ active: activeTab === 'remote' }"
                    @click="activeTab = 'remote'">
                    <font-awesome-icon icon="link" />
                    远程图片
                </button>
                <button type="button" class="tab-btn" :class="{ active: activeTab === 'select' }"
                    @click="switchToSelectTab">
                    <font-awesome-icon icon="images" />
                    选择图片
                </button>
            </div>

            <div class="dialog-content">
                <!-- 上传图片 Tab -->
                <div v-if="activeTab === 'upload'" class="upload-tab">
                    <div class="upload-section">
                        <div v-if="!selectedFile" class="file-upload-area">
                            <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*"
                                id="imageFileInput" class="file-input" />
                            <label for="imageFileInput" class="file-label">
                                <font-awesome-icon icon="cloud-upload-alt" class="upload-icon" />
                                <span>点击选择图片或拖拽到此处</span>
                            </label>
                        </div>

                        <div v-else class="file-preview">
                            <img :src="filePreviewUrl" alt="预览" class="preview-image" />
                            <button type="button" class="remove-file-btn" @click="clearFile" title="移除图片">
                                <font-awesome-icon icon="times" />
                            </button>
                        </div>

                        <div class="form-group">
                            <label for="imageDescription">图片描述（可选）</label>
                            <input type="text" id="imageDescription" v-model="imageDescription" placeholder="请输入图片描述"
                                class="form-input" />
                        </div>

                        <button type="button" class="upload-btn" @click="uploadImage"
                            :disabled="!selectedFile || uploading">
                            <font-awesome-icon v-if="uploading" icon="spinner" spin />
                            <font-awesome-icon v-else icon="upload" />
                            {{ uploading ? '上传中...' : '上传并插入' }}
                        </button>
                    </div>
                </div>

                <!-- 远程图片 Tab -->
                <div v-if="activeTab === 'remote'" class="remote-tab">
                    <div class="remote-section">
                        <div class="form-group">
                            <label for="remoteImageUrl">图片地址</label>
                            <input type="text" id="remoteImageUrl" v-model="remoteImageUrl"
                                placeholder="请输入图片URL，如：https://example.com/image.jpg" class="form-input" />
                        </div>
                        <div class="form-group">
                            <label for="remoteImageDesc">图片描述</label>
                            <input type="text" id="remoteImageDesc" v-model="imageDescription" placeholder="请输入图片描述（可选）"
                                class="form-input" />
                        </div>
                    </div>
                </div>

                <!-- 选择图片 Tab -->
                <div v-if="activeTab === 'select'" class="select-tab">
                    <div v-if="loadingImages" class="loading-state">
                        <font-awesome-icon icon="spinner" spin class="loading-icon" />
                        <span>加载中...</span>
                    </div>

                    <div v-else-if="imageList.length === 0" class="empty-state">
                        <font-awesome-icon icon="image" class="empty-icon" />
                        <span>暂无图片</span>
                    </div>

                    <div v-else class="image-grid">
                        <div v-for="image in imageList" :key="image.id" class="image-item"
                            :class="{ selected: selectedImageId === image.id }" @click="selectImage(image)">
                            <img :src="`/images/show/${image.id}.jpg`" :alt="image.descriptions || image.filename" />
                            <div class="image-info">
                                <span class="image-name" :title="image.filename">{{ image.filename }}</span>
                            </div>
                            <div v-if="selectedImageId === image.id" class="selected-indicator">
                                <font-awesome-icon icon="check-circle" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="activeTab !== 'upload'" class="dialog-footer">
                <!-- 分页 -->
                <div v-if="activeTab == 'select' && imageList.length > 0" class="pagination">
                    <button type="button" class="page-btn" :disabled="currentPage <= 1"
                        @click="changePage(currentPage - 1)">
                        <font-awesome-icon icon="chevron-left" />
                    </button>
                    <span class="page-info">第 {{ currentPage }} / {{ totalPageCount || 1 }} 页</span>
                    <button type="button" class="page-btn" :disabled="currentPage >= totalPageCount"
                        @click="changePage(currentPage + 1)">
                        <font-awesome-icon icon="chevron-right" />
                    </button>
                </div>

                <div class="button-group">
                    <button type="button" class="cancel-btn" @click="closeDialog">取消</button>
                    <button type="button" class="confirm-btn" @click="confirmInsert" :disabled="!canConfirm">
                        确认
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { uploadImage, getImageList } from '@/api/image'

export default {
    name: 'ImageInsertDialog',
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close', 'confirm'],
    data() {
        return {
            activeTab: 'upload', // 'upload' | 'select'
            // 上传相关
            selectedFile: null,
            filePreviewUrl: '',
            imageDescription: '',
            remoteImageUrl: '',
            uploading: false,
            // 图片列表相关
            imageList: [],
            loadingImages: false,
            currentPage: 1,
            pageLimit: 12,
            totalPageCount: 0,
            selectedImageId: null,
            selectedImageData: null
        }
    },
    computed: {
        canConfirm() {
            if (this.activeTab === 'upload') {
                return false // 上传Tab通过按钮直接触发
            } else if (this.activeTab === 'remote') {
                return !!this.remoteImageUrl
            } else {
                return !!this.selectedImageId
            }
        }
    },
    watch: {
        show(val) {
            if (val) {
                this.resetState()
                this.activeTab = 'upload'
                document.body.style.overflow = 'hidden'
            } else {
                document.body.style.overflow = ''
            }
        }
    },
    beforeUnmount() {
        document.body.style.overflow = ''
    },
    methods: {
        closeDialog() {
            this.$emit('close')
        },

        resetState() {
            this.selectedFile = null
            this.filePreviewUrl = ''
            this.imageDescription = ''
            this.remoteImageUrl = ''
            this.uploading = false
            this.selectedImageId = null
            this.selectedImageData = null
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = ''
            }
        },

        switchToSelectTab() {
            this.activeTab = 'select'
            this.fetchImageList()
        },

        handleFileSelect(e) {
            const file = e.target.files[0]
            if (file) {
                this.selectedFile = file
                if (this.filePreviewUrl) {
                    URL.revokeObjectURL(this.filePreviewUrl)
                }
                this.filePreviewUrl = URL.createObjectURL(file)
            }
        },

        clearFile() {
            this.selectedFile = null
            if (this.filePreviewUrl) {
                URL.revokeObjectURL(this.filePreviewUrl)
                this.filePreviewUrl = ''
            }
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = ''
            }
        },

        async uploadImage() {
            if (!this.selectedFile || this.uploading) return

            this.uploading = true
            try {
                const formData = new FormData()
                formData.append('imgFile', this.selectedFile)
                if (this.imageDescription) {
                    formData.append('descriptions', this.imageDescription)
                }

                const response = await uploadImage(formData)
                // request 拦截器通常返回 response.data
                const result = response

                if (result.code === 0 && result.data) {
                    this.remoteImageUrl = result.data.url
                    this.confirmInsert()
                } else {
                    alert('上传失败：' + (result.message || '未知错误'))
                }
            } catch (error) {
                console.error('上传图片失败:', error)
                alert('上传图片失败，请重试')
            } finally {
                this.uploading = false
            }
        },

        async fetchImageList(page = 1) {
            this.loadingImages = true
            this.currentPage = page
            try {
                const result = await getImageList(page, this.pageLimit)
                if (result.code === 0 && result.data) {
                    this.imageList = result.data.data || []
                    this.totalPageCount = result.data.totalPageCount || 0
                } else {
                    this.imageList = []
                    this.totalPageCount = 0
                }
            } catch (error) {
                console.error('获取图片列表失败:', error)
                this.imageList = []
                this.totalPageCount = 0
            } finally {
                this.loadingImages = false
            }
        },

        changePage(page) {
            if (page < 1) return
            this.fetchImageList(page)
        },

        selectImage(image) {
            this.selectedImageId = image.id
            this.selectedImageData = image
        },

        confirmInsert() {
            let imageUrl = ''
            let imageAlt = '图片描述'

            if (this.activeTab === 'upload' || this.activeTab === 'remote') {
                if (!this.remoteImageUrl) return
                imageUrl = this.remoteImageUrl
                imageAlt = this.imageDescription || '图片描述'
            } else {
                if (!this.selectedImageId) return
                imageUrl = `/images/show/${this.selectedImageId}.jpg`
                imageAlt = this.selectedImageData?.descriptions || this.selectedImageData?.filename || '图片描述'
            }

            this.$emit('confirm', { url: imageUrl, alt: imageAlt })
            this.closeDialog()
        }
    }
}
</script>

<style scoped>
.image-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.image-dialog {
    background: var(--card-bg);
    border-radius: 12px;
    width: 90%;
    max-width: 680px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    overflow: hidden;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color);
    background: var(--hover-bg);
}

.dialog-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color);
}

.close-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s;
}

.close-btn:hover {
    background: var(--border-color);
    color: var(--text-color);
}

/* Tab 切换 */
.dialog-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    background: var(--hover-bg);
}

.tab-btn {
    flex: 1;
    padding: 0.875rem 1.25rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9375rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.tab-btn:hover {
    color: var(--text-color);
    background: rgba(var(--primary-rgb), 0.05);
}

.tab-btn.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    background: var(--card-bg);
}

/* 对话框内容区 */
.dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem;
}

/* 上传 Tab */
.upload-tab,
.remote-tab {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.upload-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.file-upload-area {
    position: relative;
}

.file-input {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
}

.file-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    border: 2px dashed var(--border-color);
    border-radius: 10px;
    background: var(--hover-bg);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.file-label:hover {
    border-color: var(--primary-color);
    background: rgba(var(--primary-rgb), 0.05);
}

.upload-icon {
    font-size: 2.5rem;
    color: var(--primary-color);
}

.file-name {
    color: var(--text-color);
    font-weight: 500;
}

.file-preview {
    position: relative;
    display: flex;
    justify-content: center;
    padding: 0.5rem;
    background: var(--hover-bg);
    border-radius: 8px;
    animation: fadeIn 0.3s ease;
}

.remove-file-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.75rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
    z-index: 10;
}

.remove-file-btn:hover {
    background: var(--error-color, #ff4d4f);
    border-color: var(--error-color, #ff4d4f);
    color: white;
    transform: scale(1.1);
}

.preview-image {
    max-width: 200px;
    max-height: 150px;
    border-radius: 6px;
    object-fit: contain;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
}

.form-input {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--card-bg);
    color: var(--text-color);
    font-size: 0.9375rem;
    transition: all 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.form-input::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
}

.upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark, #3a7bd5));
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.upload-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.upload-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}



/* 选择图片 Tab */
.select-tab {
    min-height: 300px;
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem;
    color: var(--text-secondary);
}

.loading-icon,
.empty-icon {
    font-size: 2.5rem;
    opacity: 0.5;
}

/* 图片网格 */
.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
}

.image-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
}

.image-item:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-item.selected {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.2);
}

.image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.5rem;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.image-name {
    font-size: 0.75rem;
    color: white;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.selected-indicator {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.75rem;
}

/* 分页 */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 0;
}

.page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.page-info {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

/* 对话框底部 */
.dialog-footer {
    display: flex;
    align-items: center;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--border-color);
    background: var(--hover-bg);
}

.button-group {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-left: auto;
}

.cancel-btn,
.confirm-btn {
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.cancel-btn {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-color);
}

.cancel-btn:hover {
    background: var(--hover-bg);
}

.confirm-btn {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark, #3a7bd5));
    border: none;
    color: white;
}

.confirm-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.confirm-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 640px) {
    .image-dialog {
        width: 95%;
        max-height: 90vh;
    }

    .dialog-header {
        padding: 0.875rem 1rem;
    }

    .dialog-content {
        padding: 1rem;
    }

    .file-label {
        padding: 1.5rem;
    }

    .upload-icon {
        font-size: 2rem;
    }

    .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.75rem;
    }

    .dialog-footer {
        padding: 0.875rem 1rem;
    }
}
</style>
