<template>
	<div class="invoice-detail-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader :title="`Hóa đơn #${invoice?.invoiceCode || invoice?.invoiceId || ''}`" :show-search="false" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<div class="detail-header">
					<GmsButton variant="outline" icon="fa-arrow-left" @click="goBack">Quay về trang chủ</GmsButton>
					<div class="header-actions">
						<GmsButton v-if="canPay" variant="success" icon="fa-check" :loading="paying" @click="handlePay">Xác nhận thanh toán</GmsButton>
						<GmsButton variant="primary" icon="fa-print" @click="handlePrint">In hóa đơn</GmsButton>
					</div>
				</div>

				<div v-if="loading" class="loading-state">
					<i class="fas fa-spinner fa-spin"></i>
					<span>Đang tải...</span>
				</div>

				<div v-else-if="invoice" class="invoice-content" id="invoice-print">
					<!-- Invoice Header -->
					<div class="invoice-header">
						<div class="invoice-title">
							<h1>HÓA ĐƠN DỊCH VỤ</h1>
							<p class="invoice-code">Mã hóa đơn: {{ invoice.invoiceCode || `INV-${invoice.invoiceId}` }}</p>
						</div>
						<div class="invoice-date">
							<p><strong>Ngày xuất:</strong> {{ formatDate(invoice.issueDate) }}</p>
							<p v-if="invoice.serviceTicketCode"><strong>Mã phiếu:</strong> {{ invoice.serviceTicketCode }}</p>
						</div>
					</div>

					<!-- Customer & Vehicle Info -->
					<div class="info-section">
						<div class="info-block">
							<h3>Thông tin khách hàng</h3>
							<p><strong>Tên:</strong> {{ invoice.customer?.customerName || 'N/A' }}</p>
							<p><strong>Điện thoại:</strong> {{ invoice.customer?.customerPhone || 'N/A' }}</p>
							<p v-if="invoice.customer?.customerEmail"><strong>Email:</strong> {{ invoice.customer.customerEmail }}</p>
						</div>
						<div class="info-block">
							<h3>Thông tin xe</h3>
							<p><strong>Tên xe:</strong> {{ invoice.vehicle?.vehicleName || 'N/A' }}</p>
							<p><strong>Biển số:</strong> {{ invoice.vehicle?.vehicleLicensePlate || 'N/A' }}</p>
							<p v-if="invoice.vehicle?.make"><strong>Hãng:</strong> {{ invoice.vehicle.make }}</p>
							<p v-if="invoice.vehicle?.model"><strong>Model:</strong> {{ invoice.vehicle.model }}</p>
							<p v-if="invoice.vehicle?.currentKm"><strong>Số km:</strong> {{ invoice.vehicle.currentKm.toLocaleString() }} km</p>
						</div>
					</div>

					<!-- Parts Table -->
					<div v-if="invoice.parts && invoice.parts.length > 0" class="table-section">
						<h3>Phụ tùng</h3>
						<table class="invoice-table">
							<thead>
								<tr>
									<th>STT</th>
									<th>Mã phụ tùng</th>
									<th>Tên phụ tùng</th>
									<th>Danh mục</th>
									<th>Đơn vị</th>
									<th>Số lượng</th>
									<th>Đơn giá</th>
									<th>Thành tiền</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(item, index) in invoice.parts" :key="item.serviceTicketDetailId">
									<td>{{ index + 1 }}</td>
									<td>{{ item.part?.partCode || 'N/A' }}</td>
									<td>{{ item.part?.partName || 'N/A' }}</td>
									<td>{{ item.part?.partCategory?.partCategoryName || 'N/A' }}</td>
									<td>{{ item.part?.partUnit || 'N/A' }}</td>
									<td>{{ item.quantity }}</td>
									<td>{{ formatCurrency(item.part?.partPrice || 0) }}</td>
									<td>{{ formatCurrency((item.part?.partPrice || 0) * item.quantity) }}</td>
								</tr>
							</tbody>
						</table>
					</div>

					<!-- Garage Services Table -->
					<div v-if="invoice.garageServices && invoice.garageServices.length > 0" class="table-section">
						<h3>Dịch vụ</h3>
						<table class="invoice-table">
							<thead>
								<tr>
									<th>STT</th>
									<th>Mã dịch vụ</th>
									<th>Tên dịch vụ</th>
									<th>Mô tả</th>
									<th>Giá</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(service, index) in invoice.garageServices" :key="service.garageServiceId || index">
									<td>{{ index + 1 }}</td>
									<td>{{ service.garageServiceCode || 'N/A' }}</td>
									<td>{{ service.garageServiceName || 'N/A' }}</td>
									<td>{{ service.description || 'N/A' }}</td>
									<td>{{ formatCurrency(service.price || 0) }}</td>
								</tr>
							</tbody>
						</table>
					</div>

					<!-- Invoice Summary -->
					<div class="invoice-summary">
						<div class="summary-row">
							<span>Tổng tiền phụ tùng:</span>
							<span>{{ formatCurrency(invoice.partsAmount || 0) }}</span>
						</div>
						<div class="summary-row">
							<span>Tổng tiền dịch vụ:</span>
							<span>{{ formatCurrency(invoice.garageServiceAmount || 0) }}</span>
						</div>
						<div class="summary-row">
							<span>Tổng tiền trước thuế:</span>
							<span>{{ formatCurrency((invoice.partsAmount || 0) + (invoice.garageServiceAmount || 0)) }}</span>
						</div>
						<div class="summary-row">
							<span>Giảm giá:</span>
							<span>-{{ formatCurrency(invoice.discountAmount || 0) }}</span>
						</div>
						<div class="summary-row">
							<span>Thuế VAT (10%):</span>
							<span>{{ formatCurrency(invoice.taxAmount || 0) }}</span>
						</div>
						<div class="summary-row total">
							<span><strong>Tổng cộng:</strong></span>
							<span><strong>{{ formatCurrency(invoice.totalAmount || 0) }}</strong></span>
						</div>
					</div>

					<!-- Invoice Status -->
					<div class="invoice-status">
						<p><strong>Trạng thái:</strong> 
							<span :class="`status-badge status-${getInvoiceStatusClass(invoice.invoiceStatus)}`">
								{{ getInvoiceStatusLabel(invoice.invoiceStatus) }}
							</span>
						</p>
					</div>
				</div>

				<div v-else class="empty-state">
					<i class="fas fa-file-invoice"></i>
					<p>Không tìm thấy hóa đơn</p>
				</div>
			</main>
		</div>

		<!-- Toast -->
		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { TheHeader, TheSideBar } from '@/layout'
	import { GmsButton, GmsToast } from '@/components'
	import { useToast } from '@/composables/useToast'
	import { getMenuByRole } from '@/utils/menu'
	import authService from '@/services/auth'
	import invoiceService from '@/services/invoice'

	const route = useRoute()
	const router = useRouter()
	const toastRef = ref(null)
	const toast = useToast()

	const sidebarCollapsed = ref(false)
	const loading = ref(false)
	const paying = ref(false)
	const invoice = ref(null)
	const menuItems = ref([])

	// Computed
	const canPay = computed(() => {
		// Chỉ cho phép thanh toán khi invoice chưa được thanh toán (status = 0)
		return invoice.value?.invoiceStatus === 0
	})

	// Methods
	const formatDate = (date) => {
		if (!date) return 'N/A'
		return new Date(date).toLocaleString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(amount)
	}

	const getInvoiceStatusLabel = (status) => {
		const labels = {
			0: 'Chưa thanh toán',
			1: 'Đã thanh toán',
			2: 'Đã hủy'
		}
		return labels[status] || 'N/A'
	}

	const getInvoiceStatusClass = (status) => {
		const classes = {
			0: 'pending',
			1: 'paid',
			2: 'cancelled'
		}
		return classes[status] || 'unknown'
	}

	const loadInvoice = async () => {
		const invoiceId = route.params.id
		if (!invoiceId) {
			toast.error('Không tìm thấy ID hóa đơn')
			return
		}

		try {
			loading.value = true
			const response = await invoiceService.getById(invoiceId)
			invoice.value = response.data
		} catch (error) {
			toast.error('Lỗi khi tải hóa đơn', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			loading.value = false
		}
	}

	const handlePay = async () => {
		if (!invoice.value) return

		if (!confirm('Bạn có chắc chắn muốn xác nhận thanh toán hóa đơn này?')) {
			return
		}

		try {
			paying.value = true
			const currentUser = authService.getCurrentUser()
			const modifiedBy = currentUser?.userId || 1

			await invoiceService.setStatusPaid(invoice.value.invoiceId, modifiedBy)
			toast.success('Xác nhận thanh toán thành công!', 'Hóa đơn đã được đánh dấu là đã thanh toán')
			await loadInvoice()
		} catch (error) {
			toast.error('Lỗi khi xác nhận thanh toán', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			paying.value = false
		}
	}

	const handlePrint = () => {
		window.print()
	}

	const goBack = () => {
		router.push('/staff/dashboard')
	}

	const handleLogout = async () => {
		await authService.logout()
		router.push('/')
	}

	onMounted(async () => {
		// Set toast instance
		if (toastRef.value) {
			const { setToastInstance } = await import('@/composables/useToast')
			setToastInstance(toastRef.value)
		}

		// Get menu
		const user = authService.getCurrentUser()
		if (user) {
			menuItems.value = getMenuByRole(user.role)
		}

		// Load invoice
		await loadInvoice()
	})
</script>

<style scoped>
	.invoice-detail-view {
		min-height: 100vh;
		background: var(--light, #f8f9fa);
	}

	.content-wrapper {
		transition: margin-left 0.3s ease;
	}

	.main-content {
		padding: 2rem;
	}

	.detail-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.loading-state,
	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #777;
	}

	.loading-state i,
	.empty-state i {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		display: block;
		color: var(--primary, #ff7a00);
	}

	.invoice-content {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		max-width: 1200px;
		margin: 0 auto;
	}

	.invoice-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid #e0e0e0;
	}

	.invoice-title h1 {
		margin: 0;
		font-size: 2rem;
		color: var(--dark, #2c3a47);
		text-transform: uppercase;
	}

	.invoice-code {
		margin: 0.5rem 0 0 0;
		color: #666;
		font-size: 1rem;
	}

	.invoice-date p {
		margin: 0.25rem 0;
		color: #666;
	}

	.info-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.info-block {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 8px;
	}

	.info-block h3 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: var(--dark, #2c3a47);
		border-bottom: 2px solid var(--primary, #ff7a00);
		padding-bottom: 0.5rem;
	}

	.info-block p {
		margin: 0.5rem 0;
		color: #555;
	}

	.table-section {
		margin-bottom: 2rem;
	}

	.table-section h3 {
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		color: var(--dark, #2c3a47);
	}

	.invoice-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	.invoice-table th,
	.invoice-table td {
		padding: 0.75rem;
		text-align: left;
		border: 1px solid #e0e0e0;
	}

	.invoice-table th {
		background: #f8f9fa;
		font-weight: 600;
		color: var(--dark, #2c3a47);
	}

	.invoice-table tbody tr:nth-child(even) {
		background: #fafafa;
	}

	.invoice-summary {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 2px solid #e0e0e0;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		color: #555;
	}

	.summary-row.total {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 2px solid #e0e0e0;
		font-size: 1.2rem;
		color: var(--dark, #2c3a47);
	}

	.invoice-status {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 2px solid #e0e0e0;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
		margin-left: 0.5rem;
	}

	.status-badge.status-pending {
		background: #fef3c7;
		color: #92400e;
	}

	.status-badge.status-paid {
		background: #dcfce7;
		color: #166534;
	}

	.status-badge.status-cancelled {
		background: #fee2e2;
		color: #991b1b;
	}

	/* Print Styles */
	@media print {
		.detail-header,
		.header-actions,
		.content-wrapper > :first-child {
			display: none !important;
		}

		.invoice-content {
			box-shadow: none;
			padding: 1rem;
		}

		body {
			background: white;
		}
	}

	@media (max-width: 992px) {
		.content-wrapper {
			margin-left: 0 !important;
		}

		.info-section {
			grid-template-columns: 1fr;
		}
	}
</style>
