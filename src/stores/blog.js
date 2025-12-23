import { defineStore } from 'pinia'
import { getBlogInfo } from '@/api/common'

export const useBlogStore = defineStore('blog', {
    state: () => ({
        blogInfo: {
            about: '',
            access_num: 0,
            descriptions: '',
            email: '',
            head: '',
            id: 0,
            updated_at: ''
        }
    }),
    actions: {
        async fetchBlogInfo() {
            try {
                const response = await getBlogInfo()
                if (response.code === 0) {
                    this.blogInfo = response.data
                }
            } catch (error) {
                console.error('Failed to fetch blog info:', error)
            }
        }
    }
})
