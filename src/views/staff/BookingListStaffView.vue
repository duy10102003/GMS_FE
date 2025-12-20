<template>
	<div class="booking-list">
		<TheSideBar :collapsed="sidebarCollapsed" :collapsible="true" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />
		<div class="booking-list__body">
			<TheHeader title="Danh sách lịch đặt" :show-search="false" :notifications="notifications" @logout="handleLogout" />

			<main class="page">
				<!-- <div class="page-head">
          <div></div>
          <GmsButton variant="primary" icon="fa-plus" @click="$router.push('/booking/Guest')">
            Đặt lịch mới
          </GmsButton>
        </div> -->

				<div class="filters">
					<div class="filter-item">
						<label>Từ ngày</label>
						<input v-model="dateFrom" type="date" />
					</div>
					<div class="filter-item">
						<label>Đến ngày</label>
						<input v-model="dateTo" type="date" />
					</div>
					<div class="filter-item wide">
						<label>Tìm (Tên khách, Xe, SĐT)</label>
						<input v-model="searchText" type="text" placeholder="Nhập từ khóa..." />
					</div>
					<div class="filter-item show-page-size">
						<label>Hiển thị</label>
						<select v-model.number="pageSize">
							<option :value="5">5</option>
							<option :value="10">10</option>
							<option :value="20">20</option>
							<option :value="50">50</option>
						</select>
					</div>
				</div>

				<div class="active-filters" v-if="activeFilters.length">
					<span class="active-filters__label">Đang lọc:</span>
					<div class="active-filters__chips">
						<button v-for="f in activeFilters" :key="f.key" class="filter-chip" @click="clearFilter(f.key)">
							<span>{{ f.label }}</span>
							<i class="fa-solid fa-xmark"></i>
						</button>
						<button class="clear-all" @click="clearAllFilters">Xóa tất cả</button>
					</div>
				</div>

				<div class="card">
					<div v-if="loading" class="state state--loading">
						<i class="fas fa-spinner fa-spin"></i>
						Đang tải...
					</div>

					<div v-else-if="pagedBookings.length" class="table-wrapper">
						<table class="table">
							<thead>
								<tr class="label-title">
									<th>
										MÃ
										<button class="filter-btn" @click="openFilter('id', 'MÃ', filterId, 'text')">
											<i class="fa-solid fa-filter"></i>
										</button>
									</th>
									<th>
										Tên khách
										<button class="filter-btn" @click="openFilter('customer', 'Tên khách', filterCustomer, 'text')">
											<i class="fa-solid fa-filter"></i>
										</button>
									</th>
									<th>
										Xe
										<button class="filter-btn" @click="openFilter('vehicle', 'Xe', filterVehicle, 'text')">
											<i class="fa-solid fa-filter"></i>
										</button>
									</th>
									<th>
										Số điện thoại
										<button class="filter-btn" @click="openFilter('phone', 'Số điện thoại', filterPhone, 'text')">
											<i class="fa-solid fa-filter"></i>
										</button>
									</th>
									<th>
										Trạng thái
										<button class="filter-btn" @click="openFilter('status', 'Trạng thái', filterStatus, 'status')">
											<i class="fa-solid fa-filter"></i>
										</button>
									</th>
									<th>Thời gian</th>
									<th>Thao tác</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item in pagedBookings" :key="item.bookingId || item.id">
									<td>{{ item.bookingCode || item.bookingId || item.id || '-' }}</td>
									<td>{{ item.customerName || '-' }}</td>
									<td>{{ item.vehicleName || '-' }}</td>
									<td>{{ item.customerPhone || '-' }}</td>
									<td>
										<span class="status">
											<select :value="item.status ?? item.bookingStatus ?? ''" :disabled="!canChangeStatus(item) || updatingId === (item.bookingId || item.id)" @change="(e) => changeStatus(item, e.target.value)">
												<option :value="0">Chờ xử lý</option>
												<option :value="1">Từ chối</option>
												<option :value="2">Xác nhận</option>
											</select>
										</span>
									</td>
									<td>{{ formatDate(item.bookingTime || item.createdDate) }}</td>
									<td class="actions">
										<GmsButton size="small" variant="info" @click="viewDetail(item)">Xem</GmsButton>
										<GmsButton v-if="canCreateService(item)" size="small" variant="success" @click="createService(item)">Tạo service</GmsButton>
										<!-- <select
                      :value="item.status ?? item.bookingStatus ?? ''"
                      :disabled="updatingId === (item.bookingId || item.id)"
                      @change="(e) => changeStatus(item, e.target.value)"
                    >
                      <option :value="0">Chờ xử lý</option>
                      <option :value="1">Đang thực hiện</option>
                      <option :value="2">Đã hoàn thành</option>
                    </select> -->
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div v-else class="state">
						<i class="fas fa-calendar-times"></i>
						Không có dữ liệu
					</div>

					<div class="pager" v-if="filteredBookings.length > 0">
						<div class="pager-info">
							Hiển thị
							<strong>
								{{ (page - 1) * pageSize + 1 }}
								-
								{{ Math.min(page * pageSize, filteredBookings.length) }}
							</strong>
							/ {{ filteredBookings.length }} lịch
						</div>
						<div class="pager-actions">
							<button :disabled="page === 1" @click="changePage(page - 1)">&lt;</button>
							<span>Trang {{ page }}</span>
							<button :disabled="page * pageSize >= filteredBookings.length" @click="changePage(page + 1)">&gt;</button>
						</div>
					</div>
				</div>
			</main>
		</div>

		<div v-if="filterModal.show" class="filter-modal-backdrop" @click.self="closeFilterModal">
			<div class="filter-modal">
				<div class="filter-modal__header">
					<h3>Lọc theo {{ filterModal.label }}</h3>
					<button class="close-btn" @click="closeFilterModal"><i class="fa-solid fa-xmark"></i></button>
				</div>
				<div class="filter-modal__body">
					<label>Toán tử</label>
					<select v-model="filterModal.operator">
						<option value="contains">Chứa</option>
						<option value="notContains">Không chứa</option>
						<option value="equals">Bằng</option>
						<option value="notEquals">Khác</option>
						<option value="startsWith">Bắt đầu bằng</option>
						<option value="endsWith">Kết thúc bằng</option>
					</select>

					<label>Giá trị</label>
					<template v-if="filterModal.type === 'status'">
						<select v-model="filterModal.value">
							<option value="">Tất cả</option>
							<option value="PENDING">Chờ xử lý</option>
							<option value="REJECT">Từ chối</option>
							<option value="CONFIRMED">Xác nhận</option>
						</select>
					</template>
					<template v-else>
						<input v-model="filterModal.value" type="text" placeholder="Nhập giá trị..." />
					</template>
				</div>
				<div class="filter-modal__footer">
					<button class="btn-outline" @click="closeFilterModal">Hủy</button>
					<button class="btn-primary" @click="applyFilterModal">Áp dụng</button>
				</div>
			</div>
		</div>

		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
	import { ref, computed, watch, onMounted } from 'vue'
	import { useRouter } from 'vue-router'
	import { TheHeader, TheSideBar } from '@/layout'
	import { GmsButton, GmsToast } from '@/components'
	import bookingService from '@/services/booking'
	import customerService from '@/services/customer'
	import authService from '@/services/auth'
	import { setToastInstance, useToast } from '@/composables/useToast'

	const router = useRouter()
	const toastRef = ref(null)
	const toast = useToast()
	const notifications = ref([])
	const sidebarCollapsed = ref(false)

	const bookings = ref([])
	const filteredBookings = ref([])
	const loading = ref(false)
	const page = ref(1)
	const pageSize = ref(10)
	const dateFrom = ref('')
	const dateTo = ref('')
	const searchText = ref('')
	const updatingId = ref(null)
	const filterId = ref('')
	const filterCustomer = ref('')
	const filterVehicle = ref('')
	const filterPhone = ref('')
	const filterStatus = ref('')
	const filterOpId = ref('contains')
	const filterOpCustomer = ref('contains')
	const filterOpVehicle = ref('contains')
	const filterOpPhone = ref('contains')
	const filterOpStatus = ref('equals')
	const filterModal = ref({
		show: false,
		field: '',
		label: '',
		type: 'text',
		operator: 'contains',
		value: ''
	})

	const operatorLabel = (op) => {
		if (op === 'equals') return 'bằng'
		if (op === 'notEquals') return 'khác'
		if (op === 'startsWith') return 'bắt đầu bằng'
		if (op === 'endsWith') return 'kết thúc bằng'
		if (op === 'notContains') return 'không chứa'
		return 'chứa'
	}

	const formatDate = (date) => {
		if (!date) return '-'
		const d = new Date(date)
		if (Number.isNaN(d.getTime())) return '-'
		return d.toLocaleString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const statusLabel = (status) => {
		if (status === 0 || status === 'PENDING') return 'Chờ xử lý'
		if (status === 1 || status === 'REJECT') return 'Từ chối'
		if (status === 2 || status === 'CONFIRMED') return 'Xác nhận'
		return 'Không rõ'
	}

	const statusClass = (status) => {
		if (status === 0 || status === 'PENDING') return 'pending'
		if (status === 1 || status === 'REJECT') return 'reject'
		if (status === 2 || status === 'CONFIRMED') return 'confirmed'
		return 'unknown'
	}

	const applyFilter = () => {
		const q = searchText.value.trim().toLowerCase()
		const from = dateFrom.value ? new Date(dateFrom.value) : null
		const to = dateTo.value ? new Date(dateTo.value) : null

		filteredBookings.value = bookings.value.filter((b) => {
			const d = b.bookingTime || b.createdDate
			const dateObj = d ? new Date(d) : null
			const matchDate = (!from || (dateObj && dateObj >= from)) && (!to || (dateObj && dateObj <= to))

			const text = [b.customerName, b.vehicleName, b.customerPhone, b.bookingCode, b.bookingId, b.id].filter(Boolean).join(' ').toLowerCase()

			const matchText = q ? text.includes(q) : true

			const matchByOperator = (val, target, op) => {
				const v = (val || '').toString().toLowerCase()
				const t = (target || '').toString().toLowerCase()
				if (!t) return true
				if (op === 'equals') return v === t
				if (op === 'notEquals') return v !== t
				if (op === 'startsWith') return v.startsWith(t)
				if (op === 'endsWith') return v.endsWith(t)
				if (op === 'notContains') return !v.includes(t)
				return v.includes(t)
			}

			const matchId = matchByOperator(b.bookingId || b.id || '', filterId.value, filterOpId.value)
			const matchCustomer = matchByOperator(b.customerName, filterCustomer.value, filterOpCustomer.value)
			const matchVehicle = matchByOperator(b.vehicleName, filterVehicle.value, filterOpVehicle.value)
			const matchPhone = matchByOperator(b.customerPhone, filterPhone.value, filterOpPhone.value)
			const matchStatus = filterStatus.value ? matchByOperator(b.status ?? b.bookingStatus ?? '', filterStatus.value, filterOpStatus.value || 'equals') : true

			return matchDate && matchText && matchId && matchCustomer && matchVehicle && matchPhone && matchStatus
		})
		page.value = 1
	}
	const canCreateService = (item) => {
		// if(!item.bookingTime) return false
		const status = item.status ?? item.bookingStatus
		const now = new Date()
		const bookingTime = new Date(item.bookingTime)
		return bookingTime <= now && (status === 2 || status === 'CONFIRMED')
	}
	const canChangeStatus = (item) => {
		const status = item.status ?? item.bookingStatus
		return status === 0 || status === 'PENDING'
	}
	const pagedBookings = computed(() => {
		const start = (page.value - 1) * pageSize.value
		return filteredBookings.value.slice(start, start + pageSize.value)
	})

	const viewDetail = (item) => {
		const id = item.bookingId || item.id
		if (!id) return
		router.push(`/staff/bookings/${id}`)
	}
	const createService = async (item) => {
		const id = item.bookingId || item.id
		let customerId = item.customerId || item.customerID || null
		let customerEmail = item.customerEmail || item.email || ''
		let customerName = item.customerName || ''
		let customerPhone = item.customerPhone || ''
		if (!id) return
		try {
			// lấy chi tiết booking để chắc chắn có customerId
			const detail = await bookingService.getById(id)
			const data = detail?.data || detail
			customerId = customerId || data.customerId || data.customerID || null
			customerName = customerName || data.customerName || ''
			customerPhone = customerPhone || data.customerPhone || ''
			// lấy email từ bảng customer nếu có customerId
			if (customerId && !customerEmail) {
				const cusRes = await customerService.getById(customerId)
				const cus = cusRes?.data || cusRes
				customerEmail = cus?.customerEmail || cus?.email || ''
				customerName = customerName || cus?.customerName || cus?.fullName || ''
				customerPhone = customerPhone || cus?.customerPhone || cus?.phone || ''
			}
		} catch (err) {
			console.warn('Không lấy được thông tin customer/booking', err)
		}
		router.push({
			path: '/staff/service-tickets/create',
			query: { bookingId: id, customerId, customerEmail, customerName, customerPhone }
		})
	}
	const changeStatus = async (item, newStatus) => {
		const id = item.bookingId || item.id
		if (!id) return
		const prevStatus = item.status ?? item.bookingStatus
		if (newStatus === prevStatus) return
		const confirmed = window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái booking này không?')
		if (!confirmed) {
			item.status = prevStatus
			item.bookingStatus = prevStatus
			return
		}
		try {
			const statusVal = Number.isNaN(Number(newStatus)) ? newStatus : Number(newStatus)
			updatingId.value = id
			item.status = statusVal
			item.bookingStatus = statusVal
			await bookingService.updateStatus(id, { bookingStatus: statusVal, note: '' })
			toast.success('Đã cập nhật trạng thái')
			applyFilter()
		} catch (err) {
			item.status = prevStatus
			item.bookingStatus = prevStatus
			toast.error('Không cập nhật được trạng thái', err?.message || '')
		} finally {
			updatingId.value = null
		}
	}

	const openFilter = (field, label, currentValue, type = 'text') => {
		let operator = 'contains'
		if (field === 'id') operator = filterOpId.value
		if (field === 'customer') operator = filterOpCustomer.value
		if (field === 'vehicle') operator = filterOpVehicle.value
		if (field === 'phone') operator = filterOpPhone.value
		if (field === 'status') operator = filterOpStatus.value
		filterModal.value = {
			show: true,
			field,
			label,
			type,
			operator,
			value: currentValue || ''
		}
	}

	const applyFilterModal = () => {
		const { field, value, operator } = filterModal.value
		if (field === 'id') {
			filterId.value = value
			filterOpId.value = operator
		}
		if (field === 'customer') {
			filterCustomer.value = value
			filterOpCustomer.value = operator
		}
		if (field === 'vehicle') {
			filterVehicle.value = value
			filterOpVehicle.value = operator
		}
		if (field === 'phone') {
			filterPhone.value = value
			filterOpPhone.value = operator
		}
		if (field === 'status') {
			filterStatus.value = value
			filterOpStatus.value = operator
		}
		filterModal.value.show = false
		applyFilter()
	}

	const closeFilterModal = () => {
		filterModal.value.show = false
	}

	const changePage = (newPage) => {
		page.value = newPage
	}

	const activeFilters = computed(() => {
		const list = []
		if (dateFrom.value) {
			list.push({ key: 'dateFrom', label: `Từ ngày >= ${dateFrom.value}` })
		}
		if (dateTo.value) {
			list.push({ key: 'dateTo', label: `Đến ngày <= ${dateTo.value}` })
		}
		if (searchText.value) {
			list.push({ key: 'searchText', label: `Tìm kiếm: ${searchText.value}` })
		}
		if (filterId.value) {
			list.push({ key: 'id', label: `MÃ ${operatorLabel(filterOpId.value)} "${filterId.value}"` })
		}
		if (filterCustomer.value) {
			list.push({ key: 'customer', label: `Tên khách ${operatorLabel(filterOpCustomer.value)} "${filterCustomer.value}"` })
		}
		if (filterVehicle.value) {
			list.push({ key: 'vehicle', label: `Xe ${operatorLabel(filterOpVehicle.value)} "${filterVehicle.value}"` })
		}
		if (filterPhone.value) {
			list.push({ key: 'phone', label: `SĐT ${operatorLabel(filterOpPhone.value)} "${filterPhone.value}"` })
		}
		if (filterStatus.value) {
			list.push({ key: 'status', label: `Trạng thái ${operatorLabel(filterOpStatus.value)} "${statusLabel(filterStatus.value)}"` })
		}
		return list
	})

	const clearFilter = (key) => {
		if (key === 'dateFrom') dateFrom.value = ''
		if (key === 'dateTo') dateTo.value = ''
		if (key === 'searchText') searchText.value = ''
		if (key === 'id') {
			filterId.value = ''
			filterOpId.value = 'contains'
		}
		if (key === 'customer') {
			filterCustomer.value = ''
			filterOpCustomer.value = 'contains'
		}
		if (key === 'vehicle') {
			filterVehicle.value = ''
			filterOpVehicle.value = 'contains'
		}
		if (key === 'phone') {
			filterPhone.value = ''
			filterOpPhone.value = 'contains'
		}
		if (key === 'status') {
			filterStatus.value = ''
			filterOpStatus.value = 'equals'
		}
		applyFilter()
	}

	const clearAllFilters = () => {
		dateFrom.value = ''
		dateTo.value = ''
		searchText.value = ''
		filterId.value = ''
		filterCustomer.value = ''
		filterVehicle.value = ''
		filterPhone.value = ''
		filterStatus.value = ''
		filterOpId.value = 'contains'
		filterOpCustomer.value = 'contains'
		filterOpVehicle.value = 'contains'
		filterOpPhone.value = 'contains'
		filterOpStatus.value = 'equals'
		applyFilter()
	}

	watch([searchText, dateFrom, dateTo, pageSize, filterId, filterCustomer, filterVehicle, filterPhone, filterStatus], applyFilter)

	const loadBookings = async () => {
		try {
			loading.value = true
			const res = await bookingService.getPaging({
				page: 1,
				pageSize: 200,
				columnSorts: [{ columnName: 'CreatedDate', sortDirection: 'DESC' }]
			})
			const items = res?.data?.items || res?.items || []
			bookings.value = items
			applyFilter()
		} catch (err) {
			toast.error('Không tải được danh sách booking', err?.message || '')
		} finally {
			loading.value = false
		}
	}

	const handleLogout = async () => {
		await authService.logout()
		router.push('/')
	}

	onMounted(() => {
		if (toastRef.value) {
			setToastInstance(toastRef.value)
		}
		loadBookings()
	})
</script>

<style scoped>
	.booking-list {
		display: flex;
		background: #f4f7fb;
		min-height: 100vh;
	}

	.booking-list__body {
		flex: 1;
		margin-left: var(--sidebar-width, 260px);
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.page {
		padding: 90px 24px 32px;
	}

	.page-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-bottom: 14px;
	}

	.page-head h1 {
		margin: 0;
		font-size: 24px;
		color: #111827;
	}

	.page-head p {
		margin: 4px 0 0;
		color: #6b7280;
	}

	.filters {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 10px;
		margin-bottom: 12px;
	}

	.active-filters {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 12px;
	}

	.active-filters__label {
		font-weight: 600;
		color: #374151;
	}

	.active-filters__chips {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.filter-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: #eef2ff;
		color: #4b5563;
		border: 1px solid #c7d2fe;
		border-radius: 999px;
		padding: 6px 10px;
		cursor: pointer;
	}

	.filter-chip i {
		font-size: 12px;
	}

	.clear-all {
		border: 1px dashed #d1d5db;
		background: #fff;
		padding: 6px 12px;
		border-radius: 10px;
		cursor: pointer;
	}

	.filter-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.filter-item label {
		font-size: 13px;
		color: #4b5563;
	}

	.filter-item input,
	.filter-item select {
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		padding: 10px;
	}
	.filter-item.show-page-size {
		max-width: 120px;
	}
	.filter-item.wide {
		grid-column: span 2;
	}

	.card {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 14px;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
		padding: 14px;
	}

	.state {
		text-align: center;
		padding: 40px 10px;
		color: #6b7280;
	}

	.state i {
		font-size: 20px;
		margin-right: 6px;
	}

	.table-wrapper {
		overflow: auto;
		max-height: calc(100vh - 350px);
	}

	.table {
		width: 100%;
		border-collapse: collapse;
	}

	.table th,
	.table td {
		padding: 10px 8px;
		border-bottom: 1px solid #e5e7eb;
		text-align: left;
		white-space: nowrap;
	}

	.table th {
		background: #f9fafb;
		font-weight: 700;
		color: #374151;
	}

	.filter-btn {
		border: none;
		background: transparent;
		cursor: pointer;
		padding: 0 4px;
		color: #9ca3af;
	}

	.actions {
		display: flex;
		gap: 6px;
		align-items: center;
	}

	.status {
		display: inline-block;
		padding: 4px 10px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 700;
	}

	.status.pending {
		background: #fef3c7;
		color: #92400e;
	}
	.status.progress {
		background: #e0f2fe;
		color: #1d4ed8;
	}
	.status.done {
		background: #dcfce7;
		color: #166534;
	}
	.status.unknown {
		background: #e5e7eb;
		color: #374151;
	}

	.pager {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 12px 0 0;
	}

	.pager-info {
		color: #4b5563;
	}

	.pager-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.pager button {
		border: 1px solid #d1d5db;
		background: #fff;
		padding: 6px 10px;
		border-radius: 8px;
		cursor: pointer;
	}

	.pager button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.filter-modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3000;
	}

	.filter-modal {
		background: #fff;
		border-radius: 12px;
		padding: 18px;
		width: 420px;
		max-width: 90vw;
		box-shadow: 0 24px 70px rgba(0, 0, 0, 0.16);
	}

	.filter-modal__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.filter-modal__header h3 {
		margin: 0;
	}
	.filter-modal__header,
	.filter-modal__footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
	}
	.filter-modal__body label {
		display: block;
		margin-bottom: 6px;
		font-weight: 600;
	}
	.filter-modal__body input,
	.filter-modal__body select {
		width: 100%;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 10px;
	}
	.close-btn {
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 18px;
	}

	.filter-modal__body label {
		display: block;
		margin: 8px 0 6px;
		font-weight: 600;
	}

	.filter-modal__footer {
		margin-top: 12px;
		display: flex;
		justify-content: flex-end;
		gap: 10px;
	}

	.btn-outline {
		border: 1px solid #d1d5db;
		background: #fff;
		padding: 10px 14px;
		border-radius: 10px;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--primary, #ff7a00);
		color: #fff;
		border: none;
		border-radius: 10px;
		padding: 10px 14px;
		cursor: pointer;
	}
	.label-title {
		background-color: #f3f4f6;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	@media (max-width: 992px) {
		.booking-list__body {
			margin-left: 0;
		}
		.page {
			padding: 80px 14px 24px;
		}
	}
</style>
