<template>
	<div class="dashboard-manager">
		<TheSideBar @logout="handleLogout" />
		<div class="dashboard-manager-body">
			<TheHeader @logout="handleLogout" />

			<main class="main-content">
				<div class="d-flex justify-content-between align-items-center mb-3">
					<h1 class="page-title mb-0">Dashboard Quan ly</h1>
					<nav class="breadcrumb mb-0">
						<span>
							<a href="#" class="text-primary text-decoration-none">Dashboard</a>
						</span>
						<span class="mx-2 text-muted">/</span>
						<a href="/template/manager/dashboard-manager.html" class="text-muted breadcrumb-link">Tong quan</a>
					</nav>
				</div>

				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-icon" style="background: rgba(255, 122, 0, 0.1); color: var(--primary)">
							<i class="fas fa-chart-line"></i>
						</div>
						<h6>Doanh thu thang nay</h6>
						<div class="value">182M</div>
						<div class="change positive">
							<i class="fas fa-arrow-up"></i>
							+15%
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-icon" style="background: rgba(16, 172, 132, 0.1); color: var(--success)">
							<i class="fas fa-wrench"></i>
						</div>
						<h6>Dich vu hoan thanh</h6>
						<div class="value">234</div>
						<div class="change positive">
							<i class="fas fa-arrow-up"></i>
							+8%
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-icon" style="background: rgba(84, 160, 255, 0.1); color: var(--info)">
							<i class="fas fa-car-side"></i>
						</div>
						<h6>Xe ban duoc</h6>
						<div class="value">28</div>
						<div class="change positive">
							<i class="fas fa-arrow-up"></i>
							+12%
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-icon" style="background: rgba(247, 183, 49, 0.1); color: var(--warning)">
							<i class="fas fa-users"></i>
						</div>
						<h6>Khach hang moi</h6>
						<div class="value">156</div>
						<div class="change positive">
							<i class="fas fa-arrow-up"></i>
							+24%
						</div>
					</div>
				</div>

				<div class="content-card">
					<div class="content-card-header">
						<h5>Hieu suat nhan su</h5>
						<button class="btn btn-primary">
							<i class="fas fa-chart-pie"></i>
							Xem chi tiet
						</button>
					</div>

					<table class="custom-table">
						<thead>
							<tr>
								<th>Ten nhan vien</th>
								<th>Vai tro</th>
								<th>Hieu suat</th>
								<th>Trang thai</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Tran The B</td>
								<td>Le tan</td>
								<td>92%</td>
								<td><span class="badge badge-completed">Tot</span></td>
							</tr>
							<tr>
								<td>Hoang Van E</td>
								<td>Tho sua chua</td>
								<td>95%</td>
								<td><span class="badge badge-approved">Xuat sac</span></td>
							</tr>
							<tr>
								<td>Do- Thi F</td>
								<td>Sale</td>
								<td>89%</td>
								<td><span class="badge badge-pending">Dang danh gia</span></td>
							</tr>
						</tbody>
					</table>
				</div>
			</main>
		</div>
	</div>
</template>

<script setup>
	import { confirmLogout, initNavBarActiveLink } from '@/assets/js/NavBarActiveLink'
	import '@/assets/style/MainDashboard.css'
	import TheHeader from '@/layout/TheHeader.vue'
	import TheSideBar from '@/layout/TheSideBar.vue'
	import { onBeforeUnmount, onMounted } from 'vue'

	let teardownNavLinks

	onMounted(() => {
		teardownNavLinks = initNavBarActiveLink()
	})

	onBeforeUnmount(() => {
		if (typeof teardownNavLinks === 'function') {
			teardownNavLinks()
		}
	})

	const handleLogout = () => {
		confirmLogout(() => {
			window.location.href = '/home'
		})
	}
</script>

<style scoped>
	.dashboard-manager {
		display: flex;
	}

	.dashboard-manager-body {
		flex: 1;
		margin-left: var(--sidebar-width, 260px);
		min-height: 100vh;
		background: #f8f9fc;
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 992px) {
		.dashboard-manager-body {
			margin-left: 0;
		}
	}
</style>
