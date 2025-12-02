/**
 * 文章相关 API
 */

import request from '@/utils/request'

/**
 * 获取首页数据
 * @param {number} pageNo - 页码
 * @param {number} pageSize - 每页数量
 */
export function getHomeData(pageNo = 1, pageSize = 15) {
    return request.get('/home', {
        params: {
            pageNo,
            pageSize
        }
    })
}

/**
 * 删除文章
 * @param {string} id - 文章ID
 */
export function deleteArticle(id) {
    return request.delete(`/article/${id}`)
}

/**
 * 获取文章详情
 * @param {string} id - 文章ID
 */
export function getArticleDetail(id) {
    // 从本地存储获取 viewer_uuid
    const viewerUUID = localStorage.getItem('viewer_uuid')

    const config = {}
    if (viewerUUID) {
        config.headers = {
            'viewer_uuid': viewerUUID
        }
    }

    return request.get(`/article/${id}`, config)
}

/**
 * 提交评论
 * @param {Object} data - 评论数据
 * @param {string} data.article_id - 文章ID
 * @param {string} data.reviewer - 评论者昵称
 * @param {string} data.website - 个人网站
 * @param {string} data.content - 评论内容
 * @param {number} [data.parent_id] - 父评论ID（回复时需要）
 */
export function submitComment(data) {
    return request.post('/comment', data)
}

/**
 * 删除评论
 * @param {number} id - 评论ID
 */
export function deleteComment(id) {
    return request.delete(`/comment/${id}`)
}
