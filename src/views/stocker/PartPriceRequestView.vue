<template>
	<div class="price-requests-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader title="Quản lý yêu cầu xét giá" :show-search="false" :notifications="notifications" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<div class="page-header">
					<div>
						<p class="page-subtitle">Quản lý</p>
						<h1 class="page-title">Yêu cầu xét giá</h1>
						<p class="page-description">Theo dõi các yêu cầu xét giá gần đây và trạng thái xử lý</p>
					</div>
					<GmsButton variant="primary" icon="fa-plus" @click="openPartModal">Tạo yêu cầu mới</GmsButton>
				</div>

				<div class="stats-grid">
					<div class="stat-card created">
						<div class="stat-label">Đã tạo</div>
						<div class="stat-value">{{ stats.created }}</div>
						<div class="stat-meta">
							<i class="fas fa-file"></i>
							<span>Chờ định giá</span>
						</div>
					</div>
					<div class="stat-card priced">
						<div class="stat-label">Đã định giá</div>
						<div class="stat-value">{{ stats.priced }}</div>
						<div class="stat-meta">
							<i class="fas fa-calculator"></i>
							<span>Chờ xác nhận</span>
						</div>
					</div>
					<div class="stat-card confirmed">
						<div class="stat-label">Đã xác nhận</div>
						<div class="stat-value">{{ stats.confirmed }}</div>
						<div class="stat-meta">
							<i class="fas fa-check"></i>
							<span>Sẵn sàng đóng</span>
						</div>
					</div>
					<div class="stat-card closed">
						<div class="stat-label">Đã đóng</div>
						<div class="stat-value">{{ stats.closed }}</div>
						<div class="stat-meta">
							<i class="fas fa-boxes"></i>
							<span>Hoàn tất</span>
						</div>
					</div>
				</div>

				<div class="filters-card">
					<div class="search-field">
						<i class="fas fa-search"></i>
						<GmsInput v-model="searchQuery" placeholder="Tìm theo mã yêu cầu, người tạo..." :clearable="true" @input="handleSearch" />
					</div>
					<div class="status-tabs">
						<button
							v-for="tab in statusTabs"
							:key="tab.status"
							class="status-tab"
							:class="{ active: activeStatusTab === tab.status }"
							@click="setStatusTab(tab.status)"
						>
							{{ tab.label }} <span class="badge">{{ tab.count }}</span>
						</button>
					</div>
				</div>

				<div class="table-card">
					<div class="table-header">
						<div>
							<h2>Danh sách các phiếu yêu cầu xét giá</h2>
							<p class="table-subtitle">
								Hiển thị {{ displayRange.start }} - {{ displayRange.end }} / {{ pagination.totalItems }} phiếu
							</p>
						</div>
					</div>
					<div class="table-wrapper">
						<GmsTable :data="filteredRequests" :columns="tableColumns" :loading="loading" :pagination="false" :scrollable="true">
							<template #cell-code="{ row }">
								<div>
									<strong>{{ row.code }}</strong>
									<span class="muted">#{{ row.internalId }}</span>
								</div>
							</template>

							<template #cell-requestedBy="{ row }">
								<div class="supplier-cell">
									<span class="supplier-name">{{ row.requestedBy }}</span>
								</div>
							</template>

							<template #cell-confirmedBy="{ row }">
								<div class="supplier-cell">
									<span class="supplier-name">{{ row.confirmedBy || 'Chưa có' }}</span>
								</div>
							</template>

							<template #cell-requestDate="{ row }">
								{{ formatDate(row.requestDate) }}
							</template>

							<template #cell-confirmedDate="{ row }">
								{{ formatDate(row.confirmedDate) }}
							</template>

							<template #cell-status="{ row }">
								<span :class="`status-chip status-${row.status.toLowerCase()}`" :title="row.rejectionReason || ''">
									<i :class="`fas ${getStatusIcon(row.status)}`"></i>
									{{ getStatusLabel(row.status) }}
								</span>
							</template>

							<template #cell-note="{ row }">
								{{ row.note || '—' }}
							</template>

							<template #cell-actions="{ row }">
								<div class="action-buttons">
									<button class="action-button" title="Xem chi tiết" @click="openDetail(row.index)">
										<i class="fas fa-eye"></i>
									</button>
									<button
										class="action-button"
										title="Đóng yêu cầu"
										:disabled="!canCloseRequest(row)"
										@click="handleClose(row.index)"
									>
										<i class="fas fa-times"></i>
									</button>
								</div>
							</template>
						</GmsTable>
					</div>
					<div v-if="!loading && !filteredRequests.length" class="table-empty">
						Không có phiếu xuất kho phù hợp.
					</div>

					<div v-if="!loading && pagination.totalItems > 0" class="table-pagination">
						<div class="pagination-info">
							Hiển thị {{ displayRange.start }} - {{ displayRange.end }} / {{ pagination.totalItems }} phiếu
						</div>
						<div class="pagination-controls">
							<button class="page-btn" :disabled="pagination.page === 1" @click="goToPage(pagination.page - 1)">
								Trước
							</button>
							<button
								v-for="page in pageNumbers"
								:key="page"
								class="page-btn"
								:class="{ active: page === pagination.page }"
								@click="goToPage(page)"
							>
								{{ page }}
							</button>
							<button class="page-btn" :disabled="pagination.page === totalPages" @click="goToPage(pagination.page + 1)">
								Sau
							</button>
							<label class="page-size">
								<span>Hiển thị</span>
								<select v-model.number="pagination.size" @change="handlePageSizeChange">
									<option v-for="size in pageSizeOptions" :key="size" :value="size">
										{{ size }}
									</option>
								</select>
								<span>/ trang</span>
							</label>
						</div>
					</div>
				</div>
			</main>
		</div>

		<!-- Part Selection Modal - New Request -->
		<GmsDialog v-model="showPartModal" title="Chọn phụ tùng cho phiếu yêu cầu" size="full">
			<div class="part-selection-dialog">
				<div class="part-selection-header">
					<div>
						<h3>Danh sách phụ tùng</h3>
						<p>{{ partModalPagination.totalItems }} phụ tùng khả dụng</p>
					</div>
					<GmsInput v-model="partSearchQuery" placeholder="Nhập tên hoặc mã phụ tùng..." prefix-icon="fa-search" @input="filterParts" />
				</div>

				<div class="part-selection-body">
					<div class="left-panel">
						<div class="part-table-wrapper">
							<table class="part-table">
								<thead>
									<tr>
										<th>ID</th>
										<th>Mã phụ tùng</th>
										<th>Tên phụ tùng</th>
										<th>Danh mục</th>
										<th>Status</th>
										<th>Hành động</th>
									</tr>
								</thead>
								<tbody>
									<tr v-if="partModalLoading">
										<td colspan="6" class="empty-cell">Đang tải dữ liệu...</td>
									</tr>
									<tr v-else-if="!paginatedParts.length">
										<td colspan="6" class="empty-cell">Không có phụ tùng đủ điều kiện.</td>
									</tr>
									<template v-else>
										<tr
											v-for="part in paginatedParts"
											:key="part.id"
											:class="{ selected: isPartSelected(part.id) }"
											@click="togglePart(part)"
										>
											<td>{{ part.id }}</td>
											<td><strong>{{ part.code }}</strong></td>
											<td>{{ part.name }}</td>
											<td>
												<div class="supplier-cell">
													<span class="supplier-name">{{ part.category }}</span>
													<span class="muted">{{ part.catCode }}</span>
												</div>
											</td>
											<td>
												<span v-if="part.status" class="part-status">{{ part.status }}</span>
												<span v-else class="part-status-na">#N/A</span>
											</td>
											<td>
												<button
													class="select-part-btn"
													:class="{ deselected: !isPartSelected(part.id) }"
													@click.stop="togglePart(part)"
												>
													<i :class="isPartSelected(part.id) ? 'fas fa-circle-check' : 'far fa-circle'"></i>
												</button>
											</td>
										</tr>
									</template>
								</tbody>
							</table>
							<div class="part-pagination">
								<button :disabled="partModalLoading || currentPartPage === 1" @click="prevPartPage">Trước</button>
								<span>Trang {{ currentPartPage }} / {{ totalPartPages }}</span>
								<button :disabled="partModalLoading || currentPartPage === totalPartPages" @click="nextPartPage">
									Sau
								</button>
							</div>
						</div>
					</div>

					<div class="right-panel">
						<div class="selected-summary">
							<h4>
								<span>Phụ tùng đã chọn ({{ selectedParts.length }})</span>
								<span class="selected-total">{{ formatCurrency(selectedTotal) }}</span>
							</h4>
							<ul v-if="selectedParts.length > 0">
								<li v-for="selected in selectedParts" :key="selected.id" class="selected-card">
									<div class="selected-card-header">
										<div class="selected-info">
											<div class="selected-name">{{ selected.code }} - {{ selected.name }}</div>
										</div>
										<button class="remove-chip" @click="removePart(selected.id)">Xóa</button>
									</div>
									<div class="selected-inputs">
										<div class="input-group">
											<label>Số lượng:</label>
											<input type="number" class="form-input" v-model.number="selected.orderQty" :min="1" :max="selected.available" />
										</div>
										<div class="input-group">
											<label>Giá mua:</label>
											<input type="number" class="form-input" v-model.number="selected.unit_price" :min="1000" placeholder="Nhập giá mua" />
										</div>
									</div>
								</li>
							</ul>
							<div v-else class="selected-empty">Chưa chọn phụ tùng</div>
						</div>
					</div>
				</div>

				<div class="note-section">
					<label class="note-label">
						<i class="fas fa-sticky-note"></i>
						<span>Ghi chú:</span>
					</label>
					<textarea v-model="requestNote" class="note-input" placeholder="Nhập ghi chú cho yêu cầu..." rows="3"></textarea>
				</div>

				<div class="dialog-actions">
					<GmsButton variant="outline" @click="closePartModal">Hủy</GmsButton>
					<GmsButton
						variant="primary"
						:disabled="creatingRequest || selectedParts.length === 0"
						@click="confirmSelection"
					>
						{{ creatingRequest ? 'Đang tạo...' : 'Tạo phiếu' }}
					</GmsButton>
				</div>
			</div>
		</GmsDialog>

		<!-- Detail Modal -->
		<GmsDialog v-model="showDetailModal" :title="`Chi tiết yêu cầu ${currentRequest?.code || ''}`" size="full">
			<div v-if="detailLoading" class="detail-loading">
				<span class="detail-spinner"></span>
				<p>Dang tai chi tiet phieu...</p>
			</div>
			<div v-else-if="currentRequest" class="detail-dialog">
				<div class="detail-left">
					<div class="detail-info-card">
						<h3>Thông tin chung</h3>
						<div class="detail-info-row">
							<span class="detail-info-label">Mã yêu cầu</span>
							<span class="detail-info-value">{{ currentRequest.code }}</span>
						</div>
						<div class="detail-info-row">
							<span class="detail-info-label">Ngày tạo:</span>
							<span class="detail-info-value">{{ formatDate(currentRequest.requestDate) }}</span>
						</div>
						<div class="detail-info-row">
							<span class="detail-info-label">Người tạo:</span>
							<span class="detail-info-value">{{ currentRequest.requestedBy }}</span>
						</div>
						<div class="detail-info-row">
							<span class="detail-info-label">Người xác nhận:</span>
							<span class="detail-info-value">{{ currentRequest.confirmedBy || 'Chưa có' }}</span>
						</div>
						<div class="detail-info-row">
							<span class="detail-info-label">Ngày xác nhận:</span>
							<span class="detail-info-value">{{ formatDate(currentRequest.confirmedDate) }}</span>
						</div>
						<div class="detail-info-row">
							<span class="detail-info-label">Trạng thái:</span>
							<span class="detail-info-value">{{ getStatusLabel(currentRequest.status) }}</span>
						</div>
						<div class="detail-info-row">
							<span class="detail-info-label">Ghi chú:</span>
							<span class="detail-info-value">{{ currentRequest.note || 'Không có ghi chú' }}</span>
						</div>
						<div class="detail-info-row">
							<span class="detail-info-label">Tổng giá trị:</span>
							<span class="detail-info-value">{{ formatCurrency(currentRequest.totalAmount) }}</span>
						</div>
						<div v-if="currentRequest.status === 'REJECTED' && currentRequest.rejectionReason" class="detail-rejection">
							<strong>Lý do từ chối</strong>
							<p>{{ currentRequest.rejectionReason }}</p>
						</div>
					</div>
				</div>

				<div class="detail-right">
					<div class="items-table-wrapper">
						<table class="items-table">
							<thead>
								<tr>
									<th>MÃ PT</th>
									<th>TÊN</th>
									<th>SỐ LƯỢNG</th>
									<th>GIÁ MUA</th>
									<th>THÀNH TIỀN</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(item, idx) in currentRequestItems" :key="idx">
									<td>{{ item.code }}</td>
									<td>{{ item.name }}</td>
									<td>{{ item.quantity }}</td>
									<td>{{ formatCurrency(item.oldPrice) }}</td>
									<td>{{ formatCurrency(item.quantity * item.oldPrice) }}</td>
								</tr>
							</tbody>
							<tfoot>
								<tr class="total-row">
									<td colspan="4" style="text-align: right; font-weight: 700">Tổng cộng:</td>
									<td>{{ formatCurrency(detailGrandTotal) }}</td>
								</tr>
							</tfoot>
						</table>
					</div>

					<div class="detail-actions">
						<GmsButton
							v-if="currentRequest.status === 'CONFIRMED' && canCloseRequest(currentRequest)"
							variant="primary"
							icon="fa-times"
							@click="handleClose"
						>
							Đóng yêu cầu
						</GmsButton>
						<GmsButton variant="outline" @click="showDetailModal = false">Đóng</GmsButton>
					</div>
				</div>
			</div>
			<div v-else class="detail-loading">
				<p>Chưa có dữ liệu chi tiết.</p>
			</div>
		</GmsDialog>

		<!-- Toast -->
		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
	import { ref, computed, reactive, onMounted } from 'vue'
	import { TheHeader, TheSideBar } from '@/layout'
	import { GmsInput, GmsButton, GmsTable, GmsDialog, GmsToast } from '@/components'
	import { useToast } from '@/composables/useToast'
	import { getMenuByRole } from '@/utils/menu'
	import authService from '@/services/auth'
	import partService from '@/services/part'

	const toastRef = ref(null)
	const toast = useToast()

	const sidebarCollapsed = ref(false)
	const loading = ref(false)
	const showPartModal = ref(false)
	const showDetailModal = ref(false)
	const detailLoading = ref(false)
	const notifications = ref([])
	const menuItems = ref([])
	const requestNote = ref('')

	const searchQuery = ref('')
	const activeStatusTab = ref('ALL')
	const partSearchQuery = ref('')
	const currentPartPage = ref(1)
	const itemsPerPage = 10
	const partModalPagination = reactive({
		page: 0,
		size: itemsPerPage,
		totalItems: 0
	})
	const partModalLoading = ref(false)
	const creatingRequest = ref(false)

	// Mock data
	const priceRequests = ref([])
	const pagination = reactive({
		page: 1,
		size: 10,
		totalItems: 0
	})
	const pageSizeOptions = [5, 10, 15, 20]


	const parts = ref([])

	const selectedParts = ref([])
	const currentRequest = ref(null)
	const currentUser = ref(null)
	const tableColumns = ref([
		{ key: 'code', label: 'Mã yêu cầu', sortable: true, filterable: true },
		{ key: 'requestedBy', label: 'Người tạo', sortable: true, filterable: true },
		{ key: 'confirmedBy', label: 'Người xác nhận', sortable: true, filterable: true },
		{ key: 'requestDate', label: 'Ngày tạo', sortable: true, filterable: true },
		{ key: 'confirmedDate', label: 'Ngày xác nhận', sortable: true, filterable: true },
		{ key: 'status', label: 'Trạng thái', sortable: true, filterable: true },
		{ key: 'note', label: 'Ghi chú', sortable: false, filterable: true },
		{ key: 'actions', label: 'Hành động', filterable: false }
	])

	// Computed
	const stats = computed(() => {
		return {
			created: priceRequests.value.filter((r) => r.status === 'CREATED').length,
			priced: priceRequests.value.filter((r) => r.status === 'PRICED').length,
			confirmed: priceRequests.value.filter((r) => r.status === 'CONFIRMED').length,
			closed: priceRequests.value.filter((r) => r.status === 'CLOSED').length
		}
	})

	const statusTabs = computed(() => {
		return [
			{ status: 'ALL', label: 'Tất cả', count: priceRequests.value.length },
			{ status: 'CREATED', label: 'Đã tạo', count: stats.value.created },
			{ status: 'PRICED', label: 'Đã định giá', count: stats.value.priced },
			{ status: 'CONFIRMED', label: 'Đã xác nhận', count: stats.value.confirmed },
			{ status: 'CLOSED', label: 'Đã đóng', count: stats.value.closed }
		]
	})

	const filteredRequests = computed(() => priceRequests.value)

	const totalPages = computed(() => {
		if (!pagination.size || pagination.size <= 0) return 1
		if (!pagination.totalItems) return 1
		return Math.max(1, Math.ceil(pagination.totalItems / pagination.size))
	})

	const pageNumbers = computed(() => {
		const pages = []
		const maxVisible = 5
		let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2))
		let end = Math.min(totalPages.value, start + maxVisible - 1)

		if (end - start < maxVisible - 1) {
			start = Math.max(1, end - maxVisible + 1)
		}

		for (let i = start; i <= end; i += 1) {
			pages.push(i)
		}

		return pages
	})

	const displayRange = computed(() => {
		if (!pagination.totalItems) {
			return { start: 0, end: 0 }
		}
		const start = (pagination.page - 1) * pagination.size + 1
		const end = Math.min(start + filteredRequests.value.length - 1, pagination.totalItems)
		return { start, end }
	})

	const paginatedParts = computed(() => parts.value)

	const totalPartPages = computed(() => {
		const total = partModalPagination.totalItems || parts.value.length || 0
		const size = partModalPagination.size || itemsPerPage
		const pages = Math.ceil(total / size) || 1
		return Math.max(1, pages)
	})

	const selectedTotal = computed(() => {
		return selectedParts.value.reduce((sum, s) => sum + (s.orderQty * (s.unit_price || s.purchase_price)), 0)
	})

	const currentRequestItems = computed(() => currentRequest.value?.items || [])

	const detailGrandTotal = computed(() => {
		return currentRequestItems.value.reduce((sum, item) => sum + item.quantity * item.oldPrice, 0)
	})

	// Methods
	const canCloseRequest = (request) => {
		if (!request || !currentUser.value) return false

		// Lấy ID từ user object và parse thành số nguyên
		const rawId = currentUser.value?.id || currentUser.value?.userId || currentUser.value?.accountId
		const currentUserId = rawId != null ? Number(rawId) : null

		// Validate currentUserId là một số nguyên hợp lệ
		if (!currentUserId || isNaN(currentUserId) || currentUserId <= 0) {
			return false
		}

		// Kiểm tra status phải là CONFIRMED
		if (request.status !== 'CONFIRMED') return false

		// Kiểm tra người close phải là người request
		if (request.requestedById != null && Number(request.requestedById) !== currentUserId) {
			return false
		}

		// Kiểm tra người close không được là người confirmed
		if (request.confirmedById != null && Number(request.confirmedById) === currentUserId) {
			return false
		}

		return true
	}
	const formatCurrency = (num = 0) => {
		return (Number(num) || 0).toLocaleString('vi-VN') + ' đ'
	}

	const formatDate = (date) => {
		if (!date) return 'Chưa có'

		const parsed =
			date instanceof Date
				? date
				: typeof date === 'string'
					? new Date(date)
					: null

		if (!parsed || Number.isNaN(parsed.getTime())) {
			return typeof date === 'string' ? date : 'Chưa có'
		}

		return new Intl.DateTimeFormat('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}).format(parsed)
	}

	const getStatusLabel = (status) => {
		const labels = {
			CREATED: 'Đã tạo',
			PRICED: 'Đã báo giá',
			CONFIRMED: 'Đã xác nhận',
			CLOSED: 'Đã đóng',
			REJECTED: 'Từ chối'
		}
		return labels[status] || status
	}

	const getStatusIcon = (status) => {
		const icons = {
			CREATED: 'fa-circle-plus',
			PRICED: 'fa-tags',
			CONFIRMED: 'fa-check-circle',
			CLOSED: 'fa-box',
			REJECTED: 'fa-times-circle'
		}
		return icons[status] || 'fa-circle'
	}

	const setStatusTab = (status) => {
		if (activeStatusTab.value === status) return
		activeStatusTab.value = status
		pagination.page = 1
		loadPartStockOuts()
	}

	const handleSearch = () => {
		pagination.page = 1
		loadPartStockOuts()
	}

	const normalizeStockOutItem = (item = {}) => {
		const quantity = Number(item.quantity ?? item.partQuantity ?? item.orderQty ?? 0)
		const unitPrice = Number(
			item.stockOutPrice ?? item.importPrice ?? item.oldPrice ?? item.unit_price ?? item.price ?? 0
		)

		return {
			id: item.partStockOutItemId || item.id || item.partId,
			partId: item.partId,
			code: item.partCode || item.code || '',
			name: item.partName || item.name || '',
			quantity,
			oldPrice: unitPrice,
			newPrice: Number(item.partPrice ?? item.newPrice ?? 0),
			total: quantity * unitPrice
		}
	}

	const normalizeStockOutRequest = (item) => {
		const normalizedItems = Array.isArray(item?.items) ? item.items.map((child) => normalizeStockOutItem(child)) : []
		const totalAmount =
			item.totalAmount != null
				? Number(item.totalAmount)
				: normalizedItems.reduce((sum, child) => sum + child.total, 0)

		return {
			index: item.partStockOutId,
			id: item.partStockOutId,
			code: item.partStockOutCode,
			internalId: item.partStockOutId,
			requestedBy: item.requestedByName || 'N/A',
			requestedById: item.requestedById || null,
			confirmedBy: item.confirmedByName || null,
			confirmedById: item.confirmedById || null,
			requestDate: item.requestedDate,
			confirmedDate: item.confirmedDate,
			status: item.status || 'CREATED',
			note: item.note || '',
			totalAmount,
			items: normalizedItems,
			raw: item
		}
	}

	const loadPartStockOuts = async () => {
		try {
			loading.value = true
			const params = {
				page: Math.max(0, pagination.page - 1),
				size: pagination.size,
				direction: 'DESC'
			}
			if (searchQuery.value?.trim()) {
				params.keyword = searchQuery.value.trim()
			}
			if (activeStatusTab.value && activeStatusTab.value !== 'ALL') {
				params.status = activeStatusTab.value
			}
			const response = await partService.getStockOutList(params)
			const payload = response?.data?.data || response?.data || {}
			const items = Array.isArray(payload) ? payload : payload.items || []
			priceRequests.value = items.map((item) => normalizeStockOutRequest(item))
			const total = payload.totalItems ?? payload.total ?? items.length
			const serverPage = payload.page ?? payload.currentPage ?? params.page ?? 0
			pagination.totalItems = Number(total) || 0
			pagination.size = payload.size ?? params.size ?? pagination.size
			pagination.page = pagination.totalItems === 0 ? 1 : Number(serverPage) + 1
		} catch (error) {
			priceRequests.value = []
			pagination.totalItems = 0
			pagination.page = 1
			toast.error(error?.message || 'Khong the tai danh sach phieu xuat kho')
		} finally {
			loading.value = false
		}
	}

	const goToPage = (page) => {
		if (page < 1 || page > totalPages.value) return
		pagination.page = page
		loadPartStockOuts()
	}

	const handlePageSizeChange = () => {
		if (!pagination.size || pagination.size <= 0) {
			pagination.size = 10
		}
		pagination.page = 1
		loadPartStockOuts()
	}

	const openPartModal = async () => {
		selectedParts.value = []
		currentPartPage.value = 1
		partModalPagination.page = 0
		partSearchQuery.value = ''
		requestNote.value = ''
		showPartModal.value = true
		await loadAvailableParts()
	}

	const closePartModal = () => {
		showPartModal.value = false
		selectedParts.value = []
		requestNote.value = ''
		parts.value = []
		partModalPagination.totalItems = 0
		partModalPagination.page = 0
		currentPartPage.value = 1
	}

	const filterParts = () => {
		partModalPagination.page = 0
		currentPartPage.value = 1
		loadAvailableParts()
	}

	const normalizePartFromApi = (item) => ({
		id: item.partId,
		code: item.partCode,
		name: item.partName,
		category: item.partCategoryName || 'N/A',
		catCode: item.partCategoryCode || '',
		qty: item.partQuantity ?? 0,
		partQuantity: item.partQuantity ?? 0,
		availableQty: item.partQuantity ?? 0,
		purchase_price: item.importPrice ?? 0,
		selling_price: item.partPrice ?? 0,
		status: item.status || '',
		warranty: item.warrantyMonth ?? 0
	})

	const loadAvailableParts = async () => {
		if (!showPartModal.value) return
		try {
			partModalLoading.value = true
			const params = {
				page: partModalPagination.page,
				size: partModalPagination.size,
				direction: 'DESC'
			}
			const keyword = partSearchQuery.value?.trim()
			if (keyword) {
				params.keyword = keyword
			}
			const response = await partService.getImportedAvailable(params)
			const payload = response?.data?.data || response?.data || {}
			const items = Array.isArray(payload) ? payload : payload.items || []
			parts.value = items.map(normalizePartFromApi)
			const total = payload.totalItems ?? payload.total ?? items.length
			partModalPagination.totalItems = Number(total) || items.length
			const serverPage = payload.page ?? payload.currentPage ?? params.page ?? 0
			partModalPagination.page = Number(serverPage) || 0
			partModalPagination.size = payload.size ?? params.size ?? partModalPagination.size
			currentPartPage.value = partModalPagination.page + 1
		} catch (error) {
			parts.value = []
			partModalPagination.totalItems = 0
			toast.error(error?.message || 'Không thể tải danh sách phụ tùng đủ điều kiện')
		} finally {
			partModalLoading.value = false
		}
	}

	const isPartSelected = (id) => {
		return selectedParts.value.some((s) => s.id === id)
	}

	const togglePart = (part) => {
		const index = selectedParts.value.findIndex((s) => s.id === part.id)
		if (index > -1) {
			selectedParts.value.splice(index, 1)
		} else {
			selectedParts.value.push({
				...part,
				available: part.availableQty ?? part.qty ?? part.partQuantity ?? 0,
				orderQty: 1,
				unit_price: part.purchase_price,
				unit_price_type: 'PURCHASE'
			})
		}
	}

	const removePart = (id) => {
		selectedParts.value = selectedParts.value.filter((s) => s.id !== id)
	}

	const prevPartPage = () => {
		if (partModalPagination.page <= 0 || partModalLoading.value) return
		partModalPagination.page -= 1
		currentPartPage.value = partModalPagination.page + 1
		loadAvailableParts()
	}

	const nextPartPage = () => {
		if (currentPartPage.value >= totalPartPages.value || partModalLoading.value) return
		partModalPagination.page += 1
		currentPartPage.value = partModalPagination.page + 1
		loadAvailableParts()
	}

	const confirmSelection = async () => {
		if (selectedParts.value.length === 0 || creatingRequest.value) return

		if (!currentUser.value) {
			toast.error('Không xác định được thông tin người dùng')
			return
		}

		// Lấy ID từ user object và parse thành số nguyên
		const rawId = currentUser.value?.id || currentUser.value?.userId || currentUser.value?.accountId
		const requestedById = rawId != null ? Number(rawId) : null

		// Validate requestedById là một số nguyên hợp lệ
		if (!requestedById || isNaN(requestedById) || requestedById <= 0) {
			toast.error('Không xác định được ID người yêu cầu hợp lệ')
			console.error('Invalid requestedById:', { rawId, requestedById, user: currentUser.value })
			return
		}

		const items = selectedParts.value
			.map((part) => ({
				partId: part.id,
				partQuantity: Number(part.orderQty) || 0,
				importPrice: part.unit_price != null ? Number(part.unit_price) : part.purchase_price ?? 0
			}))
			.filter((item) => item.partId && item.partQuantity > 0)

		if (!items.length) {
			toast.error('Vui lòng nhập số lượng hợp lệ')
			return
		}

		const payload = {
			requestedById,
			note: requestNote.value?.trim() || null,
			items
		}

		try {
			creatingRequest.value = true
			await partService.createStockOutRequest(payload)
			toast.success('Tạo phiếu thành công!', `Đã gửi ${items.length} phụ tùng chờ xét giá`)
			closePartModal()
			await loadPartStockOuts()
		} catch (error) {
			toast.error(error?.message || 'Không thể tạo yêu cầu xét giá')
		} finally {
			creatingRequest.value = false
		}
	}

	const openDetail = async (index) => {
		const baseRequest = priceRequests.value.find((r) => r.index === index)
		if (!baseRequest?.id) {
			toast.error('Khong tim thay thong tin phieu')
			return
		}

		showDetailModal.value = true
		detailLoading.value = true
		try {
			const response = await partService.getStockOutDetail(baseRequest.id)
			const payload = response?.data?.data || response?.data || {}
			currentRequest.value = normalizeStockOutRequest({
				...baseRequest.raw,
				...payload
			})
		} catch (error) {
			currentRequest.value = null
			showDetailModal.value = false
			toast.error(error?.message || 'Khong the tai chi tiet phieu')
		} finally {
			detailLoading.value = false
		}
	}

	const handleClose = async (index) => {
		const request = typeof index === 'number' ? priceRequests.value.find((r) => r.index === index) : currentRequest.value
		if (!request) return

		if (!currentUser.value) {
			toast.error('Không xác định được thông tin người dùng')
			return
		}

		// Lấy ID từ user object và parse thành số nguyên
		const rawId = currentUser.value?.id || currentUser.value?.userId || currentUser.value?.accountId
		const currentUserId = rawId != null ? Number(rawId) : null

		// Validate currentUserId là một số nguyên hợp lệ
		if (!currentUserId || isNaN(currentUserId) || currentUserId <= 0) {
			toast.error('Không xác định được ID người dùng hiện tại hợp lệ')
			console.error('Invalid currentUserId:', { rawId, currentUserId, user: currentUser.value })
			return
		}

		// Kiểm tra điều kiện
		if (request.status !== 'CONFIRMED') {
			toast.error('Chỉ có thể đóng yêu cầu ở trạng thái "Đã xác nhận"!')
			return
		}

		// Kiểm tra người close phải là người request
		if (request.requestedById != null && Number(request.requestedById) !== currentUserId) {
			toast.error('Chỉ người tạo yêu cầu mới có thể đóng phiếu!')
			return
		}

		// Kiểm tra người close không được là người confirmed
		if (request.confirmedById != null && Number(request.confirmedById) === currentUserId) {
			toast.error('Người đã xác nhận không thể đóng phiếu!')
			return
		}

		try {
			await partService.closeStockOut(request.id, { closedById: currentUserId })
			const message = `Đã đóng yêu cầu ${request.code}!`
			toast.success(message)

			if (showDetailModal.value) {
				showDetailModal.value = false
			}

			// Reload list to get updated data
			await loadPartStockOuts()
		} catch (error) {
			toast.error(error?.message || 'Không thể đóng yêu cầu')
		}
	}

	const handleLogout = async () => {
		await authService.logout()
		window.location.href = '/'
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
			currentUser.value = user
		}

		await loadPartStockOuts()
	})
