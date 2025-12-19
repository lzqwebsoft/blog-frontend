import request from '@/utils/request'

/**
 * 获取关于页面数据
 */
export function getAboutData() {
    return request.get('/about')
}
