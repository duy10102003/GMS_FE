import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireStaff, requireMechanic } from './guards'
import authService from '../services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/staff/service-tickets'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: () => import('../views/VerifyOtpView.vue')
    },
    // Staff routes
    {
      path: '/staff/service-tickets',
      name: 'staff-service-tickets',
      component: () => import('../views/staff/ServiceTicketsView.vue')
    },
    {
      path: '/staff/service-tickets/create',
      name: 'staff-create-service-ticket',
      component: () => import('../views/staff/CreateServiceTicketView.vue')
    },
    {
      path: '/staff/service-tickets/:id',
      name: 'staff-service-ticket-detail',
      component: () => import('../views/staff/ServiceTicketDetailView.vue')
    },
    // Mechanic routes
    {
      path: '/mechanic/tasks',
      name: 'mechanic-tasks',
      component: () => import('../views/mechanic/MechanicTasksView.vue')
    },
    {
      path: '/mechanic/tasks/:id',
      name: 'mechanic-task-detail',
      component: () => import('../views/mechanic/MechanicTaskDetailView.vue')
    },
    // Manager routes
    {
      path: '/manager/garage-services',
      name: 'manager-garage-services',
      component: () => import('../views/manager/GarageServicesView.vue')
    },
    // Stocker routes
    {
      path: '/stocker/part-categories',
      name: 'stocker-part-categories',
      component: () => import('../views/stocker/PartCategoriesView.vue')
    },
    {
      path: '/stocker/parts',
      name: 'stocker-parts',
      component: () => import('../views/stocker/PartsView.vue')
    }
  ],
})

// No guards - allow access to all routes

export default router
