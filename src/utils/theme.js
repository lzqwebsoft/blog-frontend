/**
 * 主题管理工具函数
 * 支持跨平台、智能主题检测和切换
 */

const THEME_STORAGE_KEY = 'blog_theme_preference'
const THEME_EXPIRY_DAYS = 1

/**
 * 带有有效期的 localStorage 存储
 * @param {string} key
 * @param {any} value
 * @param {number} days
 */
function setWithExpiry(key, value, days) {
    const now = new Date()
    const item = {
        value: value,
        expiry: now.getTime() + days * 24 * 60 * 60 * 1000
    }
    localStorage.setItem(key, JSON.stringify(item))
}

/**
 * 带有有效期的 localStorage 获取
 * @param {string} key
 * @returns {any|null}
 */
function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    try {
        const item = JSON.parse(itemStr)
        const now = new Date()
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key)
            return null
        }
        return item.value
    } catch {
        return null
    }
}


/**
 * 检测操作系统
 * @returns {string} 操作系统名称: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown'
 */
export function detectOS() {
    const userAgent = navigator.userAgent.toLowerCase()

    if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
        return 'ios'
    }
    if (userAgent.includes('android')) {
        return 'android'
    }
    if (userAgent.includes('mac')) {
        return 'macos'
    }
    if (userAgent.includes('win')) {
        return 'windows'
    }
    if (userAgent.includes('linux')) {
        return 'linux'
    }
    return 'unknown'
}

/**
 * 获取当前时间段
 * @returns {string} 'day' 或 'night'
 */
export function getTimePeriod() {
    const hour = new Date().getHours()
    // 晚上19点到早上7点为夜间
    return hour >= 19 || hour < 7 ? 'night' : 'day'
}

/**
 * 获取操作系统特定主题偏好
 * @param {string} os - 操作系统
 * @param {string} timePeriod - 'day' 或 'night'
 * @returns {boolean} true 为深色模式, false 为浅色模式
 */
export function getOSPreferredTheme(os, timePeriod) {
    // 夜间时段: 无论什么操作系统都优先使用深色模式
    if (timePeriod === 'night') {
        return true
    }

    // 白天时段: 根据操作系统返回默认偏好
    const defaults = {
        windows: false, // Windows 默认浅色
        macos: false, // macOS 默认浅色
        linux: false, // Linux 默认浅色
        android: false, // Android 默认浅色
        ios: false, // iOS 默认浅色
    }

    return defaults[os] !== undefined ? defaults[os] : false
}

/**
 * 获取系统深色模式偏好
 * @returns {boolean} 系统是否偏好深色模式
 */
export function getSystemThemePreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * 初始化主题 - 智能检测跨平台最佳主题
 * @returns {boolean} true 为深色模式, false 为浅色模式
 */
export function initializeTheme() {
    // 1. 首先从 localStorage 中获取
    const storedTheme = getWithExpiry(THEME_STORAGE_KEY)
    if (storedTheme !== null) {
        return storedTheme
    }

    // 2. 检测操作系统和当前时段
    const os = detectOS()
    const timePeriod = getTimePeriod()

    // 3. 获取操作系统特定偏好
    const osPreference = getOSPreferredTheme(os, timePeriod)

    // 4. 回退到系统偏好
    const systemPrefersDark = getSystemThemePreference()

    // 返回操作系统偏好或系统偏好
    return osPreference !== undefined ? osPreference : systemPrefersDark
}

/**
 * 应用主题到文档
 * @param {boolean} isDark - 是否为深色模式
 */
export function applyTheme(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark-theme')
    } else {
        document.documentElement.classList.remove('dark-theme')
    }
    // 保存到 localStorage
    setWithExpiry(THEME_STORAGE_KEY, isDark, THEME_EXPIRY_DAYS)
}
