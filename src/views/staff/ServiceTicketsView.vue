<template>
	<div class="service-tickets-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader title="Quản lý phiếu dịch vụ" :show-search="false" :notifications="notifications" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<!-- Toolbar -->
				<div class="toolbar">
					<div class="toolbar-left">
						<GmsInput v-model="searchQuery" placeholder="Tìm theo mã phiếu, khách hàng, biển số..." prefix-icon="fa-search" :clearable="true" class="search-input" @input="handleSearch" />
					</div>

					<div class="toolbar-right">
						<GmsButton variant="primary" icon="fa-plus" @click="router.push('/staff/service-tickets/create')">Tạo phiếu mới</GmsButton>
					</div>
				</div>

				<!-- Filters -->
				<div class="filters">
					<div class="filter-group">
						<label>Trạng thái:</label>
						<select v-model="filters.status" class="filter-select" @change="applyFilters">
							<option value="">Tất cả trạng thái</option>
							<option :value="SERVICE_TICKET_STATUS.PENDING">Chờ xử lý</option>
							<option :value="SERVICE_TICKET_STATUS.ASSIGNED">Đã phân công</option>
							<option :value="SERVICE_TICKET_STATUS.IN_PROGRESS">Đang xử lý</option>
							<option :value="SERVICE_TICKET_STATUS.COMPLETED">Hoàn thành</option>
							<option :value="SERVICE_TICKET_STATUS.CANCELLED">Đã hủy</option>
						</select>
					</div>

					<div class="filter-group">
						<label>Thợ phụ trách:</label>
						<select v-model="filters.mechanic" class="filter-select" @change="applyFilters">
							<option value="">Tất cả thợ</option>
							<option v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.id">
								{{ mechanic.name }}
							</option>
						</select>
					</div>

					<div class="filter-group">
						<label>Từ ngày:</label>
						<input v-model="filters.fromDate" type="date" class="filter-input" @change="applyFilters" />
					</div>

					<div class="filter-group">
						<label>Đến ngày:</label>
						<input v-model="filters.toDate" type="date" class="filter-input" @change="applyFilters" />
					</div>

					<GmsButton variant="outline" icon="fa-times" @click="clearFilters">Xóa bộ lọc</GmsButton>
				</div>

				<!-- Table -->
				<GmsTable :data="filteredTickets" :columns="tableColumns" title="Danh sách phiếu dịch vụ" :loading="loading" :pagination="false" @row-click="handleRowClick" @sort="handleSort">
					<template #cell-customer="{ row }">
						<div>
							<div class="customer-name">{{ row.customer?.customerName }}</div>
							<div class="customer-phone">{{ row.customer?.customerPhone }}</div>
						</div>
					</template>

					<template #cell-mechanic="{ row }">
						<div v-if="row.technicalTasks && row.technicalTasks.length > 0" class="mechanic-info">
							<img :src="getAvatarUrl(row.technicalTasks[0].assignedTo?.fullName || 'Mechanic')" :alt="row.technicalTasks[0].assignedTo?.fullName" class="mechanic-avatar" />
							<span>{{ row.technicalTasks[0].assignedTo?.fullName }}</span>
						</div>
						<span v-else class="text-muted">Chưa phân công</span>
					</template>

					<template #cell-serviceTicketStatus="{ row }">
						<span :class="`badge badge-${getStatusColor(row.serviceTicketStatus)}`">
							{{ getStatusLabel(row.serviceTicketStatus) }}
						</span>
					</template>

					<template #cell-actions="{ row }">
						<div class="action-buttons">
							<GmsButton v-if="row.serviceTicketStatus === SERVICE_TICKET_STATUS.PENDING" variant="primary" size="small" icon="fa-user-plus" @click.stop="openAssignDialog(row)">Phân công</GmsButton>

							<GmsButton variant="outline" size="small" icon="fa-eye" @click.stop="viewDetail(row)">Chi tiết</GmsButton>
						</div>
					</template>
				</GmsTable>

				<!-- Pagination -->
				<div v-if="totalPages > 1" class="pagination mt-4">
					<GmsButton variant="outline" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
						<i class="fas fa-chevron-left"></i>
					</GmsButton>
					<span class="page-info">Trang {{ currentPage }} / {{ totalPages }} (Tổng: {{ totalItems }})</span>
					<GmsButton variant="outline" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
						<i class="fas fa-chevron-right"></i>
					</GmsButton>
				</div>
			</main>
		</div>

		<!-- Assign Mechanic Dialog -->
		<GmsDialog v-model="showAssignDialog" title="Phân công thợ sửa" size="medium">
			<template v-if="selectedTicket">
				<form @submit.prevent="confirmAssign">
					<p class="mb-3">
						Chọn thợ phụ trách phiếu
						<strong>#{{ selectedTicket.serviceTicketCode }}</strong>
					</p>

					<div class="mb-3">
						<label>Chọn thợ:</label>
						<select v-model="assignForm.assignedToTechnical" class="form-select" required>
							<option value="">-- Chọn thợ --</option>
							<option v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.id">
								{{ mechanic.name }}
							</option>
						</select>
					</div>

					<div class="mb-3">
						<label class="form-label">Mô tả công việc *</label>
						<textarea v-model="assignForm.description" class="form-control" rows="3" placeholder="Nhập mô tả công việc cho thợ..." required></textarea>
					</div>

					<div class="dialog-actions">
						<GmsButton type="button" variant="outline" @click="showAssignDialog = false">Hủy</GmsButton>
						<GmsButton type="submit" variant="primary" :loading="loading">Xác nhận phân công</GmsButton>
					</div>
				</form>
			</template>
		</GmsDialog>

		<!-- Toast -->
		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
	import { GmsButton, GmsDialog, GmsInput, GmsTable, GmsToast } from '@/components'
	import { useToast } from '@/composables/useToast'
	import { SERVICE_TICKET_STATUS, SERVICE_TICKET_STATUS_COLORS, SERVICE_TICKET_STATUS_LABELS } from '@/constant/serviceTicketStatus'
	import { TheHeader, TheSideBar } from '@/layout'
	import api from '@/services/api'
	import authService from '@/services/auth'
	import serviceTicketService from '@/services/serviceTicket'
	import { getMenuByRole } from '@/utils/menu'
	import { computed, onMounted, ref } from 'vue'
	import { useRouter } from 'vue-router'

	const router = useRouter()
	const toastRef = ref(null)
	const toast = useToast()

	const sidebarCollapsed = ref(false)
	const loading = ref(false)
	const showAssignDialog = ref(false)
	const selectedTicket = ref(null)
	const assignForm = ref({
		assignedToTechnical: '',
		description: ''
	})
	const searchQuery = ref('')
	const pageSize = ref(10)
	const currentPage = ref(1)
	const sortConfig = ref({ key: '', order: 'asc' })

	const tickets = ref([])
	const mechanics = ref([])
	const notifications = ref([])
	const menuItems = ref([])
	const totalItems = ref(0)

	const filters = ref({
		status: '',
		mechanic: '',
		fromDate: '',
		toDate: ''
	})

	const tableColumns = ref([
		{ key: 'serviceTicketCode', label: 'Mã phiếu', sortable: true },
		{ key: 'customer', label: 'Khách hàng' },
		{ key: 'vehicle.vehicleLicensePlate', label: 'Biển số', sortable: true },
		{ key: 'initialIssue', label: 'Vấn đề' },
		{ key: 'mechanic', label: 'Thợ phụ trách' },
		{ key: 'serviceTicketStatus', label: 'Trạng thái', sortable: true },
		{ key: 'createdDate', label: 'Ngày tạo', sortable: true },
		{ key: 'actions', label: 'Hành động' }
	])

	// Computed
	const filteredTickets = computed(() => {
		return tickets.value
	})

	// Methods
	const getAvatarUrl = (name) => {
		return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF7A00&color=fff`
	}

	const getStatusLabel = (status) => {
		return SERVICE_TICKET_STATUS_LABELS[status] || 'N/A'
	}

	const getStatusColor = (status) => {
		return SERVICE_TICKET_STATUS_COLORS[status] || 'secondary'
	}

	const getNestedValue = (obj, path) => {
		const keys = path.split('.')
		let value = obj
		for (const key of keys) {
			value = value?.[key]
		}
		return value
	}

	const handleSearch = () => {
		currentPage.value = 1
		loadTickets()
	}

	const applyFilters = () => {
		currentPage.value = 1
		loadTickets()
	}

	const clearFilters = () => {
		filters.value = {
			status: '',
			mechanic: '',
			fromDate: '',
			toDate: ''
		}
		searchQuery.value = ''
		currentPage.value = 1
		loadTickets()
	}

	const handleSort = ({ key, order }) => {
		sortConfig.value = { key, order }
		loadTickets()
	}

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages.value) {
			currentPage.value = page
			loadTickets()
		}
	}

	const totalPages = computed(() => {
		return Math.ceil(totalItems.value / pageSize.value)
	})

	const handleRowClick = (row) => {
		viewDetail(row)
	}

	const viewDetail = (ticket) => {
		router.push(`/staff/service-tickets/${ticket.serviceTicketId}`)
	}

	const openAssignDialog = (ticket) => {
		selectedTicket.value = ticket
		assignForm.value = {
			assignedToTechnical: '',
			description: ''
		}
		showAssignDialog.value = true
		loadMechanics()
	}

	const confirmAssign = async () => {
		if (!assignForm.value.assignedToTechnical || !selectedTicket.value) {
			toast.error('Vui lòng chọn thợ và nhập mô tả')
			return
		}

		try {
			loading.value = true
			await serviceTicketService.assign(selectedTicket.value.serviceTicketId, {
				assignedToTechnical: parseInt(assignForm.value.assignedToTechnical),
				description: assignForm.value.description
			})

			showAssignDialog.value = false
			toast.success('Phân công thành công!', `Đã giao phiếu #${selectedTicket.value.serviceTicketCode} cho thợ`)
			await loadTickets()
		} catch (error) {
			toast.error('Lỗi khi phân công', error.message)
		} finally {
			loading.value = false
		}
	}

	const loadTickets = async () => {
		try {
			loading.value = true

			// Build column filters
			const columnFilters = []

			// Search filter
			if (searchQuery.value) {
				columnFilters.push({
					columnName: 'ServiceTicketCode',
					operator: 'contains',
					value: searchQuery.value
				})
			}

			// Status filter
			if (filters.value.status !== '') {
				columnFilters.push({
					columnName: 'ServiceTicketStatus',
					operator: 'equals',
					value: filters.value.status
				})
			}

			// Date filters
			if (filters.value.fromDate) {
				columnFilters.push({
					columnName: 'CreatedDate',
					operator: 'greater_or_equal',
					value: filters.value.fromDate
				})
			}

			if (filters.value.toDate) {
				columnFilters.push({
					columnName: 'CreatedDate',
					operator: 'less_or_equal',
					value: filters.value.toDate
				})
			}

			// Build sort
			const columnSorts = []
			if (sortConfig.value.key) {
				columnSorts.push({
					columnName: sortConfig.value.key,
					sortDirection: sortConfig.value.order === 'asc' ? 'ASC' : 'DESC'
				})
			} else {
				// Default sort by created date DESC
				columnSorts.push({
					columnName: 'CreatedDate',
					sortDirection: 'DESC'
				})
			}

			const params = {
				page: currentPage.value,
				pageSize: pageSize.value,
				columnFilters,
				columnSorts
			}

			const response = await serviceTicketService.getPaging(params)
			tickets.value = response.data.items || []
			totalItems.value = response.data.total || 0
		} catch (error) {
			toast.error('Lỗi khi tải danh sách phiếu', error.message)
		} finally {
			loading.value = false
		}
	}

	const loadMechanics = async () => {
		try {
			const response = await api.get('/mechanics')
			mechanics.value = response.data || response
		} catch (error) {
			console.error('Error loading mechanics:', error)
			// Fallback data
			mechanics.value = [
				{ id: 1, name: 'Nguyễn Văn Thợ', tickets: 2, status: 'busy' },
				{ id: 2, name: 'Trần Công Sửa', tickets: 1, status: 'busy' },
				{ id: 3, name: 'Lê Kỹ Thuật', tickets: 0, status: 'available' }
			]
		}
	}

	const handleLogout = async () => {
		await authService.logout()
		router.push('/login')
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

		// Load data
		await loadTickets()
		await loadMechanics()
	})
