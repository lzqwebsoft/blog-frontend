/**
 * 文章相关 API
 */

import request from '@/utils/request'

/**
 * 获取首页数据
 * @param {number} pageNo - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} categoryId - 分类ID（可选）
 */
export function getHomeData(pageNo = 1, pageSize = 15, categoryId = null) {
    const params = {
        pageNo,
        pageSize
    }

    if (categoryId) {
        params.typeId = categoryId
    }

    return request.get('/home', {
        params
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
 * @param {URLSearchParams} data - 评论数据（x-www-form-urlencoded格式）
 * @param {string} data.article_id - 文章ID
 * @param {string} data.reviewer - 评论者昵称
 * @param {string} data.website - 个人网站
 * @param {string} data.content - 评论内容
 * @param {string} [data.parent_comment_id] - 父评论ID（回复时需要）
 * @param {string} [data.root_comment_id] - 根评论ID（回复时需要）
 * @param {string} [data.captchaCode] - 验证码（非登录用户必填）
 * @param {string} [data.captchaID] - 验证码ID（非登录用户必填）
 */
export function submitComment(data) {
    return request.post('/comment/add', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 删除评论
 * @param {number} id - 评论ID
 */
export function deleteComment(id) {
    return request.delete(`/comment/delete/${id}`)
}

/**
 * 获取文章分类列表
 * @returns {Promise} - 文章分类列表
 */
export function getArticleTypes() {
    return request.get('/article_type/list')
}

/**
 * 保存文章
 * @param {URLSearchParams} data - 文章数据（x-www-form-urlencoded格式）
 * @param {string} data.title - 文章标题
 * @param {string} data.content - 文章内容
 * @param {string} data.typeId - 文章分类ID
 * @param {string} data.codeTheme - 代码主题
 * @param {boolean} data.allowComment - 是否允许评论
 * @param {boolean} data.isTop - 是否置顶
 * @param {number} data.readedNum - 阅读量
 * @param {number} data.contentType - 内容类型（1:Markdown, 2:HTML）
 */
export function saveArticle(data) {
    return request.post('/article/save', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}
