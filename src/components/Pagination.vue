<template>
    <div class="pagination-bar">
        <div class="pagination-info">
            <slot name="info">
                <span v-if="totalItems"> 共 {{ totalItems }} 条，{{ totalPages }} 页 </span>
            </slot>
        </div>

        <div class="pagination-controls">
            <button
                class="page-nav-btn"
                :disabled="currentPage === 1 || disabled"
                @click="handlePageChange(currentPage - 1)"
                title="上一页"
            >
                <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>

            <div class="page-numbers" v-if="showPageNumbers">
                <button
                    v-for="page in visiblePages"
                    :key="page"
                    class="page-num-btn"
                    :class="{ active: currentPage === page }"
                    @click="handlePageChange(page)"
                >
                    {{ page }}
                </button>
            </div>

            <button
                class="page-nav-btn"
                :disabled="currentPage === totalPages || disabled"
                @click="handlePageChange(currentPage + 1)"
                title="下一页"
            >
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Pagination',
    props: {
        currentPage: {
            type: Number,
            required: true,
            default: 1,
        },
        totalPages: {
            type: Number,
            required: true,
            default: 1,
        },
        totalItems: {
            type: Number,
            default: null,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        showPageNumbers: {
            type: Boolean,
            default: true,
        },
        maxVisiblePages: {
            type: Number,
            default: 5,
        },
    },
    computed: {
        visiblePages() {
            const pages = []
            const { maxVisiblePages, currentPage, totalPages } = this

            let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
            let end = Math.min(totalPages, start + maxVisiblePages - 1)

            if (end - start + 1 < maxVisiblePages) {
                start = Math.max(1, end - maxVisiblePages + 1)
            }

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
            return pages
        },
    },
    methods: {
        handlePageChange(page) {
            if (page < 1 || page > this.totalPages || this.disabled) return
            this.$emit('page-change', page)
        },
    },
}
</script>

<style scoped>
.pagination-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
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
    font-weight: 500;
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
    transition: all 0.2s ease;
    font-weight: 500;
}

.page-num-btn:hover:not(.active),
.page-nav-btn:hover:not(:disabled) {
    background-color: var(--hover-bg);
    border-color: var(--text-secondary);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-num-btn.active {
    background-color: var(--text-color);
    color: var(--bg-color);
    border-color: var(--text-color);
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.page-nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
}

/* Dark theme adjustments */
:root.dark-theme .page-num-btn.active {
    background-color: white;
    color: #000;
    border-color: white;
}
</style>
