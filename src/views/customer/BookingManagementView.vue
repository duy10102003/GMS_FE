<template>
  <div class="booking-management">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
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
          <span>Thao tác</span>
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

          <div class="cell actions-cell" @click.stop>
            <button class="btn-action info" @click="viewBooking(booking)">Xem</button>
            <button class="btn-action primary" @click="editBooking(booking)">Sửa</button>
            <button class="btn-action danger" @click="deleteBooking(booking)">Xóa</button>
          </div>
        </div>
      </section>

      <div class="pagination">
        <div class="pagination-info">
          Trang {{ currentPage }} / {{ totalPages }} • {{ filteredBookings.length }} booking
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TheSideBar from '../../layout/TheSideBar.vue'
import authService from '@/services/auth'
import bookingService from '@/services/booking'
import { useToast } from '@/composables/useToast'
import { getMenuByRole } from '@/utils/menu'

const router = useRouter()
const toast = useToast()
const sidebarCollapsed = ref(false)
const loading = ref(false)
const deletingId = ref(null)
const menuItems = ref([])

const searchQuery = ref('')
const dateFilter = ref({ start: '', end: '' })
const currentPage = ref(1)
const pageSize = ref(10)
const bookings = ref([])
const currentUser = ref(authService.getCurrentUser())

const goCreate = () => {
  router.push('/booking/Guest')
}

const viewBooking = (booking) => {
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
  const confirmed = window.confirm('Bạn có chắc muốn xóa booking này?')
  if (!confirmed) return
  try {
    deletingId.value = id
    await bookingService.delete(id)
    toast.success('Xóa booking thành công')
    await fetchBookings()
  } catch (error) {
    toast.error('Không thể xóa booking', error.message || 'Đã xảy ra lỗi')
  } finally {
    deletingId.value = null
  }
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

const totalPages = computed(() => Math.max(1, Math.ceil(filteredBookings.value.length / pageSize.value)))

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
      pageSize: 100,
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

    bookings.value = items.filter((b) => {
      const emails = [b.customerEmail, b.email].filter(Boolean).map((e) => e.toLowerCase())
      return email ? emails.includes(email.toLowerCase()) : true
    })
  } catch (error) {
    toast.error('Không thể tải danh sách booking', error.message || 'Đã xảy ra lỗi')
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  dateFilter.value = { start: '', end: '' }
}

const goToPage = (page) => {
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/home')
}

onMounted(async () => {
  const user = authService.getCurrentUser()
  if (user?.role) {
    menuItems.value = getMenuByRole(user.role)
  }
  await fetchBookings()
})
</script>

<style scoped>
.booking-management {
  display: flex;
  min-height: 100vh;
  background: var(--light, #f8f9fa);
}

.booking-content {
  flex: 1;
  padding: 2rem;
  transition: margin-left 0.3s ease;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.6rem;
}

.page-header p {
  margin: 0.25rem 0 0;
  color: #6c757d;
}

.btn-primary {
  background: var(--primary, #ff7a00);
  border: none;
  color: white;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  min-width: 260px;
}

.search-box input {
  border: none;
  outline: none;
  flex: 1;
}

.filters-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: white;
  padding: 0.45rem 0.65rem;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.btn-ghost {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  cursor: pointer;
}

.table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 2fr 2fr 2fr 2fr;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eef0f4;
}

.table-head {
  background: #f7f8fb;
  font-weight: 700;
}

.table-row:hover {
  background: #f6f7fb;
}

.cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cell-text .primary-text {
  font-weight: 600;
}

.empty-state {
  padding: 1.5rem;
  text-align: center;
  color: #6c757d;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.pagination-actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.page-btn.active {
  background: var(--primary, #ff7a00);
  color: white;
  border-color: var(--primary, #ff7a00);
}

.actions-cell {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.btn-action {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  background: white;
}

.btn-action.info {
  color: #0d6efd;
  border-color: #0d6efd;
}

.btn-action.primary {
  color: #ff7a00;
  border-color: #ff7a00;
}

.btn-action.danger {
  color: #e74c3c;
  border-color: #e74c3c;
}
</style>
