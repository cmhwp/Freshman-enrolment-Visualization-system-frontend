import 'normalize.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'ant-design-vue/dist/reset.css';
import App from './App.vue'
import router from './router'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons-vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 注册图标组件
app.component('UserOutlined', UserOutlined)
app.component('LockOutlined', LockOutlined)
app.component('MailOutlined', MailOutlined)
app.component('PhoneOutlined', PhoneOutlined)
app.component('HomeOutlined', HomeOutlined)

app.mount('#app')
