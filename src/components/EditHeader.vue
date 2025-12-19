<template>
    <header class="edit-header">
        <div class="header-container">
            <div class="header-left">
                <RouterLink to="/" class="brand">飘痕</RouterLink>
                <div class="breadcrumb">
                    <span class="divider">/</span>
                    <span class="title">写文章</span>
                </div>
            </div>

            <div class="header-right">
                <!-- 自动保存状态 -->
                <div class="save-status" v-if="autoSaveStatus" :class="autoSaveStatus">
                    <span class="dot"></span>
                    <span class="text">{{ statusLabel }}</span>
                </div>

                <div class="actions">
                    <!-- 模式切换 -->
                    <button class="icon-btn" @click="$emit('toggle-mode')"
                        :title="useMarkdown ? '切换到富文本' : '切换到Markdown'">
                        <font-awesome-icon :icon="useMarkdown ? 'code' : 'font'" />
                    </button>

                    <!-- 主题切换 -->
                    <button class="icon-btn theme-toggle" @click="$emit('toggle-theme')"
                        :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
                        <font-awesome-icon :icon="isDark ? 'sun' : 'moon'" />
                    </button>

                    <div class="v-divider"></div>

                    <!-- 操作按钮 -->
                    <button class="btn-preview" @click="$emit('preview')">预览</button>

                    <button class="btn-draft" @click="$emit('save-draft')" :disabled="submitting">
                        草稿
                    </button>

                    <button class="btn-publish" @click="$emit('publish')" :disabled="submitting">
                        <font-awesome-icon :icon="submitting ? 'spinner' : 'paper-plane'"
                            :class="{ 'fa-spin': submitting }" />
                        {{ submitting ? '发布' : '发布' }}
                    </button>

                    <!-- 用户头像 -->
                    <RouterLink to="/set" class="avatar-link" title="个人设置">
                        <img src="@/assets/images/avatar.jpg" alt="头像" class="avatar">
                    </RouterLink>
                </div>
            </div>
        </div>
    </header>
</template>

<script>
export default {
    name: 'EditHeader',
    props: {
        useMarkdown: {
            type: Boolean,
            default: true
        },
        isDark: {
            type: Boolean,
            default: false
        },
        submitting: {
            type: Boolean,
            default: false
        },
        autoSaveStatus: {
            type: String,
            default: ''
        },
        statusLabel: {
            type: String,
            default: ''
        }
    },
    emits: ['toggle-mode', 'toggle-theme', 'preview', 'save-draft', 'publish']
}
</script>

<style scoped>
.edit-header {
    height: 64px;
    background: var(--header-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    transition: var(--transition);
}

.header-container {
    max-width: 1800px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.brand {
    font-size: 1.6rem;
    font-weight: 800;
    font-family: var(--font-serif);
    color: var(--text-color);
    text-decoration: none;
    letter-spacing: 0.05em;
    transition: transform 0.2s;
}

.brand:hover {
    transform: scale(1.05);
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.divider {
    color: var(--border-color);
    font-size: 1.2rem;
    font-weight: 300;
}

.title {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
    font-family: var(--font-serif);
}

.header-right {
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.save-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--text-secondary);
    opacity: 0.5;
}

.save-status.saving .dot {
    background-color: var(--primary-color);
    opacity: 1;
    animation: status-pulse 1.5s infinite;
}

.save-status.success .dot {
    background-color: #10b981;
    opacity: 1;
}

.save-status.error .dot {
    background-color: #ef4444;
    opacity: 1;
}

@keyframes status-pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.5);
        opacity: 0.5;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.icon-btn {
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-btn:hover {
    color: var(--text-color);
    background: var(--hover-bg);
}

.v-divider {
    width: 1px;
    height: 1.25rem;
    background: var(--border-color);
    margin: 0 0.25rem;
}

.btn-preview {
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    transition: var(--transition);
}

.btn-preview:hover {
    background: var(--hover-bg);
}

.btn-draft {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.4rem 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
}

.btn-draft:hover {
    background: var(--hover-bg);
}

.btn-publish {
    background: var(--primary-color);
    color: #fff;
    border: none;
    padding: 0.4rem 1.25rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: var(--transition);
}

.btn-publish:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px var(--shadow-color);
}

.btn-publish:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.avatar-link {
    display: flex;
    align-items: center;
    margin-left: 0.5rem;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--border-color);
    object-fit: cover;
    transition: transform 0.2s;
}

.avatar:hover {
    transform: scale(1.1);
    border-color: var(--text-secondary);
}

@media (max-width: 1024px) {
    .header-container {
        padding: 0 1.5rem;
    }

    .header-right {
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    .header-container {
        padding: 0 1rem;
    }

    .breadcrumb,
    .save-status,
    .btn-preview,
    .btn-draft {
        display: none;
    }

    .v-divider {
        display: none;
    }

    .actions {
        gap: 0.5rem;
    }
}
</style>
