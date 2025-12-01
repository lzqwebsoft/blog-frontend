/**
 * 认证管理模块
 * 管理 token 的存储、获取、刷新和过期检查
 */

const TOKEN_KEY = 'blog_token'
const REFRESH_TOKEN_KEY = 'blog_refresh_token'
const EXPIRES_AT_KEY = 'blog_expires_at'
const EXPIRES_REFRESH_AT_KEY = 'blog_expires_refresh_at'

/**
 * 保存认证信息到本地存储
 */
export function saveAuthData(data) {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
    localStorage.setItem(EXPIRES_AT_KEY, data.expires_at)
    localStorage.setItem(EXPIRES_REFRESH_AT_KEY, data.expires_refresh_at)
}

/**
 * 获取 token
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

/**
 * 获取 refresh token
 */
export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 获取 token 过期时间
 */
export function getExpiresAt() {
    return localStorage.getItem(EXPIRES_AT_KEY)
}

/**
 * 获取 refresh token 过期时间
 */
export function getRefreshExpiresAt() {
    return localStorage.getItem(EXPIRES_REFRESH_AT_KEY)
}

/**
 * 清除所有认证信息
 */
export function clearAuthData() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(EXPIRES_AT_KEY)
    localStorage.removeItem(EXPIRES_REFRESH_AT_KEY)
}

/**
 * 检查 token 是否过期
 * @returns {boolean} true 表示已过期
 */
export function isTokenExpired() {
    const expiresAt = getExpiresAt()
    if (!expiresAt) return true

    const expiresTime = new Date(expiresAt).getTime()
    const now = Date.now()
    // 提前 30 秒判断过期，避免边界情况
    return now >= expiresTime - 30000
}

/**
 * 检查 refresh token 是否过期
 * @returns {boolean} true 表示已过期
 */
export function isRefreshTokenExpired() {
    const expiresAt = getRefreshExpiresAt()
    if (!expiresAt) return true

    const expiresTime = new Date(expiresAt).getTime()
    const now = Date.now()
    return now >= expiresTime
}

/**
 * 检查是否已登录（有有效的 token）
 */
export function isAuthenticated() {
    const token = getToken()
    return !!token && !isTokenExpired()
}
