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
        },
        {
            path: '/show/:id',
            name: 'show',
            component: Show,
        },
        {
            path: '/select/:categoryId',
            name: 'category',
            component: Index,
        },
        {
            path: '/article/new',
            name: 'article-new',
            component: EditArticle,
        },
        {
            path: '/article/edit/:id',
            name: 'article-edit',
            component: EditArticle,
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
        },
        {
            path: '/forget_pwd',
            name: 'forgot-password',
            component: ForgotPassword,
        },
        {
            path: '/found_pwd',
            name: 'found-password',
            component: FoundPassword,
        },
        {
            path: '/reset_pwd',
            name: 'reset-password',
            component: ResetPassword,
        },
        {
            path: '/change_pwd',
            name: 'change-password',
            component: ChangePassword,
        },
        {
            path: '/set',
            name: 'blog-settings',
            component: Set,
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: NotFound,
        },
    ],
})

export default router
