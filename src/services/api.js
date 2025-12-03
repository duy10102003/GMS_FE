import { API_BASE_URL } from '../constant/api.js'

/**
 * Base API Service
 * Xử lý tất cả các request đến backend
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = this.getToken()
  }

  /**
   * Lấy token từ localStorage
   */
  getToken() {
    return localStorage.getItem('token') || null
  }

  /**
   * Lưu token vào localStorage
   */
  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  /**
   * Lấy headers cho request
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  /**
   * Xử lý response
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type')
    
    if (!response.ok) {
      // Xử lý lỗi
      const errorData = contentType?.includes('application/json')
        ? await response.json()
        : { message: response.statusText }
      
      // Nếu token hết hạn, clear và redirect
      if (response.status === 401) {
        this.setToken(null)
        window.location.href = '/login'
      }
      
      throw new Error(errorData.message || 'Có lỗi xảy ra')
    }

    return contentType?.includes('application/json')
      ? await response.json()
      : await response.text()
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('GET Error:', error)
      throw error
    }
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('POST Error:', error)
      throw error
    }
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('PUT Error:', error)
      throw error
    }
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('PATCH Error:', error)
      throw error
    }
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('DELETE Error:', error)
      throw error
    }
  }

  /**
   * Upload file
   */
  async upload(endpoint, file, additionalData = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key])
      })

      const headers = {}
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Upload Error:', error)
      throw error
    }
  }
}

// Export singleton instance
export default new ApiService()


