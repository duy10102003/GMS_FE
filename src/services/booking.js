import api from './api.js'
import { API_ENDPOINTS } from '@/constant/api'

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
    return await api.post(API_ENDPOINTS.BOOKING.PAGING, params)
  }

  /**
   * Lấy booking theo email qua endpoint chuyên biệt (BE mới)
   * GET /api/Booking/by-email?email=...
   */
  async getByEmailDirect(email) {
    return await api.get(API_ENDPOINTS.BOOKING.BY_EMAIL, { email })
  }

  /**
   * Lấy chi tiết booking theo id
   * GET /api/Booking/{id}
   */
  async getById(id) {
    return await api.get(API_ENDPOINTS.BOOKING.BY_ID(id))
  }

  /**
   * Tạo booking cho khách vãng lai (guest)
   * POST /api/Booking/guest
   */
  async createByGuest(data) {
    return await api.post(API_ENDPOINTS.BOOKING.CREATE_GUEST, data)
  }

  /**
   * Tạo booking cho người dùng đã đăng nhập
   * POST /api/Booking/user
   */
  async createByUser(data) {
    return await api.post(API_ENDPOINTS.BOOKING.CREATE_USER, data)
  }

  /**
   * Cập nhật booking
   * PUT /api/Booking/{id}
   */
  async update(id, data) {
    return await api.put(API_ENDPOINTS.BOOKING.UPDATE(id), data)
  }

  /**
   * Hủy/Xóa booking
   * DELETE /api/Booking/{id}
   */
  async delete(id) {
    return await api.delete(API_ENDPOINTS.BOOKING.DELETE(id))
  }
}

export default new BookingService()
