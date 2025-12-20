// src/stores/auth.js
import { defineStore } from 'pinia'
import api from '../services/apiSpringboot'

export const useAuthStore = defineStore('auth', {
	state: () => ({
		accessToken: localStorage.getItem('accessToken') || null,
		refreshToken: localStorage.getItem('refreshToken') || null,
		user: JSON.parse(localStorage.getItem('user')) || null,

		loading: false,
		error: null
	}),

	getters: {
		isAuthenticated: (state) => !!state.accessToken,
		role: (state) => state.user?.role || null
	},

	actions: {
		// Step 1: Request OTP
		async requestOtp(email) {
			this.loading = true
			this.error = null

			try {
				await api.post('/auth/login/request-otp', { email })
				return true
			} catch (err) {
				this.error = err.response?.data?.message || 'Không gửi được OTP'
				return false
			} finally {
				this.loading = false
			}
		},

		// Step 2: Verify OTP
		async verifyOtp(email, otp) {
			this.loading = true
			this.error = null

			try {
				const res = await api.post('/auth/login/verify-otp', { email, otp })
				const data = res.data.data

				this.accessToken = data.accessToken
				this.refreshToken = data.refreshToken
				this.user = {
					userId: data.userId,
					fullName: data.fullName,
					email: data.email,
					role: data.role
				}

				localStorage.setItem('accessToken', this.accessToken)
				localStorage.setItem('refreshToken', this.refreshToken)
				localStorage.setItem('user', JSON.stringify(this.user))

				return true
			} catch (err) {
				this.error = err.response?.data?.message || 'OTP sai'
				return false
			} finally {
				this.loading = false
			}
		},

		// Step 3: Call backend logout
		async logoutCall() {
			try {
				const token = this.accessToken || localStorage.getItem('accessToken')
				if (token) {
					// Gọi API logout đến Spring Boot (port 8888)
					const { API_BASE_URL_SPRINGBOOT } = await import('../constant/api')
					await fetch(`${API_BASE_URL_SPRINGBOOT}/auth/logout`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token}`
						}
					})
				}
			} catch (err) {
				console.warn('Logout API error (but continuing with FE cleanup):', err)
			}
		},

		// Step 4: FE logout
		async logout() {
			// Gọi API logout ở BE trước
			await this.logoutCall()

			// Clear state
			this.accessToken = null
			this.refreshToken = null
			this.user = null

			// Clear localStorage
			localStorage.removeItem('accessToken')
			localStorage.removeItem('refreshToken')
			localStorage.removeItem('user')
			localStorage.removeItem('token')
		}
	}
})
