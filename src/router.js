import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Settings from './views/Settings.vue'
import Story from './views/Story.vue' // <-- Tambah import ini

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/tetapan', name: 'Settings', component: Settings },
  { path: '/cerita', name: 'Story', component: Story } // <-- Tambah route ini
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router