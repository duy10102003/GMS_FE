<template>
  <div class="service-ticket-detail-view">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />
    
    <div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        :title="`Chi tiết phiếu dịch vụ #${serviceTicket?.serviceTicketCode || ''}`"
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
              v-if="canEdit"
              variant="primary"
              icon="fa-edit"
              @click="showEditDialog = true"
            >
              Chỉnh sửa
            </GmsButton>
            <GmsButton
              v-if="canAssign"
              variant="success"
              icon="fa-user-plus"
              @click="showAssignDialog = true"
            >
              Phân công thợ
            </GmsButton>
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
              <i class="fas fa-info-circle me-2"></i>Thông tin cơ bản
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
                <span class="value">{{ serviceTicket.customer?.customerName }}</span>
              </div>
              <div class="info-item">
                <label>Số điện thoại:</label>
                <span class="value">{{ serviceTicket.customer?.customerPhone }}</span>
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
              <i class="fas fa-car me-2"></i>Thông tin xe
            </h5>
            <div class="info-grid">
              <div class="info-item">
                <label>Tên xe:</label>
                <span class="value">{{ serviceTicket.vehicle?.vehicleName }}</span>
              </div>
              <div class="info-item">
                <label>Biển số:</label>
                <span class="value">{{ serviceTicket.vehicle?.vehicleLicensePlate }}</span>
              </div>
              <div class="info-item">
                <label>Hãng:</label>
                <span class="value">{{ serviceTicket.vehicle?.make }}</span>
              </div>
              <div class="info-item">
                <label>Model:</label>
                <span class="value">{{ serviceTicket.vehicle?.model }}</span>
              </div>
              <div class="info-item">
                <label>Số km hiện tại:</label>
                <span class="value">{{ serviceTicket.vehicle?.currentKm?.toLocaleString() }} km</span>
              </div>
            </div>
          </div>

          <!-- Parts -->
          <div class="info-card">
            <div class="card-header-with-action">
              <h5 class="card-title">
                <i class="fas fa-cogs me-2"></i>Phụ tùng
              </h5>
              <GmsButton
                v-if="canEdit"
                variant="primary"
                size="small"
                icon="fa-plus"
                @click="showAddPartDialog = true"
              >
                Thêm phụ tùng
              </GmsButton>
            </div>
            <GmsTable
              v-if="serviceTicket.parts && serviceTicket.parts.length > 0"
              :data="serviceTicket.parts"
              :columns="partsColumns"
              :pagination="false"
            >
              <template #cell-actions="{ row }">
                <GmsButton
                  v-if="canEdit"
                  variant="danger"
                  size="small"
                  icon="fa-trash"
                  @click="handleDeletePart(row.serviceTicketDetailId)"
                >
                  Xóa
                </GmsButton>
              </template>
            </GmsTable>
            <div v-else class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Chưa có phụ tùng nào</p>
            </div>
          </div>

          <!-- Garage Services -->
          <div class="info-card">
            <div class="card-header-with-action">
              <h5 class="card-title">
                <i class="fas fa-wrench me-2"></i>Dịch vụ
              </h5>
              <GmsButton
                v-if="canEdit"
                variant="primary"
                size="small"
                icon="fa-plus"
                @click="showAddServiceDialog = true"
              >
                Thêm dịch vụ
              </GmsButton>
            </div>
            <GmsTable
              v-if="serviceTicket.garageServices && serviceTicket.garageServices.length > 0"
              :data="serviceTicket.garageServices"
              :columns="servicesColumns"
              :pagination="false"
            >
              <template #cell-actions="{ row }">
                <GmsButton
                  v-if="canEdit"
                  variant="danger"
                  size="small"
                  icon="fa-trash"
                  @click="handleDeleteService(row.serviceTicketDetailId)"
                >
                  Xóa
                </GmsButton>
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
              <i class="fas fa-tasks me-2"></i>Tasks kỹ thuật
            </h5>
            <div v-if="serviceTicket.technicalTasks && serviceTicket.technicalTasks.length > 0">
              <div
                v-for="task in serviceTicket.technicalTasks"
                :key="task.technicalTaskId"
                class="task-item"
              >
                <div class="task-header">
                  <div>
                    <strong>Task #{{ task.technicalTaskId }}</strong>
                    <span :class="`badge badge-${getTaskStatusColor(task.taskStatus)}`">
                      {{ getTaskStatusLabel(task.taskStatus) }}
                    </span>
                  </div>
                  <div class="task-info">
                    <span>Thợ: {{ task.assignedTo?.fullName || 'N/A' }}</span>
                    <span>Ngày assign: {{ formatDate(task.assignedAt) }}</span>
                  </div>
                </div>
                <p class="task-description">{{ task.description }}</p>
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

    <!-- Assign Dialog -->
    <GmsDialog v-model="showAssignDialog" title="Phân công thợ" size="medium">
      <form @submit.prevent="handleAssign">
        <div class="mb-3">
          <label class="form-label">Mô tả công việc *</label>
          <textarea
            v-model="assignForm.description"
            class="form-control"
            rows="3"
            placeholder="Nhập mô tả công việc cho thợ..."
            required
          ></textarea>
        </div>
        <div class="mt-3">
          <label>Chọn thợ:</label>
          <select v-model="assignForm.assignedToTechnical" class="form-select" required>
            <option value="">-- Chọn thợ --</option>
            <option
              v-for="mechanic in mechanics"
              :key="mechanic.id"
              :value="mechanic.id"
            >
              {{ mechanic.name }}
            </option>
          </select>
        </div>
        <template #footer>
          <GmsButton variant="outline" @click="showAssignDialog = false">Hủy</GmsButton>
          <GmsButton type="submit" variant="primary" :loading="assignLoading">
            Phân công
          </GmsButton>
        </template>
      </form>
    </GmsDialog>

    <!-- Add Part Dialog -->
    <GmsDialog v-model="showAddPartDialog" title="Thêm phụ tùng" size="medium">
      <form @submit.prevent="handleAddPart">
        <div class="mb-3">
          <label>Chọn phụ tùng:</label>
          <select v-model="partForm.partId" class="form-select" required>
            <option value="">-- Chọn phụ tùng --</option>
            <option
              v-for="part in availableParts"
              :key="part.partId"
              :value="part.partId"
            >
              {{ part.partName }} - Tồn kho: {{ part.partStock }} {{ part.partUnit }}
            </option>
          </select>
        </div>
        <GmsInput
          v-model.number="partForm.quantity"
          label="Số lượng"
          type="number"
          :min="1"
          :required="true"
        />
        <template #footer>
          <GmsButton variant="outline" @click="showAddPartDialog = false">Hủy</GmsButton>
          <GmsButton type="submit" variant="primary" :loading="addPartLoading">
            Thêm
          </GmsButton>
        </template>
      </form>
    </GmsDialog>

    <!-- Add Service Dialog -->
    <GmsDialog v-model="showAddServiceDialog" title="Thêm dịch vụ" size="medium">
      <form @submit.prevent="handleAddService">
        <div class="mb-3">
          <label>Chọn dịch vụ:</label>
          <select v-model="serviceForm.garageServiceId" class="form-select" required>
            <option value="">-- Chọn dịch vụ --</option>
            <option
              v-for="service in availableServices"
              :key="service.garageServiceId"
              :value="service.garageServiceId"
            >
              {{ service.garageServiceName }} - {{ formatPrice(service.garageServicePrice) }}
            </option>
          </select>
        </div>
        <GmsInput
          v-model.number="serviceForm.quantity"
          label="Số lượng"
          type="number"
          :min="1"
          :required="true"
        />
        <template #footer>
          <GmsButton variant="outline" @click="showAddServiceDialog = false">Hủy</GmsButton>
          <GmsButton type="submit" variant="primary" :loading="addServiceLoading">
            Thêm
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
const serviceTicket = ref(null)
const mechanics = ref([])
const availableParts = ref([])
const availableServices = ref([])
const menuItems = ref([])

