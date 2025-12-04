<template>
  <div class="dashboard-manager">
    <TheSideBar @logout="handleLogout" />
    <div class="dashboard-manager-body">
      <TheHeader @logout="handleLogout" />

      <main class="main-content" style="padding: 2rem;">
        <div class="header-row">
          <h1 class="page-title">Dashboard Quản Lý</h1>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(255, 122, 0, 0.1); color: var(--primary)">
              <i class="fas fa-chart-line"></i>
            </div>
            <h6>Doanh thu tháng này</h6>
            <div class="value">{{ formatCurrency(stats.revenueThisMonth) }}</div>
            <div class="change positive" v-if="stats.revenueChange > 0">
              <i class="fas fa-arrow-up"></i>
              +{{ stats.revenueChange }}%
            </div>
            <div class="change negative" v-else-if="stats.revenueChange < 0">
              <i class="fas fa-arrow-down"></i>
              {{ stats.revenueChange }}%
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16, 172, 132, 0.1); color: var(--success)">
              <i class="fas fa-wrench"></i>
            </div>
            <h6>Dịch vụ hoàn thành</h6>
            <div class="value">{{ stats.completedServices }}</div>
            <div class="change positive" v-if="stats.servicesChange > 0">
              <i class="fas fa-arrow-up"></i>
              +{{ stats.servicesChange }}%
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(84, 160, 255, 0.1); color: var(--info)">
              <i class="fas fa-car-side"></i>
            </div>
            <h6>Xe bán được</h6>
            <div class="value">{{ stats.carsSold }}</div>
            <div class="change positive" v-if="stats.carsChange > 0">
              <i class="fas fa-arrow-up"></i>
              +{{ stats.carsChange }}%
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(247, 183, 49, 0.1); color: var(--warning)">
              <i class="fas fa-users"></i>
            </div>
            <h6>Khách hàng mới</h6>
            <div class="value">{{ stats.newCustomers }}</div>
            <div class="change positive" v-if="stats.customersChange > 0">
              <i class="fas fa-arrow-up"></i>
              +{{ stats.customersChange }}%
            </div>
          </div>
        </div>

        <!-- Staff Performance -->
        <div class="content-card">
          <div class="content-card-header">
            <h5>Hiệu suất nhân sự</h5>
            <GmsButton variant="primary" icon="fa-chart-pie">
              Xem chi tiết
            </GmsButton>
          </div>

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải...</span>
          </div>

          <div v-else-if="staffPerformance.length > 0" class="performance-table">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Tên nhân viên</th>
                  <th>Vai trò</th>
                  <th>Hiệu suất</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="staff in staffPerformance" :key="staff.userId">
                  <td>
                    <div class="staff-info">
                      <div class="staff-avatar">
                        {{ getInitials(staff.fullName) }}
                      </div>
                      <div>
                        <div class="staff-name">{{ staff.fullName }}</div>
                        <small class="text-muted">{{ staff.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-badge">{{ getRoleLabel(staff.role) }}</span>
                  </td>
                  <td>
                    <div class="performance-bar">
                      <div class="performance-fill" :style="{ width: `${staff.performance}%` }"></div>
                      <span class="performance-text">{{ staff.performance }}%</span>
                    </div>
                  </td>
                  <td>
                    <span :class="`badge badge-${getPerformanceBadge(staff.performance)}`">
                      {{ getPerformanceLabel(staff.performance) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-users"></i>
            <p>Chưa có dữ liệu nhân sự</p>
          </div>
        </div>

        <!-- Recent Service Tickets -->
        <div class="content-card">
          <div class="content-card-header">
            <h5>Phiếu dịch vụ gần đây</h5>
            <GmsButton variant="primary" icon="fa-eye" @click="$router.push('/staff/service-tickets')">
              Xem tất cả
            </GmsButton>
          </div>

          <div v-if="recentTickets.length > 0" class="tickets-list">
            <div
              v-for="ticket in recentTickets"
              :key="ticket.serviceTicketId"
              class="ticket-item"
            >
              <div class="ticket-info">
                <div>
                  <strong>{{ ticket.serviceTicketCode || `#${ticket.serviceTicketId}` }}</strong>
                  <div class="ticket-meta">
                    <span><i class="fas fa-user"></i> {{ ticket.customerName || 'N/A' }}</span>
                    <span><i class="fas fa-car"></i> {{ ticket.vehicleName || 'N/A' }}</span>
                  </div>
                </div>
                <span :class="`badge badge-${getStatusColor(ticket.serviceTicketStatus)}`">
                  {{ getStatusLabel(ticket.serviceTicketStatus) }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Không có phiếu dịch vụ nào</p>
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
import serviceTicketService from '@/services/serviceTicket'
import { SERVICE_TICKET_STATUS, SERVICE_TICKET_STATUS_LABELS, SERVICE_TICKET_STATUS_COLORS } from '@/constant/serviceTicketStatus'

const router = useRouter()
const toast = useToast()

const loading = ref(false)

const stats = ref({
  revenueThisMonth: 182000000,
  revenueChange: 15,
  completedServices: 234,
  servicesChange: 8,
  carsSold: 28,
  carsChange: 12,
  newCustomers: 156,
  customersChange: 24
})

const staffPerformance = ref([
  { userId: 1, fullName: 'Trần Thế B', email: 'tranb@example.com', role: 'STAFF', performance: 92 },
  { userId: 2, fullName: 'Hoàng Văn E', email: 'hoange@example.com', role: 'MECHANIC', performance: 95 },
  { userId: 3, fullName: 'Đỗ Thị F', email: 'dof@example.com', role: 'STAFF', performance: 89 }
])

const recentTickets = ref([])

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount)
}

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getRoleLabel = (role) => {
  const labels = {
    STAFF: 'Lễ tân',
    MECHANIC: 'Thợ sửa chữa',
    MANAGER: 'Quản lý',
    STOCKER: 'Thủ kho'
  }
  return labels[role] || role
}

const getPerformanceBadge = (performance) => {
  if (performance >= 95) return 'success'
  if (performance >= 90) return 'primary'
  if (performance >= 85) return 'warning'
  return 'secondary'
}

const getPerformanceLabel = (performance) => {
  if (performance >= 95) return 'Xuất sắc'
  if (performance >= 90) return 'Tốt'
  if (performance >= 85) return 'Khá'
  return 'Đang đánh giá'
}

const getStatusLabel = (status) => {
  return SERVICE_TICKET_STATUS_LABELS[status] || 'N/A'
}

const getStatusColor = (status) => {
  return SERVICE_TICKET_STATUS_COLORS[status] || 'secondary'
}

const loadDashboardData = async () => {
  try {
    loading.value = true

    // Load recent tickets
    const recentParams = {
      page: 1,
      pageSize: 5,
      columnSorts: [{ columnName: 'CreatedDate', sortDirection: 'DESC' }]
    }
    const recentResponse = await serviceTicketService.getPaging(recentParams)
    recentTickets.value = recentResponse.data?.items || []

    // TODO: Load actual stats from API
    // const statsResponse = await api.get('/manager/stats')
    // stats.value = statsResponse.data

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
.dashboard-manager {
  display: flex;
}

.dashboard-manager-body {
  flex: 1;
  margin-left: var(--sidebar-width, 260px);
  min-height: 100vh;
  background: #f8f9fc;
  display: flex;
  flex-direction: column;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dark, #2c3a47);
  margin: 0;
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-card .change.positive {
  color: var(--success, #10ac84);
}

.stat-card .change.negative {
  color: var(--danger, #ee5a6f);
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

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table thead {
  background: #f8f9fa;
}

.custom-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--dark, #2c3a47);
  border-bottom: 2px solid #e9ecef;
  font-size: 0.875rem;
}

.custom-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  color: var(--dark, #2c3a47);
}

.custom-table tbody tr:hover {
  background: #f8f9fa;
}

.staff-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.staff-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary, #ff7a00);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.staff-name {
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: #f0f0f0;
  color: #666;
  font-size: 0.75rem;
  font-weight: 500;
}

.performance-bar {
  position: relative;
  width: 100%;
  height: 24px;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}

.performance-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--success, #10ac84), var(--primary, #ff7a00));
  transition: width 0.3s;
}

.performance-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
  z-index: 1;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ticket-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid var(--primary, #ff7a00);
}

.ticket-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.ticket-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.ticket-meta i {
  color: var(--primary, #ff7a00);
}

.text-muted {
  color: #999;
  font-size: 0.75rem;
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
  .dashboard-manager-body {
    margin-left: 0;
  }
}
</style>
