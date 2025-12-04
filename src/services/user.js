import api from './api.js'

/**
 * User API Service
 */
class UserService {
  /**
   * Lấy danh sách Technical Staff với trạng thái (role MECHANIC)
   * GET /api/User/technical-staff?roleName=MECHANIC
   */
  async getTechnicalStaff(roleName = 'MECHANIC') {
    return await api.get('/User/technical-staff', {
      roleName
    })
  }

  /**
   * Lấy danh sách Staff
   */
  async getStaff(roleName = 'Staff') {
    return await api.get('/User/staff', {
      roleName
    })
  }
}

export default new UserService()


