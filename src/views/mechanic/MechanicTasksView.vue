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
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-left">
            <GmsInput
              v-model="searchQuery"
              placeholder="Tìm theo mã phiếu, khách hàng..."
              prefix-icon="fa-search"
              :clearable="true"
              class="search-input"
              @input="handleSearch"
            />
          </div>
        </div>

        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Trạng thái task:</label>
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
              <option :value="SERVICE_TICKET_STATUS.PENDING_TECHNICAL_CONFIRMATION">Chờ xác nhận kỹ thuật</option>
              <option :value="SERVICE_TICKET_STATUS.ADJUSTED_BY_TECHNICAL">Đã điều chỉnh</option>
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
                {{ task.serviceTicketCode || 'N/A' }}
              </div>
              <div class="task-badges">
                <span :class="`badge badge-${getTaskStatusColor(task.taskStatus)}`">
                  {{ getTaskStatusLabel(task.taskStatus) }}
                </span>
                <span :class="`badge badge-${getServiceTicketStatusColor(task.serviceTicketStatus)}`">
                  {{ getServiceTicketStatusLabel(task.serviceTicketStatus) }}
                </span>
              </div>
            </div>

            <div class="task-info">
              <div class="info-row">
                <i class="fas fa-car"></i>
                <span>{{ task.vehicleName || 'N/A' }}</span>
                <span v-if="task.vehicleLicensePlate" class="license-plate">
                  {{ task.vehicleLicensePlate }}
                </span>
              </div>
              <div class="info-row">
                <i class="fas fa-user"></i>
                <span>{{ task.customerName || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <i class="fas fa-phone"></i>
                <span>{{ task.customerPhone || 'N/A' }}</span>
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
        <div v-if="totalItems > 0" class="pagination mt-4">
          <div class="pagination-left">
            <div class="pagination-info">
              Hiển thị {{ startIndex + 1 }}-{{ endIndex }} trong tổng {{ totalItems }} công việc
            </div>
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
            <GmsButton
              variant="outline"
              size="small"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <i class="fas fa-chevron-left"></i>
            </GmsButton>

            <div class="pagination-pages">
              <button
                v-for="page in visiblePages"
                :key="page"
                class="pagination-page"
                :class="{ active: page === currentPage }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>

            <GmsButton
              variant="outline"
              size="small"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <i class="fas fa-chevron-right"></i>
            </GmsButton>
          </div>
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
import { GmsInput, GmsButton, GmsToast } from '@/components'
import { useToast } from '@/composables/useToast'
import { getMenuByRole } from '@/utils/menu'
import authService from '@/services/auth'
import technicalTaskService from '@/services/technicalTask'
import {
  SERVICE_TICKET_STATUS,
  SERVICE_TICKET_STATUS_LABELS,
  SERVICE_TICKET_STATUS_COLORS,
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
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

const filters = ref({
  taskStatus: null,
  serviceTicketStatus: null
})

// Computed
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

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
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleSearch = () => {
  currentPage.value = 1
  loadTasks()
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
      assignedToTechnical: currentUser.userId,
      taskStatus: filters.value.taskStatus,
      serviceTicketStatus: filters.value.serviceTicketStatus
    }

    // Add search filter if exists
    if (searchQuery.value && searchQuery.value.trim()) {
      params.columnFilters = [{
        columnName: 'ServiceTicketCode',
        operator: 'contains',
        value: searchQuery.value.trim()
      }]
    }

    const response = await technicalTaskService.getPaging(params)
    tasks.value = response.data.items || []
    totalItems.value = response.data.total || 0
  } catch (error) {
    toast.error('Lỗi khi tải danh sách công việc', error.message || error.userMsg || 'Có lỗi xảy ra')
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    taskStatus: null,
    serviceTicketStatus: null
  }
  searchQuery.value = ''
  currentPage.value = 1
  loadTasks()
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadTasks()
  }
}

const handlePageSizeChange = () => {
  currentPage.value = 1
  loadTasks()
}

const viewTaskDetail = (task) => {
  router.push(`/mechanic/tasks/${task.technicalTaskId}`)
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
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  gap: 1rem;
}

.task-code {
  font-weight: 600;
  color: var(--primary, #ff7a00);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-badges {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
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
  flex-wrap: wrap;
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

.mt-4 {
  margin-top: 1.5rem;
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
</style>
