/**
 * 用户相关 API
 */

import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录参数
 * @param {string} data.userName - 用户名
 * @param {string} data.password - 密码
 * @param {string} [data.captchaCode] - 验证码（错误3次后需要）
 * @param {string} [data.captchaID] - 验证码ID（错误3次后需要）
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
 * 获取图片验证码
 * @returns {Promise<{captcha: string, captcha_id: string}>}
 */
export function getCaptcha() {
    return request.get('/captcha')
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
