<template>
    <div class="shuoshuo-container">
        <!-- 头部标题区 -->
        <div class="shuoshuo-header animate-fade-in">
            <div class="header-icon-wrapper">
                <font-awesome-icon icon="lightbulb" class="title-icon" />
            </div>
            <h1 class="header-title">碎碎念</h1>
            <p class="header-subtitle">记录生活点滴，捕捉瞬间感悟。</p>
            <div class="header-stats-badge">
                <span class="badge-dot"></span>
                <span>当前共发表了 <strong>{{ total }}</strong> 条说说</span>
            </div>
        </div>

        <!-- 1. 发表说说编辑器 (仅登录博主可见) -->
        <div v-if="isAuthenticated" class="editor-card card-glass animate-fade-in">
            <div class="editor-header">
                <img src="@/assets/images/avatar.jpg" alt="博主头像" class="editor-avatar" />
                <span class="editor-title">发布新说说</span>
            </div>
            <div class="editor-body">
                <textarea v-model="content" class="editor-textarea" placeholder="有什么新鲜事想分享吗？支持文字与最多9张图片..." rows="4"
                    :disabled="uploadingTalk"></textarea>

                <!-- 图片预览与上传九宫格网格 -->
                <div class="preview-grid" v-if="selectedFiles.length > 0">
                    <div v-for="(item, index) in selectedFiles" :key="index" class="preview-item animate-scale-in"
                        :class="{ 'is-uploading': item.uploading, 'is-error': item.error }">
                        <img :src="item.previewUrl" alt="预览图" class="preview-img" />
                        <div class="upload-overlay" v-if="item.uploading">
                            <font-awesome-icon icon="spinner" spin class="upload-spinner" />
                            <span class="upload-percent">上传中</span>
                        </div>
                        <div class="error-overlay" v-if="item.error" @click="retryUpload(index)" title="点击重试">
                            <font-awesome-icon icon="circle-exclamation" class="error-icon" />
                            <span class="error-text">重试</span>
                        </div>
                        <button type="button" class="remove-img-btn" @click="removePreviewImage(index)" title="移除图片">
                            <font-awesome-icon icon="times" />
                        </button>
                    </div>

                    <!-- 网格中添加图片的占位按钮 (不超过9张) -->
                    <div v-if="selectedFiles.length < 9" class="add-image-placeholder" @click="triggerFileInput"
                        title="选择图片">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" class="add-icon">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        <span>{{ selectedFiles.length }}/9</span>
                    </div>
                </div>

                <!-- 隐藏的 File Input -->
                <input type="file" ref="fileInput" multiple accept="image/*" style="display: none"
                    @change="onFileChange" />
            </div>
            <div class="editor-footer">
                <button type="button" class="btn-image-trigger" @click="triggerFileInput"
                    :disabled="selectedFiles.length >= 9 || uploadingTalk">
                    <font-awesome-icon icon="image" class="footer-icon" />
                    <span>添加图片 ({{ selectedFiles.length }}/9)</span>
                </button>
                <button type="button" class="btn-submit-talk" @click="submitTalk"
                    :disabled="uploadingTalk || !content.trim() || hasUnfinishedUploads">
                    <font-awesome-icon v-if="uploadingTalk" icon="spinner" spin />
                    <font-awesome-icon v-else icon="paper-plane" />
                    {{ uploadingTalk ? '发布中...' : '发布说说' }}
                </button>
            </div>
        </div>

        <!-- 2. 说说列表区 -->
        <div v-if="loading && talks.length === 0" class="loading-state">
            <font-awesome-icon icon="spinner" spin class="loading-icon" />
            <span>努力加载说说中...</span>
        </div>

        <div v-else-if="talks.length === 0" class="empty-state card-glass">
            <font-awesome-icon icon="smile" class="empty-icon" />
            <p>还没有发表过说说哦～</p>
        </div>

        <div v-else class="talk-list-timeline">
            <div v-for="talk in talks" :key="talk.id" class="talk-timeline-item">
                <!-- 时间轴左侧时间标识 -->
                <div class="timeline-date-col">
                    <span class="timeline-year"><strong>{{ getYearStr(talk.release_at) }}</strong></span>
                    <span class="timeline-month-day">{{ getMonthDayStr(talk.release_at) }}</span>
                </div>

                <!-- 时间轴中心指示小点 -->
                <div class="timeline-node">
                    <div class="node-dot"></div>
                </div>

                <!-- 右侧说说卡片 -->
                <div class="talk-card card-glass animate-slide-up">
                    <div class="card-header">
                        <div class="card-meta">
                            <span class="blogger-badge">博主</span>
                            <span class="time-relative">{{ getRelativeTimeStr(talk.release_at) }}</span>
                        </div>
                        <button v-if="isAuthenticated" class="btn-delete-talk" @click="deleteTalkItem(talk.id)"
                            title="删除说说">
                            <font-awesome-icon icon="trash-can" />
                        </button>
                    </div>

                    <!-- 说说内容 -->
                    <div class="card-content" v-html="formatContent(talk.content)"></div>

                    <!-- 说说九宫格图片 -->
                    <div v-if="talk.images_list && talk.images_list.length > 0" class="card-images-grid"
                        :class="getImageGridClass(talk.images_list.length)">
                        <div v-for="(imgUrl, imgIndex) in talk.images_list" :key="imgIndex" class="grid-image-item"
                            @click="openLightbox(talk.images_list, imgIndex)">
                            <img :src="imgUrl" alt="说说图片" loading="lazy" />
                        </div>
                    </div>

                    <!-- 说说底部操作条 -->
                    <div class="card-actions">
                        <button class="btn-action-comment" @click="toggleComments(talk.id)">
                            <font-awesome-icon icon="comment-dots" />
                            <span>评论 ({{ getCommentCount(talk) }})</span>
                        </button>
                    </div>

                    <!-- 3. 说说评论组区 -->
                    <div class="comment-section" v-show="activeCommentSectionTalkId === talk.id">
                        <!-- 评论列表 -->
                        <div class="comments-list-box" v-if="talk.comments && talk.comments.length > 0">
                            <!-- 递归评论渲染 -->
                            <div v-for="cmt in talk.comments" :key="cmt.id" class="parent-comment-item border-glow">
                                <div class="comment-avatar-wrapper">
                                    <img :src="getAvatar(cmt.email)" alt="头像" class="comment-avatar" />
                                </div>
                                <div class="comment-detail">
                                    <div class="comment-info-header">
                                        <span class="comment-name" :class="{ 'blogger-text': cmt.is_blogger }">
                                            {{ cmt.reviewer }}
                                            <span v-if="cmt.is_blogger" class="blogger-mini-badge">博主</span>
                                        </span>
                                        <span class="comment-date">{{ getRelativeTimeStr(cmt.created_at) }}</span>
                                        <span class="comment-location" v-if="cmt.from_local">
                                            来自 {{ cmt.from_local }}
                                        </span>
                                    </div>
                                    <div class="comment-text-body">{{ cmt.content }}</div>
                                    <div class="comment-actions-bar">
                                        <button class="btn-comment-reply" @click="replyComment(cmt)">
                                            <font-awesome-icon icon="reply" />
                                            回复
                                        </button>
                                        <button v-if="isAuthenticated" class="btn-comment-delete"
                                            @click="deleteCommentItem(cmt.id, talk.id)">
                                            <font-awesome-icon icon="trash" />
                                            删除
                                        </button>
                                    </div>

                                    <!-- 递归渲染的二级回复评论列表 -->
                                    <div v-for="subCmt in cmt.child_comments" :key="subCmt.id"
                                        class="sub-comment-item border-glow">
                                        <div class="comment-avatar-wrapper">
                                            <img :src="getAvatar(subCmt.email)" alt="头像" class="comment-avatar" />
                                        </div>
                                        <div class="comment-detail">
                                            <div class="comment-info-header">
                                                <span class="comment-name"
                                                    :class="{ 'blogger-text': subCmt.is_blogger }">
                                                    {{ subCmt.reviewer }}
                                                    <span v-if="subCmt.is_blogger" class="blogger-mini-badge">博主</span>
                                                </span>
                                                <span class="comment-date">
                                                    {{ getRelativeTimeStr(subCmt.created_at) }}
                                                </span>
                                                <span class="comment-location" v-if="subCmt.from_local">
                                                    来自 {{ subCmt.from_local }}
                                                </span>
                                            </div>
                                            <div class="comment-text-body">
                                                <span class="reply-target-prefix">@{{ cmt.reviewer }}</span>
                                                {{ subCmt.content }}
                                            </div>
                                            <div class="comment-actions-bar">
                                                <button v-if="isAuthenticated" class="btn-comment-delete"
                                                    @click="deleteCommentItem(subCmt.id, talk.id)">
                                                    <font-awesome-icon icon="trash" />
                                                    删除
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="comments-list-box-empty" v-else>
                            <p>沙发空缺，快来抢占第一条吐槽吧！</p>
                        </div>

                        <!-- 评论输入框表单 -->
                        <div class="comment-form-box">
                            <div class="reply-banner" v-if="replyTo">
                                <span>正在回复 <strong>@{{ replyTo.reviewer }}</strong> 的评论</span>
                                <button class="btn-cancel-reply" @click="cancelReply">
                                    <font-awesome-icon icon="times" />
                                </button>
                            </div>

                            <div class="comment-textarea-wrapper">
                                <textarea v-model="commentText" class="comment-textarea"
                                    :placeholder="replyTo ? '撰写您的答复...' : '说点什么，留下您的印记...'" rows="3"
                                    @focus="onCommentFocus"></textarea>
                            </div>

                            <!-- 匿名用户滑出填写个人资料和验证码 -->
                            <transition name="slide-fade">
                                <div class="comment-meta-inputs" v-if="!isAuthenticated && showMetaInputs">
                                    <div class="meta-row">
                                        <div class="meta-input-group">
                                            <font-awesome-icon icon="user" class="meta-icon" />
                                            <input type="text" v-model="nickname" placeholder="昵称 (*)"
                                                class="meta-input" />
                                        </div>
                                        <div class="meta-input-group">
                                            <font-awesome-icon icon="envelope" class="meta-icon" />
                                            <input type="email" v-model="email" placeholder="邮箱 (*，用于Gravatar头像)"
                                                class="meta-input" />
                                        </div>
                                        <div class="meta-input-group">
                                            <font-awesome-icon icon="link" class="meta-icon" />
                                            <input type="url" v-model="website" placeholder="网址 (Http://)"
                                                class="meta-input" />
                                        </div>
                                    </div>

                                    <div class="captcha-row" v-if="captchaImage">
                                        <div class="meta-input-group captcha-input-group">
                                            <font-awesome-icon icon="shield-halved" class="meta-icon" />
                                            <input type="text" v-model="captchaCode" placeholder="验证码 (*)"
                                                class="meta-input" />
                                        </div>
                                        <div class="captcha-img-box" @click="refreshCaptcha" title="点击刷新验证码">
                                            <img :src="captchaImage" alt="验证码" />
                                        </div>
                                    </div>
                                </div>
                            </transition>

                            <div class="comment-form-footer">
                                <span class="input-char-count">{{ commentText.length }}/200</span>
                                <button type="button" class="btn-submit-comment" @click="submitComment(talk.id)"
                                    :disabled="!commentText.trim()">
                                    <font-awesome-icon icon="paper-plane" />
                                    <span>提交评论</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. 全局 AppPagination 分页 -->
        <AppPagination v-if="totalPages > 1" :current-page="currentPage" :total-pages="totalPages" :total-items="total"
            @page-change="onPageChange" />

        <!-- 5. 全屏手势遮罩层查看器 (Lightbox) -->
        <transition name="lightbox-zoom">
            <div v-if="lightboxVisible" class="lightbox-overlay" @click="closeLightbox" @wheel="onWheel"
                @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
                <!-- 控制面板按钮 (阻止事件冒泡防止遮罩层关闭) -->
                <div class="lightbox-controls" @click.stop>
                    <button class="ctrl-btn" @click="zoomIn" title="放大">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path
                                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2V7z" />
                        </svg>
                    </button>
                    <button class="ctrl-btn" @click="zoomOut" title="缩小">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path
                                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7V9z" />
                        </svg>
                    </button>
                    <button class="ctrl-btn" @click="rotateLeft" title="向左旋转">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path
                                d="M7.11 8.53L5.7 7.12C4.62 8.44 4 10.14 4 12c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8c-2.12 0-4.05.83-5.5 2.17L6.5 4H2v4.5h4.5l.61-.61zM12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6c0-1.21.36-2.34 1-3.28l1.41 1.42C7.16 10.8 7 11.38 7 12c0 2.76 2.24 5 5 5s5-2.24 5-5-2.24-5-5-5v3l-4-4 4-4v3z" />
                        </svg>
                    </button>
                    <button class="ctrl-btn" @click="rotateRight" title="向右旋转">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path
                                d="M16.89 8.53l1.41-1.41C19.38 8.44 20 10.14 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8c2.12 0 4.05.83 5.5 2.17L17.5 4H22v4.5h-4.5l-.61-.61zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6c0-1.21-.36-2.34-1-3.28l-1.41 1.42c.43.66.59 1.24.59 1.86 0 2.76-2.24 5-5 5s-5-2.24-5-5 2.24-5 5-5v-3l4 4-4 4v-3z" />
                        </svg>
                    </button>
                    <button class="ctrl-btn" @click="resetImage" title="重置">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path
                                d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                    </button>
                    <button class="ctrl-btn close-btn" @click="closeLightbox" title="关闭">
                        <font-awesome-icon icon="times" />
                    </button>
                </div>

                <!-- 大图显示区域 -->
                <div class="lightbox-stage">
                    <img :src="lightboxImages[lightboxIndex]" alt="全图预览" class="lightbox-img" :style="imgTransformStyle"
                        @mousedown.stop="startDrag" @click.stop />
                </div>

                <!-- 切换上一张/下一张按钮 (阻止冒泡) -->
                <button v-if="lightboxIndex > 0" class="nav-arrow prev-arrow" @click.stop="prevImage" title="上一张">
                    <font-awesome-icon icon="chevron-left" />
                </button>
                <button v-if="lightboxIndex < lightboxImages.length - 1" class="nav-arrow next-arrow"
                    @click.stop="nextImage" title="下一张">
                    <font-awesome-icon icon="chevron-right" />
                </button>

                <!-- 当前页指示码 -->
                <div class="lightbox-indicator" @click.stop>
                    {{ lightboxIndex + 1 }} / {{ lightboxImages.length }}
                </div>
            </div>
        </transition>

        <!-- 6. 全局自定义 Message 提示弹框组 -->
        <transition-group name="message-fade" tag="div" class="message-container">
            <div v-for="msg in messages" :key="msg.id" class="message-item" :class="'message-' + msg.type">
                <font-awesome-icon v-if="msg.type === 'success'" icon="circle-check" class="message-icon" />
                <font-awesome-icon v-else-if="msg.type === 'error'" icon="circle-exclamation" class="message-icon" />
                <font-awesome-icon v-else-if="msg.type === 'warning'" icon="triangle-exclamation"
                    class="message-icon" />
                <font-awesome-icon v-else icon="circle-info" class="message-icon" />
                <span class="message-text">{{ msg.text }}</span>
            </div>
        </transition-group>
    </div>
