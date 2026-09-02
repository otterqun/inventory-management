import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import SecondPage from './views/SecondPage.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/page-baru', component: SecondPage }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // kalau nak deploy ke GitHub pages, tukar ni sikit nanti. Untuk lokal guna ni dulu.
  routes
})

export default router