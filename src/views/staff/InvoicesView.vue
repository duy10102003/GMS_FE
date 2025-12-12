<template>
	<div class="invoices-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader title="Quản lý hóa đơn" :show-search="false" :notifications="notifications" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<!-- Toolbar -->
				<div class="toolbar">
					<div class="toolbar-left">
						<GmsInput v-model="searchQuery" placeholder="Tìm theo mã hóa đơn, khách hàng, số điện thoại..." prefix-icon="fa-search" :clearable="true" class="search-input" @input="handleSearch" />
					</div>
				</div>

				<!-- Active Filters -->
				<div v-if="activeFilters.length > 0" class="active-filters">
					<span class="filter-label">Bộ lọc đang áp dụng:</span>
					<div class="filter-tags">
						<span v-for="(filter, index) in activeFilters" :key="index" class="filter-tag">
							{{ getFilterLabel(filter) }}
							<i class="fas fa-times" @click="removeFilter(index)"></i>
						</span>
					</div>
					<GmsButton variant="outline" size="small" icon="fa-times" @click="clearAllFilters">Xóa tất cả</GmsButton>
				</div>

				<!-- Table -->
				<div class="table-container">
					<GmsTable :data="invoices" :columns="tableColumns" title="Danh sách hóa đơn" :loading="loading" :pagination="false" :scrollable="true" @sort="handleSort" @filter-click="openFilterModal">
						<template #cell-customer="{ row }">
							<div>
								<div class="customer-name">{{ row.customerName || 'N/A' }}</div>
								<div class="customer-phone">{{ row.customerPhone || '' }}</div>
							</div>
						</template>

						<template #cell-issueDate="{ row }">
							{{ formatDate(row.issueDate) }}
						</template>

						<template #cell-totalAmount="{ row }">
							{{ formatCurrency(row.totalAmount || 0) }}
						</template>

						<template #cell-invoiceStatus="{ row }">
							<span :class="`badge badge-${getStatusColor(row.invoiceStatus)}`">
								{{ getStatusLabel(row.invoiceStatus) }}
							</span>
						</template>

						<template #cell-actions="{ row }">
							<div class="action-buttons">
								<GmsButton variant="outline" size="small" icon="fa-eye" @click.stop="viewDetail(row)">Chi tiết</GmsButton>
							</div>
						</template>
					</GmsTable>
				</div>

				<!-- Pagination -->
				<div v-if="totalItems > 0" class="pagination mt-4">
					<div class="pagination-left">
						<div class="pagination-info">Hiển thị {{ startIndex + 1 }}-{{ endIndex }} trong tổng {{ totalItems }} hóa đơn</div>
						<div class="pagination-size">
							<label>Số lượng/trang:</label>
							<select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
								<option :value="5">5</option>
								<option :value="10">10</option>
								<option :value="15">15</option>
								<option :value="20">20</option>
							</select>
						</div>
					</div>
					<div class="pagination-controls">
						<GmsButton variant="outline" size="small" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
							<i class="fas fa-chevron-left"></i>
						</GmsButton>

						<div class="pagination-pages">
							<button v-for="page in visiblePages" :key="page" class="pagination-page" :class="{ active: page === currentPage }" @click="goToPage(page)">
								{{ page }}
							</button>
						</div>

						<GmsButton variant="outline" size="small" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
							<i class="fas fa-chevron-right"></i>
						</GmsButton>
					</div>
				</div>

				<div v-else-if="!loading" class="empty-state">
					<i class="fas fa-file-invoice"></i>
					<p>Chưa có hóa đơn nào</p>
				</div>
			</main>
		</div>

		<!-- Column Filter Modal -->
		<GmsDialog v-model="showFilterModal" :title="`Lọc theo ${currentFilterColumn?.label || ''}`" size="medium">
			<div v-if="currentFilterColumn" class="filter-modal-content">
				<div class="mb-3">
					<label class="form-label">Toán tử:</label>
					<select v-model="filterForm.operator" class="form-select">
						<option v-if="isNumericColumn(currentFilterColumn)" value="equals">Bằng</option>
						<option v-if="isNumericColumn(currentFilterColumn)" value="not_equals">Không bằng</option>
						<option v-if="!isNumericColumn(currentFilterColumn)" value="equals">Bằng</option>
						<option v-if="!isNumericColumn(currentFilterColumn)" value="not_equals">Không bằng</option>
						<option v-if="!isNumericColumn(currentFilterColumn)" value="contains">Chứa</option>
						<option v-if="!isNumericColumn(currentFilterColumn)" value="not_contains">Không chứa</option>
						<option v-if="!isNumericColumn(currentFilterColumn)" value="starts_with">Bắt đầu bằng</option>
						<option v-if="!isNumericColumn(currentFilterColumn)" value="ends_with">Kết thúc bằng</option>
						<option v-if="isNumericColumn(currentFilterColumn)" value="greater_than">Lớn hơn</option>
						<option v-if="isNumericColumn(currentFilterColumn)" value="less_than">Nhỏ hơn</option>
						<option v-if="isNumericColumn(currentFilterColumn)" value="greater_or_equal">Lớn hơn hoặc bằng</option>
						<option v-if="isNumericColumn(currentFilterColumn)" value="less_or_equal">Nhỏ hơn hoặc bằng</option>
						<option value="empty">Rỗng</option>
						<option value="not_empty">Không rỗng</option>
					</select>
				</div>

				<div v-if="!['empty', 'not_empty'].includes(filterForm.operator)" class="mb-3">
					<label class="form-label">Giá trị:</label>
					<GmsInput v-if="isNumericColumn(currentFilterColumn)" v-model.number="filterForm.value" type="number" :placeholder="`Nhập ${currentFilterColumn.label.toLowerCase()}...`" :min="0" />
					<GmsInput v-else-if="isDateColumn(currentFilterColumn)" v-model="filterForm.value" type="date" :placeholder="`Chọn ${currentFilterColumn.label.toLowerCase()}...`" />
					<GmsInput v-else v-model="filterForm.value" :placeholder="`Nhập ${currentFilterColumn.label.toLowerCase()}...`" />
				</div>

				<div class="dialog-actions">
					<GmsButton type="button" variant="outline" @click="closeFilterModal">Hủy</GmsButton>
					<GmsButton type="button" variant="outline" @click="clearCurrentFilter">Xóa bộ lọc</GmsButton>
					<GmsButton type="button" variant="primary" @click="applyColumnFilter">Áp dụng</GmsButton>
				</div>
			</div>
		</GmsDialog>

		<!-- Toast -->
		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { useRouter } from 'vue-router'
	import { TheHeader, TheSideBar } from '@/layout'
	import { GmsInput, GmsButton, GmsTable, GmsDialog, GmsToast } from '@/components'
	import { useToast } from '@/composables/useToast'
	import { getMenuByRole } from '@/utils/menu'
	import authService from '@/services/auth'
	import invoiceService from '@/services/invoice'

	const router = useRouter()
	const toastRef = ref(null)
	const toast = useToast()

	const sidebarCollapsed = ref(false)
	const loading = ref(false)
	const showFilterModal = ref(false)
	const currentFilterColumn = ref(null)
	const notifications = ref([])
	const menuItems = ref([])

	const searchQuery = ref('')
	const pageSize = ref(10)
	const currentPage = ref(1)
	const sortConfig = ref({ key: '', order: 'asc' })

	const invoices = ref([])
	const totalItems = ref(0)

	const columnFilters = ref([])
	const activeFilters = ref([])

	const filterForm = ref({
		operator: 'contains',
		value: ''
	})

	const tableColumns = ref([
		{ key: 'invoiceId', label: 'ID', sortable: true, filterable: false },
		//{ key: 'invoiceCode', label: 'Mã hóa đơn', sortable: true, filterable: true },
		{ key: 'serviceTicketCode', label: 'Mã phiếu', sortable: true, filterable: true },
		{ key: 'customer', label: 'Khách hàng', sortable: false, filterable: false },
		{ key: 'issueDate', label: 'Ngày xuất', sortable: true, filterable: true, isDate: true },
		{ key: 'totalAmount', label: 'Tổng tiền', sortable: true, filterable: true, isNumeric: true },
		{ key: 'invoiceStatus', label: 'Trạng thái', sortable: true, filterable: true, isNumeric: true },
		{ key: 'actions', label: 'Hành động', filterable: false }
	])

	// Computed
	const totalPages = computed(() => {
		return Math.ceil(totalItems.value / pageSize.value)
	})

	const startIndex = computed(() => {
		return (currentPage.value - 1) * pageSize.value
	})

	const endIndex = computed(() => {
		return Math.min(startIndex.value + pageSize.value, totalItems.value)
	})

	const visiblePages = computed(() => {
		const pages = []
		const maxVisible = 5
		let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
		let end = Math.min(totalPages.value, start + maxVisible - 1)

		if (end - start < maxVisible - 1) {
			start = Math.max(1, end - maxVisible + 1)
		}

		for (let i = start; i <= end; i++) {
			pages.push(i)
		}

		return pages
	})

	// Methods
	const isNumericColumn = (column) => {
		return column?.isNumeric || ['invoiceStatus', 'invoiceId', 'totalAmount'].includes(column?.key)
	}

	const isDateColumn = (column) => {
		return column?.isDate || ['issueDate'].includes(column?.key)
	}

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

	const getStatusLabel = (status) => {
		const labels = {
			0: 'Chưa thanh toán',
			1: 'Đã thanh toán',
			2: 'Đã hủy'
		}
		return labels[status] || 'N/A'
	}

	const getStatusColor = (status) => {
		const colors = {
			0: 'warning',
			1: 'success',
			2: 'danger'
		}
		return colors[status] || 'secondary'
	}

	const getFilterLabel = (filter) => {
		const column = tableColumns.value.find((col) => {
			const colKey =
				col.key.charAt(0).toUpperCase() +
				col.key
					.slice(1)
					.replace(/([A-Z])/g, '_$1')
					.toUpperCase()
			return colKey === filter.columnName || col.key === filter.columnName
		})
		const columnLabel = column ? column.label : filter.columnName
		const operatorLabels = {
			equals: '=',
			not_equals: '≠',
			contains: 'chứa',
			not_contains: 'không chứa',
			starts_with: 'bắt đầu',
			ends_with: 'kết thúc',
			empty: 'rỗng',
			not_empty: 'không rỗng',
			greater_than: '>',
			less_than: '<',
			greater_or_equal: '≥',
			less_or_equal: '≤'
		}
		const operatorLabel = operatorLabels[filter.operator] || filter.operator
		return `${columnLabel}: ${operatorLabel} ${filter.value || ''}`
	}

	const openFilterModal = (column) => {
		if (!column.filterable) return

		currentFilterColumn.value = column

		// Check if filter already exists for this column
		const existingFilter = columnFilters.value.find((f) => {
			const colKey =
				column.key.charAt(0).toUpperCase() +
				column.key
					.slice(1)
					.replace(/([A-Z])/g, '_$1')
					.toUpperCase()
			return f.columnName === colKey || f.columnName === column.key
		})

		if (existingFilter) {
			filterForm.value = {
				operator: existingFilter.operator,
				value: existingFilter.value || ''
			}
		} else {
			filterForm.value = {
				operator: isNumericColumn(column) ? 'equals' : isDateColumn(column) ? 'equals' : 'contains',
				value: ''
			}
		}

		showFilterModal.value = true
	}

	const closeFilterModal = () => {
		showFilterModal.value = false
		currentFilterColumn.value = null
		filterForm.value = {
			operator: 'contains',
			value: ''
		}
	}

	const applyColumnFilter = () => {
		if (!currentFilterColumn.value) return

		if (['empty', 'not_empty'].includes(filterForm.value.operator) && !filterForm.value.value) {
			// Empty/not_empty doesn't need value
		} else if (!filterForm.value.value && filterForm.value.value !== 0 && filterForm.value.operator !== 'empty' && filterForm.value.operator !== 'not_empty') {
			toast.error('Vui lòng nhập giá trị')
			return
		}

		// Remove existing filter for this column
		const columnKey =
			currentFilterColumn.value.key.charAt(0).toUpperCase() +
			currentFilterColumn.value.key
				.slice(1)
				.replace(/([A-Z])/g, '_$1')
				.toUpperCase()

		columnFilters.value = columnFilters.value.filter((f) => f.columnName !== columnKey && f.columnName !== currentFilterColumn.value.key)

		// Add new filter
		if (filterForm.value.operator !== 'empty' && filterForm.value.operator !== 'not_empty' && (filterForm.value.value || filterForm.value.value === 0)) {
			columnFilters.value.push({
				columnName: columnKey,
				operator: filterForm.value.operator,
				value: filterForm.value.value.toString()
			})
		} else if (['empty', 'not_empty'].includes(filterForm.value.operator)) {
			columnFilters.value.push({
				columnName: columnKey,
				operator: filterForm.value.operator,
				value: null
			})
		}

		updateActiveFilters()
		currentPage.value = 1
		loadInvoices()
		closeFilterModal()
	}

	const clearCurrentFilter = () => {
		if (!currentFilterColumn.value) return

		const columnKey =
			currentFilterColumn.value.key.charAt(0).toUpperCase() +
			currentFilterColumn.value.key
				.slice(1)
				.replace(/([A-Z])/g, '_$1')
				.toUpperCase()

		columnFilters.value = columnFilters.value.filter((f) => f.columnName !== columnKey && f.columnName !== currentFilterColumn.value.key)

		updateActiveFilters()
		currentPage.value = 1
		loadInvoices()
		closeFilterModal()
	}

	const removeFilter = (index) => {
		const filter = activeFilters.value[index]
		const columnKey = filter.columnName

		columnFilters.value = columnFilters.value.filter((f) => f.columnName !== columnKey)

		updateActiveFilters()
		currentPage.value = 1
		loadInvoices()
	}

	const clearAllFilters = () => {
		columnFilters.value = []
		searchQuery.value = ''
		updateActiveFilters()
		currentPage.value = 1
		loadInvoices()
	}

	const updateActiveFilters = () => {
		activeFilters.value = [...columnFilters.value]
	}

	const handleSearch = () => {
		currentPage.value = 1
		loadInvoices()
	}

	const handleSort = ({ key, order }) => {
		sortConfig.value = { key, order }
		loadInvoices()
	}

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages.value) {
			currentPage.value = page
			loadInvoices()
		}
	}

	const handlePageSizeChange = () => {
		currentPage.value = 1
		loadInvoices()
	}

	const viewDetail = (invoice) => {
		router.push(`/staff/invoices/${invoice.invoiceId}`)
	}

	const loadInvoices = async () => {
		try {
			loading.value = true

			// Build column filters
			const filters = [...columnFilters.value]

			// Search filter - chỉ tìm theo mã hóa đơn, mã phiếu, tên khách hàng
			if (searchQuery.value && searchQuery.value.trim()) {
				const searchValue = searchQuery.value.trim()
				// Tìm theo mã hóa đơn hoặc mã phiếu
				filters.push({
					columnName: 'ServiceTicketCode',
					operator: 'contains',
					value: searchValue
				})
			}

			// Build sort
			const columnSorts = []
			if (sortConfig.value.key) {
				const sortKey =
					sortConfig.value.key.charAt(0).toUpperCase() +
					sortConfig.value.key
						.slice(1)
						.replace(/([A-Z])/g, '_$1')
						.toUpperCase()
				columnSorts.push({
					columnName: sortKey,
					sortDirection: sortConfig.value.order === 'asc' ? 'ASC' : 'DESC'
				})
			} else {
				// Default sort by issue date DESC
				columnSorts.push({
					columnName: 'IssueDate',
					sortDirection: 'DESC'
				})
			}

			const params = {
				page: currentPage.value,
				pageSize: pageSize.value,
				columnFilters: filters.length > 0 ? filters : undefined,
				columnSorts: columnSorts.length > 0 ? columnSorts : undefined
				// Không truyền customerId để lấy tất cả
			}

			const response = await invoiceService.getPaging(params)
			const items = response.data?.items || response.data || []

			invoices.value = items
			totalItems.value = response.data?.total || 0
		} catch (error) {
			toast.error('Lỗi khi tải danh sách hóa đơn', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			loading.value = false
		}
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

		// Load data
		await loadInvoices()
	})
</script>

<style scoped>
	.invoices-view {
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

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
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

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #777;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.empty-state i {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		display: block;
		color: var(--primary, #ff7a00);
	}
</style>
