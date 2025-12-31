import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/style.css'  // 导入全局样式

// 创建应用实例
const app = createApp(App)

app.use(createPinia())
app.use(router)

// 初始化认证状态
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()
auth.init()

app.mount('#app')
