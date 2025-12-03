import api from './api.js'

/**
 * Part API Service
 */
class PartService {
  /**
   * Lấy tất cả Part (cho select)
   */
  async getAll() {
    return await api.get('/Part/all')
  }

  /**
   * Phân trang Part
   */
  async getPaging(params) {
    return await api.post('/Part/paging', params)
  }

  /**
   * Lấy chi tiết Part
   */
  async getById(id) {
    return await api.get(`/Part/${id}`)
  }

  /**
   * Tạo mới Part
   */
  async create(data) {
    return await api.post('/Part', data)
  }

  /**
   * Cập nhật Part
   */
  async update(id, data) {
    return await api.put(`/Part/${id}`, data)
  }

  /**
   * Xóa Part (soft delete)
   */
  async delete(id) {
    return await api.delete(`/Part/${id}`)
  }

  /**
   * Kiểm tra mã Part trùng
   */
  async checkCode(partCode, excludeId = null) {
    const params = { partCode }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return await api.get('/Part/check-code', { params })
  }
}

export default new PartService()
