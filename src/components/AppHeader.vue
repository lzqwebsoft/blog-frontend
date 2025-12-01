<template>
    <header class="header" :class="{ hidden: isHidden }">
        <nav class="nav">
            <div class="nav-left">
                <img src="@/assets/images/avatar.jpg" alt="头像" class="avatar">
                <div class="brand-slogan">
                    <div class="nav-brand">
                        <RouterLink to="/">飘痕の博客</RouterLink>
                    </div>
                    <div class="slogan">自由自在的学习编程艺术</div>
                </div>
            </div>

            <div class="header-search">
                <font-awesome-icon icon="magnifying-glass" class="search-icon" />
                <input type="text" class="search-input" placeholder="搜索博客内容...">
            </div>

            <div class="nav-menu">
                <button class="nav-item search-button" @click="showSearchDialog = true">
                    <font-awesome-icon icon="magnifying-glass" />
                </button>

                <button class="nav-item theme-toggle" @click="toggleTheme" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
                    <font-awesome-icon :icon="isDark ? 'sun' : 'moon'" />
                </button>

                <div class="dropdown" ref="dropdownRef">
                    <button class="nav-item" @click="showMenu = !showMenu">
                        <font-awesome-icon icon="gear" class="menu" />
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
    </header>

    <!-- 搜索对话框 -->
    <div class="search-dialog" v-if="showSearchDialog" @click.self="showSearchDialog = false">
        <div class="search-dialog-content">
            <div class="search-dialog-input-group">
                <font-awesome-icon icon="magnifying-glass" class="dialog-search-icon" />
                <input id="search-input" type="text" v-model="searchText" class="dialog-search-input"
                    placeholder="搜索博客内容..." @keyup.enter="handleSearch" ref="searchInput" />
                <button class="dialog-search-button" @click="handleSearch">
                    搜索
                </button>
            </div>
        </div>
    </div>
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
            showSearchDialog: false,
            searchText: '',
            menuItems: [
                { title: '发表博客', url: '/article/new', icon: 'edit' },
                { title: '修改密码', url: '/change_pwd', icon: 'lock' },
                { title: '设&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;置', url: '/set', icon: 'cog' },
                { title: '注&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;销', url: '/login', icon: 'sign-out-alt' },
            ],
        }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll)
        this.initializeTheme()
        document.addEventListener('click', this.handleClickOutside)
    },
    unmounted() {
        window.removeEventListener('scroll', this.handleScroll)
        document.removeEventListener('click', this.handleClickOutside)
    },
    watch: {
        showSearchDialog(newVal) {
            if (newVal) {
                this.$nextTick(() => {
                    this.$refs.searchInput?.focus();
                });
            }
        }
    },
    methods: {
        handleScroll() {
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
                document.documentElement.style.setProperty('--sidebar-nav-top', '68px')
            } else if (currentTop - this.previousTop > 10 && currentTop > 150) {
                // Scroll down - hide header
                this.isHidden = true
                document.documentElement.style.setProperty('--sidebar-nav-top', '0px')
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
        handleClickOutside(event) {
            const dropdown = this.$refs.dropdownRef
            if (dropdown && !dropdown.contains(event.target)) {
                this.showMenu = false
            }
        },
        handleSearch() {
            if (this.searchText.trim()) {
                console.log('搜索:', this.searchText);
                this.showSearchDialog = false;
                this.searchText = '';
            }
        },
    },
}
</script>

<style scoped>
.header {
    background: var(--header-bg);
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
    padding: 0.5rem 1rem;
}

.nav-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border-color);
    transition: transform 0.3s ease;
}

.avatar:hover {
    transform: scale(1.1);
}

.brand-slogan {
    display: flex;
    flex-direction: column;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-brand a {
    color: var(--text-color);
    text-decoration: none;
}

.slogan {
    font-size: 0.9rem;
    color: var(--text-color);
    opacity: 0.8;
}

.nav-menu {
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 1rem;
}

.header-search {
    display: flex;
    align-items: center;
    flex: 1;
    max-width: 400px;
    margin: 0 2rem 0 4rem;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 0.8rem 1.2rem;
    padding-left: 3rem;
    border: 1px solid var(--border-color);
    border-radius: 30px;
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--text-color);
    font-size: 1rem;
    transition: var(--transition);
}

.search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.2);
}

.search-icon {
    position: absolute;
    left: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-size: 1.2rem;
}

.dropdown {
    position: relative;
}

.dropdown-content {
    position: absolute;
    right: 0;
    top: 100%;
    background: var(--header-bg);
    min-width: 150px;
    box-shadow: 0 8px 16px var(--shadow-color);
    border-radius: 4px;
    z-index: 1001;
}

.dropdown-item {
    display: block;
    padding: 0.75rem 1rem;
    text-decoration: none;
    border-bottom: 1px solid var(--hover-bg);
    color: var(--text-color);
}

.dropdown-item:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

:root.dark-theme .dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-item:last-child {
    border-bottom: none;
}

.menu-icon {
    margin-right: 0.5rem;
    width: 16px;
    text-align: center;
}

.search-button {
    display: none;
}

.nav-item {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: #333;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.nav-item:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

:root.dark-theme .nav-item {
    color: var(--text-color);
}

:root.dark-theme .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.search-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 1100;
    padding-top: 100px;
    backdrop-filter: blur(4px);
}

.search-dialog-content {
    background: var(--header-bg);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    box-shadow: 0 4px 12px var(--shadow-color);
}

.search-dialog-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
}

.dialog-search-icon {
    position: absolute;
    left: 1rem;
    color: var(--text-secondary);
    font-size: 1.2rem;
}

.dialog-search-input {
    padding: 0.8rem 1.2rem 0.8rem 3rem;
    border: 2px solid var(--border-color);
    font-size: 1rem;
    border-radius: 30px;
    background: var(--bg-color);
    color: var(--text-color);
}

.dialog-search-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.dialog-search-button {
    flex-shrink: 0;
    padding: 0.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.dialog-search-button:hover {
    background: var(--primary-hover);
}

:root.dark-theme .search-dialog-content {
    border: 1px solid var(--border-color);
}

:root.dark-theme .dialog-search-input {
    background: var(--header-bg);
}

@media (max-width: 768px) {
    .nav {
        padding: 0.5rem;
    }

    .nav-left {
        gap: 0.75rem;
    }

    .avatar {
        width: 50px;
        height: 50px;
    }

    .nav-brand {
        font-size: 1.25rem;
    }

    .slogan {
        font-size: 0.8rem;
    }

    .header-search {
        display: none;
        /* 隐藏搜索框 */
    }

    .nav-menu {
        margin-left: auto;
        gap: 0.5rem;
        /* 减小间距 */
    }

    .search-button {
        display: block;
    }
}
</style>
