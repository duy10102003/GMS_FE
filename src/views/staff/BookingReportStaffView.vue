<template>
  <div class="booking-report">
    <TheSideBar :collapsed="sidebarCollapsed" :collapsible="true" @update:collapsed="sidebarCollapsed = $event" @logout="handleLogout" />
    <div class="booking-report__body">
      <TheHeader title="Báo cáo lịch đặt" :show-search="false" @logout="handleLogout" />

      <main class="page">
        <div class="filters">
          <div class="filter-item">
            <label>Từ ngày</label>
            <input v-model="dateFrom" type="date" @change="applyFilters" />
          </div>
          <div class="filter-item">
            <label>Đến ngày</label>
            <input v-model="dateTo" type="date" @change="applyFilters" />
          </div>
          <div class="filter-item wide">
            <label>Tìm kiếm</label>
            <input v-model="searchText" type="text" placeholder="Tên khách, xe, SĐT..." @keyup.enter="applyFilters" />
          </div>
          <div class="filter-actions">
            <GmsButton variant="outline" icon="fa-rotate-right" :loading="loading" @click="refreshData">Làm mới</GmsButton>
          </div>
        </div>

        <div class="summary-grid">
          <div class="stat-card">
            <div class="stat-icon soft-blue"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-label">Tổng lịch đặt</div>
            <div class="stat-value">{{ filteredBookings.length }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon soft-amber"><i class="fas fa-hourglass-half"></i></div>
            <div class="stat-label">Chờ xử lý</div>
            <div class="stat-value">{{ pendingCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon soft-green"><i class="fas fa-play"></i></div>
            <div class="stat-label">Đang thực hiện</div>
            <div class="stat-value">{{ progressCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon soft-red"><i class="fas fa-flag-checkered"></i></div>
            <div class="stat-label">Hoàn thành</div>
            <div class="stat-value">{{ completedCount }}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="panel chart-card">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Trạng thái</p>
                <h3>Phân bổ booking</h3>
              </div>
              <span class="pill ghost">{{ filteredBookings.length }} mục</span>
            </div>
            <div class="donut-wrapper" v-if="filteredBookings.length">
              <div class="donut" :style="donutStyle">
                <div class="donut-hole">
                  <strong>{{ filteredBookings.length }}</strong>
                  <small>booking</small>
                </div>
              </div>
              <div class="legend">
                <div class="legend-item">
                  <span class="legend-dot pending"></span>
                  <div>
                    <div class="legend-label">Chờ xử lý</div>
                    <div class="legend-meta">{{ pendingCount }} ({{ percentStatus.pending }}%)</div>
                  </div>
                </div>
                <div class="legend-item">
                  <span class="legend-dot progress"></span>
                  <div>
                    <div class="legend-label">Đang thực hiện</div>
                    <div class="legend-meta">{{ progressCount }} ({{ percentStatus.progress }}%)</div>
                  </div>
                </div>
                <div class="legend-item">
                  <span class="legend-dot done"></span>
                  <div>
                    <div class="legend-label">Hoàn thành</div>
                    <div class="legend-meta">{{ completedCount }} ({{ percentStatus.completed }}%)</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="state">Không có dữ liệu</div>
          </div>

          <div class="panel chart-card">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Theo ngày</p>
                <h3>Số lịch đặt gần đây</h3>
              </div>
              <span class="pill ghost">7 ngày</span>
            </div>
            <div v-if="!recentSeries.length" class="state">Không có dữ liệu</div>
            <div v-else class="bar-chart">
              <div v-for="row in recentSeries" :key="row.label" class="bar">
                <div class="bar-label">
                  <strong>{{ row.label }}</strong>
                  <small class="muted">{{ row.count }} booking</small>
                </div>
                <div class="bar-track">
                  <span class="bar-fill" :style="{ width: row.percent + '%' }"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel table-card">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Chi tiết</p>
              <h3>Bảng booking</h3>
            </div>
            <span class="pill ghost">{{ filteredBookings.length }} mục</span>
          </div>

          <div v-if="loading" class="state"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>
          <div v-else-if="!filteredBookings.length" class="state">Không có dữ liệu</div>
          <div v-else class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách</th>
                  <th>Xe</th>
                  <th>SĐT</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in pagedBookings" :key="row.bookingId || row.id">
                  <td>{{ row.bookingId || row.id }}</td>
                  <td>{{ row.customerName || '-' }}</td>
                  <td>{{ row.vehicleName || '-' }}</td>
                  <td>{{ row.customerPhone || '-' }}</td>
                  <td>{{ formatDate(row.bookingTime || row.createdDate) }}</td>
                  <td>
                    <span class="status" :class="statusClass(row.bookingStatus)">
                      {{ statusLabel(row.bookingStatus) }}
                    </span>

                  </td>
                </tr>
              </tbody>
            </table>

            <div class="pager">
              <div class="pager-info">
                <label>Hiển thị</label>
                <select v-model.number="pageSize" @change="handlePageSizeChange" class="page-size-select">
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                </select>
                <span>
                  <strong>{{ startIndex }} - {{ endIndex }}</strong>
                  / {{ filteredBookings.length }} mục
                </span>
              </div>
              <div class="pager-actions">
                <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">&lt;</button>
                <span>Trang {{ currentPage }} / {{ totalPages }}</span>
                <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsButton } from '@/components'
import authService from '@/services/auth'
import bookingService from '@/services/booking'

const router = useRouter()
const sidebarCollapsed = ref(false)
const loading = ref(false)

const bookings = ref([])
const filteredBookings = ref([])
const searchText = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const currentPage = ref(1)
const pageSize = ref(10)

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusLabel = (status) => {
  if (status === 0 || status === 'PENDING') return 'Chờ xử lý'
  if (status === 1 || status === 'IN_PROGRESS') return 'Đang thực hiện'
  if (status === 2 || status === 'COMPLETED') return 'Đã hoàn thành'
  return 'Khác'
}

const statusClass = (status) => {
  if (status === 0 || status === 'PENDING') return 'pending'
  if (status === 1 || status === 'IN_PROGRESS') return 'progress'
  if (status === 2 || status === 'COMPLETED') return 'done'
  return 'unknown'
}

const normalizeBooking = (item = {}) => ({
  bookingId: item.bookingId || item.id,
  bookingCode: item.bookingCode || item.code,
  customerName: item.customerName || item.name,
  customerPhone: item.customerPhone || item.phone,
  vehicleName: item.vehicleName || item.vehicle,
  bookingTime: item.bookingTime || item.createdDate,
  bookingStatus: Number(item.bookingStatus) // ÉP KIỂU TẠI NGUỒN
})

const applyFilters = () => {
  const q = searchText.value.trim().toLowerCase()
  const from = dateFrom.value ? new Date(dateFrom.value) : null
  const to = dateTo.value ? new Date(dateTo.value) : null

  filteredBookings.value = bookings.value.filter((b) => {
    const dateObj = b.bookingTime ? new Date(b.bookingTime) : null
    const matchDate =
      (!from || (dateObj && dateObj >= from)) &&
      (!to || (dateObj && dateObj <= to))

    const text = [b.customerName, b.vehicleName, b.customerPhone, b.bookingCode, b.bookingId]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const matchText = q ? text.includes(q) : true

    return matchDate && matchText
  })
  currentPage.value = 1
}

watch([searchText, dateFrom, dateTo], applyFilters)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredBookings.value.length / pageSize.value)))
const startIndex = computed(() => (filteredBookings.value.length ? (currentPage.value - 1) * pageSize.value + 1 : 0))
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, filteredBookings.value.length))

