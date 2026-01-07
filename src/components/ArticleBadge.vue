<script>
export default {
    props: {
        type: {
            type: String,
            required: true,
            default: "original"
        }
    },
    data() {
        return {
            types: {
                original: {
                    color: "badge-success",
                    text: "原"
                },
                reprint: {
                    color: "badge-default",
                    text: "转"
                },
                translation: {
                    color: "badge-info",
                    text: "译"
                },
                top: {
                    color: "badge-danger",
                    text: "置顶"
                }
            }
        }
    }
}
</script>

<template>
    <span class="badge" :class="types[type].color">
        {{ types[type].text }}
    </span>
</template>

<style scoped>
.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.2em 0.6em;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.badge-success {
    color: #fff;
    background: linear-gradient(135deg, #28C76F 0%, #17A05D 100%);
}

.badge-default {
    color: #fff;
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
}

.badge-info {
    color: #fff;
    background: linear-gradient(135deg, #FF9F43 0%, #FF6B00 100%);
}

.badge-danger {
    color: #fff;
    background: linear-gradient(135deg, #EA5455 0%, #B22222 100%);
}
</style>
