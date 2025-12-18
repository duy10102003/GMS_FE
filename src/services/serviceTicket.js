import api from './api.js'

/**
 * Service Ticket API Service
 * Dựa trên API Documentation
 */
class ServiceTicketService {
  /**
   * Phân trang Service Ticket
   */
  async getPaging(params) {
    return await api.post('/ServiceTicket/paging', params)
  }

  /**
   * Phân trang Service Ticket theo Customer
   * POST /api/ServiceTicket/{customerId}/customer/paging
   */
  async getPagingByCustomer(customerId, params) {
    return await api.post(`/ServiceTicket/${customerId}/customer/paging`, params)
  }

  /**
   * Lấy chi tiết Service Ticket
   */
  async getById(id) {
    return await api.get(`/ServiceTicket/${id}`)
  }

  /**
   * Tạo Service Ticket (Staff)
   * POST /api/ServiceTicket
   */
  async create(data) {
    return await api.post('/ServiceTicket', data)
  }

  /**
   * Cập nhật Service Ticket (Staff)
   * PUT /api/ServiceTicket/{id}
   */
  async update(id, data) {
    return await api.put(`/ServiceTicket/${id}`, data)
  }

  /**
   * Chuyển Status - PendingTechnicalConfirmation (0)
   * PUT /api/ServiceTicket/{id}/status/pending
   */
  async setStatusPending(id, data) {
    return await api.put(`/ServiceTicket/${id}/status/pending`, data)
  }

  /**
   * Chuyển Status - AdjustedByTechnical (1)
   * PUT /api/ServiceTicket/{id}/status/adjusted
   */
  async setStatusAdjusted(id, data) {
    return await api.put(`/ServiceTicket/${id}/status/adjusted`, data)
  }

  /**
   * Chuyển Status - InProgress (2)
   * PUT /api/ServiceTicket/{id}/status/in-progress
   */
  async setStatusInProgress(id, data) {
    return await api.put(`/ServiceTicket/${id}/status/in-progress`, data)
  }

  /**
   * Chuyển Status - Completed (3)
   * PUT /api/ServiceTicket/{id}/status/completed
   */
  async setStatusCompleted(id, data) {
    return await api.put(`/ServiceTicket/${id}/status/completed`, data)
  }

  /**
   * Chuyển Status - Cancelled (4)
   * PUT /api/ServiceTicket/{id}/status/cancelled
   */
  async setStatusCancelled(id, data) {
    return await api.put(`/ServiceTicket/${id}/status/cancelled`, data)
  }

  /**
   * Assign Service Ticket cho Technical Staff
   * POST /api/ServiceTicket/{id}/assign
   */
  async assign(id, data) {
    return await api.post(`/ServiceTicket/${id}/assign`, data)
  }

  /**
   * Lấy danh sách task của mechanic (paging)
   * POST /api/ServiceTicket/mechanic/{mechanicId}/tasks
   */
  async getMechanicTasks(mechanicId, params) {
    return await api.post(`/ServiceTicket/mechanic/${mechanicId}/tasks`, params)
  }

  /**
   * Lấy chi tiết task của mechanic
   * GET /api/ServiceTicket/mechanic/{mechanicId}/tasks/{technicalTaskId}
   */
  async getMechanicTaskDetail(mechanicId, technicalTaskId) {
    return await api.get(`/ServiceTicket/mechanic/${mechanicId}/tasks/${technicalTaskId}`)
  }

  /**
   * Customer xác nhận Service Ticket
   * PUT /api/ServiceTicket/{id}/status/customerConfirm
   */
  async confirmByCustomer(id) {
    return await api.put(`/ServiceTicket/${id}/status/customerConfirm`)
  }

  /**
   * Xóa Service Ticket
   */
  async delete(id) {
    return await api.delete(`/ServiceTicket/${id}`)
  }
}

export default new ServiceTicketService()
