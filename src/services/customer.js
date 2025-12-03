import api from './api.js'

/**
 * Customer API Service
 */
class CustomerService {
  /**
   * Tìm kiếm Customer cho Select
   * POST /api/Customer/search
   */
  async search(searchKeyword = '', limit = 50) {
    return await api.post('/Customer/search', {
      searchKeyword,
      limit
    })
  }

  /**
   * Lấy chi tiết Customer
   */
  async getById(id) {
    return await api.get(`/Customer/${id}`)
  }

  /**
   * Tạo mới Customer
   */
  async create(data) {
    return await api.post('/Customer', data)
  }

  /**
   * Cập nhật Customer
   */
  async update(id, data) {
    return await api.put(`/Customer/${id}`, data)
  }
}

export default new CustomerService()

