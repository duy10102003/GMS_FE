<template>
  <div class="dashboard-stocker">
    <TheSideBar @logout="handleLogout" />
    <div class="dashboard-stocker-body">
      <TheHeader @logout="handleLogout" />
      <main class="main-content" style="padding: 2rem;">
        <div class="header-row">
          <h1 class="page-title">Dashboard Thủ Kho</h1>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(84, 160, 255, 0.1); color: var(--info)">
              <i class="fas fa-warehouse"></i>
            </div>
            <h6>Tổng phụ tùng</h6>
            <div class="value">{{ stats.totalParts }}</div>
            <div class="change">
              <i class="fas fa-boxes"></i> Trong kho
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(247, 183, 49, 0.1); color: var(--warning)">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h6>Sắp hết hàng</h6>
            <div class="value">{{ stats.lowStock }}</div>
            <div class="change warning">
              <i class="fas fa-bell"></i> Cần nhập kho
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16, 172, 132, 0.1); color: var(--success)">
              <i class="fas fa-check-circle"></i>
            </div>
            <h6>Đã nhập hôm nay</h6>
            <div class="value">{{ stats.restockedToday }}</div>
            <div class="change positive">
              <i class="fas fa-calendar-day"></i> Hôm nay
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(255, 122, 0, 0.1); color: var(--primary)">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <h6>Yêu cầu nhập kho</h6>
            <div class="value">{{ stats.pendingRequests }}</div>
            <div class="change">
              <i class="fas fa-clock"></i> Chờ xử lý
            </div>
          </div>
        </div>

        <!-- Low Stock Alert -->
        <div class="content-card" v-if="lowStockItems.length > 0">
          <div class="content-card-header">
            <h5>Cảnh báo sắp hết hàng</h5>
            <GmsButton variant="warning" icon="fa-exclamation-triangle">
              Xem tất cả
            </GmsButton>
          </div>

          <div class="low-stock-list">
            <div
              v-for="item in lowStockItems"
              :key="item.partId"
              class="low-stock-item"
            >
              <div class="item-info">
                <div>
                  <strong>{{ item.partName }}</strong>
                  <div class="item-meta">
                    <span>Mã: {{ item.partCode }}</span>
                    <span>Danh mục: {{ item.categoryName }}</span>
                  </div>
                </div>
                <div class="stock-info">
                  <div class="stock-level">
                    <span class="stock-label">Tồn kho:</span>
                    <span class="stock-value warning">{{ item.currentStock }}</span>
                    <span class="stock-unit">{{ item.unit }}</span>
                  </div>
                  <div class="stock-min">
                    Tối thiểu: {{ item.minStock }} {{ item.unit }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="content-card">
          <div class="content-card-header">
            <h5>Hoạt động gần đây</h5>
          </div>

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải...</span>
          </div>

          <div v-else-if="recentActivities.length > 0" class="activities-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon" :class="`activity-${activity.type}`">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-meta">
                  <span>{{ activity.description }}</span>
                  <span class="activity-time">{{ formatDate(activity.time) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-history"></i>
            <p>Chưa có hoạt động nào</p>
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

const router = useRouter()
const toast = useToast()

const loading = ref(false)

const stats = ref({
  totalParts: 0,
  lowStock: 0,
  restockedToday: 0,
  pendingRequests: 0
})

const lowStockItems = ref([
  {
    partId: 1,
    partName: 'Dầu nhớt 5W-30',
    partCode: 'OIL001',
    categoryName: 'Dầu nhớt',
    currentStock: 5,
    minStock: 20,
    unit: 'Lít'
  },
  {
    partId: 2,
    partName: 'Lọc gió',
    partCode: 'FILTER001',
    categoryName: 'Lọc',
    currentStock: 8,
    minStock: 30,
    unit: 'Cái'
  }
])

const recentActivities = ref([
  {
    id: 1,
    type: 'restock',
    icon: 'fas fa-box',
    title: 'Nhập kho phụ tùng',
    description: 'Đã nhập 50 lít dầu nhớt 5W-30',
    time: new Date()
  },
  {
    id: 2,
    type: 'update',
    icon: 'fas fa-edit',
    title: 'Cập nhật số lượng',
    description: 'Cập nhật số lượng lọc gió: 30 cái',
    time: new Date(Date.now() - 3600000)
  },
  {
    id: 3,
    type: 'alert',
    icon: 'fas fa-exclamation-triangle',
    title: 'Cảnh báo sắp hết hàng',
    description: 'Dầu nhớt 5W-30 sắp hết (còn 5 lít)',
    time: new Date(Date.now() - 7200000)
  }
])

const formatDate = (date) => {
  if (!date) return 'N/A'
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

const loadDashboardData = async () => {
  try {
    loading.value = true

    // Calculate stats from low stock items
    stats.value.lowStock = lowStockItems.value.length

    // TODO: Load actual data from API
    // const response = await api.get('/stocker/dashboard')
    // stats.value = response.data.stats
    // lowStockItems.value = response.data.lowStockItems
    // recentActivities.value = response.data.activities

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
.dashboard-stocker {
  display: flex;
}

.dashboard-stocker-body {
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

.stat-card .change.warning {
  color: var(--warning, #f7b731);
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

.low-stock-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.low-stock-item {
  padding: 1.25rem;
  background: #fff8e1;
  border-radius: 8px;
  border-left: 4px solid var(--warning, #f7b731);
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.item-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.stock-info {
  text-align: right;
}

.stock-level {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.stock-label {
  font-size: 0.875rem;
  color: #666;
}

.stock-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stock-value.warning {
  color: var(--warning, #f7b731);
}

.stock-unit {
  font-size: 0.875rem;
  color: #666;
}

.stock-min {
  font-size: 0.75rem;
  color: #999;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-restock {
  background: rgba(16, 172, 132, 0.1);
  color: var(--success, #10ac84);
}

.activity-update {
  background: rgba(84, 160, 255, 0.1);
  color: var(--info, #54a0ff);
}

.activity-alert {
  background: rgba(247, 183, 49, 0.1);
  color: var(--warning, #f7b731);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: var(--dark, #2c3a47);
  margin-bottom: 0.25rem;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #666;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.activity-time {
  color: #999;
  white-space: nowrap;
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

@media (max-width: 992px) {
  .dashboard-stocker-body {
    margin-left: 0;
  }
}
</style>
