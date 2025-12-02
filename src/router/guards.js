import { ROLES, hasPermission, hasRole } from '../constant/roles.js'
import authService from '../services/auth.js'

/**
 * Router guard để kiểm tra authentication
 */
export function requireAuth(to, from, next) {
  if (authService.isAuthenticated()) {
    next()
  } else {
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
}

/**
 * Router guard để kiểm tra role
 */
export function requireRole(...roles) {
  return (to, from, next) => {
    if (!authService.isAuthenticated()) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    const userRole = authService.getCurrentRole()
    if (hasRole(userRole, roles)) {
      next()
    } else {
      next({ name: 'forbidden' })
    }
  }
}

/**
 * Router guard để kiểm tra permission
 */
export function requirePermission(permission) {
  return (to, from, next) => {
    if (!authService.isAuthenticated()) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    const userRole = authService.getCurrentRole()
    if (hasPermission(userRole, permission)) {
      next()
    } else {
      next({ name: 'forbidden' })
    }
  }
}

/**
 * Router guard cho customer
 */
export const requireCustomer = requireRole(ROLES.CUSTOMER)

/**
 * Router guard cho staff
 */
export const requireStaff = requireRole(ROLES.STAFF)

/**
 * Router guard cho manager
 */
export const requireManager = requireRole(ROLES.MANAGER)

/**
 * Router guard cho stocker
 */
export const requireStocker = requireRole(ROLES.STOCKER)

/**
 * Router guard cho mechanic
 */
export const requireMechanic = requireRole(ROLES.MECHANIC)

