import { createRouter, createWebHistory } from 'vue-router'
const Index = () => import('../views/Index.vue')
const Show = () => import('../views/Show.vue')
const About = () => import('../views/About.vue')
const Login = () => import('@/views/Login.vue')
const EditArticle = () => import('../views/EditArticle.vue')
const Set = () => import('@/views/Set.vue')
const ChangePassword = () => import('@/views/ChangePassword.vue')
const ForgotPassword = () => import('@/views/ForgotPassword.vue')
const FoundPassword = () => import('@/views/FoundPassword.vue')
const ResetPassword = () => import('@/views/ResetPassword.vue')
const NotFound = () => import('../views/NotFound.vue')

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
                title: '文章详情',
                description: '显示文章详情',
            },
        },
        {
            path: '/about',
            name: 'about',
            component: About,
            meta: {
                title: '关于本站',
                description: '了解更多关于-ZQLUO-的博客信息',
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
            path: '/reset_pwd/:sid',
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
        document.title = to.meta.title + ' - 飘痕の博客'
    } else {
        document.title = '飘痕の博客'
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