</template>

<script>
import { getTalkList, saveTalk, deleteTalk, addTalkComment, deleteTalkComment } from '@/api/talk'
import { uploadImage } from '@/api/image'
import { getCaptcha } from '@/api/user'
import { isAuthenticated } from '@/utils/auth'
import AppPagination from '@/components/AppPagination.vue'
import md5 from 'blueimp-md5'

export default {
    name: 'ShuoshuoView',
    components: {
        AppPagination
    },
    data() {
        return {
            talks: [],
            total: 0,
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            loading: false,

            // 登录博主状态
            isAuthenticated: false,

            // 发表说说编辑器数据
            content: '',
            selectedFiles: [], // 格式: { file, previewUrl, uploading, error, remoteUrl }
            uploadingTalk: false,

            // 评论相关
            activeCommentSectionTalkId: null,
            showMetaInputs: false,
            nickname: '',
            email: '',
            website: '',
            commentText: '',
            replyTo: null, // 当前正在回复的评论对象

            // 验证码数据
            captchaImage: '',
            captchaId: '',
            captchaCode: '',

            // 大图灯箱 (Lightbox) 数据
            lightboxVisible: false,
            lightboxImages: [],
            lightboxIndex: 0,
            zoomScale: 1,
            rotateDeg: 0,
            translateX: 0,
            translateY: 0,
            isDragging: false,
            startX: 0,
            startY: 0,

            // 自定义消息弹框列表
            messages: []
        }
    },
    computed: {
        hasUnfinishedUploads() {
            return this.selectedFiles.some(item => item.uploading)
        },
        imgTransformStyle() {
            return {
                transform: `translate(${this.translateX}px, ${this.translateY}px) scale(${this.zoomScale}) rotate(${this.rotateDeg}deg)`,
                cursor: this.isDragging ? 'grabbing' : 'grab',
                transition: this.isDragging ? 'none' : 'transform 0.15s ease-out'
            }
        }
    },
    mounted() {
        this.isAuthenticated = isAuthenticated()
        this.fetchTalks(1)
    },
    methods: {
        // --- 核心网络请求方法 ---
        async fetchTalks(page = 1) {
            this.loading = true
            this.currentPage = page
            try {
                const res = await getTalkList(page, this.pageSize)
                if (res.code === 0 && res.data) {
                    this.talks = res.data.list || []
                    this.total = res.data.total || 0
                    this.totalPages = Math.ceil(this.total / this.pageSize) || 1
                }
            } catch (error) {
                console.error('获取说说列表失败:', error)
            } finally {
                this.loading = false
            }
        },

        onPageChange(page) {
            this.fetchTalks(page)
            // 平滑滚动回顶部
            window.scrollTo({ top: 0, behavior: 'smooth' })
        },

        // --- 发表说说图片上传处理 ---
        triggerFileInput() {
            if (this.selectedFiles.length >= 9) {
                this.showWarning('最多只能上传9张图片哦')
                return
            }
            this.$refs.fileInput.click()
        },

        async onFileChange(e) {
            const files = Array.from(e.target.files)
            if (files.length === 0) return

            const currentCount = this.selectedFiles.length
            const allowedCount = 9 - currentCount
            const uploadFiles = files.slice(0, allowedCount)

            if (files.length > allowedCount) {
                this.showWarning(`单次最多还能选择 ${allowedCount} 张图片！超出的图片已自动忽略。`)
            }

            // 先生成预览项
            const startIdx = this.selectedFiles.length
            uploadFiles.forEach(file => {
                this.selectedFiles.push({
                    file,
                    previewUrl: URL.createObjectURL(file),
                    uploading: true,
                    error: false,
                    remoteUrl: ''
                })
            })

            // 开始上传
            for (let i = 0; i < uploadFiles.length; i++) {
                const globalIndex = startIdx + i
                this.uploadSingleFile(globalIndex)
            }

            // 清空 file input value，允许重复选择相同文件
            this.$refs.fileInput.value = ''
        },

        async uploadSingleFile(index) {
            const item = this.selectedFiles[index]
            if (!item) return

            item.uploading = true
            item.error = false

            try {
                const formData = new FormData()
                formData.append('imgFile', item.file)
                formData.append('descriptions', '说说图片')

                const res = await uploadImage(formData)
                if (res.code === 0 && res.data) {
                    item.remoteUrl = res.data.url
                } else {
                    item.error = true
                }
            } catch (error) {
                console.error('上传图片失败:', error)
                item.error = true
            } finally {
                item.uploading = false
            }
        },

        retryUpload(index) {
            this.uploadSingleFile(index)
        },

        removePreviewImage(index) {
            const item = this.selectedFiles[index]
            if (item) {
                URL.revokeObjectURL(item.previewUrl)
                this.selectedFiles.splice(index, 1)
            }
        },

        async submitTalk() {
            if (!this.content.trim() || this.uploadingTalk || this.hasUnfinishedUploads) return

            this.uploadingTalk = true
            try {
                // 筛选出成功上传的图片链接
                const imageUrls = this.selectedFiles
                    .filter(item => item.remoteUrl)
                    .map(item => item.remoteUrl)

                const res = await saveTalk(this.content, imageUrls)
                if (res.code === 0) {
                    this.content = ''
                    // 清除图片预览
                    this.selectedFiles.forEach(item => URL.revokeObjectURL(item.previewUrl))
                    this.selectedFiles = []
                    // 重新获取第一页说说
                    await this.fetchTalks(1)
                    this.showSuccess('说说发布成功！')
                } else {
                    this.showError(res.message || '说说发布失败，请重试')
                }
            } catch (error) {
                console.error('发布说说失败:', error)
                this.showError('说说发布失败，请检查网络后重试')
            } finally {
                this.uploadingTalk = false
            }
        },

        async deleteTalkItem(talkID) {
            if (!confirm('确定要彻底删除这条说说吗？此操作无法恢复。')) return

            try {
                const res = await deleteTalk(talkID)
                if (res.code === 0) {
                    this.showSuccess('说说已成功删除')
                    // 刷新当前页
                    await this.fetchTalks(this.currentPage)
                } else {
                    this.showError(res.message || '删除失败，请重试')
                }
            } catch (error) {
                console.error('删除说说失败:', error)
                this.showError('删除说说失败，请重试')
            }
        },

        // --- 评论交互管理方法 ---
        toggleComments(talkId) {
            if (this.activeCommentSectionTalkId === talkId) {
                this.activeCommentSectionTalkId = null
                this.cancelReply()
            } else {
                this.activeCommentSectionTalkId = talkId
                this.cancelReply()
                this.showMetaInputs = false
            }
        },

        async onCommentFocus() {
            if (!this.isAuthenticated) {
                this.showMetaInputs = true
                if (!this.captchaImage) {
                    await this.loadCaptcha()
                }
            }
        },

        async loadCaptcha() {
            try {
                const res = await getCaptcha()
                if (res.code === 0 && res.data) {
                    this.captchaImage = res.data.captcha
                    this.captchaId = res.data.captcha_id
                }
            } catch (error) {
                console.error('获取验证码失败:', error)
            }
        },

        async refreshCaptcha() {
            this.captchaCode = ''
            await this.loadCaptcha()
        },

        replyComment(comment) {
            this.replyTo = comment
            this.commentText = ''
            // 聚焦到输入框
            this.$nextTick(() => {
                const textareas = document.querySelectorAll('.comment-textarea')
                textareas.forEach(ta => ta.focus())
            })
        },

        cancelReply() {
            this.replyTo = null
            this.commentText = ''
        },

        async submitComment(talkID) {
            if (!this.commentText.trim()) return

            if (!this.isAuthenticated) {
                if (!this.nickname.trim()) {
                    this.showWarning('请输入您的昵称')
                    return
                }
                if (!this.email.trim()) {
                    this.showWarning('请输入您的电子邮箱')
                    return
                }
                if (!this.captchaCode.trim()) {
                    this.showWarning('请输入验证码')
                    return
                }
            }

            try {
                const formData = new URLSearchParams()
                formData.append('talk_id', talkID)
                formData.append('content', this.commentText)

                if (!this.isAuthenticated) {
                    formData.append('reviewer', this.nickname)
                    formData.append('email', this.email)
                    if (this.website) {
                        formData.append('website', this.website)
                    }
                    formData.append('captchaCode', this.captchaCode)
                    formData.append('captchaID', this.captchaId)
                }

                if (this.replyTo) {
                    formData.append('parent_id', this.replyTo.id)
                    // root_id 设为父评论的 root_id 或其本身，保证扁平两层结构
                    formData.append('root_id', this.replyTo.root_id || this.replyTo.id)
                }

                const res = await addTalkComment(formData)
                if (res.code === 0) {
                    this.showSuccess('评论发表成功')

                    // 重新更新说说的评论列表
                    const talk = this.talks.find(t => t.id === talkID)
                    if (talk) {
                        talk.comments = res.data.comments || []
                    }

                    // 清空评论框
                    this.commentText = ''
                    this.captchaCode = ''
                    this.replyTo = null
                    this.showMetaInputs = false

                    if (!this.isAuthenticated) {
                        this.captchaImage = ''
                        this.captchaId = ''
                    }
                } else {
                    this.showError(res.message || '评论提交失败，请重试')
                    if (!this.isAuthenticated) {
                        await this.refreshCaptcha()
                    }
                }
            } catch (error) {
                console.error('提交说说评论失败:', error)
                this.showError(error.message || '评论发表失败，请重试')
                if (!this.isAuthenticated) {
                    await this.refreshCaptcha()
                }
            }
        },

        async deleteCommentItem(commentId, talkID) {
            if (!confirm('确定要删除这条说说评论吗？')) return

            try {
                const res = await deleteTalkComment(commentId)
                if (res.code === 0) {
                    this.showSuccess('评论已删除')
                    // 更新当前说说的评论列表
                    const talk = this.talks.find(t => t.id === talkID)
                    if (talk) {
                        talk.comments = talk.comments.filter(c => c.id !== commentId)
                        // 二级评论过滤器
                        talk.comments.forEach(c => {
                            if (c.child_comments) {
                                c.child_comments = c.child_comments.filter(sub => sub.id !== commentId)
                            }
                        })
                    }
                } else {
                    this.showError(res.message || '删除失败，请重试')
                }
            } catch (error) {
                console.error('删除说说评论失败:', error)
                this.showError('评论删除失败，请重试')
            }
        },

        // --- 全屏灯箱 (Lightbox) 交互方法 ---
        openLightbox(images, index) {
            this.lightboxImages = images
            this.lightboxIndex = index
            this.resetImage()
            this.lightboxVisible = true
            // 禁止背景滑动
            document.body.style.overflow = 'hidden'
        },

        closeLightbox() {
            this.lightboxVisible = false
            document.body.style.overflow = ''
        },

        onWheel(e) {
            const zoomSpeed = 0.12
            let newScale = this.zoomScale + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed)
            this.zoomScale = Math.max(0.4, Math.min(newScale, 6))
        },

        startDrag(e) {
            if (e.button !== 0) return
            this.isDragging = true
            this.startX = e.clientX - this.translateX
            this.startY = e.clientY - this.translateY
        },

        onDrag(e) {
            if (!this.isDragging) return
            this.translateX = e.clientX - this.startX
            this.translateY = e.clientY - this.startY
        },

        stopDrag() {
            this.isDragging = false
        },

        zoomIn() {
            this.zoomScale = Math.min(this.zoomScale + 0.3, 6)
        },

        zoomOut() {
            this.zoomScale = Math.max(this.zoomScale - 0.3, 0.4)
        },

        rotateLeft() {
            this.rotateDeg -= 90
        },

        rotateRight() {
            this.rotateDeg += 90
        },

        resetImage() {
            this.zoomScale = 1
            this.rotateDeg = 0
            this.translateX = 0
            this.translateY = 0
            this.isDragging = false
        },

        nextImage() {
            if (this.lightboxIndex < this.lightboxImages.length - 1) {
                this.lightboxIndex++
                this.resetImage()
            }
        },

        prevImage() {
            if (this.lightboxIndex > 0) {
                this.lightboxIndex--
                this.resetImage()
            }
        },

        // --- 辅助格式化与显示工具方法 ---
        formatContent(text) {
            if (!text) return ''
            let escaped = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')

            // 匹配 URL 转化成超链接
            const urlRegex = /(https?:\/\/[^\s]+)/g
            escaped = escaped.replace(urlRegex, (url) => {
                return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-link">${url}</a>`
            })
            // 换行符替换
            return escaped.replace(/\n/g, '<br>')
        },

        getAvatar(email) {
            if (!email) return 'https://www.gravatar.com/avatar/?d=mp'
            return `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=mp`
        },

        getCommentCount(talk) {
            let count = talk.comments ? talk.comments.length : 0
            if (talk.comments) {
                talk.comments.forEach(c => {
                    if (c.child_comments) {
                        count += c.child_comments.length
                    }
                })
            }
            return count
        },

        showMessage(text, type = 'success', duration = 3000) {
            const id = Date.now() + Math.random().toString(36).substr(2, 5)
            const messageObj = { id, text, type }
            this.messages.push(messageObj)
            setTimeout(() => {
                this.messages = this.messages.filter(msg => msg.id !== id)
            }, duration)
        },

        showSuccess(text) {
            this.showMessage(text, 'success')
        },

        showError(text) {
            this.showMessage(text, 'error')
        },

        showWarning(text) {
            this.showMessage(text, 'warning')
        },

        showInfo(text) {
            this.showMessage(text, 'info')
        },

        getYearStr(dateStr) {
            if (!dateStr) return ''
            const date = new Date(dateStr)
            return date.getFullYear()
        },

        getMonthDayStr(dateStr) {
            if (!dateStr) return ''
            const date = new Date(dateStr)
            const month = date.getMonth() + 1
            const day = date.getDate()
            const mStr = month < 10 ? '0' + month : month
            const dStr = day < 10 ? '0' + day : day
            return `${mStr}月${dStr}日`
        },

        getDayStr(dateStr) {
            if (!dateStr) return ''
            const date = new Date(dateStr)
            const day = date.getDate()
            return day < 10 ? '0' + day : day
        },

        getMonthYearStr(dateStr) {
            if (!dateStr) return ''
            const date = new Date(dateStr)
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一', '十二']
            return `${monthNames[month - 1]} / ${year}`
        },

        getRelativeTimeStr(dateStr) {
            if (!dateStr) return ''
            const date = new Date(dateStr)
            const now = new Date()
            const diffMs = now - date

            const diffMins = Math.floor(diffMs / (60 * 1000))
            const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
            const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

            if (diffMins < 1) return '刚刚'
            if (diffMins < 60) return `${diffMins} 分钟前`
            if (diffHours < 24) return `${diffHours} 小时前`
            if (diffDays < 7) return `${diffDays} 天前`

            // 超过7天直接返回格式化具体时间
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const day = date.getDate()
            const hours = date.getHours()
            const mins = date.getMinutes()
            return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hours < 10 ? '0' + hours : hours}:${mins < 10 ? '0' + mins : mins}`
        },

        getImageGridClass(length) {
            if (length === 1) return 'grid-1'
            if (length === 2 || length === 4) return 'grid-2'
            return 'grid-3'
        },

        isValidURL(urlPath) {
            if (!urlPath) return false
            try {
                const url = new URL(urlPath)
                return url.protocol === 'http:' || url.protocol === 'https:'
            } catch {
                return false
            }
        }
    }
}
</script>

<style scoped>
/* 说说全局容器 */
.shuoshuo-container {
    max-width: 900px;
    margin: 10px auto;
    /* 核心色调改为高级时尚黑色 */
    --primary-color: #000000;
    --primary-hover: #222222;
    --primary-rgb: 0, 0, 0;
}

:root.dark-theme .shuoshuo-container {
    /* 暗黑模式下主色调改为高亮白色/银灰色 */
    --primary-color: #e5e5e5;
    --primary-hover: #ffffff;
    --primary-rgb: 255, 255, 255;
}

/* 头部样式美化 */
.shuoshuo-header {
    text-align: center;
    margin-bottom: 3.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.header-icon-wrapper {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: rgba(var(--primary-rgb), 0.04);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.06);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.shuoshuo-header:hover .header-icon-wrapper {
    transform: translateY(-4px) scale(1.05);
    border-color: var(--primary-color);
    background: rgba(var(--primary-rgb), 0.08);
    box-shadow: 0 12px 30px rgba(var(--primary-rgb), 0.15);
}

.title-icon {
    font-size: 2rem;
    color: var(--primary-color);
    transition: transform 0.4s ease;
}

.shuoshuo-header:hover .title-icon {
    transform: rotate(15deg);
}

.header-title {
    font-size: 2.75rem;
    font-weight: 800;
    letter-spacing: 2px;
    margin-bottom: 0.75rem;
    color: var(--text-color);
    font-family: var(--font-serif);
    position: relative;
    padding-bottom: 8px;
}

.header-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background: var(--primary-color);
    border-radius: 2px;
    transition: width 0.3s ease;
}

.shuoshuo-header:hover .header-title::after {
    width: 60px;
}

.header-subtitle {
    font-size: 1.05rem;
    color: var(--text-secondary);
    max-width: 500px;
    line-height: 1.6;
    margin-bottom: 1.25rem;
}

.header-stats-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(var(--primary-rgb), 0.03);
    border: 1px solid rgba(var(--primary-rgb), 0.08);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #52c41a;
    box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.2);
    animation: blink-live 1.8s infinite;
}

@keyframes blink-live {
    0% {
        opacity: 0.4;
        box-shadow: 0 0 0 0px rgba(82, 196, 26, 0.4);
    }

    50% {
        opacity: 1;
        box-shadow: 0 0 0 5px rgba(82, 196, 26, 0);
    }

    100% {
        opacity: 0.4;
        box-shadow: 0 0 0 0px rgba(82, 196, 26, 0);
    }
}

/* 毛玻璃质感卡片通用类 */
.card-glass {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: 0 10px 30px var(--shadow-color);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: var(--transition);
}

/* 1. 发布编辑器卡片 */
.editor-card {
    padding: 1.5rem;
    margin-bottom: 3.5rem;
}

.editor-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.editor-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-color);
}

.editor-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-color);
}

.editor-body {
    margin-bottom: 1rem;
}

.editor-textarea {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    font-size: 1rem;
    color: var(--text-color);
    resize: vertical;
    transition: var(--transition);
    font-family: var(--font-sans);
}

.editor-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
}

/* 上传图片九宫格预览 */
.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 10px;
    margin-top: 12px;
}

.preview-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.preview-item:hover .preview-img {
    transform: scale(1.05);
}

.upload-overlay,
.error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: white;
    font-size: 0.75rem;
}

.upload-spinner {
    font-size: 1.2rem;
}

.error-overlay {
    background: rgba(220, 53, 69, 0.85);
    cursor: pointer;
}

.error-icon {
    font-size: 1.2rem;
}

.remove-img-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.7rem;
    transition: background 0.2s;
    z-index: 10;
}

.remove-img-btn:hover {
    background: rgba(220, 53, 69, 0.9);
}

.add-image-placeholder {
    aspect-ratio: 1;
    border-radius: 8px;
    border: 2px dashed var(--border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
}

.add-image-placeholder:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: rgba(var(--primary-rgb), 0.05);
}

.add-icon {
    font-size: 1.2rem;
}

/* 编辑器底部操作 */
.editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
}

.btn-image-trigger {
    background: none;
    border: none;
    color: var(--primary-color);
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
    transition: background 0.2s;
}

.btn-image-trigger:hover:not(:disabled) {
    background: rgba(var(--primary-rgb), 0.08);
}

.btn-submit-talk {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 20px;
    font-weight: 600;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.2);
    transition: all 0.2s;
}

.btn-submit-talk:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(var(--primary-rgb), 0.3);
}

.btn-submit-talk:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 2. 说说时间轴列表排版 */
.talk-list-timeline {
    position: relative;
    margin-top: 2rem;
    padding-left: 10px;
}

/* 全局垂直指示线 - 经过极其精准的像素级对齐计算 */
.talk-list-timeline::before {
    content: '';
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: 124px;
    /* 10px padding-left + 90px date-col + 15px margin + 10px half timeline-node - 1px half line-width = 124px */
    width: 2px;
    background: var(--border-color);
    opacity: 0.8;
}

.talk-timeline-item {
    display: flex;
    position: relative;
    margin-bottom: 4rem;
}

/* 时间列 */
.timeline-date-col {
    width: 90px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-right: 15px;
    padding-top: 10px;
}

.timeline-year {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
    color: var(--text-color);
    font-family: var(--font-serif);
}

.timeline-month-day {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-top: 4px;
    letter-spacing: 0.5px;
}

/* 时间轴指示节点 */
.timeline-node {
    width: 20px;
    height: 40px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 20px;
}

.node-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--card-bg);
    border: 3px solid var(--primary-color);
    box-shadow: 0 0 0 4px var(--bg-color);
    position: relative;
    z-index: 5;
    transition: transform 0.3s;
}

.talk-timeline-item:hover .node-dot {
    transform: scale(1.2);
    background: var(--primary-color);
}

/* 说说卡片 */
.talk-card {
    flex: 1;
    padding: 1.5rem;
    position: relative;
}

.talk-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px var(--shadow-color);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.85rem;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
}

.blogger-badge {
    background: linear-gradient(135deg, #FDEB71 10%, #F8D800 100%);
    color: #8B4513;
    font-weight: 700;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 4px;
}

.time-relative {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.btn-delete-talk {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
}

.btn-delete-talk:hover {
    color: #dc3545;
    background: rgba(220, 53, 69, 0.1);
}

/* 说说正文 */
.card-content {
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--text-color);
    white-space: normal;
    word-break: break-all;
    margin-bottom: 1.25rem;
}

/* 说说正文中的链接样式 */
.card-content :deep(.text-link) {
    color: var(--primary-color);
    text-decoration: underline;
    font-weight: 500;
}

.card-content :deep(.text-link:hover) {
    color: var(--primary-hover);
}

/* 九宫格图片排版 */
.card-images-grid {
    display: grid;
    gap: 8px;
    margin-bottom: 1.25rem;
    border-radius: 8px;
    overflow: hidden;
    max-width: 520px;
}

.grid-image-item {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    cursor: zoom-in;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.05);
}

.grid-image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.grid-image-item:hover img {
    transform: scale(1.04);
}

/* 图片多列自适应类型 */
.card-images-grid.grid-1 {
    grid-template-columns: 1fr;
    max-width: 320px;
}

.card-images-grid.grid-1 .grid-image-item {
    aspect-ratio: 16/10;
}

.card-images-grid.grid-2 {
    grid-template-columns: repeat(2, 1fr);
}

.card-images-grid.grid-3 {
    grid-template-columns: repeat(3, 1fr);
}

/* 操作条 */
.card-actions {
    display: flex;
    border-top: 1px solid var(--border-color);
    padding-top: 0.85rem;
}

.btn-action-comment {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
    transition: all 0.2s;
}

.btn-action-comment:hover {
    color: var(--primary-color);
    background: rgba(var(--primary-rgb), 0.08);
}

/* 3. 评论面板区 */
.comment-section {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border-color);
    animation: slideDown 0.3s ease;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.comments-list-box {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 1.5rem;
}

.comments-list-box-empty {
    text-align: center;
    padding: 1.5rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.parent-comment-item {
    display: flex;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--border-color);
}

.parent-comment-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.comment-avatar-wrapper {
    flex-shrink: 0;
}

.comment-avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--border-color);
}

.comment-detail {
    flex: 1;
}

.comment-info-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.comment-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--text-color);
}

.comment-name.blogger-text {
    color: var(--primary-color);
}

.blogger-mini-badge {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 3px;
    margin-left: 2px;
}

.comment-date {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.comment-location {
    font-size: 0.75rem;
    color: var(--text-secondary);
    opacity: 0.8;
}

.comment-text-body {
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--text-color);
    word-break: break-all;
}

.reply-target-prefix {
    color: var(--primary-color);
    font-weight: 600;
    margin-right: 4px;
}

.comment-actions-bar {
    display: flex;
    gap: 12px;
    margin-top: 4px;
}

.btn-comment-reply,
.btn-comment-delete {
    background: none;
    border: none;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    transition: all 0.2s;
}

.btn-comment-reply:hover {
    color: var(--primary-color);
    background: rgba(var(--primary-rgb), 0.08);
}

.btn-comment-delete:hover {
    color: #dc3545;
    background: rgba(220, 53, 69, 0.08);
}

/* 二级回复样式 */
.sub-comment-item {
    display: flex;
    gap: 10px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    padding: 8px 10px;
    margin-top: 10px;
    border: 1px solid var(--border-color);
}

:root.dark-theme .sub-comment-item {
    background: rgba(255, 255, 255, 0.02);
}

.sub-comment-item .comment-avatar {
    width: 1.85rem;
    height: 1.85rem;
}

/* 评论输入表单 */
.comment-form-box {
    background: rgba(0, 0, 0, 0.01);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 12px;
    margin-top: 1rem;
}

:root.dark-theme .comment-form-box {
    background: rgba(255, 255, 255, 0.01);
}

.reply-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(var(--primary-rgb), 0.05);
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 0.85rem;
    margin-bottom: 8px;
    color: var(--primary-color);
}

.btn-cancel-reply {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
}

.btn-cancel-reply:hover {
    color: #dc3545;
}

.comment-textarea-wrapper {
    margin-bottom: 10px;
}

.comment-textarea {
    width: 100%;
    background: none;
    border: none;
    resize: none;
    color: var(--text-color);
    font-size: 0.92rem;
    font-family: var(--font-sans);
}

.comment-textarea:focus {
    outline: none;
}

/* 匿名用户滑动表单 */
.comment-meta-inputs {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-top: 1px solid var(--border-color);
    padding-top: 10px;
    margin-bottom: 10px;
}

.meta-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px;
}

.meta-input-group {
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.meta-icon {
    color: var(--text-secondary);
    font-size: 0.85rem;
}

.meta-input {
    flex: 1;
    background: none;
    border: none;
    font-size: 0.85rem;
    color: var(--text-color);
    width: 100%;
}

.meta-input:focus {
    outline: none;
}

.captcha-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.captcha-input-group {
    width: 160px;
    flex-shrink: 0;
}

.captcha-img-box {
    height: 34px;
    width: 100px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    cursor: pointer;
}

.captcha-img-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.comment-form-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-color);
    padding-top: 8px;
}

.input-char-count {
    font-size: 0.8rem;
    color: var(--text-secondary);
    opacity: 0.7;
}

.btn-submit-comment {
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 6px 14px;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-submit-comment:hover:not(:disabled) {
    background: var(--primary-hover);
}

.btn-submit-comment:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* 动效类 */
.animate-fade-in {
    animation: fadeIn 0.4s ease both;
}

.animate-scale-in {
    animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.animate-slide-up {
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes scaleIn {
    from {
        transform: scale(0.85);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 匿名个人输入动画过渡 */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-8px);
    opacity: 0;
}

/* 状态 */
.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
    font-size: 1.1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.loading-icon,
.empty-icon {
    font-size: 2.5rem;
    color: var(--primary-color);
}

/* 4. 灯箱 (Lightbox) 样式 */
.lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.88);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    z-index: 12000;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    user-select: none;
}

.lightbox-controls {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(0, 0, 0, 0.3);
    z-index: 12100;
}

.ctrl-btn {
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: rgba(255, 255, 255, 0.85);
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.ctrl-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: scale(1.05);
}

.ctrl-btn.close-btn {
    background: rgba(220, 53, 69, 0.15);
    color: #ff4d4f;
}

.ctrl-btn.close-btn:hover {
    background: #ff4d4f;
    color: white;
}

.lightbox-stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
}

.lightbox-img {
    max-width: 90vw;
    max-height: 80vh;
    object-fit: contain;
    user-select: none;
    -webkit-user-drag: none;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    border-radius: 4px;
}

.nav-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.25rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 12200;
}

.nav-arrow:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%) scale(1.05);
}

.prev-arrow {
    left: 24px;
}

.next-arrow {
    right: 24px;
}

.lightbox-indicator {
    padding: 10px;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    background: rgba(0, 0, 0, 0.3);
    z-index: 12100;
}

/* 灯箱淡入淡出动画 */
.lightbox-zoom-enter-active,
.lightbox-zoom-leave-active {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.lightbox-zoom-enter-from,
.lightbox-zoom-leave-to {
    opacity: 0;
    transform: scale(0.97);
}

/* 自定义消息弹框组 (简洁、大方、共同性) */
.message-container {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 15000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    pointer-events: none;
    width: 90%;
    max-width: 400px;
}

.message-item {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.4;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    color: var(--text-color);
}

.message-success {
    border-left: 4px solid #52c41a;
}

.message-success .message-icon {
    color: #52c41a;
}

.message-error {
    border-left: 4px solid #ff4d4f;
}

.message-error .message-icon {
    color: #ff4d4f;
}

.message-warning {
    border-left: 4px solid #faad14;
}

.message-warning .message-icon {
    color: #faad14;
}

.message-info {
    border-left: 4px solid #1890ff;
}

.message-info .message-icon {
    color: #1890ff;
}

/* 消息淡入淡出动效 */
.message-fade-enter-active,
.message-fade-leave-active {
    transition: all 0.3s ease;
}

.message-fade-enter-from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
}

.message-fade-leave-to {
    transform: translateY(-10px) scale(0.95);
    opacity: 0;
}

/* 响应式调整 (适配多端显示：PC, 手机, 平板及各类小屏幕设备) */
@media (max-width: 768px) {
    .shuoshuo-container {
        padding: 0 12px;
        margin: 20px auto;
    }

    .shuoshuo-header {
        margin-bottom: 2rem;
    }

    .header-icon-wrapper {
        width: 56px;
        height: 56px;
        margin-bottom: 0.85rem;
    }

    .title-icon {
        font-size: 1.65rem;
    }

    .header-title {
        font-size: 2.1rem;
        letter-spacing: 1px;
    }

    .header-subtitle {
        font-size: 0.95rem;
        margin-bottom: 1rem;
        padding: 0 10px;
    }

    .header-stats-badge {
        padding: 4px 12px;
        font-size: 0.8rem;
    }

    /* 编辑器移动端适配 */
    .editor-card {
        padding: 1rem;
        margin-bottom: 2rem;
    }

    .editor-textarea {
        padding: 0.75rem;
        font-size: 0.95rem;
    }

    .editor-footer {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;
    }

    .btn-image-trigger,
    .btn-submit-talk {
        justify-content: center;
        width: 100%;
        padding: 10px;
    }

    /* 时间轴的响应式像素级对齐排版（在手机端隐藏左边空白，直接单栏） */
    .talk-list-timeline::before {
        /* 极其精准的移动端对齐公式：
           10px (talk-list-timeline 的 padding-left) +
           11px (timeline-node 的 left) +
           10px (timeline-node 宽度 20px 的一半) -
           1px (指示线宽度 2px 的一半) = 30px */
        left: 30px;
    }

    .talk-timeline-item {
        flex-direction: column;
        margin-bottom: 2.5rem;
    }

    .timeline-date-col {
        width: auto;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        margin-right: 0;
        margin-left: 36px;
        padding-top: 0;
        margin-bottom: 8px;
    }

    .timeline-year {
        font-size: 1.35rem;
    }

    .timeline-month-day {
        font-size: 0.85rem;
        margin-top: 0;
    }

    .timeline-node {
        position: absolute;
        left: 11px;
        top: 4px;
        height: 20px;
    }

    /* 说说卡片移动端极佳可读性间距 */
    .talk-card {
        margin-left: 36px;
        padding: 1rem 0.85rem;
    }

    .card-content {
        font-size: 0.98rem;
        margin-bottom: 1rem;
    }

    /* 九宫格图片移动端适配 */
    .card-images-grid {
        max-width: 100%;
        gap: 6px;
    }

    /* 评论区移动端高级适配 */
    .comment-section {
        margin-top: 1rem;
        padding-top: 1rem;
    }

    .parent-comment-item {
        gap: 10px;
        padding-bottom: 10px;
    }

    .comment-avatar {
        width: 2rem;
        height: 2rem;
    }

    .comment-name {
        font-size: 0.85rem;
    }

    .comment-text-body {
        font-size: 0.9rem;
    }

    .sub-comment-item {
        padding: 6px 8px;
        gap: 8px;
        margin-top: 8px;
    }

    .sub-comment-item .comment-avatar {
        width: 1.65rem;
        height: 1.65rem;
    }

    /* 匿名资料表单与验证码适配，防止小屏挤压换行 */
    .comment-meta-inputs {
        gap: 6px;
    }

    .meta-row {
        grid-template-columns: 1fr;
        gap: 6px;
    }

    .captcha-row {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
    }

    .captcha-input-group {
        width: 100%;
    }

    .captcha-img-box {
        width: 100%;
        height: 38px;
    }

    .captcha-img-box img {
        object-fit: contain;
        background: var(--bg-color);
    }

    .comment-form-footer {
        padding-top: 10px;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .input-char-count {
        text-align: right;
    }

    .btn-submit-comment {
        width: 100%;
        justify-content: center;
        padding: 8px;
    }

    /* 移动端灯箱滑动按钮微调 */
    .prev-arrow {
        left: 10px;
    }

    .next-arrow {
        right: 10px;
    }

    .nav-arrow {
        width: 38px;
        height: 38px;
        font-size: 1rem;
    }
}
</style>
