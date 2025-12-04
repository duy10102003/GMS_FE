<template>
  <div class="dashboard-staff">
    <TheSideBar @logout="handleLogout" />
    <div class="dashboard-staff-body">
      <TheHeader @logout="handleLogout" />
      <main class="main-content" style="padding: 2rem;">
        <div class="header-row">
          <h1 class="page-title">Dashboard Nhân Viên</h1>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(84, 160, 255, 0.1); color: var(--info)">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <h6>Tổng phiếu dịch vụ</h6>
            <div class="value">{{ stats.totalTickets }}</div>
            <div class="change">
              <i class="fas fa-list"></i> Tất cả phiếu
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(247, 183, 49, 0.1); color: var(--warning)">
              <i class="fas fa-clock"></i>
            </div>
            <h6>Chờ xử lý</h6>
            <div class="value">{{ stats.pendingTickets }}</div>
            <div class="change">
              <i class="fas fa-hourglass-half"></i> Cần xử lý
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16, 172, 132, 0.1); color: var(--success)">
              <i class="fas fa-check-double"></i>
            </div>
            <h6>Hoàn thành hôm nay</h6>
            <div class="value">{{ stats.completedToday }}</div>
            <div class="change positive">
              <i class="fas fa-calendar-day"></i> Hôm nay
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(255, 122, 0, 0.1); color: var(--primary)">
              <i class="fas fa-wrench"></i>
            </div>
            <h6>Đang xử lý</h6>
            <div class="value">{{ stats.inProgressTickets }}</div>
            <div class="change">
              <i class="fas fa-cog fa-spin"></i> Đang làm việc
            </div>
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

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải...</span>
          </div>

          <div v-else-if="recentTickets.length > 0" class="tickets-table">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Khách hàng</th>
                  <th>Xe</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ticket in recentTickets" :key="ticket.serviceTicketId">
                  <td>
                    <strong>{{ ticket.serviceTicketCode || `#${ticket.serviceTicketId}` }}</strong>
                  </td>
                  <td>
                    <div>
                      <div>{{ ticket.customerName || ticket.customer?.customerName || 'N/A' }}</div>
                      <small class="text-muted">{{ ticket.customerPhone || ticket.customer?.customerPhone || '' }}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{{ ticket.vehicleName || ticket.vehicle?.vehicleName || 'N/A' }}</div>
                      <small class="text-muted">{{ ticket.vehicleLicensePlate || ticket.vehicle?.vehicleLicensePlate || '' }}</small>
                    </div>
                  </td>
                  <td>
                    <span :class="`badge badge-${getStatusColor(ticket.serviceTicketStatus)}`">
                      {{ getStatusLabel(ticket.serviceTicketStatus) }}
                    </span>
                  </td>
                  <td>{{ formatDate(ticket.createdDate) }}</td>
                  <td>
                    <GmsButton
                      variant="primary"
                      size="small"
                      icon="fa-eye"
                      @click="$router.push(`/staff/service-tickets/${ticket.serviceTicketId}`)"
                    >
                      Xem
                    </GmsButton>
                  </td>
                </tr>
              </tbody>
            </table>
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
  totalTickets: 0,
  pendingTickets: 0,
  completedToday: 0,
  inProgressTickets: 0
})

const recentTickets = ref([])

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

    // Load recent tickets
    const recentParams = {
      page: 1,
      pageSize: 10,
      columnSorts: [{ columnName: 'CreatedDate', sortDirection: 'DESC' }]
    }
    const recentResponse = await serviceTicketService.getPaging(recentParams)
    recentTickets.value = recentResponse.data?.items || []

    // Load all tickets for stats
    const allParams = {
      page: 1,
      pageSize: 1000
    }
    const allResponse = await serviceTicketService.getPaging(allParams)
    const allTickets = allResponse.data?.items || []

    // Calculate stats
    stats.value.totalTickets = allTickets.length
    stats.value.pendingTickets = allTickets.filter(t => 
      t.serviceTicketStatus === SERVICE_TICKET_STATUS.PENDING_TECHNICAL_CONFIRMATION ||
      t.serviceTicketStatus === 0
    ).length
    stats.value.inProgressTickets = allTickets.filter(t => 
      t.serviceTicketStatus === SERVICE_TICKET_STATUS.IN_PROGRESS ||
      t.serviceTicketStatus === 2
    ).length

    // Calculate completed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const completedToday = allTickets.filter(t => {
      if (t.serviceTicketStatus !== SERVICE_TICKET_STATUS.COMPLETED && t.serviceTicketStatus !== 3) return false
      const completedDate = t.modifiedDate || t.createdDate
      if (!completedDate) return false
      const ticketDate = new Date(completedDate)
      ticketDate.setHours(0, 0, 0, 0)
      return ticketDate.getTime() === today.getTime()
    })
    stats.value.completedToday = completedToday.length

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
.dashboard-staff {
  display: flex;
}

.dashboard-staff-body {
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

.text-muted {
  color: #999;
  font-size: 0.75rem;
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
  .dashboard-staff-body {
    margin-left: 0;
  }
}
</style>
