import './assets/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faEdit, faLock, faCog, faSignOutAlt, faMoon, faSun, faBars,
    faMagnifyingGlass, faGear, faArrowUp, faPenToSquare, faTrash,
    faCalendarDay, faEye, faCommentDots, faFolder, faLink, faFire,
    faAddressCard, faTimes, faAngleRight, faBold, faItalic, faUnderline,
    faListUl, faListOl, faUnlink, faCode, faImage, faStrikethrough,
    faQuoteLeft, faColumns, faCompress, faExpand, faCircleExclamation,
    faCircleCheck, faFloppyDisk, faXmark, faKey, faShieldHalved, faEyeSlash,
    faLightbulb, faTriangleExclamation, faSpinner, faUser, faRightToBracket,
    faPaperPlane, faEnvelope, faArrowLeft, faCopy, faAngleLeft, faAnglesRight,
    faReply, faCloudUploadAlt, faImages, faUpload, faChevronLeft, faChevronRight,
    faAngleDown, faChevronDown, faFont,
} from '@fortawesome/free-solid-svg-icons'
import {
    faQq, faXTwitter, faWeibo, faFacebook, faGithub, faStackOverflow
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router'
import { useBlogStore } from './stores/blog'

library.add(
    faQq, faXTwitter, faWeibo, faFacebook, faGithub, faStackOverflow,
    faEdit, faLock, faCog, faSignOutAlt, faMoon,
    faSun, faBars, faMagnifyingGlass, faGear, faArrowUp,
    faPenToSquare, faTrash, faCalendarDay, faEye, faCommentDots,
    faFolder, faLink, faFire, faAddressCard, faTimes, faAngleRight,
    faBold, faItalic, faUnderline, faListUl, faListOl, faUnlink,
    faCode, faImage, faStrikethrough, faQuoteLeft, faColumns,
    faCompress, faExpand, faCircleExclamation, faCircleCheck,
    faFloppyDisk, faXmark, faKey, faShieldHalved, faEyeSlash,
    faLightbulb, faTriangleExclamation, faSpinner, faUser,
    faRightToBracket, faPaperPlane, faEnvelope, faArrowLeft,
    faCopy, faAngleLeft, faAnglesRight, faReply, faCloudUploadAlt,
    faImages, faUpload, faChevronLeft, faChevronRight, faAngleDown,
    faChevronDown, faFont
)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

const blogStore = useBlogStore()
app.config.globalProperties.$blog = blogStore
Object.defineProperty(app.config.globalProperties, 'blogInfo', {
    get: () => blogStore.blogInfo
})

app.mount('#app')
