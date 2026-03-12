<template>
    <footer class="footer">
        <div class="container">
            <p>
                Powered by <a href="https://vuejs.org" target="_blank">Vue3</a>, Design by
                <a href="https://github.com/lzqwebsoft" target="_blank">-ZQLUO-</a>.
            </p>
            <p>
                Copyright &copy;2012 - {{ currentYear }}
            </p>
            <p class="filing">
                <a href="https://beian.mps.gov.cn/#/query/webSearch?code=31011202022211" rel="noreferrer"
                    target="_blank">
                    <img src="@/assets/images/filing.png" alt="备案图标" />
                    <span>沪公网安备31011202022211号</span>
                </a>
                <a href="https://beian.miit.gov.cn/" target="_blank"><span>沪ICP备2025128934号-2</span></a>
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
    text-decoration: none;
}

.filing {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 0.5rem;
}

.filing a {
    display: inline-flex;
    align-items: center;
    color: var(--text-color);
    padding: 0.2rem 0.5rem;
}

.filing a:hover {
    color: #007bff;
    text-decoration: underline;
}

.filing a:first-child {
    margin-right: 10px;
}

.filing img {
    width: 20px;
    height: 20px;
    margin-right: 5px;
}
</style>
