import api from './api.js'
import { API_ENDPOINTS } from '@/constant/api'

/**
 * Booking API Service
 * DÃ¹ng cho khÃ¡ch vÃ£ng lai vÃ  ngÆ°á»i dÃ¹ng Ä‘Ã£ Ä‘Äƒng nháº­p.
 */
class BookingService {
  /**
   * PhÃ¢n trang/tÃ¬m kiáº¿m booking
   * POST /api/Booking/paging
   */
  async getPaging(params) {
    return await api.post(API_ENDPOINTS.BOOKING.PAGING, params)
  }

  /**
   * Láº¥y booking theo email qua endpoint chuyÃªn biá»‡t (BE má»›i)
   * GET /api/Booking/by-email?email=...
   */
  async getByEmailDirect(email) {
    return await api.get(API_ENDPOINTS.BOOKING.BY_EMAIL, { email })
  }

  /**
   * Láº¥y chi tiáº¿t booking theo id
   * GET /api/Booking/{id}
   */
  async getById(id) {
    return await api.get(API_ENDPOINTS.BOOKING.BY_ID(id))
  }

  /**
   * Táº¡o booking cho khÃ¡ch vÃ£ng lai (guest)
   * POST /api/Booking/guest
   */
  async createByGuest(data) {
    return await api.post(API_ENDPOINTS.BOOKING.CREATE_GUEST, data)
  }

  /**
   * Táº¡o booking cho ngÆ°á»i dÃ¹ng Ä‘Ã£ Ä‘Äƒng nháº­p
   * POST /api/Booking/user
   */
  async createByUser(data) {
    return await api.post(API_ENDPOINTS.BOOKING.CREATE_USER, data)
  }

  /**
   * Cáº­p nháº­t booking
   * PUT /api/Booking/{id}
   */
  async update(id, data) {
    return await api.put(API_ENDPOINTS.BOOKING.UPDATE(id), data)
  }

  async updateStatus(id, data) {
    return await api.put(API_ENDPOINTS.BOOKING.STATUS(id), data)
  }

  /**
   * Há»§y/XÃ³a booking
   * DELETE /api/Booking/{id}
   */
  async delete(id) {
    return await api.delete(API_ENDPOINTS.BOOKING.DELETE(id))
  }
}

export default new BookingService()




