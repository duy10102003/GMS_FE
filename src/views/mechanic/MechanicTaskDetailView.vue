<template>
	<div class="mechanic-task-detail-view">
		<TheSideBar :collapsed="sidebarCollapsed" :menu-items="menuItems" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />

		<div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
			<TheHeader :title="`Chi tiết công việc #${task?.technicalTaskId || ''}`" :show-search="false" @logout="handleLogout" />

			<main class="main-content" style="margin-top: 70px; padding: 2rem">
				<div class="detail-header">
					<GmsButton variant="outline" icon="fa-arrow-left" @click="$router.back()">Quay lại</GmsButton>
					<div class="header-actions">
						<GmsButton v-if="canAdjust" variant="info" icon="fa-edit" @click="showAdjustDialog = true">Điều chỉnh phụ tùng/dịch vụ</GmsButton>
						<GmsButton v-if="canStartInProgress" variant="primary" icon="fa-play" @click="handleStartInProgress">Bắt đầu xử lý</GmsButton>
						<GmsButton v-if="canComplete" variant="success" icon="fa-check" @click="handleCompleteTask">Hoàn thành công việc</GmsButton>
					</div>
				</div>

				<div v-if="loading" class="loading-state">
					<i class="fas fa-spinner fa-spin"></i>
					<span>Đang tải...</span>
				</div>

				<div v-else-if="task" class="detail-content">
					<!-- Thông tin Task -->
					<div class="info-card">
						<h5 class="card-title">
							<i class="fas fa-info-circle me-2"></i>
							Thông tin công việc
						</h5>
						<div class="info-grid">
							<div class="info-item">
								<label>Mã task:</label>
								<span class="value">#{{ task.technicalTaskId }}</span>
							</div>
							<div class="info-item">
								<label>Trạng thái:</label>
								<span :class="`badge badge-${getTaskStatusColor(task.taskStatus)}`">
									{{ getTaskStatusLabel(task.taskStatus) }}
								</span>
							</div>
							<div class="info-item">
								<label>Mô tả:</label>
								<span class="value">{{ task.description || 'Không có mô tả' }}</span>
							</div>
							<div class="info-item">
								<label>Ngày assign:</label>
								<span class="value">{{ formatDate(task.assignedAt) }}</span>
							</div>
						</div>
					</div>

					<!-- Thông tin Service Ticket -->
					<div class="info-card">
						<h5 class="card-title">
							<i class="fas fa-ticket-alt me-2"></i>
							Thông tin phiếu dịch vụ
						</h5>
						<div class="info-grid">
							<div class="info-item">
								<label>Mã phiếu:</label>
								<span class="value">{{ task.serviceTicketCode || task.serviceTicket?.serviceTicketCode || `#${task.serviceTicketId}` }}</span>
							</div>
							<div class="info-item">
								<label>Trạng thái phiếu:</label>
								<span :class="`badge badge-${getServiceTicketStatusColor(task.serviceTicketStatus || task.serviceTicket?.serviceTicketStatus)}`">
									{{ getServiceTicketStatusLabel(task.serviceTicketStatus || task.serviceTicket?.serviceTicketStatus) }}
								</span>
							</div>
							<div class="info-item">
								<label>Vấn đề ban đầu:</label>
								<span class="value">{{ task.serviceTicket?.initialIssue || 'Chưa có mô tả' }}</span>
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
								<span class="value">{{ task.customer?.customerName || task.serviceTicket?.customer?.customerName }}</span>
							</div>
							<div class="info-item">
								<label>Số điện thoại:</label>
								<span class="value">{{ task.customer?.customerPhone || task.serviceTicket?.customer?.customerPhone }}</span>
							</div>
							<div class="info-item">
								<label>Email:</label>
								<span class="value">{{ task.customer?.customerEmail || task.serviceTicket?.customer?.customerEmail || 'N/A' }}</span>
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
								<span class="value">{{ task.vehicle?.vehicleName || task.serviceTicket?.vehicle?.vehicleName }}</span>
							</div>
							<div class="info-item">
								<label>Biển số:</label>
								<span class="value">{{ task.vehicle?.vehicleLicensePlate || task.serviceTicket?.vehicle?.vehicleLicensePlate }}</span>
							</div>
							<div class="info-item">
								<label>Hãng/Model:</label>
								<span class="value">{{ task.vehicle?.make || task.serviceTicket?.vehicle?.make }} {{ task.vehicle?.model || task.serviceTicket?.vehicle?.model }}</span>
							</div>
							<div class="info-item">
								<label>Số km:</label>
								<span class="value">{{ (task.vehicle?.currentKm || task.serviceTicket?.vehicle?.currentKm)?.toLocaleString() || 'N/A' }} km</span>
							</div>
						</div>
					</div>

					<!-- Parts -->
					<div class="info-card">
						<h5 class="card-title">
							<i class="fas fa-cogs me-2"></i>
							Phụ tùng
						</h5>
						<GmsTable v-if="task.parts && task.parts.length > 0" :data="task.parts" :columns="partsColumns" :pagination="false" />
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
						<GmsTable v-if="task.garageServices && task.garageServices.length > 0" :data="task.garageServices" :columns="servicesColumns" :pagination="false" />
						<div v-else class="empty-state">
							<i class="fas fa-inbox"></i>
							<p>Chưa có dịch vụ nào</p>
						</div>
					</div>
				</div>
			</main>
		</div>

		<!-- Adjust Dialog -->
		<GmsDialog v-model="showAdjustDialog" title="Điều chỉnh phụ tùng/dịch vụ" size="large">
			<div class="adjust-content">
				<!-- Initial Issue Section -->
				<div class="adjust-section">
					<h6>Mô tả vấn đề ban đầu:</h6>
					<textarea v-model="adjustForm.initialIssue" class="form-textarea" rows="4" placeholder="Nhập mô tả vấn đề ban đầu..."></textarea>
				</div>

				<!-- Parts Section -->
				<div class="adjust-section">
					<h6>Phụ tùng:</h6>

					<!-- Search Part -->
					<div class="search-wrapper">
						<GmsInput v-model="partSearchQuery" placeholder="Tìm kiếm phụ tùng..." prefix-icon="fa-search" :clearable="true" @input="searchParts" />
						<div v-if="partSearchResults.length > 0" class="search-results">
							<div v-for="part in partSearchResults" :key="part.partId" class="search-result-item" @click="addPart(part)">
								<div class="result-info">
									<strong>{{ part.partName }}</strong>
									<span class="result-meta">Mã: {{ part.partCode }} | Tồn: {{ part.partQuantity }} {{ part.partUnit }} | Giá: {{ formatPrice(part.partPrice) }}</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Selected Parts -->
					<div v-if="selectedParts.length > 0" class="selected-items">
						<div v-for="(part, index) in selectedParts" :key="index" class="selected-item">
							<div class="item-info">
								<strong>{{ part.partName }}</strong>
								<span class="item-meta">{{ formatPrice(part.price) }}</span>
							</div>
							<div class="item-actions">
								<GmsInput v-model.number="part.quantity" type="number" :min="1" style="width: 100px; margin-right: 0.5rem" />
								<GmsButton variant="danger" size="small" icon="fa-delete" @click="removePart(index)" />
							</div>
						</div>
					</div>
				</div>

				<!-- Services Section -->
				<div class="adjust-section mt-4">
					<h6>Dịch vụ:</h6>

					<!-- Search Service -->
					<div class="search-wrapper">
						<GmsInput v-model="garageServiceSearchQuery" placeholder="Tìm kiếm dịch vụ..." prefix-icon="fa-search" :clearable="true" @input="searchGarageServices" />
						<div v-if="garageServiceSearchResults.length > 0" class="search-results">
							<div v-for="service in garageServiceSearchResults" :key="service.garageServiceId" class="search-result-item" @click="addService(service)">
								<div class="result-info">
									<strong>{{ service.garageServiceName }}</strong>
									<span class="result-meta">Giá: {{ formatPrice(service.garageServicePrice) }}</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Selected Services -->
					<div v-if="selectedServices.length > 0" class="selected-items">
						<div v-for="(service, index) in selectedServices" :key="index" class="selected-item">
							<div class="item-info">
								<strong>{{ service.garageServiceName }}</strong>
								<span class="item-meta">{{ formatPrice(service.price) }}</span>
								<!-- <span class="text-muted small">(Số lượng: 1)</span> -->
							</div>
							<div class="item-actions">
								<GmsButton variant="danger" size="small" icon="fa-times" @click="removeService(index)" />
							</div>
						</div>
					</div>
				</div>
			</div>

			<template #footer>
				<GmsButton variant="outline" @click="showAdjustDialog = false">Hủy</GmsButton>
				<GmsButton @click="handleAdjust" variant="primary" :loading="adjustLoading">Điều chỉnh</GmsButton>
			</template>
		</GmsDialog>

		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
	import { ref, computed, onMounted, watch } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { TheHeader, TheSideBar } from '@/layout'
	import { GmsInput, GmsButton, GmsTable, GmsDialog, GmsToast } from '@/components'
	import { useToast } from '@/composables/useToast'
	import { getMenuByRole } from '@/utils/menu'
	import authService from '@/services/auth'
	import technicalTaskService from '@/services/technicalTask'
	import serviceTicketService from '@/services/serviceTicket'
	import partService from '@/services/part'
	import garageServiceService from '@/services/garageService'
	import { useAuthStore } from '@/stores/auth'
	import { SERVICE_TICKET_STATUS, SERVICE_TICKET_STATUS_LABELS, SERVICE_TICKET_STATUS_COLORS, TASK_STATUS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/constant/serviceTicketStatus'

	const route = useRoute()
	const router = useRouter()
	const toastRef = ref(null)
	const toast = useToast()
	const authStore = useAuthStore()

	const sidebarCollapsed = ref(false)
	const loading = ref(false)
	const task = ref(null)
	const menuItems = ref([])
	const showAdjustDialog = ref(false)
	const adjustLoading = ref(false)

	// Adjust form
	const adjustForm = ref({
		initialIssue: '',
		parts: [],
		garageServices: []
	})

	// Search states
	const partSearchQuery = ref('')
	const partSearchResults = ref([])
	const partSearchLoading = ref(false)
	const selectedParts = ref([])

	const garageServiceSearchQuery = ref('')
	const garageServiceSearchResults = ref([])
	const garageServiceSearchLoading = ref(false)
	const selectedServices = ref([])

	const partsColumns = ref([
		{ key: 'partName', label: 'Tên phụ tùng', formatter: (val, row) => row.part?.partName || val },
		{ key: 'partCode', label: 'Mã', formatter: (val, row) => row.part?.partCode || val },
		{ key: 'quantity', label: 'Số lượng' },
		{ key: 'partUnit', label: 'Đơn vị', formatter: (val, row) => row.part?.partUnit || val },
		{ key: 'inventoryPrice', label: 'Giá', formatter: (val, row) => formatPrice(row.part?.partPrice || val) }
	])

	const servicesColumns = ref([
		{ key: 'garageServiceName', label: 'Tên dịch vụ', formatter: (val, row) => row.garageService?.garageServiceName || val },
		{ key: 'garageServicePrice', label: 'Giá', formatter: (val, row) => formatPrice(row.garageService?.garageServicePrice || val) }
	])

	const canAdjust = computed(() => {
		if (!task.value) return false
		// API trả về serviceTicketStatus trực tiếp trong task object
		const status = task.value.serviceTicketStatus || task.value.serviceTicket?.serviceTicketStatus
		if (status === undefined || status === null) return false
		// Normalize status to number for comparison
		const statusNum = Number(status)
		// Có thể điều chỉnh khi service ticket status là PENDING_TECHNICAL_CONFIRMATION (0)
		return statusNum === SERVICE_TICKET_STATUS.PENDING_TECHNICAL_CONFIRMATION || status === SERVICE_TICKET_STATUS.CONFIRM_BY_CUSTOMER || status === SERVICE_TICKET_STATUS.ADJUSTED_BY_TECHNICAL || status === SERVICE_TICKET_STATUS.PENDING_TECHNICAL_CONFIRMATION || status === 0 || status === '0'
	})

	const canStartInProgress = computed(() => {
		if (!task.value) return false
		// API trả về serviceTicketStatus trực tiếp trong task object
		const status = task.value.serviceTicketStatus || task.value.serviceTicket?.serviceTicketStatus
		if (status === undefined || status === null) return false
		// Normalize status to number for comparison
		const statusNum = Number(status)
		// Có thể bắt đầu xử lý khi service ticket status là ADJUSTED_BY_TECHNICAL (1)
		return statusNum === SERVICE_TICKET_STATUS.ADJUSTED_BY_TECHNICAL || status === SERVICE_TICKET_STATUS.CONFIRM_BY_CUSTOMER || status === SERVICE_TICKET_STATUS.ADJUSTED_BY_TECHNICAL || status === 1 || status === '1'
	})

	const canComplete = computed(() => {
		if (!task.value) return false
		// API trả về serviceTicketStatus trực tiếp trong task object
		const status = task.value.serviceTicketStatus || task.value.serviceTicket?.serviceTicketStatus
		if (status === undefined || status === null) return false
		// Normalize status to number for comparison
		const statusNum = Number(status)
		// Có thể hoàn thành khi service ticket status là IN_PROGRESS (2)
		return statusNum === SERVICE_TICKET_STATUS.IN_PROGRESS || status === SERVICE_TICKET_STATUS.IN_PROGRESS || status === 2 || status === '2'
	})

	const getTaskStatusLabel = (status) => {
		return TASK_STATUS_LABELS[status] || 'N/A'
	}

	const getTaskStatusColor = (status) => {
		return TASK_STATUS_COLORS[status] || 'secondary'
	}

	const getServiceTicketStatusLabel = (status) => {
		return SERVICE_TICKET_STATUS_LABELS[status] || 'N/A'
	}

	const getServiceTicketStatusColor = (status) => {
		return SERVICE_TICKET_STATUS_COLORS[status] || 'secondary'
	}

	const formatDate = (date) => {
		if (!date) return 'N/A'
		return new Date(date).toLocaleString('vi-VN')
	}

	const formatPrice = (price) => {
		if (!price) return '0'
		return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
	}

	const loadTask = async () => {
		try {
			loading.value = true
			const response = await technicalTaskService.getById(route.params.id)

			task.value = response.data || response

			// If service ticket is not nested, try to load it separately for full details
			if (!task.value.serviceTicket && task.value.serviceTicketId) {
				try {
					const ticketResponse = await serviceTicketService.getById(task.value.serviceTicketId)
					task.value.serviceTicket = ticketResponse.data || ticketResponse
				} catch (error) {
					console.error('Error loading service ticket:', error)
				}
			}

			// Initialize adjust form with current data
			// API có thể trả về initialIssue trong serviceTicket hoặc cần load riêng
			if (task.value.serviceTicket?.initialIssue) {
				adjustForm.value.initialIssue = task.value.serviceTicket.initialIssue
			} else if (task.value.serviceTicketId) {
				// Nếu chưa có initialIssue, có thể load từ service ticket
				// Hoặc để user nhập mới
				adjustForm.value.initialIssue = ''
			}

			// Initialize selected parts and services from task
			if (task.value.parts) {
				selectedParts.value = task.value.parts.map((p) => ({
					partId: p.part?.partId || p.partId,
					partName: p.part?.partName || '',
					quantity: p.quantity || 1,
					price: p.part?.partPrice || 0
				}))
			}

			if (task.value.garageServices) {
				selectedServices.value = task.value.garageServices.map((s) => ({
					garageServiceId: s.garageService?.garageServiceId || s.garageServiceId,
					garageServiceName: s.garageService?.garageServiceName || '',
					price: s.garageService?.garageServicePrice || 0
					// Không cần quantity, mặc định là 1
				}))
			}
		} catch (error) {
			toast.error('Lỗi khi tải chi tiết công việc', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			loading.value = false
		}
	}

	const searchParts = async () => {
		if (!partSearchQuery.value || partSearchQuery.value.trim().length < 2) {
			partSearchResults.value = []
			return
		}

		try {
			partSearchLoading.value = true
			const response = await partService.search(partSearchQuery.value.trim(), 20)
			// API trả về { success: true, data: [], message: "..." }
			partSearchResults.value = response?.data || response || []
		} catch (error) {
			console.error('Error searching parts:', error)
			partSearchResults.value = []
		} finally {
			partSearchLoading.value = false
		}
	}

	const searchGarageServices = async () => {
		if (!garageServiceSearchQuery.value || garageServiceSearchQuery.value.trim().length < 2) {
			garageServiceSearchResults.value = []
			return
		}

		try {
			garageServiceSearchLoading.value = true
			const response = await garageServiceService.search(garageServiceSearchQuery.value.trim(), 20)
			garageServiceSearchResults.value = response.data || response || []
		} catch (error) {
			console.error('Error searching garage services:', error)
			garageServiceSearchResults.value = []
		} finally {
			garageServiceSearchLoading.value = false
		}
	}

	const addPart = (part) => {
		if (!part || !part.partId) return

		const exists = selectedParts.value.find((p) => p.partId === part.partId)
		if (exists) {
			toast.error('Phụ tùng này đã được thêm')
			return
		}

		selectedParts.value.push({
			partId: part.partId,
			partName: part.partName,
			quantity: 1,
			price: part.inventoryPrice || 0
		})

		partSearchQuery.value = ''
		partSearchResults.value = []
	}

	const removePart = (index) => {
		selectedParts.value.splice(index, 1)
	}

	const addService = (service) => {
		if (!service || !service.garageServiceId) return

		const exists = selectedServices.value.find((s) => s.garageServiceId === service.garageServiceId)
		if (exists) {
			toast.error('Dịch vụ này đã được thêm')
			return
		}

		selectedServices.value.push({
			garageServiceId: service.garageServiceId,
			garageServiceName: service.garageServiceName,
			price: service.garageServicePrice || 0
			// Không cần quantity, mặc định là 1
		})

		garageServiceSearchQuery.value = ''
		garageServiceSearchResults.value = []
	}

	const removeService = (index) => {
		selectedServices.value.splice(index, 1)
	}

	const handleStartInProgress = async () => {
		if (!confirm('Bạn có chắc muốn bắt đầu xử lý công việc này?')) return

		// API trả về serviceTicketId trực tiếp trong task object
		const serviceTicketId = task.value?.serviceTicketId || task.value?.serviceTicket?.serviceTicketId
		if (!serviceTicketId) {
			toast.error('Không tìm thấy service ticket ID')
			return
		}

		try {
			loading.value = true

			// Lấy userId từ auth store hoặc authService
			const currentUser = authStore.user || authService.getCurrentUser()
			const modifiedBy = currentUser?.userId

			if (!modifiedBy || modifiedBy === 0) {
				toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.')
				return
			}

			await serviceTicketService.setStatusInProgress(serviceTicketId, {
				modifiedBy,
				note: 'Mechanic bắt đầu xử lý công việc'
			})

			toast.success('Đã bắt đầu xử lý công việc!')
			await loadTask()
		} catch (error) {
			toast.error('Lỗi khi bắt đầu xử lý', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			loading.value = false
		}
	}

	const handleCompleteTask = async () => {
		if (!confirm('Bạn có chắc công việc đã hoàn thành?')) return

		// API trả về serviceTicketId trực tiếp trong task object
		const serviceTicketId = task.value?.serviceTicketId || task.value?.serviceTicket?.serviceTicketId
		if (!serviceTicketId) {
			toast.error('Không tìm thấy service ticket ID')
			return
		}

		try {
			loading.value = true

			// Lấy userId từ auth store hoặc authService
			const currentUser = authStore.user || authService.getCurrentUser()
			const modifiedBy = currentUser?.userId

			if (!modifiedBy || modifiedBy === 0) {
				toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.')
				return
			}

			// Hoàn thành technical task - API tự động cập nhật serviceTicketStatus thành Completed (3)
			await technicalTaskService.complete(task.value.technicalTaskId)

			toast.success('Đã hoàn thành công việc!')
			await loadTask()
		} catch (error) {
			toast.error('Lỗi khi hoàn thành công việc', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			loading.value = false
		}
	}

	const handleAdjust = async () => {
		if (selectedParts.value.length === 0 && selectedServices.value.length === 0 && !adjustForm.value.initialIssue?.trim()) {
			toast.error('Vui lòng chỉnh sửa ít nhất một thông tin (mô tả vấn đề, phụ tùng hoặc dịch vụ)')
			return
		}

		// Validate parts quantity
		for (const part of selectedParts.value) {
			if (!part.quantity || part.quantity < 1) {
				toast.error(`Vui lòng nhập số lượng hợp lệ cho phụ tùng: ${part.partName}`)
				return
			}
		}

		// Services không cần validate quantity, mặc định là 1

		// API trả về serviceTicketId trực tiếp trong task object
		const serviceTicketId = task.value?.serviceTicketId || task.value?.serviceTicket?.serviceTicketId
		if (!serviceTicketId) {
			toast.error('Không tìm thấy service ticket ID')
			return
		}

		try {
			adjustLoading.value = true

			// Lấy userId từ auth store hoặc authService
			const currentUser = authStore.user || authService.getCurrentUser()
			const modifiedBy = currentUser?.userId

			if (!modifiedBy || modifiedBy === 0) {
				toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.')
				return
			}

			// Điều chỉnh parts và services qua technicalTaskService.adjust
			const adjustData = {
				parts: selectedParts.value.map((p) => ({
					partId: p.partId,
					quantity: p.quantity
				})),
				garageServices: selectedServices.value.map((s) => ({
					garageServiceId: s.garageServiceId,
					quantity: 1 // Mặc định quantity = 1 cho garage services
				}))
			}

			// API adjust tự động cập nhật serviceTicketStatus thành AdjustedByTechnical (1)
			await technicalTaskService.adjust(task.value.technicalTaskId, adjustData)

			// Cập nhật service ticket với initialIssue và garageServiceIds (nếu có thay đổi)
			const updatePayload = {
				modifiedBy,
				serviceTicketCode: task.value.serviceTicketCode || '', // Giữ ServiceTicketCode
				parts: selectedParts.value.map((p) => ({
					partId: p.partId,
					quantity: p.quantity
				})),
				garageServiceIds: selectedServices.value.map((s) => s.garageServiceId) // Gửi garageServiceIds, không cần quantity
			}

			// Thêm initialIssue nếu có
			if (adjustForm.value.initialIssue?.trim()) {
				updatePayload.initialIssue = adjustForm.value.initialIssue.trim()
			}

			// Cập nhật service ticket (giữ nguyên ServiceTicketCode và các thông tin khác)
			await serviceTicketService.update(serviceTicketId, updatePayload)

			toast.success('Đã điều chỉnh phụ tùng/dịch vụ! Chờ staff xác nhận.')
			showAdjustDialog.value = false
			await loadTask()
		} catch (error) {
			toast.error('Lỗi khi điều chỉnh', error.message || error.userMsg || 'Có lỗi xảy ra')
		} finally {
			adjustLoading.value = false
		}
	}

	const handleLogout = async () => {
		await authService.logout()
		router.push('/')
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

		await loadTask()
	})
</script>

<style scoped>
	.mechanic-task-detail-view {
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
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
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

	.propose-section {
		margin-bottom: 1.5rem;
	}

	.propose-section h6 {
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--dark, #2c3a47);
	}

	.propose-item {
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.badge-primary {
		background: rgba(255, 122, 0, 0.1);
		color: var(--primary, #ff7a00);
	}

	.badge-success {
		background: rgba(16, 172, 132, 0.1);
		color: var(--success, #10ac84);
	}

	.badge-warning {
		background: rgba(255, 193, 7, 0.1);
		color: var(--warning, #ffc107);
	}

	.badge-danger {
		background: rgba(220, 53, 69, 0.1);
		color: var(--danger, #dc3545);
	}

	.badge-info {
		background: rgba(13, 202, 240, 0.1);
		color: var(--info, #0dcaf0);
	}

	.badge-secondary {
		background: rgba(108, 117, 125, 0.1);
		color: #6c757d;
	}

	.adjust-content {
		max-height: 70vh;
		overflow-y: auto;
	}

	.adjust-section {
		margin-bottom: 1.5rem;
	}

	.adjust-section h6 {
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--dark, #2c3a47);
	}

	.search-wrapper {
		position: relative;
		margin-bottom: 1rem;
	}

	.search-results {
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
		margin-top: 0.25rem;
	}

	.search-result-item {
		padding: 0.75rem 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		border-bottom: 1px solid #f0f0f0;
	}

	.search-result-item:hover {
		background: #f8f9fa;
	}

	.search-result-item:last-child {
		border-bottom: none;
	}

	.result-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.result-info strong {
		color: var(--dark, #2c3a47);
		font-size: 0.9rem;
	}

	.result-meta {
		font-size: 0.8rem;
		color: #666;
	}

	.selected-items {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.selected-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
	}

	.item-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.item-info strong {
		color: var(--dark, #2c3a47);
		font-size: 0.9rem;
	}

	.item-meta {
		font-size: 0.85rem;
		color: var(--primary, #ff7a00);
		font-weight: 600;
	}

	.item-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mt-4 {
		margin-top: 1.5rem;
	}

	.me-2 {
		margin-right: 0.5rem;
	}

	.form-textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		font-size: 0.9rem;
		font-family: inherit;
		resize: vertical;
		transition: border-color 0.2s;
	}

	.form-textarea:focus {
		outline: none;
		border-color: var(--primary, #ff7a00);
		box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
	}

	.form-textarea::placeholder {
		color: #999;
	}
</style>
