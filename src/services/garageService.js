import api from './api.js'

/**
 * Garage Service API Service
 * Dựa trên API Documentation
 */
class GarageServiceService {
  /**
   * Phân trang Garage Service
   */
  async getPaging(params) {
    return await api.post('/GarageService/paging', params)
  }

  /**
   * Lấy chi tiết Garage Service
   */
  async getById(id) {
    return await api.get(`/GarageService/${id}`)
  }

  /**
   * Tạo mới Garage Service
   */
  async create(data) {
    return await api.post('/GarageService', data)
  }

  /**
   * Cập nhật Garage Service
   */
  async update(id, data) {
    return await api.put(`/GarageService/${id}`, data)
  }

  /**
   * Xóa Garage Service (soft delete)
   */
  async delete(id) {
    return await api.delete(`/GarageService/${id}`)
  }
}

export default new GarageServiceService()
