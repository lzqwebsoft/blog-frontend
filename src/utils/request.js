/**
 * HTTP 请求模块
 * 基于 axios 封装，统一处理请求拦截、响应拦截、token 刷新等
 */

import axios from 'axios'
import {
    getToken,
    getRefreshToken,
    isTokenExpired,
    isRefreshTokenExpired,
    saveAuthData,
    clearAuthData
} from './auth'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 是否正在刷新 token
let isRefreshing = false
// 等待刷新 token 的请求队列
let refreshSubscribers = []

/**
 * 将请求加入等待队列
 */
function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback)
}

/**
 * 刷新完成后，执行队列中的请求
 */
function onTokenRefreshed(newToken) {
    refreshSubscribers.forEach((callback) => callback(newToken))
    refreshSubscribers = []
}

/**
 * 刷新 token
 */
async function refreshToken() {
    const refresh_token = getRefreshToken()
    if (!refresh_token || isRefreshTokenExpired()) {
        throw new Error('Refresh token expired')
    }

    const response = await axios.post('/api/token/refresh', {
        refresh_token
    }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })

    if (response.data.code === 0) {
        saveAuthData(response.data.data)
        return response.data.data.token
    }
    throw new Error('Refresh token failed')
}

// 请求拦截器
request.interceptors.request.use(
    async (config) => {
        // 不需要 token 的接口
        const noAuthUrls = ['/user/signIn', '/captcha', '/token/refresh']
        if (noAuthUrls.some((url) => config.url.includes(url))) {
            return config
        }

        let token = getToken()

        // 检查 token 是否过期
        if (token && isTokenExpired()) {
            if (!isRefreshTokenExpired()) {
                // refresh token 未过期，尝试刷新
                if (!isRefreshing) {
                    isRefreshing = true
                    try {
                        token = await refreshToken()
                        onTokenRefreshed(token)
                    } catch (error) {
                        clearAuthData()
                        router.push('/login')
                        return Promise.reject(error)
                    } finally {
                        isRefreshing = false
                    }
                } else {
                    // 正在刷新，将请求加入队列
                    return new Promise((resolve) => {
                        subscribeTokenRefresh((newToken) => {
                            config.headers.Authorization = `Bearer ${newToken}`
                            resolve(config)
                        })
                    })
                }
            } else {
                // refresh token 也过期了，跳转登录
                clearAuthData()
                router.push('/login')
                return Promise.reject(new Error('Session expired'))
            }
        }

        // 添加 Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        const res = response.data

        // 业务错误处理
        if (res.code !== 0) {
            // 可以在这里统一处理业务错误
            return Promise.reject(new Error(res.message || '请求失败'))
        }

        return res
    },
    (error) => {
        // HTTP 错误处理
        if (error.response) {
            const { status, data } = error.response
            if (status === 401) {
                // 未授权，清除认证信息并跳转登录
                clearAuthData()
                router.push('/login')
            }
            // 这里如果服务器服返回的有message, 则直接使用服务器中的message
            if (data && data.message) {
                return Promise.reject(new Error(data.message || error.message))
            }
        }
        return Promise.reject(error)
    }
)

export default request
