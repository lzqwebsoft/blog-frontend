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
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}
