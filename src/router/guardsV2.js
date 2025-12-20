import { useAuthStore } from '../stores/auth'
import authService from '../services/auth'
import { useToast } from '../composables/useToast'

export function requireAuth(to, from, next) {
	const auth = useAuthStore()
	
	// Kiểm tra authentication
	if (!auth.accessToken && !authService.isAuthenticated()) {
		// Hiển thị toast nếu có thể
		try {
			const toast = useToast()
			toast.error('Bạn không có quyền truy cập', 'Vui lòng đăng nhập')
		} catch (error) {
			// Nếu toast chưa được khởi tạo, chỉ log
			console.warn('Toast not available:', error)
		}
		return next('/home')
	}

	// Kiểm tra role nếu route có yêu cầu role
	if (to.meta.role) {
		const userRole = auth.role || authService.getCurrentRole()
		if (userRole !== to.meta.role) {
			// Hiển thị toast nếu có thể
			try {
				const toast = useToast()
				toast.error('Bạn không có quyền truy cập', 'Không đủ quyền')
			} catch (error) {
				console.warn('Toast not available:', error)
			}
			return next('/home')
		}
	}

	next()
}
