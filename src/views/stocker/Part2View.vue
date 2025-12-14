<template>
	<div class="restock-requests-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader title="Quản lý phiếu phê duyệt giá bán" :show-search="false" :notifications="notifications" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<div class="page-header">
					<div>
						<p class="page-subtitle">Quản lý</p>
						<h1 class="page-title">Yêu cầu duyệt giá bán</h1>
						<p class="page-description">Theo dõi các yêu cầu duyệt giá bán gần đây và trạng thái xử lý</p>
					</div>
					<GmsButton variant="primary" icon="fa-plus" @click="openPartModal">Tạo yêu cầu mới</GmsButton>
				</div>

				<div class="stats-grid">
					<div class="stat-card primary">
						<div class="stat-label">Đã tạo</div>
						<div class="stat-value">{{ stats.created }}</div>
						<div class="stat-meta">
							<i class="fas fa-file"></i>
							<span>Chờ định giá</span>
						</div>
					</div>
					<div class="stat-card success">
						<div class="stat-label">Đã định giá</div>
						<div class="stat-value">{{ stats.priced }}</div>
						<div class="stat-meta">
							<i class="fas fa-calculator"></i>
							<span>Chờ xác nhận</span>
						</div>
					</div>
					<div class="stat-card info">
						<div class="stat-label">Đã xác nhận</div>
						<div class="stat-value">{{ stats.confirmed }}</div>
						<div class="stat-meta">
							<i class="fas fa-check"></i>
							<span>Sẵn sàng đóng</span>
						</div>
					</div>
					<div class="stat-card dark">
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
							<h2>Danh sách các phiếu đề nghị duyệt giá do bộ phận kho gửi lên</h2>
							<p>{{ filteredRequests.length }} (phiếu)</p>
						</div>
						<GmsButton variant="outline" icon="fa-filter" @click="showFilterModal = true">Bộ lọc nâng cao</GmsButton>
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
									<span class="muted">{{ row.code }}</span>
								</div>
							</template>

							<template #cell-totalPart="{ row }">
								{{ row.totalPart }} mặt hàng
							</template>

							<template #cell-requestDate="{ row }">
								{{ row.requestDate }}
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

							<template #cell-totalAmount="{ row }">
								{{ formatCurrency(row.totalAmount) }}
							</template>

							<template #cell-actions="{ row }">
								<div class="action-buttons">
									<button class="action-button" title="Xem chi tiết" @click="openDetail(row.index)">
										<i class="fas fa-eye"></i>
									</button>
									<button
										class="action-button"
										title="Đánh dấu hoàn thành"
										:disabled="row.status !== 'CREATED' && row.status !== 'PRICED'"
										@click="handleComplete(row.index)"
									>
										<i class="fas fa-check"></i>
									</button>
								</div>
							</template>
						</GmsTable>
					</div>
				</div>

				<div class="timeline-card">
					<div class="timeline-header">
						<h2>Hoạt động gần đây</h2>
						<p>Các cập nhật trạng thái mới nhất từ nhà cung cấp</p>
					</div>
					<div class="timeline">
						<div v-for="(activity, index) in recentActivities" :key="index" class="timeline-item">
							<div class="timeline-dot"></div>
							<div class="timeline-content">
								<div class="timeline-title">
									<strong>{{ activity.title }}</strong>
									<span class="timeline-time">{{ activity.time }}</span>
								</div>
								<p class="timeline-text">{{ activity.description }}</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>

		<!-- Part Selection Modal -->
		<GmsDialog v-model="showPartModal" title="Chọn phụ tùng cho phiếu yêu cầu" size="large">
			<div class="part-selection-dialog">
				<div class="part-selection-header">
					<div>
						<h3>Danh sách phụ tùng</h3>
						<p>{{ filteredParts.length }} phụ tùng khả dụng</p>
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
										<th>Mã phụ tùng <i class="fas fa-filter"></i></th>
										<th>Tên phụ tùng</th>
										<th>Số lượng</th>
										<th>Danh mục</th>
										<th>Giá mua</th>
										<th>Bảo hành</th>
										<th>Hành động</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="part in paginatedParts"
										:key="part.id"
										:class="{ selected: isPartSelected(part.id) }"
										@click="togglePart(part)"
									>
										<td>{{ part.id }}</td>
										<td><strong>{{ part.code }}</strong></td>
										<td>{{ part.name }}</td>
										<td>{{ part.qty }} cái</td>
										<td>
											<div class="supplier-cell">
												<span class="supplier-name">{{ part.category }}</span>
												<span class="muted">{{ part.catCode }}</span>
											</div>
										</td>
										<td>{{ formatCurrency(part.purchase_price) }}</td>
										<td>{{ part.warranty }} tháng</td>
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
								</tbody>
							</table>
							<div class="part-pagination">
								<button :disabled="currentPartPage === 1" @click="prevPartPage">Trước</button>
								<span>Trang {{ currentPartPage }} / {{ totalPartPages }}</span>
								<button :disabled="currentPartPage === totalPartPages" @click="nextPartPage">Sau</button>
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
										<div>
											<div class="selected-name">{{ selected.code }} - {{ selected.name }}</div>
											<div class="selected-subline">
												<span>Số lượng:</span>
												<input type="number" class="qty-input" v-model.number="selected.orderQty" :min="1" :max="selected.available" />
												<span class="stock-note">(tồn: {{ selected.available }})</span>
											</div>
										</div>
										<button class="remove-chip" @click="removePart(selected.id)">Xóa</button>
									</div>
									<div class="selected-prices">
										<div class="price-pill">
											<span>Giá mua:</span>
											<strong>{{ formatCurrency(selected.purchase_price) }}</strong>
										</div>
										<div class="price-pill">
											<span>Giá bán hiện tại:</span>
											<strong>{{ selected.selling_price ? formatCurrency(selected.selling_price) : 'Chưa có giá bán' }}</strong>
										</div>
									</div>
								</li>
							</ul>
							<div v-else class="selected-empty">Chưa chọn phụ tùng</div>
						</div>
					</div>
				</div>

				<div class="dialog-actions">
					<GmsButton variant="outline" @click="closePartModal">Hủy</GmsButton>
					<GmsButton variant="primary" :disabled="selectedParts.length === 0" @click="confirmSelection">Tạo phiếu</GmsButton>
				</div>
			</div>
		</GmsDialog>

		<!-- Detail Modal -->
		<GmsDialog v-model="showDetailModal" :title="`Chi tiết yêu cầu ${currentRequest?.code || ''}`" size="large">
			<div v-if="currentRequest" class="detail-dialog">
				<div class="detail-left">
					<div class="detail-info-card">
						<h3>Thông tin chung</h3>
						<div class="detail-info-row">
							<span class="detail-info-label">Mã yêu cầu</span>
							<span class="detail-info-value">{{ currentRequest.code }}</span>
						</div>
						<div class="detail-info-row">
							<span class="detail-info-label">Ngày tạo:</span>
							<span class="detail-info-value">{{ currentRequest.requestDate }}</span>
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
									<th>GIÁ MUA (OLD_PRICE)</th>
									<th>GIÁ BÁN (NEW_PRICE)</th>
									<th>THÀNH TIỀN</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(item, idx) in currentRequestItems" :key="idx">
									<td>{{ item.code }}</td>
									<td>{{ item.name }}</td>
									<td>{{ item.quantity }}</td>
									<td>{{ formatCurrency(item.oldPrice) }}</td>
									<td>{{ formatCurrency(item.newPrice) }}</td>
									<td>{{ formatCurrency(item.quantity * item.newPrice) }}</td>
								</tr>
							</tbody>
							<tfoot>
								<tr class="total-row">
									<td colspan="5" style="text-align: right; font-weight: 700">Tổng cộng:</td>
									<td>{{ formatCurrency(detailGrandTotal) }}</td>
								</tr>
							</tfoot>
						</table>
					</div>

					<div class="detail-actions">
						<GmsButton v-if="currentRequest.status === 'CREATED'" variant="success" @click="handleApprove">Duyệt</GmsButton>
						<GmsButton v-if="currentRequest.status === 'CREATED'" variant="danger" @click="handleReject">Từ chối</GmsButton>
						<GmsButton v-if="currentRequest.status === 'PRICED'" variant="primary" @click="handleComplete">Hoàn thành</GmsButton>
						<GmsButton variant="outline" @click="showDetailModal = false">Đóng</GmsButton>
					</div>
				</div>
			</div>
		</GmsDialog>

		<!-- Filter Modal -->
		<GmsDialog v-model="showFilterModal" title="Bộ lọc nâng cao" size="medium">
			<div class="filter-modal">
				<div class="form-group">
					<label>Toán tử</label>
					<select v-model="filterForm.operator" class="form-select">
						<option value="equals">Bằng (=)</option>
						<option value="not_equals">Không bằng (≠)</option>
						<option value="contains">Chứa</option>
						<option value="not_contains">Không chứa</option>
						<option value="starts_with">Bắt đầu</option>
						<option value="ends_with">Kết thúc</option>
						<option value="empty">Rỗng</option>
						<option value="not_empty">Không rỗng</option>
						<option value="greater_than">&gt;</option>
						<option value="less_than">&lt;</option>
						<option value="greater_or_equal">≥</option>
						<option value="less_or_equal">≤</option>
					</select>
				</div>
				<div class="form-group">
					<label>Giá trị</label>
					<GmsInput v-model="filterForm.value" placeholder="Nhập giá trị lọc..." />
				</div>
				<div class="dialog-actions">
					<GmsButton variant="outline" @click="showFilterModal = false">Hủy</GmsButton>
					<GmsButton variant="outline" @click="clearFilter">Xóa lọc</GmsButton>
					<GmsButton variant="primary" @click="applyFilter">Áp dụng</GmsButton>
				</div>
			</div>
		</GmsDialog>

		<!-- Toast -->
		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { TheHeader, TheSideBar } from '@/layout'
	import { GmsInput, GmsButton, GmsTable, GmsDialog, GmsToast } from '@/components'
	import { useToast } from '@/composables/useToast'
	import { getMenuByRole } from '@/utils/menu'
	import authService from '@/services/auth'

	const toastRef = ref(null)
	const toast = useToast()

	const sidebarCollapsed = ref(false)
	const loading = ref(false)
	const showPartModal = ref(false)
	const showDetailModal = ref(false)
	const showFilterModal = ref(false)
	const notifications = ref([])
	const menuItems = ref([])

	const searchQuery = ref('')
	const activeStatusTab = ref('ALL')
	const partSearchQuery = ref('')
	const currentPartPage = ref(1)
	const itemsPerPage = 5

	// Mock data
	const priceRequests = ref([
		{
			index: 0,
			code: 'PR-2024-108',
			internalId: 1341,
			requestedBy: 'Nguyễn Văn A',
			totalPart: 12,
			requestDate: '05/12/2024',
			status: 'CREATED',
			note: 'Bổ sung khẩn cấp',
			totalAmount: 0,
			confirmedBy: null,
			confirmedDate: null,
			items: [
				{ partId: 1, code: 'PT-001', name: 'Brake Pad Set', quantity: 5, oldPrice: 450000, newPrice: 0 },
				{ partId: 3, code: 'PT-003', name: 'Spark Plug', quantity: 7, oldPrice: 72000, newPrice: 0 }
			]
		},
		{
			index: 1,
			code: 'PR-2024-109',
			internalId: 1342,
			requestedBy: 'Trần Thị B',
			totalPart: 8,
			requestDate: '04/12/2024',
			status: 'PRICED',
			note: 'Điều chỉnh giá theo thị trường',
			totalAmount: 9850000,
			confirmedBy: null,
			confirmedDate: null,
			items: [
				{ partId: 4, code: 'PT-004', name: 'Air Filter', quantity: 3, oldPrice: 180000, newPrice: 200000 },
				{ partId: 5, code: 'PT-005', name: 'Tire Valve', quantity: 5, oldPrice: 45000, newPrice: 60000 }
			]
		},
		{
			index: 2,
			code: 'PR-2024-110',
			internalId: 1343,
			requestedBy: 'Phạm Văn C',
			totalPart: 10,
			requestDate: '03/12/2024',
			status: 'CONFIRMED',
			note: 'Đã xác nhận điều chỉnh giá',
			totalAmount: 15250000,
			confirmedBy: 'Lê Văn C',
			confirmedDate: '04/12/2024',
			items: [
				{ partId: 2, code: 'PT-002', name: 'Engine Oil Filter', quantity: 4, oldPrice: 135000, newPrice: 150000 },
				{ partId: 6, code: 'PT-006', name: 'Brake Disc', quantity: 6, oldPrice: 650000, newPrice: 700000 }
			]
		},
		{
			index: 3,
			code: 'PR-2024-111',
			internalId: 1344,
			requestedBy: 'Hoàng Thị D',
			totalPart: 6,
			requestDate: '02/12/2024',
			status: 'CLOSED',
			note: 'Đã đóng sau điều chỉnh thành công',
			totalAmount: 7400000,
			confirmedBy: 'Nguyễn Văn H',
			confirmedDate: '03/12/2024',
			items: [
				{ partId: 3, code: 'PT-003', name: 'Spark Plug', quantity: 2, oldPrice: 72000, newPrice: 80000 },
				{ partId: 7, code: 'PT-007', name: 'Clutch Plate', quantity: 4, oldPrice: 320000, newPrice: 350000 }
			]
		}
	])

	const parts = ref([
		{ id: 1, code: 'PT-001', name: 'Brake Pad Set', qty: 50, category: 'Hệ thống phanh', catCode: 'BRAKE', purchase_price: 450000, selling_price: 0, warranty: 12 },
		{ id: 2, code: 'PT-002', name: 'Engine Oil Filter', qty: 100, category: 'Bộ lọc', catCode: 'FILTER', purchase_price: 135000, selling_price: 165000, warranty: 6 },
		{ id: 3, code: 'PT-003', name: 'Spark Plug', qty: 200, category: 'Hệ thống đánh lửa', catCode: 'IGNITION', purchase_price: 72000, selling_price: 88000, warranty: 24 },
		{ id: 4, code: 'PT-004', name: 'Air Filter', qty: 75, category: 'Bộ lọc', catCode: 'FILTER', purchase_price: 180000, selling_price: 220000, warranty: 12 },
		{ id: 5, code: 'PT-005', name: 'Tire Valve', qty: 300, category: 'Lốp xe', catCode: 'TIRE', purchase_price: 45000, selling_price: 55000, warranty: 3 },
		{ id: 6, code: 'PT-006', name: 'Battery Terminal', qty: 40, category: 'Hệ thống điện', catCode: 'ELECTRIC', purchase_price: 108000, selling_price: 132000, warranty: 18 },
		{ id: 7, code: 'PT-007', name: 'Radiator Hose', qty: 60, category: 'Hệ thống làm mát', catCode: 'COOLING', purchase_price: 270000, selling_price: 330000, warranty: 12 },
		{ id: 8, code: 'PT-008', name: 'Fuel Injector', qty: 25, category: 'Hệ thống nhiên liệu', catCode: 'FUEL', purchase_price: 1350000, selling_price: 1650000, warranty: 36 },
		{ id: 9, code: 'PT-009', name: 'Wiper Blade', qty: 150, category: 'Hệ thống lau kính', catCode: 'WIPER', purchase_price: 225000, selling_price: 275000, warranty: 6 },
		{ id: 10, code: 'PT-010', name: 'Alternator Belt', qty: 80, category: 'Hệ thống sạc', catCode: 'CHARGING', purchase_price: 360000, selling_price: 440000, warranty: 24 },
		{ id: 11, code: 'PT-011', name: 'Clutch Plate', qty: 30, category: 'Hệ thống ly hợp', catCode: 'CLUTCH', purchase_price: 720000, selling_price: 880000, warranty: 24 }
	])

	const selectedParts = ref([])
	const currentRequest = ref(null)
	const filteredParts = ref([...parts.value])
	const filterForm = ref({ operator: 'contains', value: '' })

	const recentActivities = ref([
		{ title: 'Hoàn tất nhập kho PO-2024-096', time: '20 phút trước', description: 'Đã kiểm đếm đủ các mặt hàng và cập nhật vào kho trung tâm.' },
		{ title: 'Silver Auto xác nhận đã giao hàng', time: '2 giờ trước', description: 'Đơn PO-2024-104 dự kiến về kho ngày 10/12.' },
		{ title: 'Tạo yêu cầu mới PO-2024-108', time: 'Hôm qua', description: 'Bổ sung phụ tùng nhanh cho khu vực sửa chữa khẩn.' }
	])

	const tableColumns = ref([
		{ key: 'code', label: 'Mã yêu cầu', sortable: true, filterable: true },
		{ key: 'requestedBy', label: 'Người tạo', sortable: true, filterable: true },
		{ key: 'totalPart', label: 'Số dòng', sortable: true, filterable: false },
		{ key: 'requestDate', label: 'Ngày tạo', sortable: true, filterable: true },
		{ key: 'status', label: 'Trạng thái', sortable: true, filterable: true },
		{ key: 'note', label: 'Ghi chú', sortable: false, filterable: true },
		{ key: 'totalAmount', label: 'Tổng giá trị', sortable: true, filterable: true },
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

	const filteredRequests = computed(() => {
		let result = [...priceRequests.value]

		// Filter by status
		if (activeStatusTab.value !== 'ALL') {
			result = result.filter((r) => r.status === activeStatusTab.value)
		}

		// Filter by search
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase()
			result = result.filter((r) => r.code.toLowerCase().includes(query) || r.requestedBy.toLowerCase().includes(query))
		}

		return result
	})

	const paginatedParts = computed(() => {
		const start = (currentPartPage.value - 1) * itemsPerPage
		const end = start + itemsPerPage
		return filteredParts.value.slice(start, end)
	})

	const totalPartPages = computed(() => {
		return Math.ceil(filteredParts.value.length / itemsPerPage)
	})

	const selectedTotal = computed(() => {
		return selectedParts.value.reduce((sum, s) => sum + (s.orderQty * (s.unit_price || s.purchase_price)), 0)
	})

	const currentRequestItems = computed(() => {
		if (!currentRequest.value) return []
		return currentRequest.value.items.map((item) => {
			const matchedPart = parts.value.find((p) => p.code === item.code) || {}
			return {
				...item,
				oldPrice: item.oldPrice ?? matchedPart.purchase_price ?? 0,
				newPrice: item.newPrice ?? matchedPart.selling_price ?? 0
			}
		})
	})

	const detailGrandTotal = computed(() => {
		return currentRequestItems.value.reduce((sum, item) => sum + item.quantity * item.newPrice, 0)
	})

	// Methods
	const formatCurrency = (num = 0) => {
		return (Number(num) || 0).toLocaleString('vi-VN') + ' đ'
	}

	const formatDate = (date) => {
		if (!date) return 'Chưa có'
		return date
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
		activeStatusTab.value = status
	}

	const handleSearch = () => {
		// Search is handled in computed
	}

	const openPartModal = () => {
		selectedParts.value = []
		filteredParts.value = [...parts.value]
		currentPartPage.value = 1
		partSearchQuery.value = ''
		showPartModal.value = true
	}

	const closePartModal = () => {
		showPartModal.value = false
		selectedParts.value = []
	}

	const filterParts = () => {
		const query = partSearchQuery.value.toLowerCase()
		filteredParts.value = parts.value.filter((p) => p.code.toLowerCase().includes(query) || p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
		currentPartPage.value = 1
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
				available: part.qty,
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
		if (currentPartPage.value > 1) {
			currentPartPage.value--
		}
	}

	const nextPartPage = () => {
		if (currentPartPage.value < totalPartPages.value) {
			currentPartPage.value++
		}
	}

	const confirmSelection = () => {
		if (selectedParts.value.length === 0) return

		const total = selectedTotal.value
		toast.success('Tạo phiếu thành công!', `Đã tạo phiếu với ${selectedParts.value.length} phụ tùng. Tổng giá trị: ${formatCurrency(total)}`)
		closePartModal()
	}

	const openDetail = (index) => {
		currentRequest.value = priceRequests.value.find((r) => r.index === index)
		showDetailModal.value = true
	}

	const handleApprove = () => {
		if (!currentRequest.value) return
		currentRequest.value.status = 'PRICED'
		currentRequest.value.approvedDate = new Date().toISOString().split('T')[0]
		toast.success('Đã duyệt yêu cầu!')
		showDetailModal.value = false
	}

	const handleReject = () => {
		if (!currentRequest.value) return
		const reason = prompt('Nhập lý do từ chối:')
		if (!reason) return
		currentRequest.value.status = 'REJECTED'
		currentRequest.value.rejectedDate = new Date().toISOString().split('T')[0]
		currentRequest.value.rejectionReason = reason
		toast.error('Đã từ chối yêu cầu!')
		showDetailModal.value = false
	}

	const handleComplete = (index) => {
		const request = typeof index === 'number' ? priceRequests.value.find((r) => r.index === index) : currentRequest.value
		if (!request) return
		request.status = 'CONFIRMED'
		request.confirmedDate = new Date().toISOString().split('T')[0]
		request.confirmedBy = 'Manager Current'
		toast.success('Đã đánh dấu hoàn thành!')
		if (showDetailModal.value) {
			showDetailModal.value = false
		}
	}

	const applyFilter = () => {
		// Filter logic here
		showFilterModal.value = false
	}

	const clearFilter = () => {
		filterForm.value = { operator: 'contains', value: '' }
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
		}
	})
