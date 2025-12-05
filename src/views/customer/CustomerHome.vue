<template>
  <div class="dashboard-customer">
    <TheSideBar @logout="handleLogout" />
    <div class="dashboard-customer-body">
      <TheHeader @logout="handleLogout" />

      <main class="main-content">
        <div class="header-row">
          <div>
            <h1 class="page-title">Danh sách đặt dịch vụ</h1>
            <p class="sub-text">Theo dõi các yêu cầu đặt lịch đã gửi</p>
          </div>
          <GmsButton variant="primary" icon="fa-plus" @click="$router.push('/booking/Guest')">
            Đặt lịch mới
          </GmsButton>
        </div>

        <div class="content-card">

          <div v-if="loading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải...</span>
          </div>

          <div v-else-if="bookings.length > 0" class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách hàng</th>
                  <th>Điện thoại</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in bookings" :key="booking.bookingId || booking.id">
                  <td>{{ booking.bookingCode || booking.bookingId || booking.id || '—' }}</td>
                  <td>{{ booking.customerName || 'N/A' }}</td>
                  <td>{{ booking.phone || 'N/A' }}</td>
                  <td>{{ formatDate(booking.bookingTime || booking.createdDate) }}</td>
                  <td>
                    <span class="badge badge-info">
                      {{ booking.status || booking.bookingStatus || 'Chờ xử lý' }}
                    </span>
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
const userEmail = ref(
  (authService.getCurrentUser()?.email || authService.getCurrentUser()?.username || '').toLowerCase()
)

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

const loadBookings = async () => {
  try {
    loading.value = true
    const email = userEmail.value

    // Ưu tiên gọi API chuyên biệt theo email nếu có
    let items = []
    try {
      const resDirect = await bookingService.getByEmailDirect(email)
      items = resDirect?.data || resDirect?.items || resDirect || []
    } catch (err) {
      // Fallback sang paging + filter server-side
      const params = {
        page: 1,
        pageSize: 20,
        columnSorts: [{ columnName: 'CreatedDate', sortDirection: 'DESC' }],
        filters: email
          ? [
              { columnName: 'CustomerEmail', value: email },
              { columnName: 'Email', value: email }
            ]
          : []
      }
      const res = await bookingService.getPaging(params)
      items = res?.data?.items || res?.items || []
    }

    if (!email) {
      bookings.value = items
      return
    }

    bookings.value = items.filter((booking) => {
      const bookingEmail = (booking.email || booking.customerEmail || booking.customerMail || '').toLowerCase()
      return bookingEmail === email
    })
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
  padding: 2rem;
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
}

.table-wrapper {
  overflow-x: auto;
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
