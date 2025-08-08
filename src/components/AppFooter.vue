<template>
    <footer class="footer">
        <div class="container">
            <p>
                Powered by <a href="https://spring.io">Spring</a>, UI by Vue3, Design by
                <a href="https://twitter.com/lzqwebsoft">-ZQLUO-</a>.
            </p>
            <p>Copyright &copy; 2012 - 2024</p>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'AppFooter',
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