const showAssignDialog = ref(false)
const showAddPartDialog = ref(false)
const showAddServiceDialog = ref(false)
const assignLoading = ref(false)
const addPartLoading = ref(false)
const addServiceLoading = ref(false)

const assignForm = ref({
  assignedToTechnical: '',
  description: ''
})

const partForm = ref({
  partId: '',
  quantity: 1
})

const serviceForm = ref({
  garageServiceId: '',
  quantity: 1
})

const partsColumns = ref([
  { key: 'part.partName', label: 'Tên phụ tùng' },
  { key: 'part.partCode', label: 'Mã' },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'part.partUnit', label: 'Đơn vị' },
  { key: 'part.inventoryPrice', label: 'Giá', formatter: (val) => formatPrice(val) },
  { key: 'actions', label: 'Hành động' }
])

const servicesColumns = ref([
  { key: 'garageService.garageServiceName', label: 'Tên dịch vụ' },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'garageService.garageServicePrice', label: 'Giá', formatter: (val) => formatPrice(val) },
  { key: 'actions', label: 'Hành động' }
])

const canEdit = computed(() => {
  if (!serviceTicket.value) return false
  return serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.COMPLETED &&
         serviceTicket.value.serviceTicketStatus !== SERVICE_TICKET_STATUS.CANCELLED
})

