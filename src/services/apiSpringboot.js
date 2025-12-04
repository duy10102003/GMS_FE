// src/services/apiSpringboot.js
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { API_BASE_URL_SPRINGBOOT } from '../constant/api'

const api = axios.create({
  baseURL: API_BASE_URL_SPRINGBOOT,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Gắn access token vào mỗi request
api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  const token = auth.accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Chuẩn hóa thông báo lỗi để UI hiển thị rõ ràng hơn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.response = {
        data: {
          message: 'Không thể kết nối tới máy chủ OTP. Kiểm tra lại API Spring Boot.'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
