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
					path: 'price-requests',
					name: 'managerPriceRequests',
					component: () => import('../views/manager/ManagerSetPriceView.vue')
				},
				{
					path: 'report/mechanics',
					name: 'managerMechanicReport',
					component: () => import('../views/manager/MechanicReportView.vue')
				},
				{
					path: 'report/parts',
					name: 'managerPartsReport',
					component: () => import('../views/manager/PartsReportView.vue')
				},
				{
					path: 'warranties',
					name: 'managerWarranties',
					component: () => import('../views/manager/WarrantyListView.vue')
				},
				{
					path: 'warranties/:id',
					name: 'managerWarrantyDetail',
					component: () => import('../views/manager/WarrantyDetailView.vue'),
					props: true
				},
				{
					path: 'mechanic-roles',
					name: 'managerMechanicRoles',
					component: () => import('../views/manager/MechanicRolesView.vue')
				},				
				{
					path: 'mechanic-roles/:id/:roleName/mechanics',
					name: 'managerMechanicRoleMechanics',
					component: () => import('../views/manager/MechanicRoleMechanicsView.vue'),
					props: true
				},
				{
					path: 'invoices',
					name: 'customerInvoicesManagerView',
					component: () => import('../views/staff/InvoicesView.vue')
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
					path: 'report/bookings',
					name: 'staffBookingReport',
					component: () => import('../views/staff/BookingReportStaffView.vue')
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
				},
				{
					path: '/customer/service-tickets/:id',
					name: 'customerServiceTicketDetail',
					component: () => import('../views/customer/CustomerServiceTicketDetail.vue')
				},
				{
					path: 'invoices',
					name: 'customerInvoices',
					component: () => import('../views/customer/InvoiceListView.vue')
				},
				{
					path: 'invoices/:id',
					name: 'customerInvoiceDetail',
					component: () => import('../views/customer/InvoiceDetailView.vue')
				},
				{
					path: 'warranties',
					name: 'customerWarranties',
					component: () => import('../views/customer/WarrantyListView.vue')
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
					component: () => import('../views/stocker/PartsViewV2.vue')
				},
				{
					path: '/stocker/part-categories',
					name: 'stockerPartCategories',
					component: () => import('../views/stocker/PartCategoriesView.vue')
				},
				{
					path: '/stocker/part-categories-v2',
					name: 'stockerPartCategoriesV2',
					component: () => import('../views/stocker/PartCategoriesViewV2.vue')
				},
				{
					path: '/stocker/price-requests',
					name: 'stockerPriceRequests',
					component: () => import('../views/stocker/PartPriceRequestView.vue')
				},
				{
					path: '/stocker/category-test',
					name: 'stockerCategoryTest',
					component: () => import('../views/stocker/CategoryTest.vue')
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
			path: '/payment-success',
			name: 'paymentSuccess',
			component: () => import('../views/PaymentSuccessView.vue')
		},
		{
			path: '/booking/Guest',
			name: 'bookingGuest',
			component: () => import('../views/customer/BookingCreateView.vue')
		}
	]
})

export default router
