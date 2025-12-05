import api from './api.js'

/**
 * Booking API Service
 * Dùng cho khách vãng lai và người dùng đã đăng nhập.
 */
class BookingService {
  /**
   * Phân trang/tìm kiếm booking
   * POST /api/Booking/paging
   */
  async getPaging(params) {
    return await api.post('/Booking/paging', params)
  }
  /**
   * Lấy booking theo email qua endpoint chuyên biệt (BE mới)
   * GET /api/Booking/by-email?email=...
   */
  async getByEmailDirect(email) {
    return await api.get('/Booking/by-email', { email })
  }

  /**
   * Lấy chi tiết booking theo id
   * GET /api/Booking/{id}
   */
  async getById(id) {
    return await api.get(`/Booking/${id}`)
  }

  /**
   * Tạo booking cho khách vãng lai (guest)
   * POST /api/Booking/guest
   */
  async createByGuest(data) {
    return await api.post('/Booking/guest', data)
  }

  /**
   * Tạo booking cho người dùng đã đăng nhập
   * POST /api/Booking/user
   */
  async createByUser(data) {
    return await api.post('/Booking/user', data)
  }

  /**
   * Cập nhật booking
   * PUT /api/Booking/{id}
   */
  async update(id, data) {
    return await api.put(`/Booking/${id}`, data)
  }

  /**
   * Hủy/Xóa booking
   * DELETE /api/Booking/{id}
   */
  async delete(id) {
    return await api.delete(`/Booking/${id}`)
  }
}

export default new BookingService()
