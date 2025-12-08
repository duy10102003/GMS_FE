import { ROLES, PERMISSIONS } from '../constant/roles.js'

/**
 * Menu items cho tá»«ng role
 */
export const CUSTOMER_MENU = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		icon: 'fa-gauge',
		path: '/customer/dashboard',
		permission: PERMISSIONS.VIEW_OWN_PROFILE
	},
	{
		key: 'vehicles',
		label: 'Xe cá»§a tÃ´i',
		icon: 'fa-car',
		path: '/customer/vehicles',
		permission: PERMISSIONS.VIEW_OWN_VEHICLES
	},
	{
		key: 'service-tickets',
		label: 'Lá»‹ch sá»­ sá»­a chá»¯a',
		icon: 'fa-wrench',
		path: '/customer/service-tickets',
		permission: PERMISSIONS.VIEW_OWN_INVOICES
	},
	{
		key: 'invoices',
		label: 'HÃ³a Ä‘Æ¡n',
		icon: 'fa-file-invoice',
		path: '/customer/invoices',
		permission: PERMISSIONS.VIEW_OWN_INVOICES
	},
	{
		key: 'contact',
		label: 'LiÃªn há»‡ mua xe',
		icon: 'fa-phone',
		path: '/customer/contact',
		permission: PERMISSIONS.VIEW_OWN_PROFILE
	},
	{
		key: 'profile',
		label: 'Há»“ sÆ¡',
		icon: 'fa-user',
		path: '/customer/profile',
		permission: PERMISSIONS.VIEW_OWN_PROFILE
	}
]

export const STAFF_MENU = [
	{
		key: "dashboard",
		label: "Dashboard",
		icon: "fa-gauge",
		path: "/staff/dashboard",
		permission: PERMISSIONS.VIEW_SERVICE_TICKETS
	},
	{
		key: "service-tickets",
		label: "Phieu dich vu",
		icon: "fa-clipboard-list",
		path: "/staff/service-tickets",
		permission: PERMISSIONS.VIEW_SERVICE_TICKETS
	},
	{
		key: "bookings",
		label: "Lich dat",
		icon: "fa-calendar-check",
		path: "/staff/bookings",
		permission: PERMISSIONS.VIEW_SERVICE_TICKETS
	},
	{
		key: "payment",
		label: "Thanh toan",
		icon: "fa-credit-card",
		path: "/staff/payment",
		permission: PERMISSIONS.PROCESS_PAYMENT
	},
	{
		key: "inventory-alerts",
		label: "Canh bao kho",
		icon: "fa-exclamation-triangle",
		path: "/staff/inventory-alerts",
		permission: PERMISSIONS.VIEW_INVENTORY_ALERTS
	}
]

export const MANAGER_MENU = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		icon: 'fa-gauge',
		path: '/manager/dashboard',
		permission: PERMISSIONS.VIEW_REPORTS
	},
	{
		key: 'reports',
		label: 'BÃ¡o cÃ¡o tá»•ng há»£p',
		icon: 'fa-chart-pie',
		path: '/manager/reports',
		permission: PERMISSIONS.VIEW_REPORTS
	},
	{
		key: 'staff',
		label: 'NhÃ¢n sá»±',
		icon: 'fa-users',
		path: '/manager/staff',
		permission: PERMISSIONS.MANAGE_STAFF
	},
	{
		key: 'inventory',
		label: 'Kho phá»¥ tÃ¹ng',
		icon: 'fa-warehouse',
		path: '/manager/inventory',
		permission: PERMISSIONS.MANAGE_INVENTORY,
		children: [
			{
				key: 'manage-parts',
				label: 'Quáº£n lÃ½ phá»¥ tÃ¹ng',
				icon: 'fa-cogs',
				path: '/manager/inventory/parts',
				permission: PERMISSIONS.MANAGE_INVENTORY
			},
			{
				key: 'low-stock',
				label: 'Cáº£nh bÃ¡o tá»« Staff',
				icon: 'fa-exclamation-triangle',
				path: '/manager/inventory/low-stock',
				permission: PERMISSIONS.VIEW_INVENTORY_ALERTS
			},
			{
				key: 'restock',
				label: 'Nháº­p kho',
				icon: 'fa-shopping-cart',
				path: '/manager/inventory/restock',
				permission: PERMISSIONS.APPROVE_RESTOCK
			}
		]
	},
	{
		key: 'revenue',
		label: 'Doanh thu',
		icon: 'fa-dollar-sign',
		path: '/manager/revenue',
		permission: PERMISSIONS.VIEW_REVENUE
	},
	{
		key: 'garage-services',
		label: 'Dá»‹ch vá»¥ garage',
		icon: 'fa-tools',
		path: '/manager/garage-services',
		permission: PERMISSIONS.VIEW_REPORTS
	},
	{
		key: 'settings',
		label: 'CÃ i Ä‘áº·t há»‡ thá»‘ng',
		icon: 'fa-cog',
		path: '/manager/settings',
		permission: PERMISSIONS.VIEW_REPORTS
	}
]

