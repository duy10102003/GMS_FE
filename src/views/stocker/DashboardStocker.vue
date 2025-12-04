<template>
	<div style="padding: 20px">
		<div class="header-row">
			<h1>Stocker Home</h1>
			<button class="logout-btn" @click="logout">Logout</button>
		</div>

		<div class="info-box">
			<p>
				<strong>User ID:</strong>
				{{ auth.user?.userId }}
			</p>
			<p>
				<strong>Full Name:</strong>
				{{ auth.user?.fullName }}
			</p>
			<p>
				<strong>Email:</strong>
				{{ auth.user?.email }}
			</p>
			<p>
				<strong>Role:</strong>
				{{ auth.user?.role }}
			</p>
		</div>
	</div>
</template>

<script setup>
	import { useRouter } from 'vue-router'
	import { useAuthStore } from '@/stores/auth'

	const router = useRouter()
	const auth = useAuthStore()

	const logout = () => {
		auth.logout()
		router.push('/login')
	}
</script>

<style>
	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logout-btn {
		background: #c62828;
		color: white;
		padding: 6px 14px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-weight: bold;
	}

	.logout-btn:hover {
		background: #b71c1c;
	}

	.info-box {
		background: #f4f4f4;
		padding: 15px;
		border-radius: 6px;
		margin-top: 20px;
		font-size: 18px;
	}
</style>
