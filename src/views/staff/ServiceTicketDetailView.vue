<template>
	<div class="service-ticket-detail-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader :title="`Chi tiết phiếu dịch vụ #${serviceTicket?.serviceTicketCode || ''}`" :show-search="false" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<div class="detail-header">
					<GmsButton variant="outline" icon="fa-arrow-left" @click="$router.back()">Quay lại</GmsButton>
					<div class="header-actions">
						<GmsButton v-if="canUpdate" variant="primary" icon="fa-edit" @click="openUpdateDialog">Cập nhật</GmsButton>

						<GmsButton v-if="canAssign" variant="success" icon="fa-user-plus" @click="openAssignDialog">Phân công thợ</GmsButton>

						<!-- <GmsButton v-if="canConfirmAdjustment" variant="warning" icon="fa-check" @click="confirmAdjustment">Xác nhận điều chỉnh</GmsButton> -->

						<GmsButton v-if="canStartInProgress" variant="primary" icon="fa-play" @click="handleStartInProgress">Bắt đầu xử lý</GmsButton>
						<GmsButton v-if="canComplete" variant="success" icon="fa-check" @click="handleCompleteTask">Hoàn thành công việc</GmsButton>
						<GmsButton v-if="canCreateInvoice" variant="info" icon="fa-file-invoice" @click="openInvoiceDialog">Tạo hóa đơn</GmsButton>

						<GmsButton v-if="canCancel" variant="danger" icon="fa-times" @click="openCancelDialog">Hủy phiếu</GmsButton>
					</div>
				</div>

				<div v-if="loading" class="loading-state">
					<i class="fas fa-spinner fa-spin"></i>
					<span>Đang tải...</span>
				</div>

				<div v-else-if="serviceTicket" class="detail-content">
					<!-- Thông tin cơ bản -->
					<div class="info-card">
						<h5 class="card-title">
							<i class="fas fa-info-circle me-2"></i>
							Thông tin cơ bản
						</h5>
						<div class="info-grid">
							<div class="info-item">
								<label>Mã phiếu:</label>
								<span class="value">{{ serviceTicket.serviceTicketCode }}</span>
							</div>
							<div class="info-item">
								<label>Trạng thái:</label>
								<span :class="`badge badge-${getStatusColor(serviceTicket.serviceTicketStatus)}`">
									{{ getStatusLabel(serviceTicket.serviceTicketStatus) }}
								</span>
							</div>
							<div class="info-item">
								<label>Vấn đề ban đầu:</label>
								<span class="value">{{ serviceTicket.initialIssue }}</span>
							</div>
							<div class="info-item">
								<label>Ngày tạo:</label>
								<span class="value">{{ formatDate(serviceTicket.createdDate) }}</span>
							</div>
							<div class="info-item">
								<label>Người tạo:</label>
								<span class="value">{{ serviceTicket.createdByUser?.fullName || 'N/A' }}</span>
							</div>
							<div class="info-item">
								<label>Ngày cập nhật:</label>
								<span class="value">{{ formatDate(serviceTicket.modifiedDate) }}</span>
							</div>
							<div class="info-item">
								<label>Người cập nhật:</label>
								<span class="value">{{ serviceTicket.modifiedByUser?.fullName || 'N/A' }}</span>
							</div>
							<div v-if="serviceTicket.bookingId" class="info-item">
								<label>Booking ID:</label>
								<span class="value">{{ serviceTicket.bookingId }}</span>
							</div>
						</div>
					</div>

					<!-- Thông tin khách hàng -->
					<div class="info-card">
						<h5 class="card-title">
							<i class="fas fa-user me-2"></i>
							Thông tin khách hàng
						</h5>
						<div class="info-grid">
							<div class="info-item">
								<label>Tên:</label>
								<span class="value">{{ serviceTicket.customer?.customerName || 'N/A' }}</span>
							</div>
							<div class="info-item">
								<label>Số điện thoại:</label>
								<span class="value">{{ serviceTicket.customer?.customerPhone || 'N/A' }}</span>
							</div>
							<div class="info-item">
								<label>Email:</label>
								<span class="value">{{ serviceTicket.customer?.customerEmail || 'N/A' }}</span>
							</div>
						</div>
					</div>

					<!-- Thông tin xe -->
					<div class="info-card">
						<h5 class="card-title">
							<i class="fas fa-car me-2"></i>
							Thông tin xe
						</h5>
						<div class="info-grid">
							<div class="info-item">
								<label>Tên xe:</label>
								<span class="value">{{ serviceTicket.vehicle?.vehicleName || 'N/A' }}</span>
							</div>
							<div class="info-item">
								<label>Biển số:</label>
								<span class="value">{{ serviceTicket.vehicle?.vehicleLicensePlate || 'N/A' }}</span>
							</div>
							<div class="info-item">
								<label>Hãng:</label>
								<span class="value">{{ serviceTicket.vehicle?.make || 'N/A' }}</span>
							</div>
							<div class="info-item">
								<label>Model:</label>
								<span class="value">{{ serviceTicket.vehicle?.model || 'N/A' }}</span>
							</div>
							<div class="info-item">
								<label>Số km hiện tại:</label>
								<span class="value">{{ serviceTicket.vehicle?.currentKm?.toLocaleString() || 'N/A' }} km</span>
							</div>
						</div>
					</div>

					<!-- Parts -->
					<div class="info-card">
						<h5 class="card-title">
							<i class="fas fa-cogs me-2"></i>
							Phụ tùng
						</h5>
						<GmsTable v-if="serviceTicket.parts && serviceTicket.parts.length > 0" :data="serviceTicket.parts" :columns="partsColumns" :pagination="false">
							<template #cell-partName="{ row }">
								{{ row.part?.partName || row.partName || 'N/A' }}
							</template>
							<template #cell-partCode="{ row }">
								{{ row.part?.partCode || row.partCode || 'N/A' }}
							</template>
							<template #cell-quantity="{ row }">
								{{ row.quantity || 0 }}
							</template>
							<template #cell-partUnit="{ row }">
								{{ row.part?.partUnit || row.partUnit || 'N/A' }}
							</template>
							<template #cell-partPrice="{ row }">
								{{ formatPrice(row.part?.partPrice || row.partPrice || 0) }}
							</template>
						</GmsTable>
						<div v-else class="empty-state">
							<i class="fas fa-inbox"></i>
							<p>Chưa có phụ tùng nào</p>
						</div>
					</div>

					<!-- Garage Services -->
					<div class="info-card">
						<h5 class="card-title">
							<i class="fas fa-wrench me-2"></i>
							Dịch vụ
						</h5>
						<GmsTable v-if="validGarageServices && validGarageServices.length > 0" :data="validGarageServices" :columns="servicesColumns" :pagination="false">
							<template #cell-serviceName="{ row }">
								{{ row.garageService?.garageServiceName || row.garageServiceName || 'N/A' }}
							</template>
							<template #cell-servicePrice="{ row }">
								{{ formatPrice(row.garageService?.garageServicePrice || row.garageServicePrice || 0) }}
							</template>
							<template #cell-quantity="{ row }">
								{{ row.quantity || 1 }}
							</template>
						</GmsTable>
						<div v-else class="empty-state">
							<i class="fas fa-inbox"></i>
							<p>Chưa có dịch vụ nào</p>
						</div>
					</div>

					<!-- Technical Tasks -->
					<div class="info-card">
						<h5 class="card-title">
							<i class="fas fa-tasks me-2"></i>
							Tasks kỹ thuật
						</h5>
						<div v-if="serviceTicket.technicalTasks && serviceTicket.technicalTasks.length > 0">
							<div v-for="task in serviceTicket.technicalTasks" :key="task.technicalTaskId" class="task-item">
								<div class="task-header">
									<div>
										<strong>Task #{{ task.technicalTaskId }}</strong>
										<span :class="`badge badge-${getTaskStatusColor(task.taskStatus)}`">
											{{ getTaskStatusLabel(task.taskStatus) }}
										</span>
									</div>
									<div class="task-info">
										<span>Thợ: {{ task.assignedToTechnical.fullName || 'N/A' }}</span>
										<span>Ngày assign: {{ formatDate(task.assignedAt) }}</span>
									</div>
								</div>
								<p class="task-description">{{ task.description || 'Không có mô tả' }}</p>
							</div>
						</div>
						<div v-else class="empty-state">
							<i class="fas fa-inbox"></i>
							<p>Chưa có task nào</p>
						</div>
					</div>
				</div>
			</main>
		</div>

		<!-- Update Dialog -->
		<GmsDialog v-model="showUpdateDialog" title="Cập nhật phiếu dịch vụ" size="large">
			<form @submit.prevent="handleUpdate">
				<div class="mb-3">
					<label class="form-label">Mô tả vấn đề *</label>
					<textarea v-model="updateForm.initialIssue" class="form-control" rows="4" placeholder="Nhập mô tả vấn đề..." required></textarea>
				</div>

				<!-- Parts -->
				<div class="mb-3">
					<label class="form-label">Phụ tùng</label>
					<div class="search-container">
						<div class="search-input-wrapper">
							<GmsInput v-model="partSearch" placeholder="Tìm kiếm phụ tùng..." prefix-icon="fa-search" :clearable="true" @input="searchParts" @focus="showPartDropdown = true" />
							<div v-if="showPartDropdown && partSearchResults.length > 0" class="dropdown-results">
								<div v-for="part in partSearchResults" :key="part.partId" class="dropdown-item" @click="addPartToUpdate(part)">
									<div class="item-name">{{ part.partName }} ({{ part.partCode }})</div>
									<div class="item-details">
										<span>Tồn kho: {{ part.partQuantity }} {{ part.partUnit }}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div v-if="updateForm.parts.length > 0" class="selected-items-list mt-2">
						<div v-for="(part, index) in updateForm.parts" :key="`${part.partId}-${index}`" class="selected-item">
							<div class="selected-info">
								<strong>{{ part.partName }}</strong>
								<span>{{ part.partCode }} - Tồn kho: {{ part.partQuantity }} {{ part.partUnit }}</span>
							</div>
							<div class="quantity-input">
								<label>Số lượng:</label>
								<GmsInput v-model.number="part.quantity" type="number" :min="1" :max="part.partQuantity" style="width: 100px" />
							</div>
							<GmsButton variant="outline" size="small" icon="fa-times" @click="removePartFromUpdate(index)">Xóa</GmsButton>
						</div>
					</div>
				</div>

				<!-- Services -->
				<div class="mb-3">
					<label class="form-label">Dịch vụ</label>
					<div class="search-container">
						<div class="search-input-wrapper">
							<GmsInput v-model="serviceSearch" placeholder="Tìm kiếm dịch vụ..." prefix-icon="fa-search" :clearable="true" @input="searchServices" @focus="showServiceDropdown = true" />
							<div v-if="showServiceDropdown && serviceSearchResults.length > 0" class="dropdown-results">
								<div v-for="service in serviceSearchResults" :key="service.garageServiceId" class="dropdown-item" @click="addServiceToUpdate(service)">
									<div class="item-name">{{ service.garageServiceName }}</div>
									<div class="item-details">
										<span v-if="service.garageServicePrice">
											{{ formatPrice(service.garageServicePrice) }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div v-if="updateForm.garageServiceIds.length > 0" class="selected-items-list mt-2">
						<div v-for="(serviceId, index) in updateForm.garageServiceIds" :key="serviceId" class="selected-item">
							<div class="selected-info">
								<strong>{{ getServiceName(serviceId) }}</strong>
								<span class="text-muted small">(Số lượng: 1)</span>
							</div>
							<GmsButton variant="outline" size="small" icon="fa-times" @click="removeServiceFromUpdate(index)">Xóa</GmsButton>
						</div>
					</div>
				</div>

				<div class="dialog-actions">
					<GmsButton type="button" variant="outline" @click="closeUpdateDialog">Hủy</GmsButton>
					<GmsButton type="submit" variant="primary" :loading="updating">Cập nhật</GmsButton>
				</div>
			</form>
		</GmsDialog>

		<!-- Assign Dialog -->
		<GmsDialog v-model="showAssignDialog" title="Phân công thợ kỹ thuật" size="medium">
			<form @submit.prevent="handleAssign">
				<div class="mb-3">
					<label class="form-label">Chọn thợ:</label>
					<select v-model.number="assignForm.assignedToTechnical" class="form-select" required>
						<option value="">-- Chọn thợ --</option>
						<option v-for="staff in technicalStaff" :key="staff.userId" :value="staff.userId">
							{{ staff.fullName }}
							<span v-if="staff.isAvailable">(Rảnh)</span>
							<span v-else>(Đang có {{ staff.currentTaskCount }} task)</span>
						</option>
					</select>
				</div>
				<div class="mb-3">
					<label class="form-label">Mô tả công việc *</label>
					<textarea v-model="assignForm.description" class="form-control" rows="3" placeholder="Nhập mô tả công việc cho thợ..." required></textarea>
				</div>
				<div class="dialog-actions">
					<GmsButton type="button" variant="outline" @click="showAssignDialog = false">Hủy</GmsButton>
					<GmsButton type="submit" variant="primary" :loading="assignLoading">Phân công</GmsButton>
				</div>
			</form>
		</GmsDialog>

		<!-- Invoice Dialog -->
		<GmsDialog v-model="showInvoiceDialog" title="Tạo hóa đơn" size="medium">
			<form @submit.prevent="handleCreateInvoice">
				<div class="mb-3">
					<label class="form-label">Thuế VAT (VNĐ)</label>
					<GmsInput v-model.number="invoiceForm.taxAmount" type="number" placeholder="0" :min="0" :readonly="true" />
				</div>
				<div class="mb-3">
					<label class="form-label">Giảm giá (VNĐ)</label>
					<GmsInput v-model.number="invoiceForm.discountAmount" type="number" placeholder="0" :min="0" />
				</div>
				<div class="dialog-actions">
					<GmsButton type="button" variant="outline" @click="showInvoiceDialog = false">Hủy</GmsButton>
					<GmsButton type="submit" variant="primary" :loading="creatingInvoice">Tạo hóa đơn</GmsButton>
				</div>
			</form>
		</GmsDialog>

		<!-- Cancel Dialog -->
		<GmsDialog v-model="showCancelDialog" title="Xác nhận hủy phiếu" size="small">
			<template v-if="serviceTicket">
				<p>
					Bạn có chắc chắn muốn hủy phiếu
					<strong>#{{ serviceTicket.serviceTicketCode }}</strong>
					?
				</p>
				<p class="text-muted small">Phụ tùng sẽ được rollback về kho.</p>
				<div class="dialog-actions">
					<GmsButton type="button" variant="outline" @click="showCancelDialog = false">Hủy</GmsButton>
					<GmsButton variant="danger" :loading="cancelling" @click="handleCancel">Xác nhận hủy</GmsButton>
				</div>
			</template>
		</GmsDialog>

		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { TheHeader, TheSideBar } from '@/layout'
	import { GmsInput, GmsButton, GmsTable, GmsDialog, GmsToast } from '@/components'
	import { useToast } from '@/composables/useToast'
	import { getMenuByRole } from '@/utils/menu'
	import authService from '@/services/auth'
	import serviceTicketService from '@/services/serviceTicket'
	import technicalTaskService from '@/services/technicalTask'
	import invoiceService from '@/services/invoice'
	import userService from '@/services/user'
	import partService from '@/services/part'
	import garageServiceService from '@/services/garageService'
	import { SERVICE_TICKET_STATUS, SERVICE_TICKET_STATUS_LABELS, SERVICE_TICKET_STATUS_COLORS, TASK_STATUS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/constant/serviceTicketStatus'

	const route = useRoute()
	const router = useRouter()
	const toastRef = ref(null)
	const toast = useToast()

	const sidebarCollapsed = ref(false)
	const loading = ref(false)
	const updating = ref(false)
	const assignLoading = ref(false)
	const creatingInvoice = ref(false)
	const cancelling = ref(false)

	const serviceTicket = ref(null)
	const technicalStaff = ref([])
	const menuItems = ref([])

	const showUpdateDialog = ref(false)
	const showAssignDialog = ref(false)
	const showInvoiceDialog = ref(false)
	const showCancelDialog = ref(false)

	// Update form
	const updateForm = ref({
		initialIssue: '',
		serviceTicketCode: '', // Thêm ServiceTicketCode
		parts: [],
		garageServiceIds: []
	})

	// Assign form
	const assignForm = ref({
		assignedToTechnical: null,
		description: ''
	})

	// Invoice form
	const invoiceForm = ref({
		taxAmount: 0,
		discountAmount: 0
	})

	// Search states for update
	const partSearch = ref('')
	const partSearchResults = ref([])
	const showPartDropdown = ref(false)
	const availableServices = ref([])
	const serviceSearch = ref('')
	const serviceSearchResults = ref([])
	const showServiceDropdown = ref(false)

	const partsColumns = ref([
		{ key: 'partName', label: 'Tên phụ tùng' },
		{ key: 'partCode', label: 'Mã' },
		{ key: 'quantity', label: 'Số lượng' },
		{ key: 'partUnit', label: 'Đơn vị' },
		{ key: 'partPrice', label: 'Giá' }
	])

	const servicesColumns = ref([
		{ key: 'serviceName', label: 'Tên dịch vụ' },
		{ key: 'quantity', label: 'Số lượng' },
		{ key: 'servicePrice', label: 'Giá' }
	])

	// Computed để lọc bỏ các garage services không hợp lệ
	const validGarageServices = computed(() => {
		if (!serviceTicket.value || !serviceTicket.value.garageServices) {
			console.log('validGarageServices: No serviceTicket or garageServices')
			return []
		}

		const filtered = serviceTicket.value.garageServices.filter((s) => {
			const serviceId = s.garageService?.garageServiceId || s.garageServiceId
			const isValid = serviceId && serviceId !== 0 && serviceId !== null && serviceId !== undefined
			if (!isValid) {
				console.log('validGarageServices: Filtered out invalid service:', s, 'serviceId:', serviceId)
			}
			return isValid
		})

		console.log('validGarageServices: Original:', serviceTicket.value.garageServices.length, 'Filtered:', filtered.length)
		console.log('validGarageServices: Result:', filtered)
		return filtered
	})

	// Computed
	const canUpdate = computed(() => {
		if (!serviceTicket.value) return false
		return serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.COMPLETED && serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.CLOSED && serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.COMPLETED_PAYMENT && serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.CANCELLED
	})

	const canAssign = computed(() => {
		if (!serviceTicket.value) return false
		return serviceTicket.value.serviceTicketStatus === SERVICE_TICKET_STATUS.PENDING_TECHNICAL_CONFIRMATION || serviceTicket.value.serviceTicketStatus === 0
	})

	const canConfirmAdjustment = computed(() => {
		if (!serviceTicket.value) return false
		const status = serviceTicket.value.serviceTicketStatus
		const statusNum = Number(status)
		const can = statusNum === SERVICE_TICKET_STATUS.ADJUSTED_BY_TECHNICAL || status === SERVICE_TICKET_STATUS.ADJUSTED_BY_TECHNICAL || status === 1 || status === '1'
		return can
	})

	const canStartInProgress = computed(() => {
		if (!serviceTicket.value) return false
		const status = serviceTicket.value.serviceTicketStatus
		const statusNum = Number(status)
		// Staff có thể chuyển status thành InProgress từ AdjustedByTechnical (1)
		const can = statusNum === SERVICE_TICKET_STATUS.ADJUSTED_BY_TECHNICAL || status === SERVICE_TICKET_STATUS.ADJUSTED_BY_TECHNICAL || status === 1 || status === '1'
		return can
	})

	const canCreateInvoice = computed(() => {
		if (!serviceTicket.value) return false
		return serviceTicket.value.serviceTicketStatus === SERVICE_TICKET_STATUS.COMPLETED || serviceTicket.value.serviceTicketStatus === 3
	})

	const canComplete = computed(() => {
		if (!serviceTicket.value) return false
		return serviceTicket.value.serviceTicketStatus === SERVICE_TICKET_STATUS.IN_PROGRESS || serviceTicket.value.serviceTicketStatus === 2
	})

	const canCancel = computed(() => {
		if (!serviceTicket.value) return false
		return serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.COMPLETED && serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.IN_PROGRESS && serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.CLOSED && serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.COMPLETED_PAYMENT && serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.CANCELLED && serviceTicket.value.serviceTicketStatus !== 3 && serviceTicket.value.serviceTicketStatus !== 4 && serviceTicket.value.serviceTicketStatus !== 5
	})

	// Methods
	const formatPrice = (price) => {
		if (!price && price !== 0) return '0 đ'
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(price)
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

	const getStatusLabel = (status) => {
		return SERVICE_TICKET_STATUS_LABELS[status] || 'N/A'
	}

	const getStatusColor = (status) => {
		return SERVICE_TICKET_STATUS_COLORS[status] || 'secondary'
	}

	const getTaskStatusLabel = (status) => {
		return TASK_STATUS_LABELS[status] || 'N/A'
	}

	const getTaskStatusColor = (status) => {
		return TASK_STATUS_COLORS[status] || 'secondary'
	}

	const getServiceName = (serviceId) => {
		if (!serviceId || serviceId === 0) {
			return 'Service không hợp lệ'
		}

		// Tìm trong availableServices
		const service = availableServices.value.find((s) => {
			const id = s.garageServiceId
			return id && (id === serviceId || Number(id) === Number(serviceId))
		})

		if (service && service.garageServiceName) {
			return service.garageServiceName
		}

		// Nếu không tìm thấy, thử tìm trong serviceTicket.garageServices
		if (serviceTicket.value && serviceTicket.value.garageServices) {
			const ticketService = serviceTicket.value.garageServices.find((s) => {
				const id = s.garageService?.garageServiceId || s.garageServiceId
				return id && (id === serviceId || Number(id) === Number(serviceId))
			})
			if (ticketService && ticketService.garageService?.garageServiceName) {
				return ticketService.garageService.garageServiceName
			}
		}

		return `Service #${serviceId}`
	}

	const searchParts = async () => {
		if (!partSearch.value || partSearch.value.length < 2) {
			partSearchResults.value = []
			return
		}

		try {
			const response = await partService.search(partSearch.value)
			partSearchResults.value = (response.data || []).filter((part) => !updateForm.value.parts.find((p) => p.partId === part.partId))
		} catch (error) {
			console.error('Error searching parts:', error)
			partSearchResults.value = []
		}
	}

	const addPartToUpdate = (part) => {
		if (updateForm.value.parts.find((p) => p.partId === part.partId)) {
			toast.warning('Phụ tùng đã được thêm')
			return
		}

		updateForm.value.parts.push({
			...part,
			quantity: 1
		})

		partSearch.value = ''
		showPartDropdown.value = false
		partSearchResults.value = []
	}

	const removePartFromUpdate = (index) => {
		updateForm.value.parts.splice(index, 1)
	}

	const searchServices = async () => {
		if (!serviceSearch.value || serviceSearch.value.length < 2) {
			serviceSearchResults.value = []
			return
		}

		try {
			const response = await garageServiceService.search(serviceSearch.value)
			const services = response.data || response || []
			// Filter: loại bỏ các service đã được thêm vào form (so sánh ID)
			serviceSearchResults.value = Array.isArray(services)
				? services.filter((service) => {
						const serviceId = service.garageServiceId
						// Kiểm tra xem serviceId đã có trong updateForm.garageServiceIds chưa
						return !updateForm.value.garageServiceIds.includes(serviceId)
					})
				: []
		} catch (error) {
			console.error('Error searching services:', error)
			serviceSearchResults.value = []
		}
	}

	const addServiceToUpdate = (service) => {
		const serviceId = service.garageServiceId

		if (!serviceId || serviceId === 0) {
			toast.error('Service không hợp lệ')
			return
		}

		// Kiểm tra xem service đã được thêm chưa (so sánh cả number và string)
		const alreadyAdded = updateForm.value.garageServiceIds.some((id) => id === serviceId || Number(id) === Number(serviceId))

		if (alreadyAdded) {
			toast.warning('Dịch vụ đã được thêm')
			return
		}

		// Thêm service ID vào form
		updateForm.value.garageServiceIds.push(serviceId)

		// Đảm bảo service có trong availableServices để hiển thị tên
		const existingService = availableServices.value.find((av) => {
			const avId = av.garageServiceId
			return avId && (avId === serviceId || Number(avId) === Number(serviceId))
		})

		if (!existingService) {
			availableServices.value.push(service)
			console.log('Added new service to availableServices:', service)
		}

		serviceSearch.value = ''
		showServiceDropdown.value = false
		serviceSearchResults.value = []

		console.log('Current garageServiceIds:', updateForm.value.garageServiceIds)
	}

	const removeServiceFromUpdate = (index) => {
		updateForm.value.garageServiceIds.splice(index, 1)
	}

	const openUpdateDialog = async () => {
		if (!serviceTicket.value) return

		// Load available services trước để có thể hiển thị tên
		await loadAvailableServices()

		// Lấy danh sách service IDs hợp lệ từ serviceTicket
		const validServiceIds = (serviceTicket.value.garageServices || [])
			.map((s) => {
				const serviceId = s.garageService?.garageServiceId || s.garageServiceId
				// Chỉ lấy service có ID hợp lệ (không phải 0, null, undefined)
				if (!serviceId || serviceId === 0) {
					return null
				}

				// Đảm bảo service đã có trong availableServices để hiển thị tên
				const existingService = availableServices.value.find((av) => {
					const avId = av.garageServiceId
					return avId && (avId === serviceId || Number(avId) === Number(serviceId))
				})

				if (!existingService) {
					// Thêm service vào availableServices nếu chưa có
					const serviceInfo = {
						garageServiceId: serviceId,
						garageServiceName: s.garageService?.garageServiceName || `Service #${serviceId}`,
						garageServicePrice: s.garageService?.garageServicePrice || 0
					}
					availableServices.value.push(serviceInfo)
					console.log('Added service to availableServices:', serviceInfo)
				}
				return serviceId
			})
			.filter((id) => id && id !== 0) // Lọc bỏ undefined/null/0

		updateForm.value = {
			initialIssue: serviceTicket.value.initialIssue || '',
			serviceTicketCode: serviceTicket.value.serviceTicketCode || '', // Giữ ServiceTicketCode
			parts: (serviceTicket.value.parts || []).map((p) => ({
				partId: p.part?.partId || p.partId,
				partName: p.part?.partName || '',
				partCode: p.part?.partCode || '',
				partQuantity: p.part?.partQuantity || 0,
				partUnit: p.part?.partUnit || '',
				quantity: p.quantity || 1
			})),
			garageServiceIds: validServiceIds
		}

		console.log('Update form garageServiceIds:', updateForm.value.garageServiceIds)
		console.log('Available services:', availableServices.value)
		showUpdateDialog.value = true
	}

	const closeUpdateDialog = () => {
		showUpdateDialog.value = false
		updateForm.value = {
			initialIssue: '',
			serviceTicketCode: '',
			parts: [],
			garageServiceIds: []
		}
		partSearch.value = ''
		serviceSearch.value = ''
		partSearchResults.value = []
		serviceSearchResults.value = []
		showPartDropdown.value = false
		showServiceDropdown.value = false
	}

	const handleUpdate = async () => {
		if (!updateForm.value.initialIssue.trim()) {
			toast.error('Vui lòng nhập mô tả vấn đề')
			return
		}

		// Validate part quantities
		for (const part of updateForm.value.parts) {
			if (!part.quantity || part.quantity < 1) {
				toast.error(`Vui lòng nhập số lượng hợp lệ cho ${part.partName}`)
				return
			}
			if (part.quantity > part.partQuantity) {
				toast.error(`Số lượng ${part.partName} vượt quá tồn kho (${part.partQuantity})`)
				return
			}
		}

		try {
			updating.value = true
			const currentUser = authService.getCurrentUser()

			const payload = {
				modifiedBy: currentUser?.userId,
				initialIssue: updateForm.value.initialIssue.trim(),
				serviceTicketCode: updateForm.value.serviceTicketCode || serviceTicket.value.serviceTicketCode, // Giữ ServiceTicketCode
				parts: updateForm.value.parts.map((p) => ({
					partId: p.partId,
					quantity: p.quantity
				})),
				garageServiceIds: updateForm.value.garageServiceIds // Gửi garageServiceIds, không cần quantity
			}

			await serviceTicketService.update(route.params.id, payload)

			toast.success('Cập nhật thành công!')
			closeUpdateDialog()
			await loadServiceTicket()
		} catch (error) {
			toast.error('Lỗi khi cập nhật', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			updating.value = false
		}
	}

	const openAssignDialog = async () => {
		await loadTechnicalStaff()
		assignForm.value = {
			assignedToTechnical: null,
			description: ''
		}
		showAssignDialog.value = true
	}

	const handleAssign = async () => {
		if (!assignForm.value.assignedToTechnical || !assignForm.value.description.trim()) {
			toast.error('Vui lòng chọn thợ và nhập mô tả công việc')
			return
		}

		try {
			assignLoading.value = true
			await serviceTicketService.assign(route.params.id, {
				assignedToTechnical: assignForm.value.assignedToTechnical,
				description: assignForm.value.description.trim()
			})

			toast.success('Phân công thành công!')
			showAssignDialog.value = false
			await loadServiceTicket()
		} catch (error) {
			toast.error('Lỗi khi phân công', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			assignLoading.value = false
		}
	}

	const confirmAdjustment = async () => {
		if (!serviceTicket.value || !serviceTicket.value.technicalTasks || serviceTicket.value.technicalTasks.length === 0) {
			toast.error('Không tìm thấy technical task')
			return
		}

		const task = serviceTicket.value.technicalTasks[0]
		if (!task.technicalTaskId) {
			toast.error('Không tìm thấy technical task ID')
			return
		}

		try {
			const currentUser = authService.getCurrentUser()
			// API confirm tự động cập nhật serviceTicketStatus thành InProgress (2)
			await technicalTaskService.confirm(task.technicalTaskId, currentUser?.userId)

			toast.success('Xác nhận điều chỉnh thành công!')
			await loadServiceTicket()
		} catch (error) {
			toast.error('Lỗi khi xác nhận điều chỉnh', error.message || error.userMsg || 'Có lỗi xảy ra')
		}
	}
	const handleCompleteTask = async () => {
		if (!serviceTicket.value?.serviceTicketId) {
			toast.error('Không tìm thấy service ticket')
			return
		}

		if (!confirm('Bạn có chắc muốn hoàn thành xử lý phiếu dịch vụ này?')) return

		try {
			const currentUser = authService.getCurrentUser()
			const modifiedBy = currentUser?.userId || 1

			await serviceTicketService.setStatusCompleted(serviceTicket.value.serviceTicketId, {
				modifiedBy,
				note: 'Staff hoàn thành xử lý phiếu dịch vụ'
			})

			toast.success('Đã hoàn thành xử lý phiếu dịch vụ!')
			await loadServiceTicket()
		} catch (error) {
			toast.error('Lỗi khi hoàn thành xử lý', error.message || error.userMsg || 'Có lỗi xảy ra')
		}
	}

	const handleStartInProgress = async () => {
		if (!serviceTicket.value?.serviceTicketId) {
			toast.error('Không tìm thấy service ticket')
			return
		}

		if (!confirm('Bạn có chắc muốn bắt đầu xử lý phiếu dịch vụ này?')) return

		try {
			const currentUser = authService.getCurrentUser()
			const modifiedBy = currentUser?.userId || 1

			await serviceTicketService.setStatusInProgress(serviceTicket.value.serviceTicketId, {
				modifiedBy,
				note: 'Staff bắt đầu xử lý phiếu dịch vụ'
			})

			toast.success('Đã bắt đầu xử lý phiếu dịch vụ!')
			await loadServiceTicket()
		} catch (error) {
			toast.error('Lỗi khi bắt đầu xử lý', error.message || error.userMsg || 'Có lỗi xảy ra')
		}
	}

	const openInvoiceDialog = () => {
		// Tính tổng tiền từ parts và services (nếu có)
		let totalAmount = 0

		// Tính từ parts
		if (serviceTicket.value?.parts && serviceTicket.value.parts.length > 0) {
			totalAmount += serviceTicket.value.parts.reduce((sum, part) => {
				return sum + (part.part?.partPrice || 0) * (part.quantity || 0)
			}, 0)
		}

		// Tính từ services
		if (serviceTicket.value?.garageServices && serviceTicket.value.garageServices.length > 0) {
			totalAmount += serviceTicket.value.garageServices.reduce((sum, service) => {
				return sum + (service.price || 0)
			}, 0)
		}

		// Set tax mặc định là 10% của tổng tiền
		const defaultTax = Math.round(totalAmount * 0.1)

		invoiceForm.value = {
			taxAmount: defaultTax,
			discountAmount: 0
		}
		showInvoiceDialog.value = true
	}

	const handleCreateInvoice = async () => {
		if (!serviceTicket.value) return

		try {
			creatingInvoice.value = true
			const payload = {
				serviceTicketId: serviceTicket.value.serviceTicketId,
				customerId: serviceTicket.value.customer?.customerId,
				taxAmount: invoiceForm.value.taxAmount || 0,
				discountAmount: invoiceForm.value.discountAmount || 0
			}

			const response = await invoiceService.create(payload)

			toast.success('Tạo hóa đơn thành công!', `Invoice ID: ${response.data.invoiceId}`)
			showInvoiceDialog.value = false
			// Điều hướng đến trang invoice
			router.push(`/staff/invoices/${response.data.invoiceId}`)
		} catch (error) {
			const res = error?.response
			const status = res?.status
			const data = res?.data

			// ⚠️ BẮT ĐÚNG KEY TỪ BACKEND
			const userMsg = data?.UserMsg || 'Có lỗi xảy ra'

			if (status === 409) {
				toast.warning('Hóa đơn đã tồn tại', userMsg)
			} else if (status === 400) {
				toast.warning('Dữ liệu không hợp lệ', userMsg)
			} else if (status === 404) {
				toast.warning('Không tìm thấy dữ liệu', userMsg)
			} else {
				toast.warning('Hóa đơn đã tồn tại', userMsg)
			}
		} finally {
			creatingInvoice.value = false
		}
	}

	const openCancelDialog = () => {
		showCancelDialog.value = true
	}

	const handleCancel = async () => {
		if (!serviceTicket.value) return

		try {
			cancelling.value = true
			const currentUser = authService.getCurrentUser()

			await serviceTicketService.setStatusCancelled(route.params.id, {
				modifiedBy: currentUser?.userId,
				note: 'Hủy phiếu dịch vụ'
			})

			toast.success('Hủy phiếu thành công!')
			showCancelDialog.value = false
			await loadServiceTicket()
		} catch (error) {
			toast.error('Lỗi khi hủy phiếu', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			cancelling.value = false
		}
	}

	const loadServiceTicket = async () => {
		try {
			loading.value = true
			const response = await serviceTicketService.getById(route.params.id)
			serviceTicket.value = response.data
		} catch (error) {
			toast.error('Lỗi khi tải chi tiết phiếu', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			loading.value = false
		}
	}

	const loadTechnicalStaff = async () => {
		try {
			const response = await userService.getTechnicalStaff()
			technicalStaff.value = response.data || []
		} catch (error) {
			console.error('Error loading technical staff:', error)
			technicalStaff.value = []
		}
	}

	const loadAvailableServices = async () => {
		try {
			// Load all services for display names - search với empty string để lấy tất cả
			const response = await garageServiceService.search('', 1000)
			const services = response.data || response || []
			availableServices.value = Array.isArray(services) ? services : []
		} catch (error) {
			console.error('Error loading services:', error)
			availableServices.value = []
		}
	}

	const handleLogout = async () => {
		await authService.logout()
		router.push('/')
	}

	// Close dropdowns when clicking outside
	const handleClickOutside = (event) => {
		if (!event.target.closest('.search-input-wrapper')) {
			showPartDropdown.value = false
			showServiceDropdown.value = false
		}
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

		await loadServiceTicket()
		await loadAvailableServices()
		document.addEventListener('click', handleClickOutside)
	})
</script>

<style scoped>
	.service-ticket-detail-view {
		min-height: 100vh;
		background: var(--light, #f8f9fa);
	}

	.content-wrapper {
		transition: margin-left 0.3s ease;
	}

	.detail-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.loading-state {
		text-align: center;
		padding: 3rem;
		color: #999;
	}

	.loading-state i {
		font-size: 2rem;
		margin-bottom: 1rem;
		display: block;
	}

	.detail-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.info-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.card-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--dark, #2c3a47);
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-item label {
		font-size: 0.85rem;
		color: #666;
		font-weight: 500;
	}

	.info-item .value {
		font-size: 1rem;
		color: var(--dark, #2c3a47);
		font-weight: 600;
	}

	.task-item {
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
		margin-bottom: 0.75rem;
	}

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.task-info {
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: #666;
		flex-wrap: wrap;
	}

	.task-description {
		margin: 0;
		color: var(--dark, #2c3a47);
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #999;
	}

	.empty-state i {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		display: block;
	}

	.search-container {
		margin-bottom: 1rem;
	}

	.search-input-wrapper {
		position: relative;
	}

	.dropdown-results {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		max-height: 300px;
		overflow-y: auto;
		z-index: 1000;
		margin-top: 4px;
	}

	.dropdown-item {
		padding: 0.75rem 1rem;
		cursor: pointer;
		border-bottom: 1px solid #f0f0f0;
		transition: background 0.2s;
	}

	.dropdown-item:hover {
		background: #f8f9fa;
	}

	.dropdown-item:last-child {
		border-bottom: none;
	}

	.item-name {
		font-weight: 600;
		color: var(--dark, #2c3a47);
		margin-bottom: 0.25rem;
	}

	.item-details {
		font-size: 0.875rem;
		color: #666;
		display: flex;
		gap: 1rem;
	}

	.selected-items-list {
		margin-top: 1rem;
	}

	.selected-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
		margin-bottom: 0.75rem;
	}

	.selected-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.selected-info strong {
		color: var(--dark, #2c3a47);
	}

	.selected-info span {
		font-size: 0.875rem;
		color: #666;
	}

	.quantity-input {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.quantity-input label {
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
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

	.mt-2 {
		margin-top: 0.5rem;
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

	.text-muted {
		color: #999;
	}

	.small {
		font-size: 0.875rem;
	}

	.text-muted.small {
		font-size: 0.8rem;
		color: #999;
		font-style: italic;
	}

	.me-2 {
		margin-right: 0.5rem;
	}
</style>
