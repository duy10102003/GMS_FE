import api from './api.js'

/**
 * Part Category API Service
 */
class PartCategoryService {
  /**
   * Lấy tất cả Part Category (cho select)
   */
  async getAll() {
    return await api.get('/PartCategory/all')
  }

  /**
   * Phân trang Part Category
   */
  async getPaging(params) {
    return await api.post('/PartCategory/paging', params)
  }

  /**
   * Lấy chi tiết Part Category
   */
  async getById(id) {
    return await api.get(`/PartCategory/${id}`)
  }

  /**
   * Tạo mới Part Category
   */
  async create(data) {
    return await api.post('/PartCategory', data)
  }

  /**
   * Cập nhật Part Category
   */
  async update(id, data) {
    return await api.put(`/PartCategory/${id}`, data)
  }

  /**
   * Xóa Part Category (soft delete)
   */
  async delete(id) {
    return await api.delete(`/PartCategory/${id}`)
  }

  /**
   * Kiểm tra mã Part Category trùng
   */
  async checkCode(partCategoryCode, excludeId = null) {
    const params = { partCategoryCode }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return await api.get('/PartCategory/check-code', { params })
  }
}

export default new PartCategoryService()


