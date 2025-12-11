import api from './api.js'

/**
 * Dịch vụ API cho vai trò thợ máy
 * Gọi các endpoint /MechanicRole
 */
class MechanicRoleService {
  /**
   * Lấy danh sách tất cả vai trò thợ máy
   * GET /api/MechanicRole
   */
  async getAll() {
    return await api.get('/MechanicRole')
  }

  /**
   * Lấy chi tiết một vai trò
   * GET /api/MechanicRole/{id}
   */
  async getById(id) {
    return await api.get(`/MechanicRole/${id}`)
  }

  /**
   * Tạo vai trò mới
   * POST /api/MechanicRole
   */
  async create(data) {
    return await api.post('/MechanicRole', data)
  }

  /**
   * Cập nhật vai trò
   * PUT /api/MechanicRole/{id}
   */
  async update(id, data) {
    return await api.put(`/MechanicRole/${id}`, data)
  }

  /**
   * Xóa vai trò
   * DELETE /api/MechanicRole/{id}
   */
  async delete(id) {
    return await api.delete(`/MechanicRole/${id}`)
  }

  /**
   * Lấy danh sách gán vai trò theo user
   * GET /api/MechanicRole/assignments/{userId}
   */
  async getAssignments(userId) {
    return await api.get(`/MechanicRole/assignments/${userId}`)
  }

  /**
   * Phân trang vai trò thợ máy
   * POST /api/MechanicRole/paging
   */
  async getPaging(params) {
    return await api.post('/MechanicRole/paging', params)
  }

  /**
   * Gán vai trò cho thợ
   * POST /api/MechanicRole/assign
   */
  async assign(data) {
    return await api.post('/MechanicRole/assign', data)
  }

  /**
   * Hủy gán vai trò
   * DELETE /api/MechanicRole/assign?userId=...&mechanicRoleId=...
   */
  async unassign({ userId, mechanicRoleId }) {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (mechanicRoleId) params.append('mechanicRoleId', mechanicRoleId)

    const query = params.toString()
    const endpoint = query ? `/MechanicRole/assign?${query}` : '/MechanicRole/assign'
    return await api.delete(endpoint)
  }

  /**
   * Lấy danh sách thợ theo role (để đếm)
   * GET /api/MechanicRole/{roleId}/mechanics
   */
  async getMechanicsByRoleId(roleId) {
    return await api.get(`/MechanicRole/${roleId}/mechanics`)
  }

  /**
   * Phân trang + lọc thợ theo vai trò
   * POST /api/MechanicRole/{roleId}/mechanics/paging
   */
  async getMechanicsPaging(roleId, payload) {
    return await api.post(`/MechanicRole/${roleId}/mechanics/paging`, payload)
  }
}

export default new MechanicRoleService()