</script>

<style scoped>
	.restock-requests-view {
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

	.stat-card.primary {
		background: linear-gradient(135deg, #f7971e, #ffd200);
		color: #4a2a00;
	}

	.stat-card.success {
		background: linear-gradient(135deg, #43cea2, #185a9d);
	}

	.stat-card.info {
		background: linear-gradient(135deg, #f85032, #e73827);
		color: #fff8f5;
	}

	.stat-card.dark {
		background: linear-gradient(135deg, #232526, #414345);
	}

	.stat-label {
		font-size: 0.85rem;
		opacity: 0.8;
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

	.status-pending,
	.status-created {
		background: rgba(255, 166, 0, 0.15);
		color: #a65c00;
	}

	.status-approved,
	.status-priced {
		background: rgba(16, 185, 129, 0.15);
		color: #047857;
	}

	.status-rejected {
		background: rgba(248, 80, 50, 0.15);
		color: #c81912;
	}

	.status-completed,
	.status-confirmed,
	.status-closed {
		background: rgba(99, 102, 241, 0.15);
		color: #4338ca;
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

	.timeline-card {
		background: #0f172a;
		color: white;
		border-radius: 18px;
		padding: 1.5rem;
		box-shadow: 0 20px 40px rgba(15, 23, 42, 0.35);
	}

	.timeline-header h2 {
		margin: 0;
	}

	.timeline-header p {
		margin: 0.25rem 0 1rem;
		color: rgba(255, 255, 255, 0.65);
	}

	.timeline {
		position: relative;
		padding-left: 1.5rem;
	}

	.timeline::before {
		content: '';
		position: absolute;
		left: 18px;
		top: 0;
		bottom: 0;
		width: 2px;
		background: rgba(255, 255, 255, 0.2);
	}

	.timeline-item {
		position: relative;
		padding-left: 1.5rem;
		margin-bottom: 1.25rem;
	}

	.timeline-dot {
		position: absolute;
		left: -11px;
		top: 4px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #38bdf8;
		box-shadow: 0 0 0 6px rgba(56, 189, 248, 0.2);
	}

	.timeline-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.95rem;
	}

	.timeline-time {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.85rem;
	}

	.timeline-text {
		margin: 0.25rem 0 0;
		color: rgba(255, 255, 255, 0.7);
	}

	.part-selection-dialog {
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		gap: 1rem;
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
		gap: 1rem;
		padding: 1rem;
	}

	.left-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.part-table-wrapper {
		flex: 1;
		overflow-x: auto;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		padding-bottom: 0.5rem;
		max-height: 55vh;
	}

	.part-table {
		flex: 1;
		overflow: auto;
		width: 100%;
		border-collapse: collapse;
		min-width: 720px;
	}

	.part-table th,
	.part-table td {
		padding: 0.75rem;
		border-bottom: 1px solid #edf2f7;
		text-align: left;
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
		width: 350px;
		border-left: 1px solid #e5e7eb;
		padding-left: 1rem;
		display: flex;
		flex-direction: column;
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
		padding: 1rem;
		background: #ffffff;
		border: 1px solid #e7edf5;
		border-radius: 14px;
		box-shadow: 0 12px 24px rgba(31, 41, 55, 0.06);
		max-height: 55vh;
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
		padding: 0.85rem 0.95rem;
		margin-bottom: 0.65rem;
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
		margin-bottom: 0.45rem;
	}

	.selected-name {
		font-weight: 700;
		color: #1f2937;
	}

	.selected-subline {
		color: #6b7280;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.25rem;
	}

	.qty-input {
		width: 70px;
		padding: 0.25rem 0.45rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.85rem;
	}

	.stock-note {
		color: #94a3b8;
		font-size: 0.85rem;
	}

	.selected-prices {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.5rem;
		margin-bottom: 0.6rem;
	}

	.price-pill {
		padding: 0.55rem 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		background: #f8fafc;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.95rem;
		color: #0f172a;
	}

	.price-pill span {
		color: #6b7280;
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
	}

	.remove-chip:hover {
		background: #dc2626;
		transform: translateY(-1px);
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
		gap: 1.5rem;
		max-height: 70vh;
	}

	.detail-left {
		flex: 0.45;
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
		flex: 0.55;
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
		padding: 0.65rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #eef2f7;
		font-size: 0.95rem;
	}

	.items-table th {
		background: #f4f7fb;
		font-size: 0.8rem;
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

	.filter-modal {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.form-group label {
		font-weight: 600;
		color: #1f2937;
	}

	.form-select {
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		border: 1px solid #d1d5db;
		outline: none;
		font-size: 0.9rem;
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
			width: auto;
			border-left: none;
			border-top: 1px solid #e5e7eb;
			padding-left: 0;
			padding-top: 1rem;
		}
	}
</style>