const canAssign = computed(() => {
  if (!serviceTicket.value) return false
  return serviceTicket.value.serviceTicketStatus === SERVICE_TICKET_STATUS.PENDING
})

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

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('vi-VN')
}

const formatPrice = (price) => {
  if (!price) return '0'
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
}

const loadServiceTicket = async () => {
  try {
    loading.value = true
    const response = await serviceTicketService.getById(route.params.id)
    serviceTicket.value = response.data
  } catch (error) {
    toast.error('Lỗi khi tải chi tiết phiếu', error.message)
  } finally {
    loading.value = false
  }
}

const loadMechanics = async () => {
  try {
    const response = await api.get('/mechanics')
    mechanics.value = response.data || response
  } catch (error) {
    console.error('Error loading mechanics:', error)
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

const handleAssign = async () => {
  try {
    assignLoading.value = true
    await serviceTicketService.assign(route.params.id, assignForm.value)
    toast.success('Phân công thành công!')
    showAssignDialog.value = false
    await loadServiceTicket()
  } catch (error) {
    toast.error('Lỗi khi phân công', error.message)
  } finally {
    assignLoading.value = false
  }
}

const handleAddPart = async () => {
  try {
    addPartLoading.value = true
    await serviceTicketService.addPart(route.params.id, partForm.value)
    toast.success('Thêm phụ tùng thành công!')
    showAddPartDialog.value = false
    partForm.value = { partId: '', quantity: 1 }
    await loadServiceTicket()
  } catch (error) {
    toast.error('Lỗi khi thêm phụ tùng', error.message)
  } finally {
    addPartLoading.value = false
  }
}

const handleAddService = async () => {
  try {
    addServiceLoading.value = true
    await serviceTicketService.addGarageService(route.params.id, serviceForm.value)
    toast.success('Thêm dịch vụ thành công!')
    showAddServiceDialog.value = false
    serviceForm.value = { garageServiceId: '', quantity: 1 }
    await loadServiceTicket()
  } catch (error) {
    toast.error('Lỗi khi thêm dịch vụ', error.message)
  } finally {
    addServiceLoading.value = false
  }
}

const handleDeletePart = async (detailId) => {
  if (!confirm('Bạn có chắc muốn xóa phụ tùng này?')) return
  
  try {
    await serviceTicketService.deleteDetail(route.params.id, detailId)
    toast.success('Xóa phụ tùng thành công!')
    await loadServiceTicket()
  } catch (error) {
    toast.error('Lỗi khi xóa phụ tùng', error.message)
  }
}

const handleDeleteService = async (detailId) => {
  if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return
  
  try {
    await serviceTicketService.deleteDetail(route.params.id, detailId)
    toast.success('Xóa dịch vụ thành công!')
    await loadServiceTicket()
  } catch (error) {
    toast.error('Lỗi khi xóa dịch vụ', error.message)
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

  await Promise.all([
    loadServiceTicket(),
    loadMechanics(),
    loadParts(),
    loadServices()
  ])
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

.card-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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
}

.task-info {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
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
</style>
