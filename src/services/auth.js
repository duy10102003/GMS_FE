import api from './api.js'
import { API_ENDPOINTS, API_BASE_URL_SPRINGBOOT } from '../constant/api.js'

/**
 * Auth Service
 * Xử lý authentication và user management
 */
class AuthService {
  /**
   * Đăng nhập
   */
  async login(credentials) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials)

      if (response.token) {
        api.setToken(response.token)
        this.saveUser(response.user)
      }

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Đăng xuất - Gọi API logout và clear session ở FE
   * @param {boolean} redirect - Có redirect về home không (default: true)
   */
  async logout(redirect = true) {
    try {
      // Gọi API logout đến Spring Boot (port 8888) để revoke token ở BE
      const token = this.getToken()
      if (token) {
        try {
          // Gọi trực tiếp với fetch để đảm bảo gọi đúng endpoint
          await fetch(`${API_BASE_URL_SPRINGBOOT}${API_ENDPOINTS.AUTH.LOGOUT}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })

          // Không cần check response.ok vì BE đã xử lý revoke token
          // Chỉ cần clear session ở FE
        } catch (apiError) {
          console.warn('Logout API call failed, but clearing session anyway:', apiError)
        }
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Luôn clear session ở FE dù API call có thành công hay không
      this.clearSession()

      // Hiển thị toast thành công trước khi redirect
      try {
        const { useToast } = await import('../composables/useToast')
        const toast = useToast()
        toast.success('Đăng xuất thành công', 'Hẹn gặp lại!')

        // Delay một chút để toast hiển thị trước khi redirect
        setTimeout(() => {
          if (redirect) {
            window.location.href = '/'
          }
        }, 500)
      } catch (toastError) {
        // Nếu không thể hiển thị toast, redirect ngay
        if (redirect) {
          window.location.href = '/'
        }
      }
    }
  }

  /**
   * Clear toàn bộ session và token ở FE
   */
  clearSession() {
    // Clear token từ api service
    api.setToken(null)

    // Clear tất cả token và user data từ localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    // Clear user từ auth service
    this.clearUser()
  }

  /**
   * Lấy token từ localStorage
   */
  getToken() {
    // Ưu tiên lấy từ accessToken (Spring Boot API), nếu không có thì lấy từ token
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || null
  }

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.warn('Invalid user data in localStorage, clearing it.', error)
      localStorage.removeItem('user')
      return null
    }
  }

  /**
   * Lưu thông tin user
   */
  saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user))
  }

  /**
   * Xóa thông tin user
   */
  clearUser() {
    localStorage.removeItem('user')
  }

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isAuthenticated() {
    return !!api.getToken() && !!this.getCurrentUser()
  }

  /**
   * Lấy role của user hiện tại
   */
  getCurrentRole() {
    const user = this.getCurrentUser()
    return user?.role || null
  }

  /**
   * Refresh token
   */
  async refreshToken() {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH)
      if (response.token) {
        api.setToken(response.token)
      }
      return response
    } catch (error) {
      this.logout()
      throw error
    }
  }

  /**
   * Lấy profile
   */
  async getProfile() {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE)
      this.saveUser(response)
      return response
    } catch (error) {
      throw error
    }
  }
}

export default new AuthService()



