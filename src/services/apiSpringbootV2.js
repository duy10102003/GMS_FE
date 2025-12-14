import { API_BASE_URL_SPRINGBOOT_V2 } from '../constant/api'

class ApiSpringbootV2Service {
	constructor() {
		this.baseURL = API_BASE_URL_SPRINGBOOT_V2
		this.token = this.getToken()
	}

	getToken() {
		return localStorage.getItem('accessToken') || localStorage.getItem('token') || null
	}

	setToken(token) {
		this.token = token
		if (token) {
			localStorage.setItem('accessToken', token)
			localStorage.setItem('token', token)
		} else {
			localStorage.removeItem('accessToken')
			localStorage.removeItem('token')
		}
	}

	getHeaders(customHeaders = {}) {
		const headers = {
			'Content-Type': 'application/json',
			...customHeaders
		}

		const token = this.getToken()
		if (token) {
			headers.Authorization = `Bearer ${token}`
		}

		return headers
	}

	async handleResponse(response) {
		const contentType = response.headers.get('content-type')

		if (!response.ok) {
			const errorData = contentType?.includes('application/json')
				? await response.json()
				: { message: response.statusText }

			if (response.status === 401) {
				this.setToken(null)
				window.location.href = '/login'
			}

			throw new Error(errorData.message || 'Co loi xay ra')
		}

		return contentType?.includes('application/json') ? await response.json() : await response.text()
	}

	async get(endpoint, params = {}) {
		const queryString = new URLSearchParams(params).toString()
		const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`

		const response = await fetch(url, {
			method: 'GET',
			headers: this.getHeaders()
		})

		return await this.handleResponse(response)
	}

	async post(endpoint, data = {}) {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'POST',
			headers: this.getHeaders(),
			body: JSON.stringify(data)
		})

		return await this.handleResponse(response)
	}

	async put(endpoint, data = {}) {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'PUT',
			headers: this.getHeaders(),
			body: JSON.stringify(data)
		})

		return await this.handleResponse(response)
	}

	async patch(endpoint, data = {}) {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'PATCH',
			headers: this.getHeaders(),
			body: JSON.stringify(data)
		})

		return await this.handleResponse(response)
	}

	async delete(endpoint) {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'DELETE',
			headers: this.getHeaders()
		})

		return await this.handleResponse(response)
	}

	async upload(endpoint, file, additionalData = {}) {
		const formData = new FormData()
		formData.append('file', file)

		Object.keys(additionalData).forEach((key) => {
			formData.append(key, additionalData[key])
		})

		const headers = {}
		const token = this.getToken()
		if (token) {
			headers.Authorization = `Bearer ${token}`
		}

		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'POST',
			headers,
			body: formData
		})

		return await this.handleResponse(response)
	}
}

export default new ApiSpringbootV2Service()
