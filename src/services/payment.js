import api from './api.js'

/**
 * Payment API Service
 * Dùng để tạo link thanh toán (VD: VNPay) cho hóa đơn.
 * Backend có thể thay đổi endpoint cho phù hợp.
 */
class PaymentService {
  /**
   * Tạo link thanh toán VNPay cho hóa đơn
   * @param {{ invoiceId: number | string }} payload
   * @returns {Promise<any>}
   */
  async createVnPay(payload) {
    // Backend: POST /api/payments/vnpay/create
    return await api.post('/payments/vnpay/create', payload)
  }
}

export default new PaymentService()


