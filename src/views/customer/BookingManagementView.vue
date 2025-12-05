<template>
  <div class="booking-management">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="sidebarMenu"
      :collapsible="true"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="booking-content" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <header class="page-header">
        <div>
          <h1>Danh sách đặt lịch</h1>
          <p>Theo dõi tất cả booking theo email đang đăng nhập</p>
        </div>
        <button class="btn-primary" @click="goCreate">
          <i class="fa-solid fa-plus"></i>
          Đặt lịch mới
        </button>
      </header>

      <section class="filter-bar">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm theo tên, SĐT, xe..."
          />
        </div>
        <div class="filters-right">
          <label class="date-filter">
            Từ
            <input v-model="dateFilter.start" type="date" />
          </label>
          <label class="date-filter">
            Đến
            <input v-model="dateFilter.end" type="date" />
          </label>
          <button class="btn-ghost" @click="clearFilters">
            <i class="fa-solid fa-rotate"></i>
            Xóa lọc
          </button>
        </div>
      </section>

      <section class="table-card">
        <div class="table-head">
          <span>Mã</span>
          <span>Tên người đặt</span>
          <span>Số điện thoại</span>
          <span>Thời gian đặt</span>
          <span>Tên xe</span>
        </div>

        <div v-if="loading" class="empty-state">Đang tải danh sách...</div>
        <div v-else-if="paginatedBookings.length === 0" class="empty-state">
          Không có booking nào
        </div>

        <div
          v-else
          v-for="booking in paginatedBookings"
          :key="booking.bookingId || booking.id"
          class="table-row"
        >
          <div class="cell">
            <div class="cell-text">
              <span class="primary-text">{{ booking.bookingId || booking.id }}</span>
            </div>
          </div>

          <div class="cell">
            <i class="fa-regular fa-user"></i>
            <div class="cell-text">
              <span class="primary-text">{{ booking.customerName || 'N/A' }}</span>
            </div>
          </div>

          <div class="cell">
            <i class="fa-solid fa-phone"></i>
            <div class="cell-text">
              <span class="primary-text">{{ booking.customerPhone || booking.phone || 'N/A' }}</span>
            </div>
          </div>

          <div class="cell">
            <i class="fa-regular fa-calendar"></i>
            <div class="cell-text">
              <span class="primary-text">{{ formatDate(booking.bookingTime || booking.createdDate) }}</span>
            </div>
          </div>

          <div class="cell">
            <i class="fa-solid fa-car-side"></i>
            <div class="cell-text">
              <span class="primary-text">{{ booking.vehicleName || booking.vehicle || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </section>

      <div class="pagination">
        <div class="pagination-info">
          Trang {{ currentPage }} / {{ totalPages }} · {{ filteredBookings.length }} booking
        </div>
        <div class="pagination-actions">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
            <i class="fa-solid fa-angle-left"></i>
          </button>
          <button
            v-for="page in pageNumbers"
            :key="page"
            class="page-btn"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">
            <i class="fa-solid fa-angle-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import TheSideBar from '../../layout/TheSideBar.vue'
import authService from '@/services/auth'
import bookingService from '@/services/booking'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()
const sidebarCollapsed = ref(false)
const loading = ref(false)

const sidebarMenu = [
  { key: 'bookings', label: 'Bookings', icon: 'fa-calendar-check', path: '/customer/bookings', exact: true },
  { key: 'vehicles', label: 'Vehicles', icon: 'fa-car', path: '#' },
  { key: 'customers', label: 'Customers', icon: 'fa-user', path: '#' },
  { key: 'reports', label: 'Reports', icon: 'fa-chart-column', path: '#' }
]

const searchQuery = ref('')
const dateFilter = ref({ start: '', end: '' })
const currentPage = ref(1)
const pageSize = ref(10)
const bookings = ref([])
const currentUser = ref(authService.getCurrentUser())

const goCreate = () => {
  router.push('/booking/Guest')
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return 'N/A'
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const normalizeDate = (value) => {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const filteredBookings = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const start = normalizeDate(dateFilter.value.start)
  const end = normalizeDate(dateFilter.value.end)

  return bookings.value.filter((b) => {
    const bookingTime = normalizeDate(b.bookingTime || b.createdDate)
    const matchDate =
      (!start || (bookingTime && bookingTime >= start)) &&
      (!end || (bookingTime && bookingTime <= end))

    const matchQuery = q
      ? [
          b.customerName,
          b.customerPhone,
          b.phone,
          b.vehicleName,
          b.vehicle,
          b.bookingId,
          b.id
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      : true

    return matchDate && matchQuery
  })
})

const totalPages = computed(() => {
  const total = Math.ceil(filteredBookings.value.length / pageSize.value) || 1
  return total
})

const paginatedBookings = computed(() => {
  const startIdx = (currentPage.value - 1) * pageSize.value
  return filteredBookings.value.slice(startIdx, startIdx + pageSize.value)
})

const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i += 1) pages.push(i)
  return pages
})

watch([searchQuery, dateFilter], () => {
  currentPage.value = 1
})

const fetchBookings = async () => {
  loading.value = true
  try {
    const email = currentUser.value?.email || currentUser.value?.username || ''
    const params = {
      page: 1,
      pageSize: 100, // lấy nhiều một lượt, filter client
      columnSorts: [{ columnName: 'CreatedDate', sortDirection: 'DESC' }],
      filters: email
        ? [
            { columnName: 'CustomerEmail', value: email },
            { columnName: 'Email', value: email }
          ]
        : []
    }
    const res = await bookingService.getPaging(params)
    const items = res?.data?.items || res?.items || []

    // Lọc theo email ở FE nếu backend không hỗ trợ filters
    bookings.value = items.filter((b) => {
      if (!email) return true
      const bookingEmail = (b.customerEmail || b.email || '').toLowerCase()
      return bookingEmail === email.toLowerCase()
    })
  } catch (error) {
    console.error('Fetch bookings error:', error)
    toast.error('Không tải được danh sách booking', error.message || error.userMsg || '')
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

fetchBookings()
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

.booking-management {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.booking-content {
  flex: 1;
  padding: 24px 32px 40px;
  transition: margin-left 0.2s ease;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 6px;
  font-size: 26px;
  color: #1f2933;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.btn-primary {
  background: var(--primary, #ff7a00);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(255, 122, 0, 0.25);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  flex: 1;
  min-width: 260px;
  gap: 8px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
}

.filters-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-filter {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #555;
}

.date-filter input {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 10px;
}

.btn-ghost {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.table-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.05);
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 0.7fr 1.2fr 1fr 1fr 1fr;
  padding: 14px 16px;
  align-items: center;
}

.table-head {
  background: #f9fafb;
  font-weight: 700;
  color: #374151;
}

.table-row {
  border-top: 1px solid #eef0f4;
}

.cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cell-text .primary-text {
  font-weight: 600;
  color: #1f2933;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #6b7280;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.page-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.page-btn.active {
  background: var(--primary, #ff7a00);
  color: #fff;
  border-color: var(--primary, #ff7a00);
}

@media (max-width: 900px) {
  .booking-content {
    margin-left: 0 !important;
    padding: 18px;
  }

  .table-head,
  .table-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .cell {
    justify-content: space-between;
  }
}
</style>
