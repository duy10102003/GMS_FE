import api from './api.js'

/**
 * Invoice API Service
 */
class InvoiceService {
  /**
   * Tạo Invoice từ Service Ticket
   * POST /api/Invoice
   */
  async create(data) {
    return await api.post('/Invoice', data)
  }

  /**
   * Lấy danh sách Invoice (Phân trang)
   * POST /api/Invoice/paging
   */
  async getPaging(params) {
    return await api.post('/Invoice/paging', params)
  }

  /**
   * Lấy chi tiết Invoice
   * GET /api/Invoice/{id}
   */
  async getById(id) {
    return await api.get(`/Invoice/${id}`)
  }

  /**
   * Cập nhật Invoice
   */
  async update(id, data) {
    return await api.put(`/Invoice/${id}`, data)
  }

  /**
   * Xóa Invoice
   */
  async delete(id) {
    return await api.delete(`/Invoice/${id}`)
  }

  /**
   * Xác nhận thanh toán Invoice
   * PUT /api/Invoice/{id}/status/paid?modifiedBy={userId}
   */
  async setStatusPaid(id, modifiedBy) {
    return await api.put(`/Invoice/${id}/status/paid?modifiedBy=${modifiedBy}`)
  }
}

export default new InvoiceService()


