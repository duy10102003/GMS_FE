<template>
  <div class="dashboard-customer">
    <TheSideBar @logout="handleLogout" />
    <div class="dashboard-customer-body">
      <TheHeader
        title="Danh sách đặt lịch"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />

      <main class="main-content">


        <div class="stats-row">
          <div class="stat-card stat-total">
            <p class="stat-title">Tổng số lịch đặt</p>
            <strong>{{ stats.total }}</strong>
          </div>
          <div class="stat-card stat-pending">
            <p class="stat-title">Chờ xử lý</p>
            <strong>{{ stats.pending }}</strong>
          </div>
          <div class="stat-card stat-completed">
            <p class="stat-title">Đã hoàn thành</p>
            <strong>{{ stats.completed }}</strong>
          </div>
          <div class="stat-card stat-inprogress">
            <p class="stat-title">Đang thực hiện</p>
            <strong>{{ stats.inProgress }}</strong>
          </div>
        </div>

        <div class="content-card">
          <div class="table-head-row">
            <h3>Lịch gần nhất</h3>
            <div>
              <GmsButton variant="primary" size="small" icon="" @click="$router.push('/customer/booking/all')" style="padding-right: 8px">
                Xem tất cả
              </GmsButton>
              <GmsButton variant="primary" size="small" icon="fa-plus" @click="$router.push('/booking/Guest')">
                Đặt lịch mới
              </GmsButton>
            </div>
          </div>

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải...</span>
          </div>

          <div v-else-if="bookings.length > 0" class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên khách</th>
                  <th>Xe</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in bookings" :key="booking.bookingId || booking.id">
                  <td>{{ booking.bookingCode || booking.bookingId || booking.id || '—' }}</td>
                  <td>{{ booking.customerName || 'N/A' }}</td>
                  <td>{{ booking.vehicleName || 'N/A' }}</td>
                  <td>{{ booking.customerPhone || 'N/A' }}</td>
                  <td>
                    <span
                      class="status-pill"
                      :class="statusClass(booking.status ?? booking.bookingStatus)"
                    >
                      {{ statusLabel(booking.status || booking.bookingStatus) }}
                    </span>
                  </td>
                <td>{{ formatDate(booking.bookingTime || booking.createdDate) }}</td>
                                    <td class="action-cell">
                    <GmsButton variant="info" size="small" @click="viewDetail(booking)">
                      Xem chi tiết
                    </GmsButton>
                    <GmsButton variant="primary" size="small" @click="editBooking(booking)">
                      Sửa
                    </GmsButton>
                    <GmsButton variant="danger" size="small" @click="deleteBooking(booking)">
                      Xóa
                    </GmsButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-ticket-alt"></i>
            <p>Bạn chưa có đặt dịch vụ nào</p>
            <GmsButton variant="primary" icon="fa-plus" @click="$router.push('/booking/Guest')">
              Đặt lịch ngay
            </GmsButton>
          </div>

          <div class="table-footer" v-if="bookings.length > 0">
            <a href="#" @click.prevent="$router.push('/customer/booking/all')">Xem tất cả →</a>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsButton } from '@/components'
import { useToast } from '@/composables/useToast'
import authService from '@/services/auth'
import bookingService from '@/services/booking'

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const bookings = ref([])
const stats = ref({
  total: 0,
  pending: 0,
  completed: 0,
  inProgress: 0
})
const userEmail = ref(
  (authService.getCurrentUser()?.email || authService.getCurrentUser()?.username || '').toLowerCase()
)

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const statusClass = (status) => {
  if (status === 0 || status === 'PENDING') return 'pending'
  if (status === 1 || status === 'IN_PROGRESS') return 'in-progress'
  if (status === 2 || status === 'COMPLETED') return 'completed'
  return 'unknown'
}

const statusLabel = (status) => {
  if (status === 0 || status === 'PENDING') return 'Chờ xử lý'
  if (status === 1 || status === 'IN_PROGRESS') return 'Đang thực hiện'
  if (status === 2 || status === 'COMPLETED') return 'Đã hoàn thành'
  return status || 'Chưa rõ'
}

const viewDetail = (booking) => {
  const id = booking.bookingId || booking.id
  if (!id) return
  router.push(`/customer/booking/${id}`)
}