const pagedBookings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredBookings.value.slice(start, start + pageSize.value)
})

const pendingCount = computed(() => filteredBookings.value.filter((b) => (b.status ?? '').toString() === '0' || b.status === 'PENDING').length)
const progressCount = computed(() => filteredBookings.value.filter((b) => b.status === 1 || b.status === 'IN_PROGRESS').length)
const completedCount = computed(() => filteredBookings.value.filter((b) => b.status === 2 || b.status === 'COMPLETED').length)

const percentStatus = computed(() => {
  const total = filteredBookings.value.length || 1
  return {
    pending: Math.round((pendingCount.value / total) * 100),
    progress: Math.round((progressCount.value / total) * 100),
    completed: Math.round((completedCount.value / total) * 100)
  }
})

const donutStyle = computed(() => {
  const segments = [
    { color: '#f59e0b', value: pendingCount.value },
    { color: '#10b981', value: progressCount.value },
    { color: '#3b82f6', value: completedCount.value }
  ]
  const total = filteredBookings.value.length || 1
  let start = 0
  const stops = segments.map((seg) => {
    const angle = (seg.value / total) * 360
    const end = start + angle
    const stop = `${seg.color} ${start}deg ${end}deg`
    start = end
    return stop
  })
  return { background: `conic-gradient(${stops.join(', ')})` }
})

