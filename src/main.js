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
    faReply, faCloudUploadAlt, faImages, faUpload, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons'
import {
    faQq, faXTwitter, faWeibo, faFacebook
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router'

library.add(
    faQq, faXTwitter, faWeibo, faFacebook,
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
    faCopy, faAngleLeft, faAnglesRight, faReply,
    faCloudUploadAlt, faImages, faUpload, faChevronLeft, faChevronRight
)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
