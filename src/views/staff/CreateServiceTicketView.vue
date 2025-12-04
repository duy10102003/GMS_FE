<template>
	<div class="create-service-ticket-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader title="Tạo phiếu dịch vụ mới" :show-search="false" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<div class="page-header">
					<GmsButton variant="outline" icon="fa-arrow-left" @click="$router.back()">Quay lại</GmsButton>
				</div>

				<div class="form-container">
					<form @submit.prevent="handleSubmit">
						<!-- Thông tin khách hàng -->
						<div class="form-section">
							<h5 class="section-title">
								<i class="fas fa-user me-2"></i>
								Thông tin khách hàng
							</h5>
							<div class="form-row">
								<div class="col-md-6">
									<label>Chọn khách hàng có sẵn (tùy chọn)</label>
									<select v-model="form.customerId" class="form-select" @change="handleCustomerSelect">
										<option value="">-- Chọn khách hàng --</option>
										<option v-for="customer in customers" :key="customer.customerId" :value="customer.customerId">{{ customer.customerName }} - {{ customer.customerPhone }}</option>
									</select>
								</div>
								<div class="col-md-6">
									<label>Hoặc tạo khách hàng mới</label>
									<GmsButton variant="outline" icon="fa-plus" @click="showNewCustomer = !showNewCustomer">
										{{ showNewCustomer ? 'Ẩn' : 'Tạo khách hàng mới' }}
									</GmsButton>
								</div>
							</div>

							<div v-if="showNewCustomer || !form.customerId" class="form-row mt-3">
								<div class="col-md-4">
									<GmsInput v-model="form.customerInfo.customerName" label="Họ và tên *" placeholder="Nhập họ tên khách hàng" :required="!form.customerId" />
								</div>
								<div class="col-md-4">
									<GmsInput v-model="form.customerInfo.customerPhone" label="Số điện thoại *" type="tel" placeholder="0912345678" :required="!form.customerId" />
								</div>
								<div class="col-md-4">
									<GmsInput v-model="form.customerInfo.customerEmail" label="Email" type="email" placeholder="email@example.com" />
								</div>
							</div>
						</div>

						<!-- Thông tin xe -->
						<div class="form-section">
							<h5 class="section-title">
								<i class="fas fa-car me-2"></i>
								Thông tin xe
							</h5>
							<div class="form-row">
								<div class="col-md-6">
									<label>Chọn xe có sẵn (tùy chọn)</label>
									<select v-model="form.vehicleId" class="form-select" @change="handleVehicleSelect">
										<option value="">-- Chọn xe --</option>
										<option v-for="vehicle in vehicles" :key="vehicle.vehicleId" :value="vehicle.vehicleId">{{ vehicle.vehicleName }} - {{ vehicle.vehicleLicensePlate }}</option>
									</select>
								</div>
								<div class="col-md-6">
									<label>Hoặc tạo xe mới</label>
									<GmsButton variant="outline" icon="fa-plus" @click="showNewVehicle = !showNewVehicle">
										{{ showNewVehicle ? 'Ẩn' : 'Tạo xe mới' }}
									</GmsButton>
								</div>
							</div>

							<div v-if="showNewVehicle || !form.vehicleId" class="form-row mt-3">
								<div class="col-md-3">
									<GmsInput v-model="form.vehicleInfo.vehicleName" label="Tên xe *" placeholder="Honda Civic" :required="!form.vehicleId" />
								</div>
								<div class="col-md-3">
									<GmsInput v-model="form.vehicleInfo.vehicleLicensePlate" label="Biển số *" placeholder="30A-12345" :required="!form.vehicleId" />
								</div>
								<div class="col-md-2">
									<GmsInput v-model="form.vehicleInfo.make" label="Hãng" placeholder="Honda" />
								</div>
								<div class="col-md-2">
									<GmsInput v-model="form.vehicleInfo.model" label="Model" placeholder="Civic" />
								</div>
								<div class="col-md-2">
									<GmsInput v-model.number="form.vehicleInfo.currentKm" label="Số km" type="number" placeholder="50000" />
								</div>
							</div>
						</div>

						<!-- Vấn đề ban đầu -->
						<div class="form-section">
							<h5 class="section-title">
								<i class="fas fa-exclamation-circle me-2"></i>
								Vấn đề ban đầu
							</h5>
							<div class="mb-3">
								<label class="form-label">Mô tả vấn đề *</label>
								<textarea v-model="form.initialIssue" class="form-control" rows="4" placeholder="Nhập mô tả vấn đề của xe..." required></textarea>
							</div>
						</div>

						<!-- Phân công thợ (tùy chọn) -->
						<div class="form-section">
							<h5 class="section-title">
								<i class="fas fa-user-cog me-2"></i>
								Phân công thợ (tùy chọn)
							</h5>
							<div class="form-row">
								<div class="col-md-6">
									<label>Chọn thợ</label>
									<select v-model="form.assignedToTechnical" class="form-select">
										<option value="">-- Chưa phân công --</option>
										<option v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.id">
											{{ mechanic.name }}
										</option>
									</select>
								</div>
								<div class="col-md-6">
									<GmsInput v-model="form.assignDescription" label="Mô tả công việc" placeholder="Nhập mô tả công việc cho thợ..." :disabled="!form.assignedToTechnical" />
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div class="form-actions">
							<GmsButton variant="outline" @click="$router.back()">Hủy</GmsButton>
							<GmsButton type="submit" variant="primary" :loading="submitting">Tạo phiếu dịch vụ</GmsButton>
						</div>
					</form>
				</div>
			</main>
		</div>

		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
	import { GmsButton, GmsInput, GmsToast } from '@/components'
	import { useToast } from '@/composables/useToast'
	import { TheHeader, TheSideBar } from '@/layout'
	import api from '@/services/api'
	import authService from '@/services/auth'
	import serviceTicketService from '@/services/serviceTicket'
	import { getMenuByRole } from '@/utils/menu'
	import { onMounted, ref } from 'vue'
	import { useRouter } from 'vue-router'

	const router = useRouter()
	const toastRef = ref(null)
	const toast = useToast()

	const sidebarCollapsed = ref(false)
	const submitting = ref(false)
	const showNewCustomer = ref(false)
	const showNewVehicle = ref(false)
	const menuItems = ref([])
	const customers = ref([])
	const vehicles = ref([])
	const mechanics = ref([])

	const form = ref({
		bookingId: null,
		customerId: null,
		customerInfo: {
			customerName: '',
			customerPhone: '',
			customerEmail: '',
			userId: null
		},
		vehicleId: null,
		vehicleInfo: {
			vehicleName: '',
			vehicleLicensePlate: '',
			currentKm: null,
			make: '',
			model: '',
			customerId: null
		},
		createdBy: null,
		initialIssue: '',
		assignedToTechnical: null,
		assignDescription: ''
	})

	const handleCustomerSelect = (event) => {
		const customerId = event.target.value
		if (customerId) {
			const customer = customers.value.find((c) => c.customerId === parseInt(customerId))
			if (customer) {
				form.value.customerInfo = {
					customerName: customer.customerName,
					customerPhone: customer.customerPhone,
					customerEmail: customer.customerEmail || '',
					userId: customer.userId
				}
			}
		}
	}

	const handleVehicleSelect = (event) => {
		const vehicleId = event.target.value
		if (vehicleId) {
			const vehicle = vehicles.value.find((v) => v.vehicleId === parseInt(vehicleId))
			if (vehicle) {
				form.value.vehicleInfo = {
					vehicleName: vehicle.vehicleName,
					vehicleLicensePlate: vehicle.vehicleLicensePlate,
					currentKm: vehicle.currentKm,
					make: vehicle.make || '',
					model: vehicle.model || '',
					customerId: vehicle.customerId
				}
			}
		}
	}

	const handleSubmit = async () => {
		// Validation
		if (!form.value.customerId && (!form.value.customerInfo.customerName || !form.value.customerInfo.customerPhone)) {
			toast.error('Vui lòng nhập đầy đủ thông tin khách hàng')
			return
		}

		if (!form.value.vehicleId && (!form.value.vehicleInfo.vehicleName || !form.value.vehicleInfo.vehicleLicensePlate)) {
			toast.error('Vui lòng nhập đầy đủ thông tin xe')
			return
		}

		if (!form.value.initialIssue.trim()) {
			toast.error('Vui lòng nhập mô tả vấn đề')
			return
		}

		try {
			submitting.value = true
			const currentUser = authService.getCurrentUser()
			form.value.createdBy = currentUser?.userId

			const response = await serviceTicketService.create(form.value)

			toast.success('Tạo phiếu dịch vụ thành công!')
			router.push(`/staff/service-tickets/${response.data.serviceTicketId}`)
		} catch (error) {
			toast.error('Lỗi khi tạo phiếu dịch vụ', error.message)
		} finally {
			submitting.value = false
		}
	}

	const loadCustomers = async () => {
		try {
			const response = await api.get('/customers')
			customers.value = response.data || response
		} catch (error) {
			console.error('Error loading customers:', error)
		}
	}

	const loadVehicles = async () => {
		try {
			const response = await api.get('/vehicles')
			vehicles.value = response.data || response
		} catch (error) {
			console.error('Error loading vehicles:', error)
		}
	}

	const loadMechanics = async () => {
		try {
			const response = await api.get('/mechanics')
			mechanics.value = response.data || response
		} catch (error) {
			console.error('Error loading mechanics:', error)
		}
	}

	const handleLogout = async () => {
		await authService.logout()
		router.push('/')
	}

	onMounted(async () => {
		if (toastRef.value) {
			const { setToastInstance } = await import('@/composables/useToast')
			setToastInstance(toastRef.value)
		}

		const user = authService.getCurrentUser()
		if (user) {
			menuItems.value = getMenuByRole(user.role)
		}

		await Promise.all([loadCustomers(), loadVehicles(), loadMechanics()])
	})
</script>

<style scoped>
	.create-service-ticket-view {
		min-height: 100vh;
		background: var(--light, #f8f9fa);
	}

	.content-wrapper {
		transition: margin-left 0.3s ease;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.form-container {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.form-section {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid #f0f0f0;
	}

	.form-section:last-child {
		border-bottom: none;
	}

	.section-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--dark, #2c3a47);
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
	}

	.form-row {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.form-row .col-md-2,
	.form-row .col-md-3,
	.form-row .col-md-4,
	.form-row .col-md-6 {
		flex: 1;
		min-width: 200px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #f0f0f0;
	}
</style>
