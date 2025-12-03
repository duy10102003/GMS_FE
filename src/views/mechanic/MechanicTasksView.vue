<template>
  <div class="mechanic-tasks-view">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />
    
    <div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Danh sách công việc"
        :show-search="false"
        @logout="handleLogout"
      />
      
      <main class="main-content" style="margin-top: 70px; padding: 2rem;">
        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Trạng thái:</label>
            <select v-model="filters.taskStatus" class="filter-select" @change="loadTasks">
              <option value="">Tất cả trạng thái</option>
              <option :value="TASK_STATUS.PENDING">Chờ bắt đầu</option>
              <option :value="TASK_STATUS.IN_PROGRESS">Đang thực hiện</option>
              <option :value="TASK_STATUS.COMPLETED">Hoàn thành</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Trạng thái phiếu:</label>
            <select v-model="filters.serviceTicketStatus" class="filter-select" @change="loadTasks">
              <option value="">Tất cả</option>
              <option :value="SERVICE_TICKET_STATUS.ASSIGNED">Đã phân công</option>
              <option :value="SERVICE_TICKET_STATUS.IN_PROGRESS">Đang xử lý</option>
              <option :value="SERVICE_TICKET_STATUS.COMPLETED">Hoàn thành</option>
            </select>
          </div>
          
          <GmsButton variant="outline" icon="fa-times" @click="clearFilters">
            Xóa bộ lọc
          </GmsButton>
        </div>

        <!-- Tasks List -->
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Đang tải...</span>
        </div>

        <div v-else-if="tasks.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>Không có công việc nào</p>
        </div>

        <div v-else class="tasks-grid">
          <div
            v-for="task in tasks"
            :key="task.technicalTaskId"
            class="task-card"
            @click="viewTaskDetail(task)"
          >
            <div class="task-header">
              <div class="task-code">
                <i class="fas fa-ticket-alt"></i>
                {{ task.serviceTicket?.serviceTicketCode }}
              </div>
              <span :class="`badge badge-${getTaskStatusColor(task.taskStatus)}`">
                {{ getTaskStatusLabel(task.taskStatus) }}
              </span>
            </div>

            <div class="task-info">
              <div class="info-row">
                <i class="fas fa-car"></i>
                <span>{{ task.serviceTicket?.vehicle?.vehicleName }}</span>
                <span class="license-plate">{{ task.serviceTicket?.vehicle?.vehicleLicensePlate }}</span>
              </div>
              <div class="info-row">
                <i class="fas fa-user"></i>
                <span>{{ task.serviceTicket?.customer?.customerName }}</span>
              </div>
              <div class="info-row">
                <i class="fas fa-phone"></i>
                <span>{{ task.serviceTicket?.customer?.customerPhone }}</span>
              </div>
            </div>

            <div class="task-description">
              <strong>Mô tả:</strong>
              <p>{{ task.description || 'Không có mô tả' }}</p>
            </div>

            <div class="task-footer">
              <div class="task-date">
                <i class="fas fa-calendar"></i>
                {{ formatDate(task.assignedAt) }}
              </div>
              <div class="task-actions">
                <GmsButton
                  v-if="task.taskStatus === TASK_STATUS.PENDING"
                  variant="primary"
                  size="small"
                  icon="fa-play"
                  @click.stop="startTask(task)"
                >
                  Bắt đầu
                </GmsButton>
                <GmsButton
                  v-else-if="task.taskStatus === TASK_STATUS.IN_PROGRESS"
                  variant="success"
                  size="small"
                  icon="fa-check"
                  @click.stop="confirmTask(task)"
                >
                  Hoàn thành
                </GmsButton>
                <GmsButton
                  variant="outline"
                  size="small"
                  icon="fa-eye"
                  @click.stop="viewTaskDetail(task)"
                >
                  Chi tiết
                </GmsButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <GmsButton
            variant="outline"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </GmsButton>
          <span class="page-info">
            Trang {{ currentPage }} / {{ totalPages }}
          </span>
          <GmsButton
            variant="outline"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </GmsButton>
        </div>
      </main>
    </div>

    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsButton, GmsToast } from '@/components'
