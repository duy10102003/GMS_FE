import api from './api.js'

// SpringBoot V2 Part endpoints (Swagger: /api/Part/paging)
const RESOURCE = '/Part'

// Đơn giản như booking.js: chỉ gọi thẳng endpoint
class PartServiceV2 {
  async getPaging(params = {}) {
    const {
      page = 1,
      pageSize = 10,
      columnFilters = [],
      columnSorts = [],
      keyword,
      search,
      searchKeyword,
      filters,
      filtersKeyword
    } = params

    const body = {
      page: Math.max(1, Number(page)),
      pageSize: Number(pageSize) > 0 ? Number(pageSize) : 10
    }

    const keywordValue = filtersKeyword || keyword || search || searchKeyword || ''
    if (keywordValue) {
      body.keyword = keywordValue.trim()
    }

    const filtersPayload = Array.isArray(filters) && filters.length ? filters : columnFilters
    if (Array.isArray(filtersPayload) && filtersPayload.length) {
      body.columnFilters = filtersPayload
    }

    const sortsPayload = Array.isArray(columnSorts) && columnSorts.length ? columnSorts : []
    if (sortsPayload.length) {
      body.columnSorts = sortsPayload
    }

    return await api.post(`${RESOURCE}/paging`, body)
  }

  async list(params) {
    return await this.getPaging(params)
  }

  async getImportedAvailable(params) {
    return await api.get(`${RESOURCE}/imported-available`, params)
  }

  async getStockOutList(params) {
    return await api.get('/part-stock-out/list', params)
  }

  async getStockOutDetail(id) {
    return await api.get(`/part-stock-out/${id}`)
  }

  async createStockOutRequest(payload) {
    return await api.post('/part-stock-out', payload)
  }

  async getItemsForPricing(id) {
    return await api.get(`/part-stock-out/${id}/items-for-pricing`)
  }

  async updatePrices(id, payload) {
    return await api.put(`/part-stock-out/${id}/update-prices`, payload)
  }

  async confirmStockOut(id, payload) {
    return await api.put(`/part-stock-out/${id}/confirm`, payload)
  }

  async closeStockOut(id, payload) {
    return await api.put(`/part-stock-out/${id}/close`, payload)
  }

  async getSelect(params) {
    return await api.get(`${RESOURCE}/select`, params)
  }

  async search(keyword) {
    return await api.get(`${RESOURCE}/select`, { keyword })
  }

  async getById(id) {
    return await api.get(`${RESOURCE}/${id}`)
  }

  async create(data) {
    return await api.post(`${RESOURCE}`, data)
  }

  async update(id, data) {
    return await api.put(`${RESOURCE}/${id}`, data)
  }

  async delete(id) {
    return await api.delete(`${RESOURCE}/${id}`)
  }

  async checkCode(partCode, excludeId) {
    return await api.get(`${RESOURCE}/check-code`, { partCode, excludeId })
  }
}

export default new PartServiceV2()
