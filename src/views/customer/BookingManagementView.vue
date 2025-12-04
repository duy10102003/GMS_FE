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
          <h1>Booking Management</h1>
          <p>Manage all vehicle bookings and reservations</p>
        </div>
        <button class="btn-primary" @click="goCreate">
          <i class="fa-solid fa-plus"></i>
          New Booking
        </button>
      </header>

      <section class="filter-bar">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm khách hàng, SĐT, hoặc xe..."
          />
        </div>
        <div class="filters-right">
          <select v-model="statusFilter">
            <option value="">Tất cả trạng thái</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <button class="btn-ghost" @click="clearFilters">
            <i class="fa-solid fa-xmark"></i>
            Xóa
          </button>
        </div>
      </section>

      <section class="table-card">
        <div class="table-head">
          <span>Booking Time</span>
          <span>Vehicle</span>
          <span>Customer</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        <div
          v-for="booking in paginatedBookings"
          :key="booking.id"
          class="table-row"
        >
          <div class="cell">
            <i class="fa-regular fa-calendar"></i>
            <div class="cell-text">
              <span class="primary-text">{{ booking.time }}</span>
            </div>
          </div>

          <div class="cell">
            <i class="fa-solid fa-car-side"></i>
            <div class="cell-text">
              <span class="primary-text">{{ booking.vehicle }}</span>
              <span class="muted">{{ booking.year }}</span>
            </div>
          </div>

          <div class="cell">
            <i class="fa-regular fa-user"></i>
            <div class="cell-text">
              <span class="primary-text">{{ booking.customer }}</span>
              <span class="muted">{{ booking.phone }}</span>
            </div>
          </div>

          <div class="cell">
            <span :class="['status', booking.status]">
              <i :class="statusIcon(booking.status)"></i>
              {{ statusLabel(booking.status) }}
            </span>
          </div>

          <div class="cell">
            <a class="action" href="#">
              Details
              <i class="fa-solid fa-angle-down"></i>
            </a>
          </div>
        </div>
      </section>

      <div class="pagination">
        <div class="pagination-info">
          Page {{ currentPage }} / {{ totalPages }} · {{ filteredBookings.length }} bookings
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

const router = useRouter()
const sidebarCollapsed = ref(false)

const sidebarMenu = [
  { key: 'bookings', label: 'Bookings', icon: 'fa-calendar-check', path: '/customer/bookings', exact: true },
  { key: 'vehicles', label: 'Vehicles', icon: 'fa-car', path: '#' },
  { key: 'customers', label: 'Customers', icon: 'fa-user', path: '#' },
  { key: 'reports', label: 'Reports', icon: 'fa-chart-column', path: '#' }
]

const bookings = ref([
  { id: 1, time: '2025-01-15 14:30', vehicle: 'Toyota Camry', year: '2023', customer: 'John Doe', phone: '+84 909 123 456', status: 'confirmed' },
  { id: 2, time: '2025-01-16 10:00', vehicle: 'Honda CR-V', year: '2022', customer: 'Jane Smith', phone: '+84 912 345 789', status: 'pending' },
  { id: 3, time: '2025-01-17 16:45', vehicle: 'BMW 328i', year: '2024', customer: 'Michael Johnson', phone: '+84 898 765 432', status: 'completed' },
  { id: 4, time: '2025-01-18 09:15', vehicle: 'Ford Focus', year: '2021', customer: 'Sarah Williams', phone: '+84 908 234 567', status: 'confirmed' }
])

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(5)

const filteredBookings = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return bookings.value.filter((b) => {
    const matchStatus = statusFilter.value ? b.status === statusFilter.value : true
    const matchQuery = q
      ? [b.time, b.vehicle, b.year, b.customer, b.phone]
          .join(' ')
          .toLowerCase()
          .includes(q)
      : true
    return matchStatus && matchQuery
  })
})

const totalPages = computed(() => {
  const total = Math.ceil(filteredBookings.value.length / pageSize.value) || 1
  return total
})

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredBookings.value.slice(start, start + pageSize.value)
})

const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i += 1) pages.push(i)
  return pages
})

const statusLabel = (status) => {
  const map = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed'
  }
  return map[status] || status
}

const statusIcon = (status) => {
  const map = {
    confirmed: 'fa-solid fa-circle-check',
    pending: 'fa-regular fa-clock',
    completed: 'fa-solid fa-circle-check'
  }
  return map[status] || 'fa-solid fa-circle'
}

const handleLogout = () => {
  // Hook up to auth flow when available
  console.log('logout clicked')
}

const goCreate = () => {
  router.push('/customer/bookings/create')
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
}

watch(filteredBookings, () => {
  // Reset page if current page exceeds total
  if (currentPage.value > totalPages.value) currentPage.value = 1
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}
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
  padding: 28px 32px 40px;
  transition: margin-left 0.2s ease;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 6px;
  color: #1f2933;
}

.page-header p {
  color: #6b7280;
  font-size: 15px;
}

.btn-primary {
  background: var(--primary, #ff7a00);
  color: #fff;
  border: none;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 12px 30px rgba(255, 122, 0, 0.35);
}

.btn-primary:hover {
  background: var(--primary-dark, #e66d00);
  transform: translateY(-1px);
}

.table-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.filter-bar {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box input {
  width: 100%;
  padding: 12px 14px 12px 38px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.filters-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filters-right select {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  background: #fff;
}

.btn-ghost {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 14px;
  font-weight: 600;
  color: #374151;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.btn-ghost:hover {
  border-color: #ff7a00;
  color: #ff7a00;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 1fr 1fr 0.8fr;
  padding: 16px 20px;
  align-items: center;
  column-gap: 12px;
}

.table-head {
  background: #f3f4f6;
  color: #475467;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.3px;
  border-bottom: 1px solid var(--border);
  text-transform: uppercase;
}

.table-row {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.15s ease;
}

.table-row:hover {
  background: #fdf7f2;
}

.cell {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #111827;
  font-weight: 600;
}

.cell-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.primary-text {
  font-weight: 700;
}

.muted {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 999px;
}

.status.confirmed { background: #e7f7ed; color: #199853; }
.status.pending { background: #fff3d8; color: #a47306; }
.status.completed { background: #e7edff; color: #3454c0; }

.action {
  color: var(--primary, #ff7a00);
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action:hover {
  color: var(--primary-dark, #e66d00);
}

.pagination {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
}

.pagination-actions {
  display: flex;
  gap: 6px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
}

.page-btn.active {
  background: var(--primary, #ff7a00);
  color: #fff;
  border-color: var(--primary, #ff7a00);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .table-head,
  .table-row {
    grid-template-columns: 1.3fr 1.1fr 1fr;
    row-gap: 12px;
  }
  .table-head span:nth-child(4),
  .table-head span:nth-child(5),
  .table-row .cell:nth-child(4),
  .table-row .cell:nth-child(5) {
    display: none;
  }
}

@media (max-width: 768px) {
  .booking-management {
    flex-direction: column;
  }
  .booking-content {
    margin-left: 0 !important;
    padding: 20px;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .table-head {
    display: none;
  }
  .table-row {
    grid-template-columns: 1fr;
    border-radius: 14px;
    margin-bottom: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  }
}
</style>
