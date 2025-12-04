<template>
  <div class="dashboard-mechanic">
    <TheSideBar @logout="handleLogout" />
    <div class="dashboard-mechanic-body">
      <TheHeader @logout="handleLogout" />

      <main class="main-content" style="padding: 2rem;">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(247, 183, 49, 0.1); color: var(--warning)">
              <i class="fas fa-wrench"></i>
            </div>
            <h6>Đang thực hiện</h6>
            <div class="value">{{ stats.inProgress }}</div>
            <div class="change">
              <i class="fas fa-clock"></i> Đang làm việc
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16, 172, 132, 0.1); color: var(--success)">
              <i class="fas fa-check-double"></i>
            </div>
            <h6>Hoàn thành tháng này</h6>
            <div class="value">{{ stats.completedThisMonth }}</div>
            <div class="change positive" v-if="stats.completedChange > 0">
              <i class="fas fa-arrow-up"></i> +{{ stats.completedChange }} so tháng trước
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(84, 160, 255, 0.1); color: var(--info)">
              <i class="fas fa-tasks"></i>
            </div>
            <h6>Chờ xác nhận</h6>
            <div class="value">{{ stats.pendingConfirmation }}</div>
            <div class="change">
              <i class="fas fa-hourglass-half"></i> Chờ staff xác nhận
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(255, 122, 0, 0.1); color: var(--primary)">
              <i class="fas fa-stopwatch"></i>
            </div>
            <h6>Tổng công việc</h6>
            <div class="value">{{ stats.totalTasks }}</div>
            <div class="change">
              <i class="fas fa-list"></i> Tất cả công việc
            </div>
          </div>
        </div>

        <!-- Current Tasks -->
        <div class="content-card">
          <div class="content-card-header">
            <h5>Công việc đang thực hiện</h5>
            <GmsButton variant="primary" icon="fa-eye" @click="$router.push('/mechanic/tasks')">
              Xem tất cả
            </GmsButton>
          </div>

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải...</span>
          </div>

          <div v-else-if="currentTasks.length > 0" class="tasks-list">
            <div
              v-for="task in currentTasks"
              :key="task.technicalTaskId"
              class="task-card"
              @click="$router.push(`/mechanic/tasks/${task.technicalTaskId}`)"
            >
              <div class="task-header">
                <div>
                  <h6>Task #{{ task.technicalTaskId }}</h6>
                  <span class="task-code">{{ task.serviceTicketCode || `#${task.serviceTicketId}` }}</span>
                </div>
                <span :class="`badge badge-${getStatusColor(task.serviceTicketStatus)}`">
                  {{ getStatusLabel(task.serviceTicketStatus) }}
                </span>
              </div>
              <p class="task-description">{{ task.description || 'Không có mô tả' }}</p>
              <div class="task-footer">
                <div class="task-info">
                  <span><i class="fas fa-user"></i> {{ task.customerName || 'N/A' }}</span>
                  <span><i class="fas fa-car"></i> {{ task.vehicleName || 'N/A' }}</span>
                </div>
                <span class="task-date">{{ formatDate(task.assignedAt) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Không có công việc nào đang thực hiện</p>
          </div>
        </div>

        <!-- Recent Completed -->
        <div class="content-card">
          <div class="content-card-header">
            <h5>Công việc đã hoàn thành gần đây</h5>
          </div>

          <div v-if="recentCompleted.length > 0" class="tasks-list">
            <div
              v-for="task in recentCompleted"
              :key="task.technicalTaskId"
              class="task-card completed"
              @click="$router.push(`/mechanic/tasks/${task.technicalTaskId}`)"
            >
              <div class="task-header">
                <div>
                  <h6>Task #{{ task.technicalTaskId }}</h6>
                  <span class="task-code">{{ task.serviceTicketCode || `#${task.serviceTicketId}` }}</span>
                </div>
                <span class="badge badge-success">Hoàn thành</span>
              </div>
              <p class="task-description">{{ task.description || 'Không có mô tả' }}</p>
              <div class="task-footer">
                <div class="task-info">
                  <span><i class="fas fa-user"></i> {{ task.customerName || 'N/A' }}</span>
                  <span><i class="fas fa-car"></i> {{ task.vehicleName || 'N/A' }}</span>
                </div>
                <span class="task-date">{{ formatDate(task.assignedAt) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Chưa có công việc nào hoàn thành</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsButton } from '@/components'
import { useToast } from '@/composables/useToast'
import authService from '@/services/auth'
import technicalTaskService from '@/services/technicalTask'
import { SERVICE_TICKET_STATUS, SERVICE_TICKET_STATUS_LABELS, SERVICE_TICKET_STATUS_COLORS } from '@/constant/serviceTicketStatus'

const router = useRouter()
const toast = useToast()

const loading = ref(false)

const stats = ref({
  inProgress: 0,
  completedThisMonth: 0,
  completedChange: 0,
  pendingConfirmation: 0,
  totalTasks: 0
})

const currentTasks = ref([])
const recentCompleted = ref([])

const getStatusLabel = (status) => {
  return SERVICE_TICKET_STATUS_LABELS[status] || 'N/A'
}

const getStatusColor = (status) => {
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

const loadDashboardData = async () => {
  try {
    loading.value = true
    const currentUser = authService.getCurrentUser()
    
    if (!currentUser?.userId) {
      toast.error('Không tìm thấy thông tin người dùng')
      return
    }

    // Load tasks đang thực hiện (InProgress)
    const inProgressParams = {
      page: 1,
      pageSize: 5,
      assignedToTechnical: currentUser.userId,
      serviceTicketStatus: SERVICE_TICKET_STATUS.IN_PROGRESS,
      columnSorts: [{ columnName: 'AssignedAt', sortDirection: 'DESC' }]
    }
    const inProgressResponse = await technicalTaskService.getPaging(inProgressParams)
    currentTasks.value = inProgressResponse.data?.items || []

    // Load tasks đã hoàn thành gần đây
    const completedParams = {
      page: 1,
      pageSize: 5,
      assignedToTechnical: currentUser.userId,
      taskStatus: 2, // Completed
      columnSorts: [{ columnName: 'AssignedAt', sortDirection: 'DESC' }]
    }
    const completedResponse = await technicalTaskService.getPaging(completedParams)
    recentCompleted.value = completedResponse.data?.items || []

    // Tính toán thống kê
    const allTasksParams = {
      page: 1,
      pageSize: 1000,
      assignedToTechnical: currentUser.userId
    }
    const allTasksResponse = await technicalTaskService.getPaging(allTasksParams)
    const allTasks = allTasksResponse.data?.items || []

    // Tính toán stats
    stats.value.inProgress = allTasks.filter(t => 
      t.serviceTicketStatus === SERVICE_TICKET_STATUS.IN_PROGRESS || 
      t.serviceTicketStatus === 2
    ).length

    stats.value.pendingConfirmation = allTasks.filter(t => 
      t.serviceTicketStatus === SERVICE_TICKET_STATUS.PENDING_TECHNICAL_CONFIRMATION || 
      t.serviceTicketStatus === 0
    ).length

    // Tính completed tháng này
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const completedThisMonth = allTasks.filter(t => {
      if (t.taskStatus !== 2) return false
      const completedDate = t.confirmedAt || t.assignedAt
      if (!completedDate) return false
      return new Date(completedDate) >= startOfMonth
    })
    stats.value.completedThisMonth = completedThisMonth.length

    stats.value.totalTasks = allTasks.length

  } catch (error) {
    console.error('Error loading dashboard data:', error)
    toast.error('Lỗi khi tải dữ liệu dashboard', error.message || error.userMsg || 'Có lỗi xảy ra')
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

onMounted(async () => {
  await loadDashboardData()
})
</script>

<style scoped>
.dashboard-mechanic {
  display: flex;
}

.dashboard-mechanic-body {
  flex: 1;
  margin-left: var(--sidebar-width, 260px);
  min-height: 100vh;
  background: #f8f9fc;
  display: flex;
  flex-direction: column;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-card h6 {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.stat-card .value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark, #2c3a47);
}

.stat-card .change {
  font-size: 0.75rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-card .change.positive {
  color: var(--success, #10ac84);
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.content-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.content-card-header h5 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
  margin: 0;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.task-card:hover {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 4px 12px rgba(255, 122, 0, 0.1);
  transform: translateY(-2px);
}

.task-card.completed {
  opacity: 0.8;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.task-header h6 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
  margin: 0 0 0.25rem 0;
}

.task-code {
  font-size: 0.875rem;
  color: #666;
}

.task-description {
  color: var(--dark, #2c3a47);
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.task-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.task-info span {
  font-size: 0.875rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-info i {
  color: var(--primary, #ff7a00);
}

.task-date {
  font-size: 0.875rem;
  color: #999;
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

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
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
  background: rgba(247, 183, 49, 0.1);
  color: var(--warning, #f7b731);
}

.badge-info {
  background: rgba(84, 160, 255, 0.1);
  color: var(--info, #54a0ff);
}

.badge-secondary {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

@media (max-width: 992px) {
  .dashboard-mechanic-body {
    margin-left: 0;
  }
}
</style>
