import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Show from '../views/Show.vue'
import EditArticle from '../views/EditArticle.vue'
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
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: NotFound,
        },
    ],
})

export default router
