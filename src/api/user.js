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
