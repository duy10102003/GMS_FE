<template>
	<div class="parts-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader title="Quản lý phụ tùng" :show-search="false" :notifications="notifications" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<!-- Toolbar -->
				<div class="toolbar">
					<div class="toolbar-left">
						<GmsInput v-model="searchQuery" placeholder="Tìm theo tên, mã phụ tùng..." prefix-icon="fa-search" :clearable="true" class="search-input" @input="handleSearch" />
					</div>

					<div class="toolbar-right">
						<GmsButton variant="primary" icon="fa-plus" @click="openCreateDialog">Tạo phụ tùng mới</GmsButton>
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
					<GmsTable :data="parts" :columns="tableColumns" title="Danh sách phụ tùng" :loading="loading" :pagination="false" :scrollable="true" @sort="handleSort" @filter-click="openFilterModal">
						<template #cell-partQuantity="{ row }">
							<span :class="row.partQuantity < 10 ? 'text-danger' : ''">{{ row.partQuantity }} {{ row.partUnit }}</span>
						</template>

						<template #cell-partCategoryName="{ row }">
							<div>
								<div class="category-name">{{ row.partCategoryName || 'N/A' }}</div>
								<div class="category-code">{{ row.partCategoryCode || '' }}</div>
							</div>
						</template>

						<template #cell-partPrice="{ row }">
							<span v-if="row.partPrice !== null && row.partPrice !== undefined">
								{{ formatPrice(row.partPrice) }}
							</span>
							<span v-else class="text-muted">Chưa có giá</span>
						</template>

						<template #cell-warrantyMonth="{ row }">
							<span v-if="row.warrantyMonth !== null && row.warrantyMonth !== undefined">{{ row.warrantyMonth }} tháng</span>
							<span v-else class="text-muted">-</span>
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
						<div class="pagination-info">Hiển thị {{ startIndex + 1 }}-{{ endIndex }} trong tổng {{ totalItems }} phụ tùng</div>
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
					<GmsInput v-else v-model="filterForm.value" :placeholder="`Nhập ${currentFilterColumn.label.toLowerCase()}...`" />
				</div>

				<div class="dialog-actions">
					<GmsButton type="button" variant="outline" @click="closeFilterModal">Hủy</GmsButton>
					<GmsButton type="button" variant="outline" @click="clearCurrentFilter">Xóa bộ lọc</GmsButton>
					<GmsButton type="button" variant="primary" @click="applyColumnFilter">Áp dụng</GmsButton>
				</div>
			</div>
		</GmsDialog>

		<!-- Create/Edit Dialog -->
		<GmsDialog v-model="showFormDialog" :title="isEditing ? 'Cập nhật phụ tùng' : 'Tạo phụ tùng mới'" size="medium">
			<form @submit.prevent="handleSubmit">
				<div class="mb-3">
					<label class="form-label">Tên phụ tùng *</label>
					<GmsInput v-model="formData.partName" placeholder="Nhập tên phụ tùng..." required :maxlength="100" />
				</div>

				<div class="mb-3">
					<label class="form-label">Mã phụ tùng *</label>
					<GmsInput v-model="formData.partCode" placeholder="Nhập mã phụ tùng..." required :maxlength="20" @blur="checkCode" />
					<small v-if="codeExists" class="text-danger">Mã phụ tùng đã tồn tại</small>
				</div>

				<div class="mb-3">
					<label class="form-label">Danh mục phụ tùng *</label>
					<select v-model.number="formData.partCategoryId" class="form-select" required>
						<option value="">-- Chọn danh mục --</option>
						<option v-for="category in partCategories" :key="category.partCategoryId" :value="category.partCategoryId">{{ category.partCategoryCode }} - {{ category.partCategoryName || 'N/A' }}</option>
					</select>
				</div>

				<div class="row">
					<div class="col-md-6">
						<div class="mb-3">
							<label class="form-label">Số lượng *</label>
							<GmsInput v-model.number="formData.partQuantity" type="number" placeholder="0" required :min="0" />
						</div>
					</div>
					<div class="col-md-6">
						<div class="mb-3">
							<label class="form-label">Đơn vị *</label>
							<GmsInput v-model="formData.partUnit" placeholder="Cái, Bộ, Lít..." required :maxlength="20" />
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-md-6">
						<div class="mb-3">
							<label class="form-label">Giá (VNĐ)</label>
							<GmsInput v-model.number="formData.partPrice" type="number" placeholder="0" :min="0" step="1000" />
						</div>
					</div>
					<div class="col-md-6">
						<div class="mb-3">
							<label class="form-label">Bảo hành (tháng)</label>
							<GmsInput v-model.number="formData.warrantyMonth" type="number" placeholder="0" :min="0" />
						</div>
					</div>
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
			<template v-if="selectedPart">
				<p>
					Bạn có chắc chắn muốn xóa phụ tùng
					<strong>{{ selectedPart.partName || selectedPart.partCode }}</strong>
					?
				</p>
				<p class="text-muted small">Phụ tùng sẽ bị xóa mềm (soft delete) và có thể khôi phục sau.</p>

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
	import { ref, computed, onMounted } from 'vue'
	import { useRouter } from 'vue-router'
	import { TheHeader, TheSideBar } from '@/layout'
	import { GmsInput, GmsButton, GmsTable, GmsDialog, GmsToast } from '@/components'
	import { useToast } from '@/composables/useToast'
	import { getMenuByRole } from '@/utils/menu'
	import authService from '@/services/auth'
	import partService from '@/services/part'
	import partCategoryService from '@/services/partCategory'

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
	const selectedPart = ref(null)
	const currentFilterColumn = ref(null)
	const codeExists = ref(false)

	const searchQuery = ref('')
	const pageSize = ref(10)
	const currentPage = ref(1)
	const sortConfig = ref({ key: '', order: 'asc' })

	const parts = ref([])
	const partCategories = ref([])
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
		partName: '',
		partCode: '',
		partQuantity: 0,
		partUnit: '',
		partCategoryId: null,
		partPrice: null,
		warrantyMonth: null
	})

	const tableColumns = ref([
		{ key: 'partId', label: 'ID', sortable: true, filterable: false },
		{ key: 'partCode', label: 'Mã phụ tùng', sortable: true, filterable: true },
		{ key: 'partName', label: 'Tên phụ tùng', sortable: true, filterable: true },
		{ key: 'partQuantity', label: 'Số lượng', sortable: true, filterable: true, isNumeric: true },
		{ key: 'partCategoryName', label: 'Danh mục', sortable: true, filterable: true },
		// { key: 'partPrice', label: 'Giá', sortable: true, filterable: true, isNumeric: true },
		{ key: 'warrantyMonth', label: 'Bảo hành', sortable: true, filterable: true, isNumeric: true },
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
		return column?.isNumeric || ['partQuantity', 'partPrice', 'warrantyMonth', 'partCategoryId'].includes(column?.key)
	}

	const formatPrice = (price) => {
		if (!price && price !== 0) return 'Chưa có giá'
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(price)
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
				operator: isNumericColumn(column) ? 'greater_or_equal' : 'contains',
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
		loadParts()
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
		loadParts()
		closeFilterModal()
	}

	const removeFilter = (index) => {
		const filter = activeFilters.value[index]
		const columnKey = filter.columnName

		columnFilters.value = columnFilters.value.filter((f) => f.columnName !== columnKey)

		updateActiveFilters()
		currentPage.value = 1
		loadParts()
	}

	const clearAllFilters = () => {
		columnFilters.value = []
		searchQuery.value = ''
		updateActiveFilters()
		currentPage.value = 1
		loadParts()
	}

	const updateActiveFilters = () => {
		activeFilters.value = [...columnFilters.value]
	}

	const handleSearch = () => {
		currentPage.value = 1
		loadParts()
	}

	const handleSort = ({ key, order }) => {
		sortConfig.value = { key, order }
		loadParts()
	}

	const goToPage = (page) => {
		if (page >= 1 && page <= totalPages.value) {
			currentPage.value = page
			loadParts()
		}
	}

	const handlePageSizeChange = () => {
		currentPage.value = 1
		loadParts()
	}

	const openCreateDialog = async () => {
		isEditing.value = false
		selectedPart.value = null
		codeExists.value = false
		formData.value = {
			partName: '',
			partCode: '',
			partQuantity: 0,
			partUnit: '',
			partCategoryId: null,
			partPrice: null,
			warrantyMonth: null
		}
		await loadPartCategories()
		showFormDialog.value = true
	}

	const openEditDialog = async (part) => {
		isEditing.value = true
		selectedPart.value = part
		codeExists.value = false
		formData.value = {
			partName: part.partName || '',
			partCode: part.partCode || '',
			partQuantity: part.partQuantity || 0,
			partUnit: part.partUnit || '',
			partCategoryId: part.partCategoryId || null,
			partPrice: part.partPrice || null,
			warrantyMonth: part.warrantyMonth || null
		}
		await loadPartCategories()
		showFormDialog.value = true
	}

	const closeFormDialog = () => {
		showFormDialog.value = false
		isEditing.value = false
		selectedPart.value = null
		codeExists.value = false
		formData.value = {
			partName: '',
			partCode: '',
			partQuantity: 0,
			partUnit: '',
			partCategoryId: null,
			partPrice: null,
			warrantyMonth: null
		}
	}

	const checkCode = async () => {
		if (!formData.value.partCode) {
			codeExists.value = false
			return
		}

		try {
			const excludeId = isEditing.value && selectedPart.value ? selectedPart.value.partId : null
			const response = await partService.checkCode(formData.value.partCode, excludeId)
			codeExists.value = response.data.exists
		} catch (error) {
			console.error('Error checking code:', error)
		}
	}

	const handleSubmit = async () => {
		if (!formData.value.partName || formData.value.partName.trim() === '') {
			toast.error('Vui lòng nhập tên phụ tùng')
			return
		}

		if (!formData.value.partCode || formData.value.partCode.trim() === '') {
			toast.error('Vui lòng nhập mã phụ tùng')
			return
		}

		if (codeExists.value) {
			toast.error('Mã phụ tùng đã tồn tại')
			return
		}

		if (!formData.value.partCategoryId) {
			toast.error('Vui lòng chọn danh mục phụ tùng')
			return
		}

		if (formData.value.partQuantity < 0) {
			toast.error('Số lượng phải >= 0')
			return
		}

		if (!formData.value.partUnit || formData.value.partUnit.trim() === '') {
			toast.error('Vui lòng nhập đơn vị')
			return
		}

		try {
			submitting.value = true

			const data = {
				partName: formData.value.partName.trim(),
				partCode: formData.value.partCode.trim(),
				partQuantity: formData.value.partQuantity || 0,
				partUnit: formData.value.partUnit.trim(),
				partCategoryId: formData.value.partCategoryId,
				partPrice: formData.value.partPrice || null,
				warrantyMonth: formData.value.warrantyMonth || null
			}

			if (isEditing.value && selectedPart.value) {
				await partService.update(selectedPart.value.partId, data)
				toast.success('Cập nhật thành công!', `Đã cập nhật phụ tùng "${data.partName}"`)
			} else {
				await partService.create(data)
				toast.success('Tạo mới thành công!', `Đã tạo phụ tùng "${data.partName}"`)
			}

			closeFormDialog()
			await loadParts()
		} catch (error) {
			toast.error('Lỗi', error.message || 'Có lỗi xảy ra')
		} finally {
			submitting.value = false
		}
	}

	const openDeleteDialog = (part) => {
		selectedPart.value = part
		showDeleteDialog.value = true
	}

	const confirmDelete = async () => {
		if (!selectedPart.value) return

		try {
			deleting.value = true
			await partService.delete(selectedPart.value.partId)
			toast.success('Xóa thành công!', `Đã xóa phụ tùng "${selectedPart.value.partName || selectedPart.value.partCode}"`)
			showDeleteDialog.value = false
			selectedPart.value = null
			await loadParts()
		} catch (error) {
			toast.error('Lỗi khi xóa', error.message || 'Có lỗi xảy ra')
		} finally {
			deleting.value = false
		}
	}

	const loadPartCategories = async () => {
		try {
			const response = await partCategoryService.getAll()
			const payload = response?.data?.data || response?.data || []
			partCategories.value = Array.isArray(payload) ? payload : payload.items || []
		} catch (error) {
			console.error('Error loading part categories:', error)
			partCategories.value = []
		}
	}

	const loadParts = async () => {
		try {
			loading.value = true

			// Build column filters
			const filters = [...columnFilters.value]

			// Search filter
			if (searchQuery.value && searchQuery.value.trim()) {
				filters.push({
					columnName: 'PartName',
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
					columnName: 'PartId',
					sortDirection: 'DESC'
				})
			}

			const params = {
				page: currentPage.value,
				pageSize: pageSize.value,
				columnFilters: filters,
				columnSorts
			}

			const response = await partService.getPaging(params)
			parts.value = response.data.items || []
			totalItems.value = response.data.total || 0
		} catch (error) {
			toast.error('Lỗi khi tải danh sách phụ tùng', error.message || 'Có lỗi xảy ra')
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
		await loadPartCategories()
		await loadParts()
	})
</script>

<style scoped>
	.parts-view {
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

	.category-name {
		font-weight: 600;
		color: var(--dark, #2c3a47);
	}

	.category-code {
		font-size: 0.85rem;
		color: #666;
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

	.small {
		font-size: 0.875rem;
	}

	.filter-modal-content {
		padding: 0.5rem 0;
	}

	.row {
		display: flex;
		gap: 1rem;
	}

	.col-md-6 {
		flex: 1;
	}
</style>
