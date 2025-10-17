import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import VueKonva from 'vue-konva'

import SvgIcon from "@/components/SvgIcon/index.vue" //自定义svg组件
import "virtual:svg-icons-register"
import './styles/global.css'

const app = createApp(App)

app.use(VueKonva)
app.use(createPinia())
app.component("Icons", SvgIcon).mount('#app')
