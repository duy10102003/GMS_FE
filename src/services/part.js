import apiSpringbootV2 from './apiSpringbootV2'

const RESOURCE = '/parts'

const wrap = async (promise) => {
	const response = await promise
	return { data: response?.data ?? response }
}

/**
 * Part API Service (Spring Boot v2)
 */
class PartService {
	async getPaging(params = {}) {
		const {
			page = 1,
			pageSize = 10,
			columnFilters = [],
			columnSorts = [],
			sortBy,
			direction,
			keyword,
			search,
			searchKeyword,
			filters,
			filtersKeyword
		} = params

		const primarySort = columnSorts?.[0]
		const zeroBased = params.zeroBased === true
		const normalizedPage = zeroBased ? Math.max(0, Number(page)) : Math.max(0, Number(page) - 1)

		const body = {
			page: normalizedPage,
			size: Number(pageSize) > 0 ? Number(pageSize) : 10,
			sortBy: sortBy || primarySort?.columnName || 'partId',
			sortDirection: (direction || primarySort?.sortDirection || 'DESC').toUpperCase()
		}

		const keywordValue = filtersKeyword || keyword || search || searchKeyword || ''
		if (keywordValue) {
			body.keyword = keywordValue.trim()
		}

		const filtersPayload = Array.isArray(filters) && filters.length ? filters : columnFilters
		if (Array.isArray(filtersPayload) && filtersPayload.length) {
			body.filters = filtersPayload
			body.columnFilters = filtersPayload
		}

		return await wrap(apiSpringbootV2.post(`${RESOURCE}/paging`, body))
	}

	// Alias for compatibility
	async list(params = {}) {
		return this.getPaging(params)
	}

	async getAll({ size = 200, direction = 'ASC' } = {}) {
		return await this.getPaging({
			page: 0,
			pageSize: size,
			sortBy: 'partId',
			direction,
			zeroBased: true
		})
	}

	async filter(payload = {}) {
		return await wrap(apiSpringbootV2.post(`${RESOURCE}/filter`, payload))
	}

	async listWithPriceInfo(payload = {}) {
		return await wrap(apiSpringbootV2.post(`${RESOURCE}/list-with-price-info`, payload))
	}

	async getImportedAvailableFilter(payload = {}) {
		return await wrap(apiSpringbootV2.post(`${RESOURCE}/imported-available/filter`, payload))
	}

	async getImportedAvailable(params = {}) {
		const query = {
			page: Number(params.page) ?? 0,
			size: Number(params.size) ?? 10,
			direction: params.direction || 'DESC'
		}

		if (params.keyword) {
			query.keyword = params.keyword.trim()
		}

		return await wrap(apiSpringbootV2.get(`${RESOURCE}/imported-available`, query))
	}

	async getStockOutFilter(payload = {}) {
		return await wrap(apiSpringbootV2.post('/part-stock-out/filter', payload))
	}

	async getStockOutList(params = {}) {
		const query = {
			page: Number(params.page) ?? 0,
			size: Number(params.size) ?? 10,
			direction: params.direction || 'DESC'
		}

		if (params.keyword) {
			query.keyword = params.keyword.trim()
		}

		if (params.status && params.status !== 'ALL') {
			query.status = params.status
		}

		return await wrap(apiSpringbootV2.get('/part-stock-out/list', query))
	}

	async getStockOutDetail(id) {
		if (!id) {
			throw new Error('Missing stock-out id')
		}
		return await wrap(apiSpringbootV2.get(`/part-stock-out/${id}`))
	}

	async createStockOutRequest(payload = {}) {
		return await wrap(apiSpringbootV2.post('/part-stock-out', payload))
	}

	async getItemsForPricing(id) {
		if (!id) {
			throw new Error('Missing stock-out id')
		}
		return await wrap(apiSpringbootV2.get(`/part-stock-out/${id}/items-for-pricing`))
	}

	async updatePrices(id, payload = {}) {
		if (!id) {
			throw new Error('Missing stock-out id')
		}
		return await wrap(apiSpringbootV2.put(`/part-stock-out/${id}/update-prices`, payload))
	}

	async confirmStockOut(id, payload = {}) {
		if (!id) {
			throw new Error('Missing stock-out id')
		}
		return await wrap(apiSpringbootV2.put(`/part-stock-out/${id}/confirm`, payload))
	}

	async closeStockOut(id, payload = {}) {
		if (!id) {
			throw new Error('Missing stock-out id')
		}
		return await wrap(apiSpringbootV2.put(`/part-stock-out/${id}/close`, payload))
	}

	async getSelect(params = {}) {
		return await wrap(apiSpringbootV2.get(`${RESOURCE}/select`, params))
	}

	async search(searchKeyword = '', limit = 50) {
		const params = {}
		if (searchKeyword) {
			params.keyword = searchKeyword
		}
		if (limit) {
			params.limit = limit
		}
		return await this.getSelect(params)
	}

	async getById(id) {
		if (!id) {
			throw new Error('Missing part id')
		}
		return await wrap(apiSpringbootV2.get(`${RESOURCE}/${id}`))
	}

	async create(data) {
		return await wrap(apiSpringbootV2.post(`${RESOURCE}`, data))
	}

	async update(id, data) {
		if (!id) {
			throw new Error('Missing part id')
		}
		return await wrap(apiSpringbootV2.put(`${RESOURCE}/${id}`, data))
	}

	async delete(id) {
		if (!id) {
			throw new Error('Missing part id')
		}
		return await wrap(apiSpringbootV2.delete(`${RESOURCE}/${id}`))
	}

	async checkCode(partCode, excludeId = null) {
		if (!partCode) {
			return { data: { exists: false } }
		}

		const params = { partCode }
		if (excludeId) {
			params.excludeId = excludeId
		}
		return await wrap(apiSpringbootV2.get(`${RESOURCE}/check-code`, params))
	}

	/**
	 * Get price history for a part
	 * GET /api/parts/{id}/price-history
	 */
	async getPriceHistory(id) {
		if (!id) {
			throw new Error('Missing part id')
		}
		return await wrap(apiSpringbootV2.get(`${RESOURCE}/${id}/price-history`))
	}

	/**
	 * Update effective dates for parts in a stock-out
	 * PUT /api/part-stock-out/{id}/update-effective-dates
	 */
	async updateEffectiveDates(stockOutId, payload = {}) {
		if (!stockOutId) {
			throw new Error('Missing stock-out id')
		}
		return await wrap(apiSpringbootV2.put(`/part-stock-out/${stockOutId}/update-effective-dates`, payload))
	}

	/**
	 * Confirm scheduled price (change status from SCHEDULED to ACTIVE)
	 * PUT /api/parts/{id}/confirm-scheduled-price
	 */
	async confirmScheduledPrice(partId) {
		if (!partId) {
			throw new Error('Missing part id')
		}
		return await wrap(apiSpringbootV2.put(`${RESOURCE}/${partId}/confirm-scheduled-price`))
	}
}

export default new PartService()
