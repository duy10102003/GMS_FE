/**
 * API Configuration
 */
const DEFAULT_NODE_API = 'https://localhost:8080/api'
const DEFAULT_SPRINGBOOT_API = 'http://localhost:8888/api'
const DEFAULT_SPRINGBOOT_V2_API = 'http://localhost:6868/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_NODE_API

export const API_BASE_URL_SPRINGBOOT = import.meta.env.VITE_API_BASE_URL_SPRINGBOOT?.trim() || import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_SPRINGBOOT_API

export const API_BASE_URL_SPRINGBOOT_V2 =
	import.meta.env.VITE_API_BASE_URL_SPRINGBOOT_V2?.trim() ||
	import.meta.env.VITE_PART_CATEGORY_API?.trim() ||
	DEFAULT_SPRINGBOOT_V2_API

export const API_ENDPOINTS = {
	// Auth
	AUTH: {
		LOGIN: '/auth/login',
		LOGOUT: '/auth/logout',
		REFRESH: '/auth/refresh',
		REGISTER: '/auth/register',
		PROFILE: '/auth/profile'
	},

	// Customer
	CUSTOMER: {
		VEHICLES: '/customers/vehicles',
		SERVICE_TICKETS: '/customers/service-tickets',
		INVOICES: '/customers/invoices',
		PROFILE: '/customers/profile'
	},

	// Staff
	STAFF: {
		SERVICE_TICKETS: '/staff/service-tickets',
		PAYMENTS: '/staff/payments',
		INVENTORY_ALERTS: '/staff/inventory-alerts'
	},

	// Manager
	MANAGER: {
		REPORTS: '/manager/reports',
		STAFF: '/manager/staff',
		INVENTORY: '/manager/inventory',
		REVENUE: '/manager/revenue',
		RESTOCK_APPROVALS: '/manager/restock-approvals'
	},

	// Stoker
	STOCKER: {
		INVENTORY: '/stocker/inventory',
		PARTS: '/stocker/parts',
		RESTOCK_REQUESTS: '/stocker/restock-requests',
		PARTCATEGORYS: '/stocker/part-categories'
	},

	// Mechanic
	MECHANIC: {
		TICKETS: '/mechanic/tickets',
		HISTORY: '/mechanic/history',
		SHIFT: '/mechanic/shift'
	},

	// Booking
	BOOKING: {
		PAGING: '/Booking/paging',
		BY_EMAIL: '/Booking/by-email',
		BY_ID: (id) => `/Booking/${id}`,
		STATUS: (id) => `/Booking/${id}/status`,
		CREATE_GUEST: '/Booking/guest',
		CREATE_USER: '/Booking/user',
		UPDATE: (id) => `/Booking/${id}`,
		DELETE: (id) => `/Booking/${id}`
	}
}
