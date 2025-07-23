import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Show from '../views/Show.vue'

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
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: () => import('../views/Index.vue'),
        },
    ],
})

export default router
