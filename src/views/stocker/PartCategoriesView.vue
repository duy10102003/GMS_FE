<template>
	<div class="part-categories-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader title="Quản lý danh mục phụ tùng" :show-search="false" :notifications="notifications" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<!-- Toolbar -->
				<div class="toolbar">
					<div class="toolbar-left">
						<GmsInput v-model="searchQuery" placeholder="Tìm theo tên, mã danh mục..." prefix-icon="fa-search" :clearable="true" class="search-input" @input="handleSearch" />
					</div>

					<div class="toolbar-right">
						<GmsButton variant="primary" icon="fa-plus" @click="openCreateDialog">Tạo danh mục mới</GmsButton>
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
					<GmsTable
						:data="categories"
						:columns="tableColumns"
						title="Danh sách danh mục phụ tùng"
						:loading="loading"
						:pagination="false"
						:scrollable="true"
						@sort="handleSort"
						@filter-click="openFilterModal"
					>
						<template #cell-status="{ row }">
							<span :class="`badge badge-${row.status === 'Active' ? 'success' : 'secondary'}`">
								{{ row.status || 'N/A' }}
							</span>
						</template>

						<template #cell-actions="{ row }">
							<div class="action-buttons">
								<GmsButton variant="outline" size="small" icon="fa-edit" @click.stop="openEditDialog(row)">Sửa</GmsButton>

								<GmsButton variant="danger" size="small" icon="fa-trash" @click.stop="openDeleteDialog(row)">Xóa</GmsButton>
							</div>
						</template>
					</GmsTable>
				</div>

				<!-- Pagination -->
				<div v-if="totalItems > 0" class="pagination mt-4">
					<div class="pagination-left">
						<div class="pagination-info">Hiển thị {{ startIndex + 1 }}-{{ endIndex }} trong tổng {{ totalItems }} danh mục</div>
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
			</main>
		</div>

		<!-- Column Filter Modal -->
		<GmsDialog v-model="showFilterModal" :title="`Lọc theo ${currentFilterColumn?.label || ''}`" size="medium">
			<div v-if="currentFilterColumn" class="filter-modal-content">
				<div class="mb-3">
					<label class="form-label">Toán tử:</label>
					<select v-model="filterForm.operator" class="form-select">
						<option value="equals">Bằng</option>
						<option value="not_equals">Không bằng</option>
						<option value="contains">Chứa</option>
						<option value="not_contains">Không chứa</option>
						<option value="starts_with">Bắt đầu bằng</option>
						<option value="ends_with">Kết thúc bằng</option>
						<option value="empty">Rỗng</option>
						<option value="not_empty">Không rỗng</option>
					</select>
				</div>

				<div v-if="!['empty', 'not_empty'].includes(filterForm.operator)" class="mb-3">
					<label class="form-label">Giá trị:</label>
					<GmsInput v-model="filterForm.value" :placeholder="`Nhập ${currentFilterColumn.label.toLowerCase()}...`" />
				</div>

				<div class="dialog-actions">
					<GmsButton type="button" variant="outline" @click="closeFilterModal">Hủy</GmsButton>
					<GmsButton type="button" variant="outline" @click="clearCurrentFilter">Xóa bộ lọc</GmsButton>
					<GmsButton type="button" variant="primary" @click="applyColumnFilter">Áp dụng</GmsButton>
				</div>
			</div>
		</GmsDialog>

		<!-- Create/Edit Dialog -->
		<GmsDialog v-model="showFormDialog" :title="isEditing ? 'Cập nhật danh mục' : 'Tạo danh mục mới'" size="medium">
			<form @submit.prevent="handleSubmit">
				<div class="mb-3">
					<label class="form-label">Mã danh mục *</label>
					<GmsInput v-model="formData.partCategoryCode" placeholder="Nhập mã danh mục..." required :maxlength="20" @blur="checkCode" />
					<small v-if="codeExists" class="text-danger">Mã danh mục đã tồn tại</small>
				</div>

				<div class="mb-3">
					<label class="form-label">Tên danh mục</label>
					<GmsInput v-model="formData.partCategoryName" placeholder="Nhập tên danh mục..." :maxlength="100" />
				</div>

				<div class="mb-3">
					<label class="form-label">Mô tả</label>
					<textarea v-model="formData.partCategoryDiscription" class="form-control" rows="3" placeholder="Nhập mô tả..." :maxlength="255"></textarea>
				</div>

				<div class="mb-3">
					<label class="form-label">Số điện thoại</label>
					<GmsInput v-model="formData.partCategoryPhone" placeholder="Nhập số điện thoại..." :maxlength="50" />
				</div>

				<div class="mb-3">
					<label class="form-label">Trạng thái</label>
					<select v-model="formData.status" class="form-select">
						<option value="">-- Chọn trạng thái --</option>
						<option value="Active">Active</option>
						<option value="Inactive">Inactive</option>
					</select>
				</div>

				<div class="dialog-actions">
					<GmsButton type="button" variant="outline" @click="closeFormDialog">Hủy</GmsButton>
					<GmsButton type="submit" variant="primary" :loading="submitting" :disabled="codeExists">
						{{ isEditing ? 'Cập nhật' : 'Tạo mới' }}
					</GmsButton>
				</div>
			</form>
		</GmsDialog>

		<!-- Delete Confirmation Dialog -->
		<GmsDialog v-model="showDeleteDialog" title="Xác nhận xóa" size="small">
			<template v-if="selectedCategory">
				<p>
					Bạn có chắc chắn muốn xóa danh mục
					<strong>{{ selectedCategory.partCategoryName || selectedCategory.partCategoryCode }}</strong>
					?
				</p>
				<p class="text-muted small">Danh mục sẽ bị xóa mềm (soft delete) và có thể khôi phục sau.</p>

				<div class="dialog-actions">
					<GmsButton type="button" variant="outline" @click="showDeleteDialog = false">Hủy</GmsButton>
					<GmsButton variant="danger" :loading="deleting" @click="confirmDelete">Xóa</GmsButton>
				</div>
			</template>
		</GmsDialog>

		<!-- Toast -->
		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
	import { GmsButton, GmsDialog, GmsInput, GmsTable, GmsToast } from '@/components'
	import { useToast } from '@/composables/useToast'
	import { TheHeader, TheSideBar } from '@/layout'
	import authService from '@/services/auth'
	import partCategoryService from '@/services/partCategory'
	import { getMenuByRole } from '@/utils/menu'
	import { computed, onMounted, ref } from 'vue'
	import { useRouter } from 'vue-router'

	const router = useRouter()
	const toastRef = ref(null)
	const toast = useToast()

	const sidebarCollapsed = ref(false)
	const loading = ref(false)
	const submitting = ref(false)
	const deleting = ref(false)
	const showFormDialog = ref(false)
	const showDeleteDialog = ref(false)
	const showFilterModal = ref(false)
	const isEditing = ref(false)
	const selectedCategory = ref(null)
	const currentFilterColumn = ref(null)
	const codeExists = ref(false)

	const searchQuery = ref('')
	const pageSize = ref(10)
	const currentPage = ref(1)
	const sortConfig = ref({ key: '', order: 'asc' })

	const categories = ref([])
	const notifications = ref([])
	const menuItems = ref([])
	const totalItems = ref(0)

	const columnFilters = ref([])
	const activeFilters = ref([])

	const filterForm = ref({
		operator: 'contains',
		value: ''
	})

	const formData = ref({
		partCategoryName: '',
		partCategoryCode: '',
		partCategoryDiscription: '',
		partCategoryPhone: '',
		status: ''
	})

	const tableColumns = ref([
		{ key: 'partCategoryId', label: 'ID', sortable: true, filterable: false },
		{ key: 'partCategoryCode', label: 'Mã danh mục', sortable: true, filterable: true },
		{ key: 'partCategoryName', label: 'Tên danh mục', sortable: true, filterable: true },
		{ key: 'partCategoryDiscription', label: 'Mô tả', sortable: true, filterable: true },
		{ key: 'partCategoryPhone', label: 'Số điện thoại', sortable: true, filterable: true },
		{ key: 'status', label: 'Trạng thái', sortable: true, filterable: true },
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
	const getFilterLabel = (filter) => {
		const column = tableColumns.value.find((col) => col.key === filter.columnName || col.key.toLowerCase() === filter.columnName.toLowerCase())
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
				operator: 'contains',
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
		} else if (!filterForm.value.value && filterForm.value.operator !== 'empty' && filterForm.value.operator !== 'not_empty') {
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
		if (filterForm.value.operator !== 'empty' && filterForm.value.operator !== 'not_empty' && filterForm.value.value) {
			columnFilters.value.push({
				columnName: columnKey,
				operator: filterForm.value.operator,
				value: filterForm.value.value
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
		loadCategories()
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
		loadCategories()
		closeFilterModal()
	}

	const removeFilter = (index) => {
		const filter = activeFilters.value[index]
		const columnKey = filter.columnName

		columnFilters.value = columnFilters.value.filter((f) => f.columnName !== columnKey)

		updateActiveFilters()
		currentPage.value = 1
		loadCategories()
	}

	const clearAllFilters = () => {
		columnFilters.value = []
		searchQuery.value = ''
		updateActiveFilters()
		currentPage.value = 1
		loadCategories()
	}

	const updateActiveFilters = () => {
		activeFilters.value = [...columnFilters.value]
	}

	const handleSearch = () => {
		currentPage.value = 1
		loadCategories()
	}

	const handleSort = ({ key, order }) => {
		sortConfig.value = { key, order }
		loadCategories()
	}

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages.value) {
			currentPage.value = page
			loadCategories()
		}
	}

	const handlePageSizeChange = () => {
		currentPage.value = 1
		loadCategories()
	}

	const openCreateDialog = () => {
		isEditing.value = false
		selectedCategory.value = null
		codeExists.value = false
		formData.value = {
			partCategoryName: '',
			partCategoryCode: '',
			partCategoryDiscription: '',
			partCategoryPhone: '',
			status: ''
		}
		showFormDialog.value = true
	}

	const openEditDialog = (category) => {
		isEditing.value = true
		selectedCategory.value = category
		codeExists.value = false
		formData.value = {
			partCategoryName: category.partCategoryName || '',
			partCategoryCode: category.partCategoryCode || '',
			partCategoryDiscription: category.partCategoryDiscription || '',
			partCategoryPhone: category.partCategoryPhone || '',
			status: category.status || ''
		}
		showFormDialog.value = true
	}

	const closeFormDialog = () => {
		showFormDialog.value = false
		isEditing.value = false
		selectedCategory.value = null
		codeExists.value = false
		formData.value = {
			partCategoryName: '',
			partCategoryCode: '',
			partCategoryDiscription: '',
			partCategoryPhone: '',
			status: ''
		}
	}

	const checkCode = async () => {
		if (!formData.value.partCategoryCode) {
			codeExists.value = false
			return
		}

		try {
			const excludeId = isEditing.value && selectedCategory.value ? selectedCategory.value.partCategoryId : null
			const response = await partCategoryService.checkCode(formData.value.partCategoryCode, excludeId)
			codeExists.value = response.data.exists
		} catch (error) {
			console.error('Error checking code:', error)
		}
	}

	const handleSubmit = async () => {
		if (!formData.value.partCategoryCode || formData.value.partCategoryCode.trim() === '') {
			toast.error('Vui lòng nhập mã danh mục')
			return
		}

		if (codeExists.value) {
			toast.error('Mã danh mục đã tồn tại')
			return
		}

		try {
			submitting.value = true

			const data = {
				partCategoryCode: formData.value.partCategoryCode.trim(),
				partCategoryName: formData.value.partCategoryName?.trim() || null,
				partCategoryDiscription: formData.value.partCategoryDiscription?.trim() || null,
				partCategoryPhone: formData.value.partCategoryPhone?.trim() || null,
				status: formData.value.status || null
			}

			if (isEditing.value && selectedCategory.value) {
				await partCategoryService.update(selectedCategory.value.partCategoryId, data)
				toast.success('Cập nhật thành công!', `Đã cập nhật danh mục "${data.partCategoryCode}"`)
			} else {
				await partCategoryService.create(data)
				toast.success('Tạo mới thành công!', `Đã tạo danh mục "${data.partCategoryCode}"`)
			}

			closeFormDialog()
			await loadCategories()
		} catch (error) {
			toast.error('Lỗi', error.message || 'Có lỗi xảy ra')
		} finally {
			submitting.value = false
		}
	}

	const openDeleteDialog = (category) => {
		selectedCategory.value = category
		showDeleteDialog.value = true
	}

	const confirmDelete = async () => {
		if (!selectedCategory.value) return

		try {
			deleting.value = true
			await partCategoryService.delete(selectedCategory.value.partCategoryId)
			toast.success('Xóa thành công!', `Đã xóa danh mục "${selectedCategory.value.partCategoryName || selectedCategory.value.partCategoryCode}"`)
			showDeleteDialog.value = false
			selectedCategory.value = null
			await loadCategories()
		} catch (error) {
			toast.error('Lỗi khi xóa', error.message || 'Có lỗi xảy ra')
		} finally {
			deleting.value = false
		}
	}

	const loadCategories = async () => {
		try {
			loading.value = true

			// Build column filters
			const filters = [...columnFilters.value]

			// Search filter
			if (searchQuery.value && searchQuery.value.trim()) {
				filters.push({
					columnName: 'PartCategoryName',
					operator: 'contains',
					value: searchQuery.value.trim()
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
				// Default sort by ID DESC
				columnSorts.push({
					columnName: 'PartCategoryId',
					sortDirection: 'DESC'
				})
			}

			const params = {
				page: currentPage.value,
				pageSize: pageSize.value,
				columnFilters: filters,
				columnSorts
			}

			const response = await partCategoryService.getPaging(params)
			categories.value = response.data.items || []
			totalItems.value = response.data.total || 0
		} catch (error) {
			toast.error('Lỗi khi tải danh sách danh mục', error.message || 'Có lỗi xảy ra')
		} finally {
			loading.value = false
		}
	}

	const handleLogout = async () => {
		await authService.logout()
		router.push('/home')
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
		await loadCategories()
	})
</script>

<style scoped>
	.part-categories-view {
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

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.text-muted {
		color: #999;
	}

	.text-danger {
		color: #dc3545;
		font-size: 0.875rem;
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

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e0e0e0;
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
		outline: none;
		transition: all 0.2s;
		font-family: inherit;
	}

	.form-control:focus {
		border-color: var(--primary, #ff7a00);
		box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
	}

	.small {
		font-size: 0.875rem;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.badge-success {
		background: rgba(16, 172, 132, 0.1);
		color: var(--success, #10ac84);
	}

	.badge-secondary {
		background: rgba(108, 117, 125, 0.1);
		color: #6c757d;
	}

	.filter-modal-content {
		padding: 0.5rem 0;
	}
</style>
