import api from './api.js'

/**
 * Vehicle API Service
 */
class VehicleService {
  /**
   * Tìm kiếm Vehicle cho Select
   * POST /api/Vehicle/search
   */
  async search(searchKeyword = '', customerId = null, limit = 50) {
    return await api.post('/Vehicle/search', {
      searchKeyword,
      customerId,
      limit
    })
  }

  /**
   * Lấy chi tiết Vehicle
   */
  async getById(id) {
    return await api.get(`/Vehicle/${id}`)
  }

  /**
   * Tạo mới Vehicle
   */
  async create(data) {
    return await api.post('/Vehicle', data)
  }

  /**
   * Cập nhật Vehicle
   */
  async update(id, data) {
    return await api.put(`/Vehicle/${id}`, data)
  }
}

export default new VehicleService()

