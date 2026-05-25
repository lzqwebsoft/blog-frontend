/**
 * 说说相关 API
 */

import request from '@/utils/request'

/**
 * 获取说说列表（分页，含评论级联）
 * @param {number} page - 页码，默认 1
 * @param {number} pageSize - 每页数量，默认 10
 */
export function getTalkList(page = 1, pageSize = 10) {
    return request.get('/talk/list', {
        params: {
            page,
            pageSize
        }
    })
}

/**
 * 保存说说（新建或编辑）
 * @param {string} content - 说说文本内容
 * @param {Array<string>} images - 上传好的图片 URL 数组
 * @param {string|number|null} id - 说说 ID（编辑时传入，否则新建）
 */
export function saveTalk(content, images = [], id = null) {
    const params = new URLSearchParams()
    params.append('content', content)
    params.append('images', JSON.stringify(images))
    if (id) {
        params.append('id', id)
    }
    return request.post('/talk/save', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 删除说说
 * @param {string|number} id - 说说 ID
 */
export function deleteTalk(id) {
    return request.delete(`/talk/delete/${id}`)
}

/**
 * 提交说说评论
 * @param {URLSearchParams} data - 评论表单数据（x-www-form-urlencoded格式）
 * @param {string} data.talk_id - 说说ID
 * @param {string} data.reviewer - 评论者昵称
 * @param {string} data.email - 评论者邮箱
 * @param {string} data.website - 个人主页（可选）
 * @param {string} data.content - 评论内容
 * @param {string} [data.parent_id] - 父评论ID（回复时）
 * @param {string} [data.root_id] - 根评论ID（回复时）
 * @param {string} [data.captchaCode] - 验证码（非登录用户必填）
 * @param {string} [data.captchaID] - 验证码ID（非登录用户必填）
 */
export function addTalkComment(data) {
    return request.post('/talk/comment/add', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 删除说说评论
 * @param {string|number} id - 评论 ID
 */
export function deleteTalkComment(id) {
    return request.delete(`/talk/comment/delete/${id}`)
}
