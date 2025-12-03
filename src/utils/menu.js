import { ROLES, PERMISSIONS } from '../constant/roles.js'

/**
 * Menu items cho từng role
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
    label: 'Xe của tôi',
    icon: 'fa-car',
    path: '/customer/vehicles',
    permission: PERMISSIONS.VIEW_OWN_VEHICLES
  },
  {
    key: 'service-tickets',
    label: 'Lịch sử sửa chữa',
    icon: 'fa-wrench',
    path: '/customer/service-tickets',
    permission: PERMISSIONS.VIEW_OWN_INVOICES
  },
  {
    key: 'invoices',
    label: 'Hóa đơn',
    icon: 'fa-file-invoice',
    path: '/customer/invoices',
    permission: PERMISSIONS.VIEW_OWN_INVOICES
  },
  {
    key: 'contact',
    label: 'Liên hệ mua xe',
    icon: 'fa-phone',
    path: '/customer/contact',
    permission: PERMISSIONS.VIEW_OWN_PROFILE
  },
  {
    key: 'profile',
    label: 'Hồ sơ',
    icon: 'fa-user',
    path: '/customer/profile',
    permission: PERMISSIONS.VIEW_OWN_PROFILE
  }
]

export const STAFF_MENU = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'fa-gauge',
    path: '/staff/dashboard',
    permission: PERMISSIONS.VIEW_SERVICE_TICKETS
  },
  {
    key: 'service-tickets',
    label: 'Phiếu dịch vụ',
    icon: 'fa-clipboard-list',
    path: '/staff/service-tickets',
    permission: PERMISSIONS.VIEW_SERVICE_TICKETS
  },
  {
    key: 'payment',
    label: 'Thanh toán',
    icon: 'fa-credit-card',
    path: '/staff/payment',
    permission: PERMISSIONS.PROCESS_PAYMENT
  },
  {
    key: 'inventory-alerts',
    label: 'Cảnh báo kho',
    icon: 'fa-exclamation-triangle',
    path: '/staff/inventory-alerts',
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
    label: 'Báo cáo tổng hợp',
    icon: 'fa-chart-pie',
    path: '/manager/reports',
    permission: PERMISSIONS.VIEW_REPORTS
  },
  {
    key: 'staff',
    label: 'Nhân sự',
    icon: 'fa-users',
    path: '/manager/staff',
    permission: PERMISSIONS.MANAGE_STAFF
  },
  {
    key: 'inventory',
    label: 'Kho phụ tùng',
    icon: 'fa-warehouse',
    path: '/manager/inventory',
    permission: PERMISSIONS.MANAGE_INVENTORY,
    children: [
      {
        key: 'manage-parts',
        label: 'Quản lý phụ tùng',
        icon: 'fa-cogs',
        path: '/manager/inventory/parts',
        permission: PERMISSIONS.MANAGE_INVENTORY
      },
      {
        key: 'low-stock',
        label: 'Cảnh báo từ Staff',
        icon: 'fa-exclamation-triangle',
        path: '/manager/inventory/low-stock',
        permission: PERMISSIONS.VIEW_INVENTORY_ALERTS
      },
      {
        key: 'restock',
        label: 'Nhập kho',
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
    label: 'Dịch vụ garage',
    icon: 'fa-tools',
    path: '/manager/garage-services',
    permission: PERMISSIONS.VIEW_REPORTS
  },
  {
    key: 'settings',
    label: 'Cài đặt hệ thống',
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
    label: 'Kho hàng',
    icon: 'fa-warehouse',
    path: '/stocker/inventory',
    permission: PERMISSIONS.VIEW_INVENTORY
  },
  {
    key: 'part-categories',
    label: 'Danh mục phụ tùng',
    icon: 'fa-list',
    path: '/stocker/part-categories',
    permission: PERMISSIONS.MANAGE_PARTS
  },
  {
    key: 'parts',
    label: 'Quản lý phụ tùng',
    icon: 'fa-cogs',
    path: '/stocker/parts',
    permission: PERMISSIONS.MANAGE_PARTS
  },
  {
    key: 'restock-requests',
    label: 'Yêu cầu nhập kho',
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
    label: 'Phiếu dịch vụ',
    icon: 'fa-wrench',
    path: '/mechanic/tickets',
    permission: PERMISSIONS.VIEW_ASSIGNED_TICKETS
  },
  {
    key: 'history',
    label: 'Lịch sử',
    icon: 'fa-history',
    path: '/mechanic/history',
    permission: PERMISSIONS.VIEW_HISTORY
  }
]

/**
 * Lấy menu items dựa trên role
 */
export function getMenuByRole(role) {
  const menuMap = {
    [ROLES.CUSTOMER]: CUSTOMER_MENU,
    [ROLES.STAFF]: STAFF_MENU,
    [ROLES.MANAGER]: MANAGER_MENU,
    [ROLES.STOCKER]: STOCKER_MENU,
    [ROLES.MECHANIC]: MECHANIC_MENU
  }
  
  return menuMap[role] || []
}


