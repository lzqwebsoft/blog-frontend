<template>
    <div class="blog-settings-view">
        <h2 class="panel-title">基本信息设置</h2>

        <div class="settings-container">
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Blog Name -->
                <div class="form-group">
                    <label class="form-label">博客名称</label>
                    <input v-model="formData.head" type="text" class="form-input" />
                </div>

                <!-- Blog Slogan -->
                <div class="form-group">
                    <label class="form-label">博客标语 (Slogan)</label>
                    <input v-model="formData.descriptions" type="text" class="form-input" />
                </div>

                <!-- Email -->
                <div class="form-group">
                    <label class="form-label">关联邮箱</label>
                    <input v-model="formData.email" type="email" class="form-input" />
                </div>

                <!-- About HTML -->
                <div class="form-group">
                    <label class="form-label">关于页面内容 (HTML)</label>
                    <div class="rich-editor">
                        <div class="editor-toolbar">
                            <button type="button" class="toolbar-btn"><font-awesome-icon
                                    :icon="['fas', 'bold']" /></button>
                            <button type="button" class="toolbar-btn"><font-awesome-icon
                                    :icon="['fas', 'italic']" /></button>
                            <button type="button" class="toolbar-btn"><font-awesome-icon
                                    :icon="['fas', 'list-ul']" /></button>
                        </div>
                        <textarea v-model="formData.about" class="editor-content" rows="6"></textarea>
                    </div>
                </div>

                <div class="form-footer">
                    <button type="submit" class="btn-black">保存更改</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BlogSettings',
    data() {
        return {
            formData: {
                head: '墨痕',
                descriptions: '落笔生花，代码构建世界。',
                email: 'contact@mohen.blog',
                about: '在这个信息爆炸的时代，我希望构建一个安静的角落...'
            }
        }
    },
    methods: {
        handleSubmit() {
            // Mock API save
            console.log('Saving settings:', this.formData)
            alert('Settings Saved!')
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

.settings-container {
    max-width: 42rem;
    /* max-w-2xl */
}

.space-y-6>*+* {
    margin-top: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
}

.form-input {
    width: 100%;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--text-color);
    outline: none;
    transition: all 0.2s;
}

.form-input:focus {
    border-color: var(--text-secondary);
}

.rich-editor {
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    overflow: hidden;
}

.editor-toolbar {
    background-color: var(--bg-color);
    border-bottom: 1px solid var(--border-color);
    padding: 0.5rem;
    display: flex;
    gap: 0.5rem;
}

.toolbar-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0.25rem;
    font-size: 0.875rem;
}

.toolbar-btn:hover {
    color: var(--text-color);
}

.editor-content {
    width: 100%;
    border: none;
    padding: 0.75rem;
    min-height: 150px;
    background-color: var(--card-bg);
    color: var(--text-color);
    resize: vertical;
    outline: none;
    font-family: monospace;
}

.form-footer {
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

.btn-black {
    background-color: #111827;
    color: white;
    padding: 0.625rem 1.5rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
}

.btn-black:hover {
    opacity: 0.9;
}

:root.dark-theme .btn-black {
    background-color: white;
    color: black;
}
</style>
