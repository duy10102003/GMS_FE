import apiSpringbootV2 from './apiSpringbootV2'

const RESOURCE = '/part-category'

const wrap = async (promise) => {
	const data = await promise
	return { data }
}

class PartCategoryService {
	async getList(params = {}) {
		return await wrap(apiSpringbootV2.get(`${RESOURCE}/list`, params))
	}

	async getSelect() {
		return await wrap(apiSpringbootV2.get(`${RESOURCE}/select`))
	}

	async paging(payload = {}) {
		return await wrap(apiSpringbootV2.post(`${RESOURCE}/paging`, payload))
	}

	async getAll() {
		const response = await this.getSelect()
		const payload = response?.data?.data || response?.data || []
		return { data: Array.isArray(payload) ? payload : payload.items || payload }
	}

	async getPaging({ page = 1, pageSize = 10, sortKey = 'partCategoryId', sortOrder = 'DESC', search = '' } = {}) {
		const params = {
			page: Math.max(0, page - 1),
			size: pageSize,
			sortBy: sortKey,
			direction: sortOrder
		}

		if (search) {
			params.search = search
			params.keyword = search
		}

		return await this.getList(params)
	}

	async getById(id) {
		return await wrap(apiSpringbootV2.get(`${RESOURCE}/${id}`))
	}

	async create(data) {
		return await wrap(apiSpringbootV2.post(`${RESOURCE}`, data))
	}

	async update(id, data) {
		return await wrap(apiSpringbootV2.put(`${RESOURCE}/${id}`, data))
	}

	async delete(id) {
		return await wrap(apiSpringbootV2.delete(`${RESOURCE}/${id}`))
	}

	async checkCode(partCategoryCode, excludeId = null) {
		if (!partCategoryCode) {
			return { data: { exists: false } }
		}

		const response = await this.getList({ page: 0, size: 200 })
		const payload = response?.data?.data || response?.data || []
		const items = payload.items || payload

		const exists = items.some((item) => {
			const sameCode =
				item.partCategoryCode?.toLowerCase().trim() === partCategoryCode.toLowerCase().trim()
			const differentId = !excludeId || Number(item.partCategoryId) !== Number(excludeId)
			return sameCode && differentId
		})

		return { data: { exists } }
	}
}

export default new PartCategoryService()
