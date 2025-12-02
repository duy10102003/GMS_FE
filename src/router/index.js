import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireStaff } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/staff/service-tickets'
    },
    {
      path: '/staff/service-tickets',
      name: 'staff-service-tickets',
      component: () => import('../views/staff/ServiceTicketsView.vue'),
      beforeEnter: [requireAuth, requireStaff]
    },
    {
      path: '/staff/service-tickets/:id',
      name: 'staff-service-ticket-detail',
      component: () => import('../views/staff/ServiceTicketDetailView.vue'),
      beforeEnter: [requireAuth, requireStaff]
    }
  ],
})

export default router
