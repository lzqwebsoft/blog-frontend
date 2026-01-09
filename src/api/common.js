import request from '@/utils/request'

/**
 * 获取博客信息配置
 */
export function getBlogInfo() {
    return request.get('/info')
}
/**
 * 更新博客信息配置
 */
export function updateBlogInfo(data) {
    const formData = new URLSearchParams()
    Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key])
        }
    })

    return request.post('/set/info', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
}

/**
 * 获取SSG缓存状态
 */
export function getSSGStatus() {
    return request.get('/ssg/status')
}

/**
 * 手动触发SSG重建
 * @param {string} type - 类型: home 或 article
 * @param {string} id - 文章ID（type为article时必填）
 */
export function regenerateSSG(type, id = '') {
    const formData = new URLSearchParams()
    formData.append('type', type)
    if (id) {
        formData.append('id', id)
    }

    return request.post('/ssg/regenerate', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
}

/**
 * 获取SSG缓存列表
 */
export function listSSGCache() {
    return request.get('/ssg/list')
}

/**
 * 验证/读取SSG缓存内容
 */
export function validateSSG(type, id = '') {
    return request.get('/ssg/validate', {
        params: { type, id },
        responseType: 'text', // Expecting raw HTML
    })
}
