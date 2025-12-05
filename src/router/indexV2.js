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
				},
				{
					path: 'garage-services',
					name: 'managerGarageService',
					component: () => import('../views/manager/GarageServicesView.vue')
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
					path: 'service-tickets',
					name: 'serviceTickets',
					component: () => import('../views/staff/ServiceTicketsView.vue')
				},
				{
					path: '/staff/service-tickets/:id',
					name: 'serviceTicketDetail',
					component: () => import('../views/staff/ServiceTicketDetailView.vue')
				},
				{
					path: '/staff/invoices/:id',
					name: 'serviceInvoice',
					component: () => import('../views/staff/InvoiceDetail.vue')
				},
				{
					path: '/staff/service-tickets/create',
					name: 'serviceTicketCreate',
					component: () => import('../views/staff/CreateServiceTicketView.vue')
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
					component: () => import('../views/stocker/DashboardStocker.vue')
				}
			]
		},
		{
			path: '/mechanic',
			redirect: '/mechanic/dashboard',
			beforeEnter: requireAuth,
			meta: { role: 'MECHANIC' },
			children: [
				{
					path: 'dashboard',
					name: 'mechanicDashboard',
					component: () => import('../views/mechanic/DashboardMechanic.vue')
				},
				{
					path: '/mechanic/tasks',
					name: 'mechanic-tasks',
					component: () => import('../views/mechanic/MechanicTasksView.vue')
				},
				{
					path: '/mechanic/tasks/:id',
					name: 'mechanic-task-detail',
					component: () => import('../views/mechanic/MechanicTaskDetailView.vue')
				}
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
