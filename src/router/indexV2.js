import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth } from './guardsV2'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', redirect: '/home' },

		{
			path: '/home',
			name: 'home',
			component: () => import('../views/HomeView.vue')
		},
		
		{ path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },

		{
			path: '/manager',
			redirect: '/manager/dashboard',
			beforeEnter: requireAuth,
			meta: { role: 'MANAGER' },
			children: [
				{
					path: 'dashboard',
					name: 'managerDashboard',
					component: () => import('../views/manager/DashboardManager.vue')
				}
			]
		},

		{
			path: '/staff',
			redirect: '/staff/dashboard',
			beforeEnter: requireAuth,
			meta: { role: 'STAFF' },
			children: [
				{
					path: 'dashboard',
					name: 'staffDashboard',
					component: () => import('../views/staff/DashBoardStaff.vue')
				},
				{
      			path: '/staff/service-tickets',
      			name: 'staff-service-tickets',
      			component: () => import('../views/staff/ServiceTicketsView.vue'),
    			}
			]
		},

		{
			path: '/customer',
			redirect: '/customer/home',
			beforeEnter: requireAuth,
			meta: { role: 'CUSTOMER' },
			children: [
				{
					path: 'home',
					name: 'customerHome',
					component: () => import('../views/customer/CustomerHome.vue')
				}
			]
		},
		{
			path: '/stocker',
			redirect: '/stocker/dashboard',
			beforeEnter: requireAuth,
			meta: { role: 'STOCKER' },
			children: [
				{
					path: 'dashboard',
					name: 'stockerDashboard',
					component: () => import('../views/staff/ServiceTicketsView.vue')
				},
			]
		},
		{
			path: '/verify-otp',
			name: 'verifyOtp',
			component: () => import('../views/VerifyOtpView.vue')
		}
	]
})

export default router
