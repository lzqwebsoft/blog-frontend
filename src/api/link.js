/**
 * 友情链接相关 API
 */

import request from '@/utils/request'

/**
 * 获取友情链接列表
 * @param {number} pageNo - 页码，默认 1
 * @param {number} pageSize - 每页数量，默认 10
 */
export function getLinkList(pageNo = 1, pageSize = 10) {
    return request.get('/link/list', {
        params: {
            pageNo,
            pageSize
        }
    })
}
/**
 * 保存友情链接（新增或更新）
 * @param {URLSearchParams} data - 链接数据
 */
export function saveLink(data) {
    return request.post('/link/save', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 删除友情链接
 * @param {number|string} id - 链接ID
 */
export function deleteLink(id) {
    return request.delete(`/link/delete/${id}`)
}
