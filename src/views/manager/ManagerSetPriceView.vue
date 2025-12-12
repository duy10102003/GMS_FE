<template>
	<div class="manager-set-price-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader title="Manager - Nhập giá bán" :show-search="false" :notifications="notifications" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<div class="page-header">
					<div>
						<p class="page-subtitle">Manager Panel</p>
						<h1 class="page-title">Danh sách yêu cầu giá bán</h1>
						<p class="page-description">Xem và xử lý yêu cầu từ stocker, nhập giá bán đề xuất</p>
					</div>
				</div>

				<div class="stats-grid">
					<div class="stat-card created">
						<div class="stat-label">Chờ định giá</div>
						<div class="stat-value">{{ stats.created }}</div>
						<div class="stat-meta">
							<i class="fas fa-clock"></i>
							<span>CREATED</span>
						</div>
					</div>
					<div class="stat-card priced">
						<div class="stat-label">Đã định giá từng phần</div>
						<div class="stat-value">{{ stats.priced }}</div>
						<div class="stat-meta">
							<i class="fas fa-save"></i>
							<span>PRICED</span>
						</div>
					</div>
					<div class="stat-card confirmed">
						<div class="stat-label">Chờ đóng toàn bộ</div>
						<div class="stat-value">{{ stats.confirmed }}</div>
						<div class="stat-meta">
							<i class="fas fa-check"></i>
							<span>CONFIRMED</span>
						</div>
					</div>
				</div>

				<div class="filters-card">
					<div class="search-field">
						<i class="fas fa-search"></i>
						<GmsInput v-model="searchQuery" placeholder="Tìm theo mã yêu cầu..." :clearable="true" @input="handleSearch" />
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
						<h2>Danh sách yêu cầu</h2>
						<p>{{ filteredRequests.length }} yêu cầu phù hợp</p>
					</div>
					<div class="table-wrapper">
						<GmsTable :data="filteredRequests" :columns="tableColumns" :loading="loading" :pagination="false" :scrollable="true">
							<template #cell-code="{ row }">
								<strong>{{ row.code }}</strong>
							</template>

							<template #cell-requestedBy="{ row }">
								{{ row.requestedBy }}
							</template>

							<template #cell-lines="{ row }">
								{{ row.lines }} mặt hàng
							</template>

							<template #cell-requestDate="{ row }">
								{{ row.requestDate }}
							</template>

							<template #cell-status="{ row }">
								<span :class="`status-chip status-${row.status.toLowerCase()}`">
									<i :class="`fas ${getStatusIcon(row.status)}`"></i>
									{{ getStatusLabel(row.status) }}
								</span>
							</template>

							<template #cell-totalAmount="{ row }">
								{{ formatCurrency(row.totalAmount) }}
							</template>

							<template #cell-actions="{ row }">
								<div class="action-buttons">
									<button
										v-if="row.status === 'CREATED' || row.status === 'PRICED'"
										class="action-button pricing"
										title="Nhập/Sửa giá"
										@click="openPricingModal(row.index)"
									>
										<i class="fas fa-calculator"></i>
									</button>
									<button
										v-if="row.status === 'PRICED'"
										class="action-button confirm"
										title="Confirm toàn bộ"
										@click="confirmAll(row.index)"
									>
										<i class="fas fa-check-double"></i>
									</button>
									<button class="action-button" title="Xem chi tiết" @click="openDetailModal(row.index)">
										<i class="fas fa-eye"></i>
									</button>
								</div>
							</template>
						</GmsTable>
					</div>
				</div>
			</main>
		</div>

		<!-- Pricing Modal -->
		<GmsDialog v-model="showPricingModal" :title="`Nhập giá bán cho ${currentRequest?.code || ''}`" size="large">
			<div v-if="currentRequest" class="pricing-modal-content">
				<div class="copy-all-section">
					<label>Copy all giá bán:</label>
					<GmsInput v-model.number="copyAllPrice" type="number" placeholder="Nhập giá (VD: 100000)" class="copy-all-input" />
					<GmsButton variant="primary" @click="copyAllPrices">Áp dụng tất cả</GmsButton>
				</div>

				<div class="pricing-table-wrapper">
					<table class="pricing-table">
						<thead>
							<tr>
								<th>Mã PT</th>
								<th>Tên</th>
								<th>Số lượng</th>
								<th>Giá mua (old_price)</th>
								<th>Giá bán đề xuất (new_price)</th>
								<th>Thành tiền (SL * New Price)</th>
								<th>Lợi nhuận (Profit)</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="item in currentRequest.items" :key="item.partId">
								<td>{{ item.code }}</td>
								<td>{{ item.name }}</td>
								<td>{{ item.quantity }}</td>
								<td>{{ formatCurrency(item.oldPrice) }}</td>
								<td>
									<GmsInput
										v-model.number="item.newPrice"
										type="number"
										:min="0"
										placeholder="Nhập giá bán"
										class="price-input"
										@input="updatePricingTotals"
									/>
								</td>
								<td>{{ formatCurrency(item.quantity * (item.newPrice || 0)) }}</td>
								<td :class="getProfitClass(item)">
									{{ ((item.newPrice || 0) - item.oldPrice) * item.quantity >= 0 ? '+' : '' }}{{ formatCurrency(((item.newPrice || 0) - item.oldPrice) * item.quantity) }}
								</td>
							</tr>
						</tbody>
						<tfoot>
							<tr>
								<td colspan="5" style="text-align: right; font-weight: 700">Tổng Cộng (Bán):</td>
								<td style="font-weight: 700">{{ formatCurrency(pricingTotalAmount) }}</td>
								<td style="font-weight: 700" :class="getProfitClassTotal()">{{ formatCurrency(pricingTotalProfit) }}</td>
							</tr>
						</tfoot>
					</table>
				</div>

				<div class="dialog-actions">
					<GmsButton variant="outline" @click="closePricingModal">Hủy</GmsButton>
					<GmsButton variant="primary" @click="saveAllPricing">Lưu toàn bộ (Chuyển sang PRICED)</GmsButton>
				</div>
			</div>
		</GmsDialog>

		<!-- Detail Modal -->
		<GmsDialog v-model="showDetailModal" :title="`Chi tiết yêu cầu ${currentRequest?.code || ''}`" size="large">
			<div v-if="currentRequest" class="detail-modal-content">
				<div class="detail-container">
					<div class="detail-info-card">
						<h3><i class="fas fa-info-circle"></i> Thông tin chung</h3>
						<div class="info-row">
							<span class="info-label">Mã yêu cầu:</span>
							<span class="info-value">{{ currentRequest.code }}</span>
						</div>
						<div class="info-row">
							<span class="info-label">Người tạo:</span>
							<span class="info-value">{{ currentRequest.requestedBy }}</span>
						</div>
						<div class="info-row">
							<span class="info-label">Ngày tạo:</span>
							<span class="info-value">{{ currentRequest.requestDate }}</span>
						</div>
						<div class="info-row">
							<span class="info-label">Trạng thái:</span>
							<span class="info-value">
								<span :class="`status-badge status-${currentRequest.status.toLowerCase()}`">
									<i :class="`fas ${getStatusIcon(currentRequest.status)}`"></i>
									{{ getStatusLabel(currentRequest.status) }}
								</span>
							</span>
						</div>
						<div class="info-row">
							<span class="info-label">Số mặt hàng:</span>
							<span class="info-value">{{ currentRequest.lines }} mặt hàng</span>
						</div>
						<div class="info-row">
							<span class="info-label">Người xác nhận:</span>
							<span class="info-value">{{ currentRequest.confirmedBy || 'Chưa có' }}</span>
						</div>
						<div class="info-row">
							<span class="info-label">Ngày xác nhận:</span>
							<span class="info-value">{{ currentRequest.confirmedDate || 'Chưa có' }}</span>
						</div>
						<div class="info-row">
							<span class="info-label">Ghi chú:</span>
							<span class="info-value">{{ currentRequest.note || 'Không có ghi chú' }}</span>
						</div>
					</div>

					<div class="detail-items-card">
						<h3><i class="fas fa-list-ul"></i> Danh sách mặt hàng</h3>
						<div class="detail-table-wrapper">
							<table class="detail-table">
								<thead>
									<tr>
										<th>Mã PT</th>
										<th>Tên mặt hàng</th>
										<th class="text-right">Số lượng</th>
										<th class="text-right">Giá mua</th>
										<th class="text-right">Giá bán</th>
										<th class="text-right">Thành tiền</th>
										<th class="text-right">Lợi nhuận</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="(item, idx) in currentRequest.items" :key="idx">
										<td><strong>{{ item.code }}</strong></td>
										<td>{{ item.name }}</td>
										<td class="text-right">{{ item.quantity }}</td>
										<td class="text-right">{{ formatCurrency(item.oldPrice) }}</td>
										<td class="text-right">{{ formatCurrency(item.newPrice) }}</td>
										<td class="text-right">{{ formatCurrency(item.quantity * (item.newPrice || 0)) }}</td>
										<td class="text-right" :class="getProfitClass(item)">
											{{ ((item.newPrice || 0) - item.oldPrice) * item.quantity >= 0 ? '+' : '' }}{{ formatCurrency(((item.newPrice || 0) - item.oldPrice) * item.quantity) }}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div class="detail-totals">
							<div class="total-box">
								<div class="total-label">Tổng giá mua</div>
								<div class="total-value">{{ formatCurrency(detailTotalOld) }}</div>
							</div>
							<div class="total-box">
								<div class="total-label">Tổng giá bán</div>
								<div class="total-value">{{ formatCurrency(detailTotalNew) }}</div>
							</div>
							<div class="total-box">
								<div class="total-label">Tổng lợi nhuận</div>
								<div class="total-value" :class="getProfitClassTotal()">{{ formatCurrency(detailTotalProfit) }}</div>
							</div>
						</div>
					</div>
				</div>

				<div class="modal-actions">
					<GmsButton variant="outline" @click="showDetailModal = false">
						<i class="fas fa-times"></i> Đóng
					</GmsButton>
					<GmsButton variant="primary" @click="openPricingFromDetail">
						<i class="fas fa-edit"></i> Chỉnh sửa giá
					</GmsButton>
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
	const showPricingModal = ref(false)
	const showDetailModal = ref(false)
	const notifications = ref([])
	const menuItems = ref([])

	const searchQuery = ref('')
	const activeStatusTab = ref('all')
	const copyAllPrice = ref(null)
	const currentPricingIndex = ref(-1)
	const currentDetailIndex = ref(-1)

	// Mock data
	const priceRequests = ref([
		{
			index: 0,
			code: 'PR-2024-108',
			requestedBy: 'Nguyễn Văn A',
			lines: 3,
			requestDate: '05/12/2024',
			status: 'CREATED',
			totalAmount: 0,
			note: 'Yêu cầu cần định giá gấp cho đơn hàng lớn',
			confirmedBy: null,
			confirmedDate: null,
			items: [
				{ partId: 1, code: 'PT-001', name: 'Brake Pad Set', quantity: 5, oldPrice: 450000, newPrice: 0 },
				{ partId: 2, code: 'PT-002', name: 'Engine Oil Filter', quantity: 10, oldPrice: 135000, newPrice: 0 },
				{ partId: 3, code: 'PT-003', name: 'Spark Plug', quantity: 20, oldPrice: 72000, newPrice: 0 }
			]
		},
		{
			index: 1,
			code: 'PR-2024-104',
			requestedBy: 'Trần Thị B',
			lines: 2,
			requestDate: '03/12/2024',
			status: 'PRICED',
			totalAmount: 1760000,
			note: 'Đã kiểm tra kỹ chất lượng sản phẩm',
			confirmedBy: null,
			confirmedDate: null,
			items: [
				{ partId: 4, code: 'PT-004', name: 'Air Filter', quantity: 8, oldPrice: 180000, newPrice: 220000 },
				{ partId: 5, code: 'PT-005', name: 'Tire Valve', quantity: 50, oldPrice: 45000, newPrice: 55000 }
			]
		},
		{
			index: 2,
			code: 'PR-2024-098',
			requestedBy: 'Phạm Văn D',
			lines: 1,
			requestDate: '02/12/2024',
			status: 'CONFIRMED',
			totalAmount: 1100000,
			note: 'Đã confirm với bộ phận kinh doanh',
			confirmedBy: 'Manager X',
			confirmedDate: '04/12/2024',
			items: [{ partId: 6, code: 'PT-006', name: 'Battery Terminal', quantity: 10, oldPrice: 108000, newPrice: 132000 }]
		},
		{
			index: 3,
			code: 'PR-2024-109',
			requestedBy: 'Lê Thị C',
			lines: 4,
			requestDate: '06/12/2024',
			status: 'CREATED',
			totalAmount: 0,
			note: 'Hàng mới nhập, cần định giá trước khi bán',
			confirmedBy: null,
			confirmedDate: null,
			items: [
				{ partId: 7, code: 'PT-007', name: 'Oil Filter', quantity: 15, oldPrice: 120000, newPrice: 0 },
				{ partId: 8, code: 'PT-008', name: 'Brake Disc', quantity: 2, oldPrice: 850000, newPrice: 0 },
				{ partId: 9, code: 'PT-009', name: 'Wiper Blade', quantity: 30, oldPrice: 45000, newPrice: 0 },
				{ partId: 10, code: 'PT-010', name: 'Headlight Bulb', quantity: 5, oldPrice: 200000, newPrice: 0 }
			]
		}
	])

	const tableColumns = ref([
		{ key: 'code', label: 'Mã yêu cầu', sortable: true, filterable: true },
		{ key: 'requestedBy', label: 'Người tạo', sortable: true, filterable: true },
		{ key: 'lines', label: 'Số dòng', sortable: true, filterable: false },
		{ key: 'requestDate', label: 'Ngày tạo', sortable: true, filterable: true },
		{ key: 'status', label: 'Trạng thái', sortable: true, filterable: true },
		{ key: 'totalAmount', label: 'Tổng giá trị', sortable: true, filterable: true },
		{ key: 'actions', label: 'Hành động', filterable: false }
	])

	// Computed
	const stats = computed(() => {
		return {
			created: priceRequests.value.filter((r) => r.status === 'CREATED').length,
			priced: priceRequests.value.filter((r) => r.status === 'PRICED').length,
			confirmed: priceRequests.value.filter((r) => r.status === 'CONFIRMED').length
		}
	})

	const statusTabs = computed(() => {
		return [
			{ status: 'all', label: 'Tất cả', count: priceRequests.value.length },
			{ status: 'CREATED', label: 'Chờ định giá', count: stats.value.created },
			{ status: 'PRICED', label: 'Đã định giá', count: stats.value.priced },
			{ status: 'CONFIRMED', label: 'Chờ đóng', count: stats.value.confirmed }
		]
	})

	const filteredRequests = computed(() => {
		let result = [...priceRequests.value]

		// Filter by status
		if (activeStatusTab.value !== 'all') {
			result = result.filter((r) => r.status === activeStatusTab.value)
		}

		// Filter by search
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase()
			result = result.filter((r) => r.code.toLowerCase().includes(query) || r.requestedBy.toLowerCase().includes(query))
		}

		// Update totalAmount for each request
		result.forEach((r) => {
			r.totalAmount = r.items.reduce((sum, i) => sum + (i.newPrice || 0) * i.quantity, 0)
		})

		return result
	})

	const currentRequest = computed(() => {
		if (currentPricingIndex.value >= 0) {
			return priceRequests.value.find((r) => r.index === currentPricingIndex.value)
		}
		if (currentDetailIndex.value >= 0) {
			return priceRequests.value.find((r) => r.index === currentDetailIndex.value)
		}
		return null
	})

	const pricingTotalAmount = computed(() => {
		if (!currentRequest.value) return 0
		return currentRequest.value.items.reduce((sum, i) => sum + (i.newPrice || 0) * i.quantity, 0)
	})

	const pricingTotalProfit = computed(() => {
		if (!currentRequest.value) return 0
		return currentRequest.value.items.reduce((sum, i) => sum + ((i.newPrice || 0) - i.oldPrice) * i.quantity, 0)
	})

	const detailTotalOld = computed(() => {
		if (!currentRequest.value) return 0
		return currentRequest.value.items.reduce((sum, i) => sum + i.oldPrice * i.quantity, 0)
	})

	const detailTotalNew = computed(() => {
		if (!currentRequest.value) return 0
		return currentRequest.value.items.reduce((sum, i) => sum + (i.newPrice || 0) * i.quantity, 0)
	})

	const detailTotalProfit = computed(() => {
		if (!currentRequest.value) return 0
		return currentRequest.value.items.reduce((sum, i) => sum + ((i.newPrice || 0) - i.oldPrice) * i.quantity, 0)
	})

	// Methods
	const formatCurrency = (num = 0) => {
		return (Number(num) || 0).toLocaleString('vi-VN') + ' đ'
	}

	const getStatusLabel = (status) => {
		const labels = {
			CREATED: 'Chờ định giá',
			PRICED: 'Đã định giá',
			CONFIRMED: 'Chờ đóng'
		}
		return labels[status] || status
	}

	const getStatusIcon = (status) => {
		const icons = {
			CREATED: 'fa-clock',
			PRICED: 'fa-save',
			CONFIRMED: 'fa-check'
		}
		return icons[status] || 'fa-circle'
	}

	const getProfitClass = (item) => {
		const profit = ((item.newPrice || 0) - item.oldPrice) * item.quantity
		return profit > 0 ? 'profit-positive' : profit < 0 ? 'profit-negative' : ''
	}

	const getProfitClassTotal = () => {
		const profit = pricingTotalProfit.value || detailTotalProfit.value
		return profit > 0 ? 'profit-positive' : profit < 0 ? 'profit-negative' : ''
	}

	const setStatusTab = (status) => {
		activeStatusTab.value = status
	}

	const handleSearch = () => {
		// Search is handled in computed
	}

	const openPricingModal = (index) => {
		currentPricingIndex.value = index
		copyAllPrice.value = null
		// Create a deep copy of items to avoid direct mutation
		const request = priceRequests.value.find((r) => r.index === index)
		if (request) {
			request.items = request.items.map((item) => ({ ...item }))
		}
		showPricingModal.value = true
	}

	const closePricingModal = () => {
		showPricingModal.value = false
		currentPricingIndex.value = -1
	}

	const copyAllPrices = () => {
		if (!copyAllPrice.value || copyAllPrice.value <= 0) {
			toast.error('Vui lòng nhập một giá bán hợp lệ (> 0) trước!')
			return
		}

		if (!currentRequest.value) return

		currentRequest.value.items.forEach((item) => {
			item.newPrice = copyAllPrice.value
		})

		updatePricingTotals()
		toast.success(`Đã copy giá ${formatCurrency(copyAllPrice.value)} cho tất cả ${currentRequest.value.lines} parts!`)
	}

	const updatePricingTotals = () => {
		// Totals are computed, no need to update manually
	}

	const saveAllPricing = () => {
		if (!currentRequest.value) return

		const unpricedItems = currentRequest.value.items.filter((i) => (i.newPrice || 0) <= 0)
		if (unpricedItems.length > 0) {
			toast.error(`Vui lòng nhập giá bán (> 0) cho tất cả ${unpricedItems.length} parts còn lại trước khi lưu!`)
			return
		}

		currentRequest.value.status = 'PRICED'
		currentRequest.value.totalAmount = pricingTotalAmount.value
		closePricingModal()
		toast.success(`Đã lưu toàn bộ định giá cho ${currentRequest.value.code}! Trạng thái: PRICED.`)
	}

	const openDetailModal = (index) => {
		currentDetailIndex.value = index
		showDetailModal.value = true
	}

	const openPricingFromDetail = () => {
		if (currentDetailIndex.value !== -1) {
			showDetailModal.value = false
			openPricingModal(currentDetailIndex.value)
		}
	}

	const confirmAll = (index) => {
		const request = priceRequests.value.find((r) => r.index === index)
		if (!request) return

		if (request.status !== 'PRICED') {
			toast.error('Không thể xác nhận. Yêu cầu phải ở trạng thái "Đã định giá" (PRICED) trước.')
			return
		}

		if (!confirm(`Confirm toàn bộ phiếu ${request.code} này để stocker có thể close?`)) {
			return
		}

		request.status = 'CONFIRMED'
		request.confirmedBy = 'Manager X'
		request.confirmedDate = new Date().toLocaleDateString('vi-VN')
		toast.success(`Đã chuyển yêu cầu ${request.code} sang trạng thái CHỜ ĐÓNG. Stocker có thể đóng phiếu.`)
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
	.manager-set-price-view {
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
		margin-bottom: 2rem;
	}

	.page-subtitle {
		color: #6c757d;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.page-title {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: #1f2937;
	}

	.page-description {
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
		background: linear-gradient(135deg, #f7971e, #ffd200);
		color: #4a2a00;
	}

	.stat-card.priced {
		background: linear-gradient(135deg, #43cea2, #185a9d);
	}

	.stat-card.confirmed {
		background: linear-gradient(135deg, #f85032, #e73827);
	}

	.stat-label {
		font-size: 0.85rem;
		opacity: 0.9;
		margin-bottom: 0.5rem;
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
		margin-bottom: 1rem;
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
	}

	.table-header {
		margin-bottom: 1rem;
	}

	.table-header h2 {
		font-size: 1.25rem;
		margin-bottom: 0.25rem;
		color: #1f2937;
	}

	.table-header p {
		color: #6c757d;
		font-size: 0.9rem;
		margin: 0;
	}

	.table-wrapper {
		overflow-x: auto;
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
		background: rgba(255, 166, 0, 0.15);
		color: #a65c00;
	}

	.status-priced {
		background: rgba(16, 185, 129, 0.15);
		color: #047857;
	}

	.status-confirmed {
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
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-button.pricing {
		background: #10b981;
		color: white;
	}

	.action-button.pricing:hover {
		background: #059669;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
	}

	.action-button.confirm {
		background: #f59e0b;
		color: white;
	}

	.action-button.confirm:hover {
		background: #d97706;
		transform: translateY(-2px);
	}

	.action-button:not(.pricing):not(.confirm) {
		background: #eef2ff;
		color: #4c1d95;
	}

	.action-button:not(.pricing):not(.confirm):hover {
		background: #c7d2fe;
	}

	.pricing-modal-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.copy-all-section {
		background: linear-gradient(135deg, #f8fafc, #e2e8f0);
		padding: 1rem;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.copy-all-section label {
		font-weight: 600;
		color: #374151;
		white-space: nowrap;
	}

	.copy-all-input {
		flex: 1;
		max-width: 250px;
	}

	.pricing-table-wrapper {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		overflow: auto;
		max-height: 50vh;
		background: white;
	}

	.pricing-table {
		width: 100%;
		border-collapse: collapse;
	}

	.pricing-table thead {
		position: sticky;
		top: 0;
		background: linear-gradient(135deg, #f8fafc, #e2e8f0);
		z-index: 10;
	}

	.pricing-table th,
	.pricing-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #f1f5f9;
	}

	.pricing-table th {
		font-size: 0.85rem;
		font-weight: 600;
		color: #64748b;
	}

	.price-input {
		width: 120px;
	}

	.pricing-table tfoot {
		background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
		font-weight: 700;
	}

	.pricing-table tfoot td {
		border-top: 2px solid #e2e8f0;
	}

	.profit-positive {
		color: #059669;
		font-weight: 600;
	}

	.profit-negative {
		color: #dc2626;
		font-weight: 600;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e2e8f0;
	}

	.detail-modal-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.detail-container {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 2rem;
	}

	.detail-info-card {
		background: linear-gradient(135deg, #f8fafc, #e2e8f0);
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
	}

	.detail-info-card h3 {
		font-size: 1.25rem;
		margin-bottom: 1.25rem;
		color: #1f2937;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 0.75rem 0;
		border-bottom: 1px solid rgba(226, 232, 240, 0.8);
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-label {
		font-weight: 600;
		color: #4b5563;
		min-width: 140px;
	}

	.info-value {
		color: #1f2937;
		text-align: right;
		font-weight: 500;
		word-break: break-word;
		max-width: 200px;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.8rem;
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.85rem;
	}

	.detail-items-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.detail-items-card h3 {
		font-size: 1.25rem;
		margin-bottom: 1.25rem;
		color: #1f2937;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.detail-table-wrapper {
		overflow-x: auto;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.detail-table {
		width: 100%;
		border-collapse: collapse;
	}

	.detail-table thead {
		background: linear-gradient(135deg, #f8fafc, #e2e8f0);
		position: sticky;
		top: 0;
	}

	.detail-table th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		color: #4b5563;
		border-bottom: 1px solid #e2e8f0;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.detail-table td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #f1f5f9;
		color: #374151;
	}

	.detail-table tbody tr:hover {
		background-color: #f9fafb;
	}

	.detail-table .text-right {
		text-align: right;
	}

	.detail-totals {
		display: flex;
		justify-content: flex-end;
		gap: 2rem;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 2px solid #e2e8f0;
	}

	.total-box {
		text-align: right;
		min-width: 180px;
	}

	.total-label {
		font-size: 0.85rem;
		color: #6b7280;
		margin-bottom: 0.25rem;
	}

	.total-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2937;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e2e8f0;
	}

	@media (max-width: 1024px) {
		.content-wrapper {
			margin-left: 0 !important;
		}

		.detail-container {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}
</style>

