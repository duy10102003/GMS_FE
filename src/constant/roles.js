/**
 * Định nghĩa các role trong hệ thống
 */
export const ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  MANAGER: 'manager',
  STOCKER: 'stocker',
  MECHANIC: 'mechanic',
  ADMIN: 'admin'
}

/**
 * Định nghĩa các quyền (permissions)
 */
export const PERMISSIONS = {
  // Customer permissions
  VIEW_OWN_VEHICLES: 'view_own_vehicles',
  CREATE_SERVICE_TICKET: 'create_service_ticket',
  VIEW_OWN_INVOICES: 'view_own_invoices',
  VIEW_OWN_PROFILE: 'view_own_profile',
  
  // Staff permissions
  VIEW_SERVICE_TICKETS: 'view_service_tickets',
  CREATE_SERVICE_TICKET: 'create_service_ticket',
  ASSIGN_MECHANIC: 'assign_mechanic',
  PROCESS_PAYMENT: 'process_payment',
  VIEW_INVENTORY_ALERTS: 'view_inventory_alerts',
  
  // Manager permissions
  VIEW_REPORTS: 'view_reports',
  MANAGE_STAFF: 'manage_staff',
  MANAGE_INVENTORY: 'manage_inventory',
  VIEW_REVENUE: 'view_revenue',
  APPROVE_RESTOCK: 'approve_restock',
  
  // Stoker permissions
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_PARTS: 'manage_parts',
  CREATE_RESTOCK_REQUEST: 'create_restock_request',
  UPDATE_STOCK_LEVELS: 'update_stock_levels',
  
  // Mechanic permissions
  VIEW_ASSIGNED_TICKETS: 'view_assigned_tickets',
  UPDATE_TICKET_STATUS: 'update_ticket_status',
  REPORT_COMPLETION: 'report_completion',
  VIEW_HISTORY: 'view_history',
  
  // Admin permissions
  MANAGE_ALL: 'manage_all'
}

/**
 * Mapping role với các permissions
 */
export const ROLE_PERMISSIONS = {
  [ROLES.CUSTOMER]: [
    PERMISSIONS.VIEW_OWN_VEHICLES,
    PERMISSIONS.CREATE_SERVICE_TICKET,
    PERMISSIONS.VIEW_OWN_INVOICES,
    PERMISSIONS.VIEW_OWN_PROFILE
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_SERVICE_TICKETS,
    PERMISSIONS.CREATE_SERVICE_TICKET,
    PERMISSIONS.ASSIGN_MECHANIC,
    PERMISSIONS.PROCESS_PAYMENT,
    PERMISSIONS.VIEW_INVENTORY_ALERTS
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.APPROVE_RESTOCK,
    PERMISSIONS.VIEW_SERVICE_TICKETS,
    PERMISSIONS.VIEW_INVENTORY_ALERTS
  ],
  [ROLES.STOCKER]: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_PARTS,
    PERMISSIONS.CREATE_RESTOCK_REQUEST,
    PERMISSIONS.UPDATE_STOCK_LEVELS
  ],
  [ROLES.MECHANIC]: [
    PERMISSIONS.VIEW_ASSIGNED_TICKETS,
    PERMISSIONS.UPDATE_TICKET_STATUS,
    PERMISSIONS.REPORT_COMPLETION,
    PERMISSIONS.VIEW_HISTORY
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_ALL
  ]
}

/**
 * Kiểm tra user có permission không
 */
export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false
  
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  
  // Admin có tất cả quyền
  if (userRole === ROLES.ADMIN) return true
  
  return rolePermissions.includes(permission)
}

/**
 * Kiểm tra user có một trong các roles không
 */
export function hasRole(userRole, roles) {
  if (!userRole || !Array.isArray(roles)) return false
  return roles.includes(userRole)
}

