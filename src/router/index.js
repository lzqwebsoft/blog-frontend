import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Show from '../views/Show.vue'
import Login from '@/views/Login.vue'
import EditArticle from '../views/EditArticle.vue'
import Set from '@/views/Set.vue'
import ChangePassword from '@/views/ChangePassword.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'
import FoundPassword from '@/views/FoundPassword.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'index',
            component: Index,
            meta: {
                title: '首页',
                description: '欢迎访问-ZQLUO-的博客, 分享生活与编程学习技术',
            },
        },
        {
            path: '/show/:id',
            name: 'show',
            component: Show,
            meta: {
                title: 'Article Detail',
                description: 'Read the full article.',
            },
        },
        {
            path: '/select/:categoryId',
            name: 'category',
            component: Index,
            meta: {
                title: '博客分类',
                description: '浏览文章分类',
            },
        },
        {
            path: '/new',
            name: 'article-new',
            component: EditArticle,
            meta: {
                title: '撰写博客',
                description: '创建新的文章.',
            },
        },
        {
            path: '/edit/:id',
            name: 'article-edit',
            component: EditArticle,
            meta: {
                title: '编辑博客',
                description: '编辑的文章.',
            },
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: {
                title: '登录',
                description: '博主登录',
            },
        },
        {
            path: '/forget_pwd',
            name: 'forgot-password',
            component: ForgotPassword,
            meta: {
                title: '忘记密码',
                description: '记记密码，找回博主登录密码',
            },
        },
        {
            path: '/found_pwd',
            name: 'found-password',
            component: FoundPassword,
            meta: {
                title: '找回密码',
                description: '找回博主登录密码.',
            },
        },
        {
            path: '/reset_pwd',
            name: 'reset-password',
            component: ResetPassword,
            meta: {
                title: '重置密码',
                description: '为博主帐户重置新密码',
            },
        },
        {
            path: '/change_pwd',
            name: 'change-password',
            component: ChangePassword,
            meta: {
                title: '修改密码',
                description: '修改博主登录密码.',
            },
        },
        {
            path: '/set',
            name: 'blog-settings',
            component: Set,
            meta: {
                title: '设置',
                description: '管理博客设置.',
            },
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: NotFound,
            meta: {
                title: '404 Not Found',
                description: 'The page you are looking for does not exist.',
            },
        },
    ],
})

router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title + " - 飘痕の博客"
    } else {
        document.title = "飘痕の博客"
    }

    if (to.meta.description) {
        const descriptionMeta = document.querySelector('meta[name="description"]')
        if (descriptionMeta) {
            descriptionMeta.setAttribute('content', to.meta.description)
        } else {
            const meta = document.createElement('meta')
            meta.name = 'description'
            meta.content = to.meta.description
            document.head.appendChild(meta)
        }
    }
    next()
})

export default router