const recentSeries = computed(() => {
  const days = 7
  const today = new Date()
  today.setHours(0, 0, 0, 0) // chuẩn hóa ngày

  const start = new Date(today)
  const end = new Date(today)
  end.setDate(today.getDate() + days - 1)

  const bucket = {}

  filteredBookings.value.forEach((b) => {
    const d = b.bookingTime ? new Date(b.bookingTime) : null
    if (!d) return
    d.setHours(0, 0, 0, 0)

    // ✅ chỉ lấy booking trong 7 ngày tới
    if (d < start || d > end) return

    const key = d.toISOString().slice(0, 10)
    bucket[key] = (bucket[key] || 0) + 1
  })

  // tạo labels cho 7 ngày tới
  const labels = []
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    labels.push(d.toISOString().slice(0, 10))
  }

  const counts = labels.map((label) => ({
    label,
    count: bucket[label] || 0
  }))

  const max = Math.max(...counts.map(c => c.count), 1)

  return counts.map(c => ({
    ...c,
    percent: c.count ? Math.round((c.count / max) * 100) : 0
  }))
})


const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const refreshData = async () => {
  await loadData()
}

const loadData = async () => {
  try {
    loading.value = true
    const res = await bookingService.getPaging({
      page: 1,
      pageSize: 300,
      columnSorts: [{ columnName: 'CreatedDate', sortDirection: 'DESC' }]
    })
    const items = res?.data?.items || res?.items || res?.data || []
    bookings.value = Array.isArray(items) ? items.map(normalizeBooking) : []
    applyFilters()
  } catch (error) {
    bookings.value = []
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

onMounted(loadData)
</script>

<style scoped>
.booking-report {
  display: flex;
  background: #f4f7fb;
  min-height: 100vh;
}
.booking-report__body {
  flex: 1;
  margin-left: var(--sidebar-width, 260px);
  display: flex;
  flex-direction: column;
}
.page {
  padding: 90px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: end;
}
.filter-item label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: #111827;
}
.filter-item input,
.filter-item select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
.filter-item.wide {
  grid-column: span 2;
}
.filter-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
.stat-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  display: grid;
  gap: 6px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}
.stat-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #fff;
}
.soft-blue { background: #60a5fa; }
.soft-amber { background: #f59e0b; }
.soft-green { background: #10b981; }
.soft-red { background: #ef4444; }
.stat-label { color: #6b7280; font-weight: 600; }
.stat-value { font-size: 22px; font-weight: 800; color: #0f172a; }

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
}
.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.eyebrow { margin: 0; color: #9ca3af; font-size: 13px; }
.panel-header h3 { margin: 2px 0 0; }
.pill {
  padding: 6px 10px;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 999px;
  font-size: 13px;
}
.donut-wrapper {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  align-items: center;
}
.donut {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  position: relative;
  display: grid;
  place-items: center;
}
.donut-hole {
  position: absolute;
  width: 95px;
  height: 95px;
  border-radius: 50%;
  background: white;
  display: grid;
  place-items: center;
  text-align: center;
  box-shadow: inset 0 0 0 1px #eef0f4;
}
.legend {
  display: grid;
  gap: 0.6rem;
}
.legend-item {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.legend-dot.pending { background: #f59e0b; }
.legend-dot.progress { background: #10b981; }
.legend-dot.done { background: #3b82f6; }
.legend-label { font-weight: 600; }
.legend-meta { color: #6b7280; }

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.bar {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.bar-label {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}
.bar-track {
  width: 100%;
  height: 12px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}
.bar-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #2563eb);
}

.table-card { margin-top: 8px; }
.table-wrapper { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table thead { background: #f3f4f6; }
.table th, .table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eef0f4;
  text-align: left;
}
.status.pending { color: #d97706; }
.status.progress { color: #0f766e; }
.status.done { color: #2563eb; }
.status.unknown { color: #6b7280; }
.state {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
}
.pager {
  margin-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.pager-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.page-size-select {
  padding: 0.35rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.pager-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.pager-actions button {
  padding: 0.35rem 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}
.pager-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr;
  }
  .filter-item.wide {
    grid-column: span 1;
  }
  .donut-wrapper {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}
</style>
