import { createRouter, createWebHistory } from 'vue-router'
import ResumeView from '../views/resume-view.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'resume',
      component: ResumeView,
    },
  ],
})

export default router
