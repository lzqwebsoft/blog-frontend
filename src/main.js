import './assets/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faEdit, faLock, faCog, faSignOutAlt, faMoon, faSun, faBars,
    faMagnifyingGlass, faGear, faArrowUp, faPenToSquare, faTrash,
    faCalendarDay, faEye, faCommentDots, faFolder, faLink, faFire, faAddressCard
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router'

library.add(
    faEdit, faLock, faCog, faSignOutAlt, faMoon,
    faSun, faBars, faMagnifyingGlass, faGear, faArrowUp,
    faPenToSquare, faTrash, faCalendarDay, faEye, faCommentDots,
    faFolder, faLink, faFire, faAddressCard
)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