const editBooking = (booking) => {
  const id = booking.bookingId || booking.id
  if (!id) return
  router.push(`/customer/booking/${id}/edit`)
}

const deleteBooking = async (booking) => {
  const id = booking.bookingId || booking.id
  if (!id) return
  const confirmed = window.confirm('Bạn chắc chắn muốn xóa lịch đặt này?')
  if (!confirmed) return
  try {
    await bookingService.delete(id)
    toast.success('Xóa lịch đặt thành công')
    await loadBookings()
  } catch (error) {
    toast.error('Không xóa được', error.message || 'Đã xảy ra lỗi')
  }
}

const loadBookings = async () => {
  try {
    const email = userEmail.value
    if (!email) {
      toast.error('Không xác định được email người dùng. Vui lòng đăng nhập lại.')
      return
    }
    const params = {
      page: 1,
      pageSize: 50,
      columnSorts: [{ columnName: 'CreatedDate', sortDirection: 'DESC' }],
      filters: email
        ? [
            { columnName: 'CustomerEmail', value: email },
            { columnName: 'Email', value: email }
          ]
        : []
    }
    loading.value = true



    
    const resDirect = await bookingService.getPaging(params)
    const items = resDirect?.data?.items || []

    
    const sorted = items
      .slice()
      .sort((a, b) => new Date(b.bookingTime || b.createdDate || 0) - new Date(a.bookingTime || a.createdDate || 0))

    
    stats.value.total = sorted.length
    stats.value.pending = sorted.filter((b) => (b.status ?? b.bookingStatus) === 0 || (b.status ?? b.bookingStatus) === 'PENDING').length
    stats.value.completed = sorted.filter((b) => (b.status ?? b.bookingStatus) === 2 || (b.status ?? b.bookingStatus) === 'COMPLETED').length
    stats.value.inProgress = sorted.filter((b) => (b.status ?? b.bookingStatus) === 1 || (b.status ?? b.bookingStatus) === 'IN_PROGRESS').length

    bookings.value = sorted.slice(0, 5)
  } catch (error) {
    console.error('Error loading bookings', error)
    toast.error('Không tải được danh sách đặt lịch', error.message || error.userMsg || 'Đã có lỗi xảy ra')
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

onMounted(loadBookings)
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

.main-content {
  padding: 0.5rem;
  padding-top: 4.5rem; /* chừa khoảng cho header cố định */
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dark, #2c3a47);
  margin: 0;
}

.sub-text {
  margin: 0.25rem 0 0 0;
  color: #666;
  font-size: 0.95rem;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-height: calc(100vh - 220px); /* vừa khít chiều cao màn hình dưới header */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  padding: 14px 16px;
  border: 1px solid #eaeaea;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.stat-total {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: #fcd34d;
}

.stat-pending {
  background: linear-gradient(135deg, #e0f2fe, #bfdbfe);
  border-color: #93c5fd;
}

.stat-completed {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border-color: #86efac;
}

.stat-inprogress {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  border-color: #f9a8d4;
}

.stat-card .stat-title,
.stat-card strong {
  color: #1f2937;
}

.stat-title {
  margin: 0;
  color: #555;
  font-weight: 600;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 22px;
  color: #111;
}

.table-head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  /* height: calc(100vh - 12px); */
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

.table th {
  font-weight: 600;
  color: #555;
  background: #fafafa;
}

.action-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-cell a {
  color: var(--primary, #ff7a00);
  text-decoration: none;
  font-weight: 600;
}

.status-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.status-pill.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-pill.in-progress {
  background: #e0f2fe;
  color: #1d4ed8;
}

.status-pill.completed {
  background: #dcfce7;
  color: #166534;
}

.status-pill.unknown {
  background: #e5e7eb;
  color: #374151;
}

.table-footer {
  padding: 12px 0 0;
  text-align: right;
}

.table-footer a {
  color: var(--primary, #ff7a00);
  text-decoration: none;
  font-weight: 600;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #777;
}

.loading-state i,
.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
  color: var(--primary, #ff7a00);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(84, 160, 255, 0.12);
  color: var(--info, #54a0ff);
}

@media (max-width: 992px) {
  .dashboard-customer-body {
    margin-left: 0;
  }
}
</style>
