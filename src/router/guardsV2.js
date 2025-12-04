import { useAuthStore } from '../stores/auth'

export function requireAuth(to, from, next) {
	const auth = useAuthStore()

	if (!auth.accessToken) return next('/login')

	if (to.meta.role && to.meta.role !== auth.role) {
		return next('/login')
	}

	next()
}
