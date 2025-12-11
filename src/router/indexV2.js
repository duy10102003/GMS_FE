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
				},
				{
					path: 'mechanic-roles',
					name: 'managerMechanicRoles',
					component: () => import('../views/manager/MechanicRolesView.vue')
				},
				{
					path: 'mechanic-roles/:id/mechanics',
					name: 'managerMechanicRoleMechanics',
					component: () => import('../views/manager/MechanicRoleMechanicsView.vue'),
					props: true
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
					path: 'bookings',
					name: 'staffBookings',
					component: () => import('../views/staff/BookingListStaffView.vue')
				},
				{
					path: '/staff/bookings/:id',
					name: 'staffBookingDetail',
					component: () => import('../views/customer/BookingDetailView.vue')
				},
				{
					path: '/staff/bookings/:id/edit',
					name: 'staffBookingEdit',
					component: () => import('../views/customer/BookingEditView.vue')
				},
				{
					path: '/staff/service-tickets/:id',
					name: 'serviceTicketDetail',
					component: () => import('../views/staff/ServiceTicketDetailView.vue')
				},
				{
					path: '/staff/invoices',
					name: 'staffInvoices',
					component: () => import('../views/staff/InvoicesView.vue')
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
				},
				{
					path: 'bookings',
					name: 'customerBookings',
					component: () => import('../views/customer/BookingManagementView.vue')
				},
				{
					path: 'booking/all',
					name: 'customerBookingList',
					component: () => import('../views/customer/BookingListView.vue')
				},
				{
					path: 'booking/:id',
					name: 'customerBookingDetail',
					component: () => import('../views/customer/BookingDetailView.vue')
				},
				{
					path: 'booking/:id/edit',
					name: 'customerBookingEdit',
					component: () => import('../views/customer/BookingEditView.vue')
				},
				{
					path: 'service-tickets',
					name: 'customerServiceTickets',
					component: () => import('../views/customer/CustomerServiceTicketsView.vue')
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
				},
				{
					path: '/stocker/parts',
					name: 'stockerParts',
					component: () => import('../views/stocker/PartsView.vue')
				},
				{
					path: '/stocker/part-categories',
					name: 'stockerPartCategories',
					component: () => import('../views/stocker/PartCategoriesView.vue')
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
		},
		{
			path: '/booking/Guest',
			name: 'bookingGuest',
			component: () => import('../views/customer/BookingCreateView.vue')
		}
	]
})

export default router
