<template>
  <div class="dashboard-customer">
    <TheSideBar @logout="handleLogout" />
    <div class="dashboard-customer-body">
      <TheHeader @logout="handleLogout" />
      <main class="main-content" style="padding: 2rem;">
        <div class="header-row">
          <h1 class="page-title">Trang Chủ Khách Hàng</h1>
        </div>

        <!-- Welcome Section -->
        <div class="welcome-card">
          <div class="welcome-content">
            <h2>Xin chào, {{ customerName }}!</h2>
            <p>Chúng tôi sẵn sàng phục vụ bạn</p>
          </div>
          <div class="welcome-actions">
            <GmsButton variant="primary" icon="fa-plus" @click="$router.push('/staff/service-tickets/create')">
              Tạo phiếu dịch vụ mới
            </GmsButton>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(84, 160, 255, 0.1); color: var(--info)">
              <i class="fas fa-car"></i>
            </div>
            <h6>Xe của tôi</h6>
            <div class="value">{{ stats.totalVehicles }}</div>
            <div class="change">
              <i class="fas fa-list"></i> Tổng số xe
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(247, 183, 49, 0.1); color: var(--warning)">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <h6>Phiếu dịch vụ</h6>
            <div class="value">{{ stats.totalTickets }}</div>
            <div class="change">
              <i class="fas fa-clipboard-list"></i> Tất cả phiếu
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16, 172, 132, 0.1); color: var(--success)">
              <i class="fas fa-check-circle"></i>
            </div>
            <h6>Đã hoàn thành</h6>
            <div class="value">{{ stats.completedTickets }}</div>
            <div class="change positive">
              <i class="fas fa-check-double"></i> Hoàn thành
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(255, 122, 0, 0.1); color: var(--primary)">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <h6>Hóa đơn</h6>
            <div class="value">{{ stats.totalInvoices }}</div>
            <div class="change">
              <i class="fas fa-receipt"></i> Tất cả hóa đơn
            </div>
          </div>
        </div>

        <!-- My Vehicles -->
        <div class="content-card">
          <div class="content-card-header">
            <h5>Xe của tôi</h5>
            <GmsButton variant="primary" icon="fa-plus">
              Thêm xe mới
            </GmsButton>
          </div>

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải...</span>
          </div>

          <div v-else-if="vehicles.length > 0" class="vehicles-grid">
            <div
              v-for="vehicle in vehicles"
              :key="vehicle.vehicleId"
              class="vehicle-card"
            >
              <div class="vehicle-header">
                <div class="vehicle-icon">
                  <i class="fas fa-car"></i>
                </div>
                <div>
                  <h6>{{ vehicle.vehicleName }}</h6>
                  <p class="vehicle-plate">{{ vehicle.vehicleLicensePlate }}</p>
                </div>
              </div>
              <div class="vehicle-details">
                <div class="detail-item">
                  <span class="detail-label">Hãng:</span>
                  <span class="detail-value">{{ vehicle.make || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Model:</span>
                  <span class="detail-value">{{ vehicle.model || 'N/A' }}</span>
                </div>
                <div class="detail-item" v-if="vehicle.currentKm">
                  <span class="detail-label">Số km:</span>
                  <span class="detail-value">{{ vehicle.currentKm.toLocaleString() }} km</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-car"></i>
            <p>Bạn chưa có xe nào</p>
            <GmsButton variant="primary" icon="fa-plus" @click="$router.push('/customer/vehicles/add')">
              Thêm xe mới
            </GmsButton>
          </div>
        </div>

        <!-- Recent Service Tickets -->
        <div class="content-card">
          <div class="content-card-header">
            <h5>Phiếu dịch vụ gần đây</h5>
            <GmsButton variant="primary" icon="fa-eye">
              Xem tất cả
            </GmsButton>
          </div>

          <div v-if="recentTickets.length > 0" class="tickets-list">
            <div
              v-for="ticket in recentTickets"
              :key="ticket.serviceTicketId"
              class="ticket-item"
              @click="$router.push(`/staff/service-tickets/${ticket.serviceTicketId}`)"
            >
              <div class="ticket-info">
                <div>
                  <strong>{{ ticket.serviceTicketCode || `#${ticket.serviceTicketId}` }}</strong>
                  <div class="ticket-meta">
                    <span><i class="fas fa-car"></i> {{ ticket.vehicleName || 'N/A' }}</span>
                    <span><i class="fas fa-calendar"></i> {{ formatDate(ticket.createdDate) }}</span>
                  </div>
                </div>
                <span :class="`badge badge-${getStatusColor(ticket.serviceTicketStatus)}`">
                  {{ getStatusLabel(ticket.serviceTicketStatus) }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-ticket-alt"></i>
            <p>Bạn chưa có phiếu dịch vụ nào</p>
            <GmsButton variant="primary" icon="fa-plus" @click="$router.push('/staff/service-tickets/create')">
              Tạo phiếu dịch vụ mới
            </GmsButton>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const customerName = computed(() => {
  const user = authService.getCurrentUser()
  return user?.fullName || user?.name || 'Khách hàng'
})

const stats = ref({
  totalVehicles: 0,
  totalTickets: 0,
  completedTickets: 0,
  totalInvoices: 0
})

const vehicles = ref([])
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

    // TODO: Load customer vehicles
    // const vehiclesResponse = await api.get('/customers/vehicles')
    // vehicles.value = vehiclesResponse.data
    // stats.value.totalVehicles = vehicles.value.length

    // Load recent tickets
    const recentParams = {
      page: 1,
      pageSize: 5,
      columnSorts: [{ columnName: 'CreatedDate', sortDirection: 'DESC' }]
    }
    const recentResponse = await serviceTicketService.getPaging(recentParams)
    recentTickets.value = recentResponse.data?.items || []

    // Calculate stats
    stats.value.totalTickets = recentTickets.value.length
    stats.value.completedTickets = recentTickets.value.filter(t => 
      t.serviceTicketStatus === SERVICE_TICKET_STATUS.COMPLETED || t.serviceTicketStatus === 3
    ).length

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
.dashboard-customer {
  display: flex;
}

.dashboard-customer-body {
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

.welcome-card {
  background: linear-gradient(135deg, var(--primary, #ff7a00) 0%, #ff9500 100%);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.welcome-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.welcome-content p {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
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

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.vehicle-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.vehicle-card:hover {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 4px 12px rgba(255, 122, 0, 0.1);
}

.vehicle-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.vehicle-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: var(--primary, #ff7a00);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.vehicle-header h6 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
  margin: 0 0 0.25rem 0;
}

.vehicle-plate {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.vehicle-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-label {
  color: #666;
}

.detail-value {
  color: var(--dark, #2c3a47);
  font-weight: 500;
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
  cursor: pointer;
  transition: all 0.2s;
}

.ticket-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
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
  .dashboard-customer-body {
    margin-left: 0;
  }
}
</style>
