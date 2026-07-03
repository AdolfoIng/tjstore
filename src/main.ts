import { createApp } from 'vue'
import { createPinia } from 'pinia';
import router from './router'
import App from './App.vue'
import '@/style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(router)

app.use(pinia) // Registrar Pinia

app.mount('#app')