</script>

<style scoped>
	.service-tickets-view {
		min-height: 100vh;
		background: var(--light, #f8f9fa);
	}

	.content-wrapper {
		transition: margin-left 0.3s ease;
	}

	.main-content {
		padding: 2rem;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.toolbar-left {
		flex: 1;
		min-width: 300px;
	}

	.search-input {
		max-width: 400px;
	}

	.toolbar-right {
		display: flex;
		gap: 0.75rem;
	}

	.filters {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-group label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--dark, #2c3a47);
	}

	.filter-select,
	.filter-input {
		padding: 0.5rem 0.75rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		font-size: 0.9rem;
		min-width: 150px;
		outline: none;
		transition: border-color 0.3s;
	}

	.filter-select:focus,
	.filter-input:focus {
		border-color: var(--primary, #ff7a00);
		box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
	}

	.customer-name {
		font-weight: 600;
		color: var(--dark, #2c3a47);
	}

	.customer-phone {
		font-size: 0.85rem;
		color: #666;
	}

	.mechanic-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mechanic-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.mechanic-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.mechanic-card {
		padding: 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s;
	}

	.mechanic-card:hover {
		border-color: var(--primary, #ff7a00);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 122, 0, 0.2);
	}

	.mechanic-card.selected {
		border-color: var(--primary, #ff7a00);
		background: rgba(255, 122, 0, 0.1);
	}

	.mechanic-card-avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		margin: 0 auto 0.5rem;
	}

	.mechanic-card-name {
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--dark, #2c3a47);
	}

	.mechanic-card-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
	}

	.text-muted {
		color: #999;
	}

	.text-success {
		color: var(--success, #10ac84);
	}

	.text-warning {
		color: var(--warning, #f7b731);
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.page-info {
		font-weight: 600;
		color: var(--dark, #2c3a47);
		min-width: 200px;
		text-align: center;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
	}
  
  

.service-tickets-view {
  min-height: 100vh;
  background: var(--light, #f8f9fa);
}

.content-wrapper {
  transition: margin-left 0.3s ease;
}

.main-content {
  padding: 2rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.toolbar-left {
  flex: 1;
  min-width: 300px;
}

.search-input {
  max-width: 400px;
}

.toolbar-right {
  display: flex;
  gap: 0.75rem;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: var(--dark, #2c3a47);
  white-space: nowrap;
}

.filter-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--primary, #ff7a00);
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.filter-tag i {
  cursor: pointer;
  opacity: 0.8;
}

.filter-tag i:hover {
  opacity: 1;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.table-container :deep(.gms-table-wrapper) {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
}

.table-container :deep(.gms-table-container) {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  max-height: calc(600px - 120px);
}

.table-container :deep(.gms-table) {
  margin: 0;
}

.table-container :deep(.gms-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--light, #f8f9fa);
}

.table-container :deep(.gms-table thead th) {
  background: var(--light, #f8f9fa);
  position: sticky;
  top: 0;
  cursor: pointer;
}

.table-container :deep(.gms-table thead th:hover) {
  background: #e9ecef;
}

.customer-name {
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.customer-phone {
  font-size: 0.85rem;
  color: #666;
}

.vehicle-name {
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.vehicle-plate {
  font-size: 0.85rem;
  color: #666;
}

.mechanic-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.text-muted {
  color: #999;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-size label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.page-size-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  min-width: 70px;
}

.page-size-select:hover {
  border-color: var(--primary, #ff7a00);
}

.page-size-select:focus {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-page {
  min-width: 36px;
  height: 36px;
  padding: 0 0.75rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  color: var(--dark, #2c3a47);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page:hover {
  background: #f8f9fa;
  border-color: var(--primary, #ff7a00);
}

.pagination-page.active {
  background: var(--primary, #ff7a00);
  color: white;
  border-color: var(--primary, #ff7a00);
}

.filter-modal-content {
  padding: 0.5rem 0;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.mb-3 {
  margin-bottom: 1rem;
}

.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.form-select:focus {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.mt-4 {
  margin-top: 1.5rem;
}
<style>
