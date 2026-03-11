<template>
    <footer class="footer">
        <div class="container">
            <p>
                Powered by <a href="https://vuejs.org" target="_blank">Vue3</a>, Design by
                <a href="https://github.com/lzqwebsoft" target="_blank">-ZQLUO-</a>.
            </p>
            <p>
                <a href="https://beian.miit.gov.cn/" target="_blank">沪ICP备2025128934号-2</a> &nbsp;&nbsp;
                Copyright &copy;2012 - {{ currentYear }}
            </p>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'AppFooter',
    computed: {
        currentYear() {
            return new Date().getFullYear()
        },
    },
}
</script>

<style scoped>
.footer {
    background-color: var(--card-bg);
    color: var(--text-color);
    padding: 2rem 0;
    text-align: center;
    margin-top: auto;
    transition: var(--transition);
    border-top: 1px solid var(--border-color);
}

.footer a {
    color: #007bff;
}
</style>
