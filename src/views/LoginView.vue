<template>
	<div class="login-view">
		<h2>Đăng nhập bằng OTP</h2>

		<form class="card" @submit.prevent="sendOtp">
			<label class="field">
				<span>Email</span>
				<input v-model.trim="email" type="email" placeholder="manager1@fpt.edu.vn" />
			</label>

			<button type="submit" :disabled="auth.loading">
				{{ auth.loading ? 'Đang gửi...' : 'Gửi OTP' }}
			</button>

			<p v-if="localError" class="error">{{ localError }}</p>
			<p v-else-if="auth.error" class="error">{{ auth.error }}</p>
		</form>
	</div>
</template>

<script setup>
	import { ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { useAuthStore } from '../stores/auth'

	const router = useRouter()
	const auth = useAuthStore()

	const email = ref('manager1@fpt.edu.vn')
	const localError = ref('')

	const sendOtp = async () => {
		localError.value = ''

		if (!email.value) {
			localError.value = 'Vui lòng nhập email FPT để nhận OTP'
			return
		}

		const ok = await auth.requestOtp(email.value)
		if (ok) {
			router.push({ name: 'verifyOtp', query: { email: email.value } })
		}
	}
</script>

<style scoped>
	.login-view {
		max-width: 420px;
		margin: 80px auto;
		padding: 0 16px;
		text-align: center;
	}

	.card {
		margin-top: 24px;
		padding: 24px;
		border: 1px solid #e4e7ec;
		border-radius: 12px;
		background: #fff;
		box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
	}

	.field {
		display: flex;
		flex-direction: column;
		text-align: left;
		gap: 6px;
	}

	input {
		width: 100%;
		padding: 10px 12px;
		border-radius: 8px;
		border: 1px solid #cbd5f5;
		background: #f5f8ff;
	}

	button {
		width: 100%;
		margin-top: 16px;
		padding: 10px 0;
		border: none;
		border-radius: 8px;
		background: #2563eb;
		color: #fff;
		font-weight: 600;
		cursor: pointer;
	}

	button:disabled {
		background: #94a3b8;
		cursor: not-allowed;
	}

	.error {
		margin-top: 12px;
		color: #ef4444;
	}
</style>
