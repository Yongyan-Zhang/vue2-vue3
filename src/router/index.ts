import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'RootHome',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('../views/UploadView.vue')
  },
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/item',
    name: 'Item',
    component: () => import('../views/ItemView.vue')
  },
  {
    path: '/score',
    name: 'Score',
    component: () => import('../views/ScoreView.vue')
  },
  {
    path: '/answer-card',
    name: 'AnswerCard',
    component: () => import('../views/AnswerCardView.vue')
  },
  {
    path: '/answer-card/:index',
    name: 'AnswerDetail',
    component: () => import('../views/AnswerDetailView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
