/**
 * API Configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

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
    RESTOCK_REQUESTS: '/stocker/restock-requests'
  },
  
  // Mechanic
  MECHANIC: {
    TICKETS: '/mechanic/tickets',
    HISTORY: '/mechanic/history',
    SHIFT: '/mechanic/shift'
  }
}

