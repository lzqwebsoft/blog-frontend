/**
 * 文章相关 API
 */

import request from '@/utils/request'

/**
 * 获取首页数据
 * @param {string} q - 搜索关键字
 * @param {number} pageNo - 页码
 * @param {number} pageSize - 每页数量
 * @param {string} categoryId - 分类ID（可选）
 */
export function getHomeData(q = null, pageNo = 1, pageSize = 15, categoryId = null) {
    const params = {
        pageNo,
        pageSize
    }

    if (q && q.trim() != "") {
        params.q = q
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
    return request.delete(`/article/delete/${id}`)
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
 * 添加文章分类
 * @param {URLSearchParams} data - 分类数据
 */
export function addArticleType(data) {
    return request.post('/article_type/add', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 删除文章分类
 * @param {string|number} id - 分类ID
 */
export function deleteArticleType(id) {
    return request.delete(`/article_type/delete/${id}`)
}

/**
 * 切换文章分类禁用状态
 * @param {string|number} id - 分类ID
 * @param {boolean} disable - 是否禁用
 */
export function toggleArticleTypeDisable(id, disable) {
    const params = new URLSearchParams()
    params.append('disable', disable)
    return request.put(`/article_type/disable/${id}`, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 更新文章分类名称
 * @param {string|number} id - 分类ID
 * @param {string} name - 分类数据
 */
export function updateArticleType(id, name) {
    const params = new URLSearchParams()
    params.append('type_name', name)
    return request.put(`/article_type/update/${id}`, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
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

/**
 * 分页查询文章列表（按类型/标题）
 * @param {Object} params - 查询参数
 * @param {number} [params.articleTypeId] - 文章类型 ID
 * @param {string} [params.title] - 标题关键字
 * @param {number} [params.pageNo] - 页码，默认 1
 * @param {number} [params.pageSize] - 每页条数，默认 15
 */
export function selectArticles(params) {
    return request.get('/article/select', {
        params
    })
}

/**
 * 切换文章评论权限
 * @param {string|number} id - 文章ID
 * @param {boolean} allow - 是否允许评论
 */
export function toggleAllowComment(id, allow) {
    const params = new URLSearchParams()
    params.append('allow', allow)
    return request.put(`/article/allow_comment/${id}`, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 切换文章置顶状态
 * @param {string|number} id - 文章ID
 * @param {boolean} top - 是否置顶
 */
export function toggleTop(id, top) {
    const params = new URLSearchParams()
    params.append('top', top)
    return request.put(`/article/is_top/${id}`, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 获取草稿列表
 * @param {number} pageNo - 页码
 * @param {number} pageSize - 每页数量
 */
export function getDrafts(pageNo = 1, pageSize = 15) {
    return request.get('/article/drafts', {
        params: {
            pageNo,
            pageSize
        }
    })
}
