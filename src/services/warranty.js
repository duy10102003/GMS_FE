import api from './api.js'

/**
 * Warranty API Service
 */
class WarrantyService {
  /**
   * Manager: paging tất cả warranty
   * POST /api/Warranty/paging
   */
  async getPaging(params) {
    return await api.post('/Warranty/paging', params)
  }

  /**
   * Customer: paging warranty theo user/customer
   * POST /api/Warranty/{userId}/customer/paging
   */
  async getPagingByCustomer(userId, params) {
    return await api.post(`/Warranty/${userId}/customer/paging`, params)
  }

  /**
   * Lấy chi tiết bảo hành theo id
   * GET /api/Warranty/{id}
   */
  async getById(id) {
    return await api.get(`/Warranty/${id}`)
  }
}

export default new WarrantyService()
