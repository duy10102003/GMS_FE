<template>
  <div class="mechanic-task-detail-view">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />
    
    <div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        :title="`Chi tiết công việc #${task?.technicalTaskId || ''}`"
        :show-search="false"
        @logout="handleLogout"
      />
      
      <main class="main-content" style="margin-top: 70px; padding: 2rem;">
        <div class="detail-header">
          <GmsButton variant="outline" icon="fa-arrow-left" @click="$router.back()">
            Quay lại
          </GmsButton>
          <div class="header-actions">
            <GmsButton
              v-if="task?.taskStatus === TASK_STATUS.PENDING"
              variant="primary"
              icon="fa-play"
              @click="handleStartTask"
            >
              Bắt đầu công việc
            </GmsButton>
            <GmsButton
              v-else-if="task?.taskStatus === TASK_STATUS.IN_PROGRESS"
              variant="success"
              icon="fa-check"
              @click="handleConfirmTask"
            >
              Xác nhận hoàn thành
            </GmsButton>
            <GmsButton
              v-if="canPropose"
              variant="info"
              icon="fa-lightbulb"
              @click="showProposeDialog = true"
            >
              Đề xuất phụ tùng/dịch vụ
            </GmsButton>
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
              <i class="fas fa-info-circle me-2"></i>Thông tin công việc
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
              <i class="fas fa-ticket-alt me-2"></i>Thông tin phiếu dịch vụ
            </h5>
            <div class="info-grid">
              <div class="info-item">
                <label>Mã phiếu:</label>
                <span class="value">{{ task.serviceTicket?.serviceTicketCode }}</span>
              </div>
              <div class="info-item">
                <label>Trạng thái phiếu:</label>
                <span :class="`badge badge-${getServiceTicketStatusColor(task.serviceTicket?.serviceTicketStatus)}`">
                  {{ getServiceTicketStatusLabel(task.serviceTicket?.serviceTicketStatus) }}
                </span>
              </div>
              <div class="info-item">
                <label>Vấn đề ban đầu:</label>
                <span class="value">{{ task.serviceTicket?.initialIssue }}</span>
              </div>
            </div>
          </div>

          <!-- Thông tin khách hàng -->
          <div class="info-card">
            <h5 class="card-title">
              <i class="fas fa-user me-2"></i>Thông tin khách hàng
            </h5>
            <div class="info-grid">
              <div class="info-item">
                <label>Tên:</label>
                <span class="value">{{ task.serviceTicket?.customer?.customerName }}</span>
              </div>
              <div class="info-item">
                <label>Số điện thoại:</label>
                <span class="value">{{ task.serviceTicket?.customer?.customerPhone }}</span>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <span class="value">{{ task.serviceTicket?.customer?.customerEmail || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Thông tin xe -->
          <div class="info-card">
            <h5 class="card-title">
              <i class="fas fa-car me-2"></i>Thông tin xe
            </h5>
            <div class="info-grid">
              <div class="info-item">
                <label>Tên xe:</label>
                <span class="value">{{ task.serviceTicket?.vehicle?.vehicleName }}</span>
              </div>
              <div class="info-item">
                <label>Biển số:</label>
                <span class="value">{{ task.serviceTicket?.vehicle?.vehicleLicensePlate }}</span>
              </div>
              <div class="info-item">
                <label>Hãng/Model:</label>
                <span class="value">{{ task.serviceTicket?.vehicle?.make }} {{ task.serviceTicket?.vehicle?.model }}</span>
              </div>
              <div class="info-item">
                <label>Số km:</label>
                <span class="value">{{ task.serviceTicket?.vehicle?.currentKm?.toLocaleString() }} km</span>
              </div>
            </div>
          </div>

          <!-- Parts -->
          <div class="info-card">
            <h5 class="card-title">
              <i class="fas fa-cogs me-2"></i>Phụ tùng
            </h5>
            <GmsTable
              v-if="task.parts && task.parts.length > 0"
              :data="task.parts"
              :columns="partsColumns"
              :pagination="false"
            />
            <div v-else class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Chưa có phụ tùng nào</p>
            </div>
          </div>

          <!-- Garage Services -->
          <div class="info-card">
            <h5 class="card-title">
              <i class="fas fa-wrench me-2"></i>Dịch vụ
            </h5>
            <GmsTable
              v-if="task.garageServices && task.garageServices.length > 0"
              :data="task.garageServices"
              :columns="servicesColumns"
              :pagination="false"
            />
            <div v-else class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Chưa có dịch vụ nào</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Propose Dialog -->
    <GmsDialog v-model="showProposeDialog" title="Đề xuất phụ tùng/dịch vụ" size="large">
      <form @submit.prevent="handlePropose">
        <div class="propose-section">
          <h6>Phụ tùng cần dùng:</h6>
          <div
            v-for="(part, index) in proposeForm.parts"
            :key="index"
            class="propose-item"
          >
            <div class="row g-3">
              <div class="col-md-6">
                <label>Chọn phụ tùng:</label>
                <select
                  v-model="part.partId"
                  class="form-select"
                  @change="updatePartPrice(index)"
                >
                  <option value="">-- Chọn phụ tùng --</option>
                  <option
                    v-for="p in availableParts"
                    :key="p.partId"
                    :value="p.partId"
                  >
                    {{ p.partName }} - Tồn kho: {{ p.partStock }} {{ p.partUnit }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <GmsInput
                  v-model.number="part.quantity"
                  label="Số lượng"
                  type="number"
                  :min="1"
                  :required="!!part.partId"
                />
              </div>
              <div class="col-md-2">
                <label>Giá:</label>
                <div class="price-display">
                  {{ formatPrice(part.price || 0) }}
                </div>
              </div>
              <div class="col-md-1">
                <GmsButton
                  variant="danger"
                  size="small"
                  icon="fa-times"
                  @click="removePart(index)"
                />
              </div>
            </div>
          </div>
          <GmsButton
            variant="outline"
            size="small"
            icon="fa-plus"
            @click="addPart"
            class="mt-2"
          >
            Thêm phụ tùng
          </GmsButton>
        </div>

        <div class="propose-section mt-4">
          <h6>Dịch vụ cần thực hiện:</h6>
          <div
            v-for="(service, index) in proposeForm.garageServices"
            :key="index"
            class="propose-item"
          >
            <div class="row g-3">
              <div class="col-md-6">
                <label>Chọn dịch vụ:</label>
                <select
                  v-model="service.garageServiceId"
                  class="form-select"
                  @change="updateServicePrice(index)"
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  <option
                    v-for="s in availableServices"
                    :key="s.garageServiceId"
                    :value="s.garageServiceId"
                  >
                    {{ s.garageServiceName }} - {{ formatPrice(s.garageServicePrice) }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <GmsInput
                  v-model.number="service.quantity"
                  label="Số lượng"
                  type="number"
                  :min="1"
                  :required="!!service.garageServiceId"
                />
              </div>
              <div class="col-md-2">
                <label>Giá:</label>
                <div class="price-display">
                  {{ formatPrice(service.price || 0) }}
                </div>
              </div>
              <div class="col-md-1">
                <GmsButton
                  variant="danger"
                  size="small"
                  icon="fa-times"
                  @click="removeService(index)"
                />
              </div>
            </div>
          </div>
          <GmsButton
            variant="outline"
            size="small"
            icon="fa-plus"
            @click="addService"
            class="mt-2"
          >
            Thêm dịch vụ
          </GmsButton>
        </div>

        <template #footer>
          <GmsButton variant="outline" @click="showProposeDialog = false">Hủy</GmsButton>
          <GmsButton type="submit" variant="primary" :loading="proposeLoading">
            Gửi đề xuất
          </GmsButton>
        </template>
      </form>
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
import api from '@/services/api'
import {
  SERVICE_TICKET_STATUS,
  SERVICE_TICKET_STATUS_LABELS,
  SERVICE_TICKET_STATUS_COLORS,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS
} from '@/constant/serviceTicketStatus'

const route = useRoute()
const router = useRouter()
const toastRef = ref(null)
const toast = useToast()

const sidebarCollapsed = ref(false)
const loading = ref(false)
const task = ref(null)
const availableParts = ref([])
const availableServices = ref([])
const menuItems = ref([])
const showProposeDialog = ref(false)
const proposeLoading = ref(false)

const proposeForm = ref({
  parts: [{ partId: '', quantity: 1, price: 0 }],
  garageServices: [{ garageServiceId: '', quantity: 1, price: 0 }]
})

const partsColumns = ref([
  { key: 'part.partName', label: 'Tên phụ tùng' },
  { key: 'part.partCode', label: 'Mã' },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'part.partUnit', label: 'Đơn vị' },
  { key: 'part.inventoryPrice', label: 'Giá', formatter: (val) => formatPrice(val) }
])

const servicesColumns = ref([
  { key: 'garageService.garageServiceName', label: 'Tên dịch vụ' },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'garageService.garageServicePrice', label: 'Giá', formatter: (val) => formatPrice(val) }
])

const canPropose = computed(() => {
  if (!task.value) return false
  return task.value.taskStatus === TASK_STATUS.PENDING || task.value.taskStatus === TASK_STATUS.IN_PROGRESS
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
    const currentUser = authService.getCurrentUser()
    const response = await serviceTicketService.getMechanicTaskDetail(
      currentUser.userId,
      route.params.id
    )
    task.value = response.data
  } catch (error) {
    toast.error('Lỗi khi tải chi tiết công việc', error.message)
  } finally {
    loading.value = false
  }
}

const loadParts = async () => {
  try {
    const response = await api.get('/parts')
    availableParts.value = response.data || response
  } catch (error) {
    console.error('Error loading parts:', error)
  }
}

const loadServices = async () => {
  try {
    const response = await api.get('/garage-services')
    availableServices.value = response.data || response
  } catch (error) {
    console.error('Error loading services:', error)
  }
}

const handleStartTask = async () => {
  if (!confirm('Bạn có chắc muốn bắt đầu công việc này?')) return

  try {
    loading.value = true
    const currentUser = authService.getCurrentUser()
    await serviceTicketService.startTask(task.value.technicalTaskId, currentUser.userId)
    toast.success('Đã bắt đầu công việc!')
    await loadTask()
  } catch (error) {
    toast.error('Lỗi khi bắt đầu công việc', error.message)
  } finally {
    loading.value = false
  }
}

const handleConfirmTask = async () => {
  if (!confirm('Bạn có chắc công việc đã hoàn thành?')) return

  try {
    loading.value = true
    const currentUser = authService.getCurrentUser()
    await serviceTicketService.confirmTask(task.value.technicalTaskId, currentUser.userId)
    toast.success('Đã xác nhận hoàn thành công việc!')
    await loadTask()
  } catch (error) {
    toast.error('Lỗi khi xác nhận hoàn thành', error.message)
  } finally {
    loading.value = false
  }
}

const addPart = () => {
  proposeForm.value.parts.push({ partId: '', quantity: 1, price: 0 })
}

const removePart = (index) => {
  proposeForm.value.parts.splice(index, 1)
  if (proposeForm.value.parts.length === 0) {
    proposeForm.value.parts.push({ partId: '', quantity: 1, price: 0 })
  }
}

const addService = () => {
  proposeForm.value.garageServices.push({ garageServiceId: '', quantity: 1, price: 0 })
}

const removeService = (index) => {
  proposeForm.value.garageServices.splice(index, 1)
  if (proposeForm.value.garageServices.length === 0) {
    proposeForm.value.garageServices.push({ garageServiceId: '', quantity: 1, price: 0 })
  }
}

const updatePartPrice = (index) => {
  const partId = proposeForm.value.parts[index].partId
  const part = availableParts.value.find(p => p.partId === parseInt(partId))
  if (part) {
    proposeForm.value.parts[index].price = part.inventoryPrice
  }
}

const updateServicePrice = (index) => {
  const serviceId = proposeForm.value.garageServices[index].garageServiceId
  const service = availableServices.value.find(s => s.garageServiceId === parseInt(serviceId))
  if (service) {
    proposeForm.value.garageServices[index].price = service.garageServicePrice
  }
}

const handlePropose = async () => {
  // Validate
  const hasParts = proposeForm.value.parts.some(p => p.partId)
  const hasServices = proposeForm.value.garageServices.some(s => s.garageServiceId)

  if (!hasParts && !hasServices) {
    toast.error('Vui lòng chọn ít nhất một phụ tùng hoặc dịch vụ')
    return
  }

  try {
    proposeLoading.value = true
    const currentUser = authService.getCurrentUser()
    
    const data = {
      parts: proposeForm.value.parts
        .filter(p => p.partId)
        .map(p => ({
          serviceTicketDetailId: null,
          partId: parseInt(p.partId),
          quantity: p.quantity
        })),
      garageServices: proposeForm.value.garageServices
        .filter(s => s.garageServiceId)
        .map(s => ({
          serviceTicketDetailId: null,
          garageServiceId: parseInt(s.garageServiceId),
          quantity: s.quantity
        }))
    }

    await serviceTicketService.proposePartsServices(
      task.value.technicalTaskId,
      currentUser.userId,
      data
    )
    
    toast.success('Đã gửi đề xuất! Chờ staff duyệt.')
    showProposeDialog.value = false
    await loadTask()
  } catch (error) {
    toast.error('Lỗi khi gửi đề xuất', error.message)
  } finally {
    proposeLoading.value = false
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

  await Promise.all([loadTask(), loadParts(), loadServices()])
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

.price-display {
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  font-weight: 600;
  color: var(--primary, #ff7a00);
}
</style>

