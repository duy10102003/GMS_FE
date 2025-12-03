import { computed } from 'vue'
import authService from '../services/auth.js'
import { hasPermission, hasRole, ROLES } from '../constant/roles.js'

/**
 * Composable for permission checking
 */
export function usePermission() {
  const currentUser = computed(() => authService.getCurrentUser())
  const currentRole = computed(() => currentUser.value?.role || null)

  const checkPermission = (permission) => {
    if (!currentRole.value) return false
    return hasPermission(currentRole.value, permission)
  }

  const checkRole = (roles) => {
    if (!currentRole.value) return false
    const rolesArray = Array.isArray(roles) ? roles : [roles]
    return hasRole(currentRole.value, rolesArray)
  }

  const isCustomer = computed(() => checkRole(ROLES.CUSTOMER))
  const isStaff = computed(() => checkRole(ROLES.STAFF))
  const isManager = computed(() => checkRole(ROLES.MANAGER))
  const isStocker = computed(() => checkRole(ROLES.STOCKER))
  const isMechanic = computed(() => checkRole(ROLES.MECHANIC))
  const isAdmin = computed(() => checkRole(ROLES.ADMIN))

  return {
    currentUser,
    currentRole,
    checkPermission,
    checkRole,
    isCustomer,
    isStaff,
    isManager,
    isStocker,
    isMechanic,
    isAdmin
  }
}


