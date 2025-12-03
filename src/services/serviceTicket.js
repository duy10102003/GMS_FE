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
   * Lấy chi tiết Service Ticket
   */
  async getById(id) {
    return await api.get(`/ServiceTicket/${id}`)
  }

  /**
   * Tạo Service Ticket (Staff)
   */
  async create(data) {
    return await api.post('/ServiceTicket', data)
  }

  /**
   * Cập nhật Service Ticket (Staff)
   */
  async update(id, data) {
    return await api.put(`/ServiceTicket/${id}`, data)
  }

  /**
   * Assign Service Ticket cho Mechanic
   */
  async assign(id, data) {
    return await api.post(`/ServiceTicket/${id}/assign`, data)
  }

  /**
   * Thêm Part vào Service Ticket
   */
  async addPart(id, data) {
    return await api.post(`/ServiceTicket/${id}/parts`, data)
  }

  /**
   * Thêm Garage Service vào Service Ticket
   */
  async addGarageService(id, data) {
    return await api.post(`/ServiceTicket/${id}/garage-services`, data)
  }

  /**
   * Xóa Part/Service khỏi Service Ticket
   */
  async deleteDetail(id, detailId) {
    return await api.delete(`/ServiceTicket/${id}/details/${detailId}`)
  }

  /**
   * Duyệt đề xuất của Mechanic (Staff)
   */
  async approveProposal(technicalTaskId, staffId, data) {
    return await api.post(
      `/ServiceTicket/technical-tasks/${technicalTaskId}/approve?staffId=${staffId}`,
      data,
    )
  }

  /**
   * Lấy danh sách Tasks của Mechanic
   */
  async getMechanicTasks(mechanicId, params) {
    return await api.post(`/ServiceTicket/mechanic/${mechanicId}/tasks`, params)
  }

  /**
   * Lấy chi tiết Task của Mechanic
   */
  async getMechanicTaskDetail(mechanicId, technicalTaskId) {
    return await api.get(`/ServiceTicket/mechanic/${mechanicId}/tasks/${technicalTaskId}`)
  }

  /**
   * Đề xuất Parts/Services (Mechanic)
   */
  async proposePartsServices(technicalTaskId, mechanicId, data) {
    return await api.post(
      `/ServiceTicket/technical-tasks/${technicalTaskId}/propose?mechanicId=${mechanicId}`,
      data,
    )
  }

  /**
   * Bắt đầu Task (Mechanic)
   */
  async startTask(technicalTaskId, mechanicId) {
    return await api.post(
      `/ServiceTicket/technical-tasks/${technicalTaskId}/start?mechanicId=${mechanicId}`,
    )
  }

  /**
   * Confirm Task hoàn thành (Mechanic)
   */
  async confirmTask(technicalTaskId, mechanicId) {
    return await api.post(
      `/ServiceTicket/technical-tasks/${technicalTaskId}/confirm?mechanicId=${mechanicId}`,
    )
  }

  /**
   * Xóa Service Ticket
   */
  async delete(id) {
    return await api.delete(`/ServiceTicket/${id}`)
  }
}

export default new ServiceTicketService()
