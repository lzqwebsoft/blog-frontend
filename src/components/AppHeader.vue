<template>
    <header class="header" :class="{ hidden: isHidden }">
        <div class="container">
            <nav class="nav">
                <div class="nav-brand">
                    <RouterLink to="/">飘痕の博客</RouterLink>
                </div>

                <div class="nav-menu">
                    <input type="text" class="search-input" placeholder="搜索" />

                    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
                        <font-awesome-icon :icon="isDark ? 'sun' : 'moon'" />
                    </button>

                    <div class="dropdown">
                        <button class="nav-item" @click="showMenu = !showMenu">
                            <font-awesome-icon icon="bars" class="menu" />
                        </button>
                        <div class="dropdown-content" v-show="showMenu">
                            <RouterLink v-for="(item, index) in menuItems" :key="index" :to="item.url"
                                class="dropdown-item">
                                <font-awesome-icon :icon="item.icon" class="menu-icon" />
                                <span v-html="item.title"></span>
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </header>
</template>

<script>
export default {
    name: 'AppHeader',
    data() {
        return {
            showMenu: false,
            isHidden: false,
            previousTop: 0,
            scrolling: false,
            isDark: false,
            menuItems: [
                { title: '发表博客', url: '/article/new.html', icon: 'edit' },
                { title: '修改密码', url: '/changepwd.html', icon: 'lock' },
                { title: '设&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;置', url: '/set.html', icon: 'cog' },
                { title: '注&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;销', url: '/singleout.html', icon: 'sign-out-alt' },
            ],
        }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll)
        this.initializeTheme()
    },
    unmounted() {
        window.removeEventListener('scroll', this.handleScroll)
    },
    methods: {
        handleScroll() {
            this.showTop = window.scrollY > 200

            if (!this.scrolling) {
                this.scrolling = true
                window.requestAnimationFrame
                    ? requestAnimationFrame(this.autoHideHeader)
                    : setTimeout(this.autoHideHeader, 250)
            }
        },
        autoHideHeader() {
            const currentTop = window.pageYOffset || document.documentElement.scrollTop

            if (this.previousTop - currentTop > 10) {
                // Scroll up - show header
                this.isHidden = false
            } else if (currentTop - this.previousTop > 10 && currentTop > 150) {
                // Scroll down - hide header
                this.isHidden = true
            }

            this.previousTop = currentTop
            this.scrolling = false
        },
        toggleTheme() {
            this.isDark = !this.isDark
            this.applyTheme()
            localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
        },
        initializeTheme() {
            const savedTheme = localStorage.getItem('theme')
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

            this.isDark = savedTheme ? savedTheme === 'dark' : prefersDark
            this.applyTheme()
        },
        applyTheme() {
            if (this.isDark) {
                document.documentElement.classList.add('dark-theme')
            } else {
                document.documentElement.classList.remove('dark-theme')
            }
        },
    },
}
</script>

<style scoped>
.header {
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    transition: transform 0.3s ease;
}

.header.hidden {
    transform: translateY(-100%);
}

.nav {
    display: flex;
    align-items: center;
    padding: 1rem 0;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-brand a {
    color: #333;
    text-decoration: none;
}

.nav-menu {
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 1rem;
}

.search-input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-width: 200px;
}

.dropdown {
    position: relative;
}

.dropdown-content {
    position: absolute;
    right: 0;
    top: 100%;
    background: #fff;
    min-width: 150px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    z-index: 1001;
}

.dropdown-item {
    display: block;
    padding: 0.75rem 1rem;
    color: #333;
    text-decoration: none;
    border-bottom: 1px solid #eee;
}

.dropdown-item:hover {
    background: #f8f9fa;
}

.dropdown-item:last-child {
    border-bottom: none;
}

.menu-icon {
    margin-right: 0.5rem;
    width: 16px;
    text-align: center;
}

.theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: #333;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.theme-toggle:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

:root.dark-theme .theme-toggle {
    color: #fff;
}

:root.dark-theme .theme-toggle:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
    .search-input {
        min-width: 120px;
    }
}
</style>
