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
				await api.post('/auth/logout')
			} catch (err) {
				console.log('Logout API error:', err.response?.data)
			}
		},

		// Step 4: FE logout
		async logout() {
			await this.logoutCall()

			this.accessToken = null
			this.refreshToken = null
			this.user = null

			localStorage.removeItem('accessToken')
			localStorage.removeItem('refreshToken')
			localStorage.removeItem('user')
		}
	}
})