</script>

<style scoped>
	.price-requests-view {
		display: flex;
		min-height: 100vh;
		background: #f6f8fb;
	}

	.content-wrapper {
		flex: 1;
		transition: margin-left 0.3s ease;
	}

	.main-content {
		padding: 2rem;
		flex: 1;
		margin-top: 70px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}


	.page-subtitle {
		color: #6c757d;
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.85rem;
	}

	.page-title {
		margin: 0.25rem 0;
		font-size: 2rem;
		color: #1f2937;
	}

	.page-description {
		margin: 0;
		color: #546372;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-card {
		border-radius: 16px;
		padding: 1.25rem;
		color: white;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}

	.stat-card.created {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
	}

	.stat-card.priced {
		background: linear-gradient(135deg, #10b981, #059669);
	}

	.stat-card.confirmed {
		background: linear-gradient(135deg, #f59e0b, #d97706);
	}

	.stat-card.closed {
		background: linear-gradient(135deg, #6b7280, #4b5563);
	}

	.stat-label {
		font-size: 0.85rem;
		opacity: 0.9;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		margin: 0.5rem 0;
	}

	.stat-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.9rem;
		opacity: 0.9;
	}

	.filters-card {
		background: white;
		border-radius: 18px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
		margin-bottom: 1.5rem;
	}

	.search-field {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border: 2px solid #edf1f7;
		border-radius: 12px;
		background: #fdfefe;
	}

	.status-tabs {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.status-tab {
		border: none;
		border-radius: 999px;
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		color: #4b5563;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.status-tab .badge {
		background: white;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.status-tab.active {
		background: #1f7cff;
		color: white;
		box-shadow: 0 10px 24px rgba(31, 124, 255, 0.25);
	}

	.status-tab.active .badge {
		background: rgba(255, 255, 255, 0.3);
		color: white;
	}

	.table-card {
		background: white;
		border-radius: 18px;
		padding: 1.5rem;
		box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
		margin-bottom: 1.5rem;
	}

	.table-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.table-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #1f2937;
	}

	.table-header p {
		margin: 0.25rem 0 0;
		color: #6c757d;
		font-size: 0.9rem;
	}

	.table-header .table-subtitle {
		color: #6b7280;
	}

	.table-empty {
		text-align: center;
		padding: 1rem;
		color: #94a3b8;
		font-style: italic;
	}

	.table-pagination {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.pagination-info {
		font-weight: 600;
		color: #1f2937;
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.page-btn {
		min-width: 38px;
		padding: 0.4rem 0.75rem;
		border-radius: 8px;
		border: 1px solid #d1d5db;
		background: white;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.page-btn:hover:not(:disabled) {
		border-color: #1f7cff;
		color: #1f7cff;
	}

	.page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-btn.active {
		background: #1f7cff;
		color: #fff;
		border-color: #1f7cff;
	}

	.page-size {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-weight: 600;
		color: #374151;
	}

	.page-size select {
		padding: 0.35rem 0.6rem;
		border-radius: 8px;
		border: 1px solid #d1d5db;
		font-weight: 600;
	}

	.table-wrapper {
		overflow-x: auto;
	}

	.muted {
		color: #94a3b8;
		font-size: 0.9rem;
		margin-left: 0.5rem;
	}

	.supplier-cell {
		display: flex;
		flex-direction: column;
	}

	.supplier-name {
		font-weight: 600;
		color: #1f2937;
	}

	.status-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.8rem;
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.85rem;
	}

	.status-created {
		background: rgba(59, 130, 246, 0.15);
		color: #1e40af;
	}

	.status-priced {
		background: rgba(16, 185, 129, 0.15);
		color: #047857;
	}

	.status-confirmed {
		background: rgba(245, 158, 11, 0.15);
		color: #b45309;
	}

	.status-closed {
		background: rgba(107, 114, 128, 0.15);
		color: #374151;
	}

	.status-rejected {
		background: rgba(248, 80, 50, 0.15);
		color: #c81912;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.action-button {
		width: 34px;
		height: 34px;
		border-radius: 8px;
		border: none;
		background: #eef2ff;
		color: #4c1d95;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.action-button:not(:disabled):hover {
		background: #c7d2fe;
	}

	/* Custom modal sizes */
	:deep(.gms-dialog--full) {
		max-width: 95vw !important;
		width: 95vw !important;
	}

	.part-selection-dialog {
		max-height: 75vh;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.part-selection-header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-start;
	}

	.part-selection-body {
		flex: 1;
		border: 1px solid #edf2f7;
		border-radius: 16px;
		overflow: hidden;
		background: #fff;
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem;
		min-height: 500px;
	}

	.left-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.part-table-wrapper {
		flex: 1;
		overflow-x: auto;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		padding-bottom: 0.5rem;
		max-height: 60vh;
	}

	.part-table {
		flex: 1;
		width: 100%;
		border-collapse: collapse;
		min-width: 600px;
	}

	.part-table th,
	.part-table td {
		padding: 1rem;
		border-bottom: 1px solid #edf2f7;
		text-align: left;
		white-space: nowrap;
		font-size: 0.95rem;
	}

	.part-table th {
		text-transform: uppercase;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		color: #94a3b8;
		position: sticky;
		top: 0;
		background: #f8fafc;
		z-index: 1;
	}

	.part-table td {
		white-space: normal;
		word-break: break-word;
	}

	.empty-cell {
		text-align: center;
		padding: 1.5rem;
		color: #94a3b8;
		font-style: italic;
	}

	.part-status {
		padding: 0.25rem 0.6rem;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		background: rgba(16, 185, 129, 0.1);
		color: #047857;
	}

	.part-status-na {
		padding: 0.25rem 0.6rem;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 600;
		background: rgba(107, 114, 128, 0.1);
		color: #6b7280;
		font-style: italic;
	}

	.part-table tr.selected {
		background: rgba(31, 124, 255, 0.08);
	}

	.part-table tr:hover {
		background: #f3f4f6;
		cursor: pointer;
	}

	.part-pagination {
		flex-shrink: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.85rem 1rem;
		margin-top: 0.5rem;
		background: #ffffff;
		border: 1px solid #d8e3f0;
		border-radius: 12px;
		box-shadow: 0 -6px 20px rgba(15, 23, 42, 0.08);
	}

	.part-pagination button {
		padding: 0.55rem 1.1rem;
		border: 1px solid #cbd5e1;
		background: #f1f5f9;
		border-radius: 10px;
		cursor: pointer;
		font-weight: 600;
		color: #0f172a;
		transition: all 0.2s ease;
		min-width: 110px;
	}

	.part-pagination button:hover:not(:disabled) {
		border-color: #1f7cff;
		background: #1f7cff;
		color: #fff;
		box-shadow: 0 6px 14px rgba(31, 124, 255, 0.2);
	}

	.part-pagination button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: #e2e8f0;
		border-color: #e2e8f0;
		color: #94a3b8;
		box-shadow: none;
	}

	.right-panel {
		width: 420px;
		border-left: 1px solid #e5e7eb;
		padding-left: 1.5rem;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.select-part-btn {
		border: none;
		border-radius: 999px;
		padding: 0.4rem 1rem;
		background: #1f7cff;
		color: white;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.select-part-btn:hover {
		background: #1e40af;
		transform: scale(1.05);
	}

	.select-part-btn.deselected {
		background: #6b7280;
	}

	.select-part-btn.deselected:hover {
		background: #4b5563;
	}

	.selected-summary {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 1.25rem;
		background: #ffffff;
		border: 1px solid #e7edf5;
		border-radius: 14px;
		box-shadow: 0 12px 24px rgba(31, 41, 55, 0.06);
		max-height: 60vh;
		overflow: hidden;
	}

	.selected-summary h4 {
		margin: 0 0 1rem;
		font-size: 1.05rem;
		color: #0f172a;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 0.65rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.selected-total {
		color: #16a34a;
		font-weight: 700;
		font-size: 1rem;
	}

	.selected-summary ul {
		flex: 1;
		list-style: none;
		padding: 0;
		margin: 0;
		overflow-y: auto;
		max-height: calc(65vh - 3rem);
		padding-right: 0.35rem;
	}

	.selected-card {
		background: linear-gradient(145deg, #f9fbff, #ffffff);
		border: 1px solid #e5ebf3;
		border-radius: 12px;
		padding: 1rem 1.25rem;
		margin-bottom: 0.85rem;
		box-shadow: 0 10px 18px rgba(15, 23, 42, 0.06);
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.selected-card:hover {
		box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
		transform: translateY(-1px);
	}

	.selected-empty {
		text-align: center;
		padding: 2rem 1rem;
		color: #94a3b8;
	}

	.selected-card-header {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		align-items: flex-start;
		margin-bottom: 0.75rem;
	}

	.selected-info {
		flex: 1;
	}

	.selected-name {
		font-weight: 700;
		color: #1f2937;
		font-size: 0.95rem;
	}

	.selected-inputs {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.input-group label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #4b5563;
	}

	.form-input {
		padding: 0.65rem 0.85rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.95rem;
		transition: border-color 0.2s;
		width: 100%;
	}

	.form-input:focus {
		outline: none;
		border-color: #1f7cff;
		box-shadow: 0 0 0 3px rgba(31, 124, 255, 0.1);
	}

	.remove-chip {
		background: #ef4444;
		color: white;
		border: none;
		padding: 0.4rem 0.75rem;
		border-radius: 8px;
		cursor: pointer;
		font-weight: 600;
		font-size: 0.9rem;
		box-shadow: 0 6px 12px rgba(239, 68, 68, 0.2);
		transition: background 0.2s ease, transform 0.15s ease;
		flex-shrink: 0;
	}

	.remove-chip:hover {
		background: #dc2626;
		transform: translateY(-1px);
	}

	.note-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: #f8fafc;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
	}

	.note-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: #1f2937;
		font-size: 0.95rem;
	}

	.note-label i {
		color: #1f7cff;
	}

	.note-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.95rem;
		font-family: inherit;
		resize: vertical;
		transition: border-color 0.2s;
	}

	.note-input:focus {
		outline: none;
		border-color: #1f7cff;
		box-shadow: 0 0 0 3px rgba(31, 124, 255, 0.1);
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e2e8f0;
	}

	.detail-dialog {
		display: flex;
		gap: 2rem;
		max-height: 80vh;
	}

	.detail-left {
		flex: 0.4;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.detail-info-card {
		background: #f7fbff;
		padding: 1.25rem;
		border-radius: 14px;
		border: 1px solid #e1e9f5;
		box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
	}

	.detail-info-card h3 {
		margin: 0 0 1rem;
		color: #1f2937;
	}

	.detail-info-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
		margin-bottom: 0.6rem;
		font-size: 0.95rem;
	}

	.detail-info-label {
		font-weight: 600;
		color: #41506b;
	}

	.detail-info-value {
		color: #0f172a;
		font-weight: 600;
		text-align: right;
	}

	.detail-rejection {
		background: rgba(248, 80, 50, 0.1);
		padding: 0.75rem;
		border-radius: 8px;
		border-left: 4px solid #ef4444;
		margin-top: 1rem;
	}

	.detail-right {
		flex: 0.6;
		display: flex;
		flex-direction: column;
	}

	.items-table-wrapper {
		flex: 1;
		overflow: auto;
		border: 1px solid #e3e8f0;
		border-radius: 14px;
		box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
		background: #ffffff;
		overflow: hidden;
	}

	.items-table {
		width: 100%;
		border-collapse: collapse;
	}

	.items-table th,
	.items-table td {
		padding: 0.85rem 1rem;
		text-align: left;
		border-bottom: 1px solid #eef2f7;
		font-size: 1rem;
	}

	.items-table th {
		background: #f4f7fb;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: #41506b;
	}

	.items-table .total-row {
		font-weight: 700;
		background: #e7f1ff;
		color: #0f172a;
	}

	.detail-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid #e2e8f0;
		margin-top: 1rem;
	}

	.detail-loading {
		padding: 2rem;
		text-align: center;
		color: #475569;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		min-height: 200px;
		justify-content: center;
	}

	.detail-spinner {
		width: 48px;
		height: 48px;
		border-radius: 999px;
		border: 4px solid #e5e7eb;
		border-top-color: #f97316;
		animation: detail-spin 0.8s linear infinite;
		display: inline-block;
	}

	@keyframes detail-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 1024px) {
		.content-wrapper {
			margin-left: 0 !important;
		}

		.page-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.part-selection-body,
		.detail-dialog {
			flex-direction: column;
		}

		.right-panel {
			width: 100%;
			border-left: none;
			border-top: 1px solid #e5e7eb;
			padding-left: 0;
			padding-top: 1rem;
		}

		.part-table {
			min-width: 100%;
		}

		.part-table th,
		.part-table td {
			padding: 0.5rem;
			font-size: 0.85rem;
		}
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.part-table {
			font-size: 0.8rem;
		}

		.part-table th,
		.part-table td {
			padding: 0.4rem;
		}
	}
</style>