import { useToast } from '@/composables/useToast'
import { getMenuByRole } from '@/utils/menu'
import authService from '@/services/auth'
import serviceTicketService from '@/services/serviceTicket'
import {
  SERVICE_TICKET_STATUS,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS
} from '@/constant/serviceTicketStatus'

const router = useRouter()
const toastRef = ref(null)
const toast = useToast()

const sidebarCollapsed = ref(false)
const loading = ref(false)
const tasks = ref([])
const menuItems = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

const filters = ref({
  taskStatus: '',
  serviceTicketStatus: ''
})

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

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

const loadTasks = async () => {
  try {
    loading.value = true
    const currentUser = authService.getCurrentUser()
    if (!currentUser?.userId) {
      toast.error('Không tìm thấy thông tin người dùng')
      return
    }

    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      columnFilters: []
    }

    if (filters.value.taskStatus !== '') {
      params.columnFilters.push({
        columnName: 'TaskStatus',
        operator: 'equals',
        value: filters.value.taskStatus.toString()
      })
    }

    if (filters.value.serviceTicketStatus !== '') {
      params.columnFilters.push({
        columnName: 'ServiceTicketStatus',
        operator: 'equals',
        value: filters.value.serviceTicketStatus.toString()
      })
    }

    const response = await serviceTicketService.getMechanicTasks(currentUser.userId, params)
    tasks.value = response.data.items || []
    totalItems.value = response.data.total || 0
  } catch (error) {
    toast.error('Lỗi khi tải danh sách công việc', error.message)
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    taskStatus: '',
    serviceTicketStatus: ''
  }
  currentPage.value = 1
  loadTasks()
}

const goToPage = (page) => {
  currentPage.value = page
  loadTasks()
}

const viewTaskDetail = (task) => {
  router.push(`/mechanic/tasks/${task.technicalTaskId}`)
}

const startTask = async (task) => {
  if (!confirm('Bạn có chắc muốn bắt đầu công việc này?')) return

  try {
    loading.value = true
    const currentUser = authService.getCurrentUser()
    await serviceTicketService.startTask(task.technicalTaskId, currentUser.userId)
    toast.success('Đã bắt đầu công việc!')
    await loadTasks()
  } catch (error) {
    toast.error('Lỗi khi bắt đầu công việc', error.message)
  } finally {
    loading.value = false
  }
}

const confirmTask = async (task) => {
  if (!confirm('Bạn có chắc công việc đã hoàn thành?')) return

  try {
    loading.value = true
    const currentUser = authService.getCurrentUser()
    await serviceTicketService.confirmTask(task.technicalTaskId, currentUser.userId)
    toast.success('Đã xác nhận hoàn thành công việc!')
    await loadTasks()
  } catch (error) {
    toast.error('Lỗi khi xác nhận hoàn thành', error.message)
  } finally {
    loading.value = false
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

  await loadTasks()
})
</script>

<style scoped>
.mechanic-tasks-view {
  min-height: 100vh;
  background: var(--light, #f8f9fa);
}

.content-wrapper {
  transition: margin-left 0.3s ease;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 150px;
  outline: none;
  transition: border-color 0.3s;
}

.filter-select:focus {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.loading-state i,
.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
}

.task-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.task-code {
  font-weight: 600;
  color: var(--primary, #ff7a00);
  font-size: 1.1rem;
}

.task-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--dark, #2c3a47);
}

.info-row i {
  color: var(--primary, #ff7a00);
  width: 20px;
}

.license-plate {
  background: rgba(255, 122, 0, 0.1);
  color: var(--primary, #ff7a00);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
}

.task-description {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.task-description strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--dark, #2c3a47);
}

.task-description p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.task-date {
  font-size: 0.85rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-info {
  font-weight: 600;
  color: var(--dark, #2c3a47);
}
</style>

