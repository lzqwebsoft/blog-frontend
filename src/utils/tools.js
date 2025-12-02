/**
 * 通用工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {string|Date} dateString - 日期字符串或日期对象
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 * @param {string|Date} dateString - 日期字符串或日期对象
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化阅读数量
 * @param {number} count - 阅读数量
 * @returns {string|number} 格式化后的阅读数量
 */
export function formatReadCount(count) {
    if (count >= 1000) {
        return Math.floor(count / 1000) + 'k+'
    }
    return count
}

/**
 * 截断文本内容
 * @param {string} content - 文本内容
 * @param {number} maxLength - 最大长度，默认300
 * @returns {string} 截断后的文本
 */
export function truncateContent(content, maxLength = 300) {
    if (!content) return ''
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
}
