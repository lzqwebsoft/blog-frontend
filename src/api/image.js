/**
 * 图片相关 API
 */

import request from '@/utils/request'

/**
 * 上传图片
 * @param {FormData} formData - 包含图片的 FormData 对象
 */
export function uploadImage(formData) {
    return request.post('/images/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 获取图片列表
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 */
export function getImageList(page = 1, limit = 12) {
    return request.get('/images/list', {
        params: {
            page,
            limit
        }
    })
}

/**
 * 删除图片
 * @param {string|number} id - 图片 ID
 */
export function deleteImage(id) {
    return request.delete(`/images/delete/${id}`)
}
