import api from './api.js'
import { API_ENDPOINTS } from '../constant/api.js'
import { ROLES } from '../constant/roles.js'

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
   * Đăng xuất
   */
  async logout() {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      api.setToken(null)
      this.clearUser()
    }
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



