/**
 * 用户相关 API
 */

import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录参数
 * @param {string} data.userName - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.captchaID - 滑动验证码ID
 * @param {string} data.slideX - 滑动验证码终点X
 */
export function signIn(data) {
    // 将数据转换为 x-www-form-urlencoded 格式
    const formData = new URLSearchParams()
    Object.keys(data).forEach((key) => {
        formData.append(key, data[key])
    })

    return request.post('/user/signIn', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 用户注销
 */
export function signOut() {
    return request.get('/user/signOut')
}

/**
 * 获取滑动验证码
 * @param {string} action - 业务动作：login / comment / talk，服务端据此绑定凭证
 * @returns {Promise<{captcha_id: string, image: string, thumb: string,
 *   thumb_x: number, thumb_y: number, thumb_width: number, thumb_height: number}>}
 */
export function getSlideCaptcha(action = '') {
    // 附带时间戳参数，避免线上 Nginx /api/ 的 proxy_cache 把同一 action 的
    // GET 响应缓存住（服务端同时返回 Cache-Control: no-store 双保险）。
    return request.get('/slide-captcha', { params: { action, _: Date.now() } })
}

/**
 * 刷新 token
 * @param {string} refreshToken
 */
export function refreshToken(refreshToken) {
    return request.post('/user/refreshToken', { refresh_token: refreshToken })
}

/**
 * 修改密码
 * @param {Object} data - 修改密码参数
 * @param {string} data.password - 当前密码
 * @param {string} data.newPassword - 新密码
 * @param {string} data.confirmPassword - 确认新密码
 */
export function changePassword(data) {
    const formData = new URLSearchParams()
    Object.keys(data).forEach((key) => {
        formData.append(key, data[key])
    })

    return request.post('/user/changepwd', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 找回密码
 * @param {string} email - 用户邮箱
 */
export function foundPwd(email) {
    const formData = new URLSearchParams()
    formData.append('email', email)

    return request.post('/user/found_pwd', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

/**
 * 验证找回密码链接
 * @param {string} sid - 验证ID
 */
export function verifyAuth(sid) {
    return request.get(`/user/auth/${sid}`)
}

/**
 * 重置密码
 * @param {Object} data - 重置密码参数
 * @param {string} data.resetToken - 重置令牌
 * @param {string} data.newPassword - 新密码
 * @param {string} data.confirmPassword - 确认新密码
 */
export function resetPassword(data) {
    const formData = new URLSearchParams()
    formData.append('resetToken', data.resetToken)
    formData.append('newPassword', data.newPassword)
    formData.append('confirmPassword', data.confirmPassword)

    return request.post('/user/reset_pwd', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}
