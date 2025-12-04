import api from './api.js'

/**
 * Technical Task API Service
 */
class TechnicalTaskService {
  /**
   * Lấy danh sách Technical Task (Phân trang)
   * POST /api/TechnicalTask/paging
   */
  async getPaging(params) {
    return await api.post('/TechnicalTask/paging', params)
  }

  /**
   * Lấy chi tiết Technical Task
   * GET /api/TechnicalTask/{id}
   */
  async getById(id) {
    return await api.get(`/TechnicalTask/${id}`)
  }

  /**
   * Technical Staff điều chỉnh Parts và Services
   * PUT /api/TechnicalTask/{id}/adjust
   */
  async adjust(id, data) {
    return await api.put(`/TechnicalTask/${id}/adjust`, data)
  }

  /**
   * Staff xác nhận điều chỉnh
   * PUT /api/TechnicalTask/{id}/confirm?confirmedBy={staffId}
   */
  async confirm(id, confirmedBy) {
    return await api.put(`/TechnicalTask/${id}/confirm?confirmedBy=${confirmedBy}`)
  }

  /**
   * Technical Staff hoàn thành công việc
   * PUT /api/TechnicalTask/{id}/complete
   */
  async complete(id) {
    return await api.put(`/TechnicalTask/${id}/complete`)
  }
}

export default new TechnicalTaskService()