export const STOCKER_MENU = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		icon: 'fa-gauge',
		path: '/stocker/dashboard',
		permission: PERMISSIONS.VIEW_INVENTORY
	},
	{
		key: 'inventory',
		label: 'Kho hÃ ng',
		icon: 'fa-warehouse',
		path: '/stocker/inventory',
		permission: PERMISSIONS.VIEW_INVENTORY
	},
	{
		key: 'part-categories',
		label: 'Danh má»¥c phá»¥ tÃ¹ng',
		icon: 'fa-list',
		path: '/stocker/part-categories',
		permission: PERMISSIONS.MANAGE_PARTS
	},
	{
		key: 'parts',
		label: 'Quáº£n lÃ½ phá»¥ tÃ¹ng',
		icon: 'fa-cogs',
		path: '/stocker/parts',
		permission: PERMISSIONS.MANAGE_PARTS
	},
	{
		key: 'restock-requests',
		label: 'YÃªu cáº§u nháº­p kho',
		icon: 'fa-shopping-cart',
		path: '/stocker/restock-requests',
		permission: PERMISSIONS.CREATE_RESTOCK_REQUEST
	}
]

export const MECHANIC_MENU = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		icon: 'fa-gauge',
		path: '/mechanic/dashboard',
		permission: PERMISSIONS.VIEW_ASSIGNED_TICKETS
	},
	{
		key: 'tickets',
		label: 'Phiáº¿u dá»‹ch vá»¥',
		icon: 'fa-wrench',
		path: '/mechanic/tasks',
		permission: PERMISSIONS.VIEW_ASSIGNED_TICKETS
	},
	{
		key: 'history',
		label: 'Lá»‹ch sá»­',
		icon: 'fa-history',
		path: '/mechanic/history',
		permission: PERMISSIONS.VIEW_HISTORY
	}
]

/**
 * Láº¥y menu items dá»±a trÃªn role
 */
export function getMenuByRole(role) {
	if (!role) {
		console.warn('getMenuByRole: role is empty')
		return []
	}

	// Normalize role to lowercase for comparison
	const normalizedRole = role.toLowerCase().trim()

	const menuMap = {
		[ROLES.CUSTOMER]: CUSTOMER_MENU,
		[ROLES.STAFF]: STAFF_MENU,
		[ROLES.MANAGER]: MANAGER_MENU,
		[ROLES.STOCKER]: STOCKER_MENU,
		[ROLES.MECHANIC]: MECHANIC_MENU
	}

	// Try exact match first (case-sensitive)
	if (menuMap[role]) {
		return menuMap[role]
	}

	// Try normalized match (case-insensitive)
	if (menuMap[normalizedRole]) {
		return menuMap[normalizedRole]
	}

	// Try matching with ROLES constants
	const roleKeys = Object.keys(ROLES)
	for (const key of roleKeys) {
		if (ROLES[key].toLowerCase() === normalizedRole) {
			return menuMap[ROLES[key]] || []
		}
	}

	console.warn('getMenuByRole: No menu found for role:', role, 'normalized:', normalizedRole)
	return []
}


