/**
 * 针对 iOS 15.0 ~ 15.3 及旧版现代浏览器的关键 Polyfill
 * 解决 Mermaid 11 及其他第三方库在低版本 WebKit 缺少 ES2022 / Web API 的问题
 */

// 1. Object.hasOwn (ES2022, Safari 15.4+)
if (typeof Object.hasOwn !== 'function') {
    Object.hasOwn = function (obj, prop) {
        if (obj === null || obj === undefined) {
            throw new TypeError('Cannot convert undefined or null to object')
        }
        return Object.prototype.hasOwnProperty.call(obj, prop)
    }
}

// 2. window.structuredClone (HTML / Web API, Safari 15.4+)
if (typeof window !== 'undefined' && typeof window.structuredClone !== 'function') {
    window.structuredClone = function (obj) {
        if (obj === undefined) return undefined
        return JSON.parse(JSON.stringify(obj))
    }
}

// 3. Array.prototype.at (ES2022, Safari 15.4+)
if (!Array.prototype.at) {
    Array.prototype.at = function (index) {
        let n = Math.trunc(index) || 0
        if (n < 0) n += this.length
        if (n < 0 || n >= this.length) return undefined
        return this[n]
    }
}

// 4. String.prototype.at (ES2022, Safari 15.4+)
if (!String.prototype.at) {
    String.prototype.at = function (index) {
        let n = Math.trunc(index) || 0
        if (n < 0) n += this.length
        if (n < 0 || n >= this.length) return undefined
        return this[n]
    }
}
