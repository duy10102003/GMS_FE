<template>
  <div class="mechanic-report-page">
    <TheSideBar @logout="handleLogout" />
    <div class="page-shell">
      <TheHeader
        title="Báo cáo chi tiết thợ máy"
        :show-search="false"
        @logout="handleLogout"
      />

      <main class="page">
        <div class="page-header">
          <div class="actions">
            <GmsButton variant="primary" icon="fa-download" :disabled="!filteredMechanics.length" @click="exportReport">
              Xuất CSV
            </GmsButton>
          </div>
        </div>

        <div class="filters filters--with-action">
          <div class="filter-item wide">
            <label>Tìm kiếm</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Tên, vai trò..."
              
            />
          </div>
          <div class="filter-item">
            <label>Từ ngày</label>
            <input type="date" v-model="filters.fromDate" @change="handleDateChange" />
          </div>
            <div class="filter-item">
            <label>Đến ngày</label>
            <input type="date" v-model="filters.toDate" @change="handleDateChange" />
          </div>
        </div>

        <div class="summary-grid">
          <div class="stat-card">
            <div class="stat-icon soft-green">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-label">Tổng số thợ</div>
            <div class="stat-value">{{ formatNumber(filteredMechanics.length) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon soft-blue">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <div class="stat-label">Công việc hoàn tất</div>
            <div class="stat-value">{{ formatNumber(summary.completed) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon soft-purple">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-label">Công việc đang làm</div>
            <div class="stat-value">{{ formatNumber(summary.inProgress) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon soft-amber">
              <i class="fas fa-hourglass-half"></i>
            </div>
            <div class="stat-label">Công việc chờ xử lý</div>
            <div class="stat-value">{{ formatNumber(summary.pending) }}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="panel chart-card">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Tổng quan</p>
                <h3>Công việc theo trạng thái</h3>
              </div>
              <span class="pill ghost">{{ summary.totalJobs }} công việc</span>
            </div>
            <div class="bar-chart">
              <div class="bar">
                <span class="bar-label">Đang chờ</span>
                <div class="bar-track">
                  <span class="bar-fill pending" :style="{ width: statusPercent.pending + '%' }"></span>
                </div>
                <small class="muted">{{ formatNumber(summary.pending) }} công việc</small>
              </div>
              <div class="bar">
                <span class="bar-label">Đang làm</span>
                <div class="bar-track">
                  <span class="bar-fill progress" :style="{ width: statusPercent.inProgress + '%' }"></span>
                </div>
                <small class="muted">{{ formatNumber(summary.inProgress) }} công việc</small>
              </div>
              <div class="bar">
                <span class="bar-label">Hoàn tất</span>
                <div class="bar-track">
                  <span class="bar-fill success" :style="{ width: statusPercent.completed + '%' }"></span>
                </div>
                <small class="muted">{{ formatNumber(summary.completed) }} công việc</small>
              </div>
            </div>
          </div>

          <div class="panel chart-card">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Theo thợ</p>
                <h3>Top theo hoàn tất</h3>
              </div>
            </div>
            <div class="stacked-bars">
              <div v-for="row in topMechanics" :key="row.userId || row.id" class="stacked-row">
                <div class="row-head">
                  <span class="name">{{ row.fullName || row.name || 'Thợ' }}</span>
                </div>
                <div class="stacked-track">
                  <span class="seg pending" :style="{ width: topWidth(row, 'pending') + '%' }"></span>
                  <span class="seg progress" :style="{ width: topWidth(row, 'inProgress') + '%' }"></span>
                  <span class="seg success" :style="{ width: topWidth(row, 'completed') + '%' }"></span>
                </div>
                <div class="row-meta">
                  <span class="pill ghost">Đang chờ {{ formatNumber(metrics[row.userId || row.id]?.pending || 0) }}</span>
                  <span class="pill pill-warning">Đang làm {{ formatNumber(metrics[row.userId || row.id]?.inProgress || 0) }}</span>
                  <span class="pill pill-success">Hoàn tất {{ formatNumber(metrics[row.userId || row.id]?.completed || 0) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="panel chart-card">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Tỷ lệ</p>
                <h3>Tròn trạng thái công việc</h3>
              </div>
              <span class="pill ghost">{{ summary.totalJobs }} công việc</span>
            </div>
            <div class="donut-wrapper">
              <div class="donut" :style="donutStyle">
                <div class="donut-hole">
                  <strong>{{ summary.totalJobs }}</strong>
                  <small>công việc</small>
                </div>
              </div>
              <div class="legend">
                <div class="legend-item">
                  <span class="legend-dot pending"></span>
                  <div>
                    <div class="legend-label">Đang chờ</div>
                    <div class="legend-meta">{{ formatNumber(summary.pending) }} ({{ statusPercent.pending }}%)</div>
                  </div>
                </div>
                <div class="legend-item">
                  <span class="legend-dot progress"></span>
                  <div>
                    <div class="legend-label">Đang làm</div>
                    <div class="legend-meta">{{ formatNumber(summary.inProgress) }} ({{ statusPercent.inProgress }}%)</div>
                  </div>
                </div>
                <div class="legend-item">
                  <span class="legend-dot success"></span>
                  <div>
                    <div class="legend-label">Hoàn tất</div>
                    <div class="legend-meta">{{ formatNumber(summary.completed) }} ({{ statusPercent.completed }}%)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel table-card">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Chi tiết</p>
              <h3>Bảng KPI theo thợ</h3>
            </div>
            <span class="pill ghost">{{ filteredMechanics.length }} / {{ mechanics.length }} thợ</span>
          </div>

          <div v-if="loading" class="state">
            <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
          </div>

          <div v-else-if="!filteredMechanics.length" class="state">
            <i class="fas fa-users-slash"></i> Không có dữ liệu phù hợp bộ lọc.
          </div>

          <div v-else class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Thợ</th>
                  <!-- <th>Vai trò</th> -->
                  <th>Đang chờ</th>
                  <th>Đang làm</th>
                  <th>Hoàn tất</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in pagedMechanics" :key="row.userId || row.id">
                  <td>
                    <div class="cell-name">
                      <span class="avatar tiny">{{ getInitials(row.fullName || row.name) }}</span>
                      <div>
                        <div class="name">{{ row.fullName || row.name || 'Thợ' }}</div>
                        <small class="muted">#{{ row.userId || row.id }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ formatNumber(metrics[row.userId || row.id]?.pending || 0) }}</td>
                  <td>{{ formatNumber(metrics[row.userId || row.id]?.inProgress || 0) }}</td>
                  <td>{{ formatNumber(metrics[row.userId || row.id]?.completed || 0) }}</td>
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
                  / {{ filteredMechanics.length }} thợ
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
import { getMenuByRole } from '@/utils/menu'
import userService from '@/services/user'
import technicalTaskService from '@/services/technicalTask'
import { TASK_STATUS } from '@/constant/serviceTicketStatus'

const router = useRouter()
// const sidebarCollapsed = ref(false)
// const notifications = ref([])
const menuItems = ref([])
const lastRefreshed = ref(new Date())
const loading = ref(false)

const filters = ref({
  search: '',
  fromDate: '',
  toDate: ''
})

const mechanics = ref([])
const metrics = ref({})
const tasks = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

const filteredMechanics = computed(() => {
  return mechanics.value.filter((row) => {
    const searchText = filters.value.search.trim().toLowerCase()
    if (searchText) {
      const haystack = `${row.fullName ||  ''} ${row.mechanicRoleName || ''} ${row.id || ''}`.toLowerCase()
      if (!haystack.includes(searchText)) return false
    }

    // Lọc khoảng thời gian: chỉ áp dụng khi bản ghi có trường thời gian
    if ((filters.value.fromDate || filters.value.toDate) && row.createdAt) {
      const time = new Date(row.createdAt)
      if (filters.value.fromDate) {
        const from = new Date(filters.value.fromDate)
        if (time < from) return false
      }
      if (filters.value.toDate) {
        const to = new Date(filters.value.toDate)
        to.setHours(23, 59, 59, 999)
        if (time > to) return false
      }
    }

    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredMechanics.value.length / pageSize.value)))
const startIndex = computed(() => (filteredMechanics.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1))
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, filteredMechanics.value.length))
const pagedMechanics = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredMechanics.value.slice(start, start + pageSize.value)
})

watch(
  () => filteredMechanics.value.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  }
)

const summary = computed(() => {
  const list = filteredMechanics.value
  const totals = list.reduce(
    (acc, row) => {
      const m = metrics.value[row.userId || row.id] || {}
      acc.completed += m.completed || 0
      acc.pending += m.pending || 0
      acc.inProgress += m.inProgress || 0
      return acc
    },
    { completed: 0, pending: 0, inProgress: 0 }
  )
  return {
    ...totals,
    totalJobs: totals.completed + totals.pending + totals.inProgress
  }
})

const statusPercent = computed(() => {
  const total = summary.value.totalJobs || 1
  return {
    pending: Math.round((summary.value.pending / total) * 100),
    inProgress: Math.round((summary.value.inProgress / total) * 100),
    completed: Math.round((summary.value.completed / total) * 100)
  }
})

const topMechanics = computed(() => {
  return [...filteredMechanics.value]
    .sort((a, b) => {
      const ma = metrics.value[a.userId || a.id] || {}
      const mb = metrics.value[b.userId || b.id] || {}
      return (mb.completed || 0) - (ma.completed || 0)
    })
    .slice(0, 5)
})

const topWidth = (row, key) => {
  const metric = metrics.value[row.userId || row.id] || {}
  const total = (metric.pending || 0) + (metric.inProgress || 0) + (metric.completed || 0)
  if (total === 0) return 0
  return Math.round(((metric[key] || 0) / total) * 100)
}

const donutStyle = computed(() => {
  const segments = [
    { color: '#f59e0b', value: summary.value.pending },
    { color: '#60a5fa', value: summary.value.inProgress },
    { color: '#22c55e', value: summary.value.completed }
  ]
  const total = summary.value.totalJobs || 1
  let start = 0
  const stops = segments.map((seg) => {
    const angle = (seg.value / total) * 360
    const end = start + angle
    const stop = `${seg.color} ${start}deg ${end}deg`
    start = end
    return stop
  })
  return {
    background: `conic-gradient(${stops.join(', ')})`
  }
})

const getInitials = (name = '') => {
  const parts = name.trim().split(' ')
  const initials = parts.slice(-2).map((p) => p.charAt(0).toUpperCase())
  return initials.join('') || 'NA'
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(Number(value || 0))
}

const rebuildMetrics = () => {
  const metricsMap = {}
  tasks.value.forEach((t) => {
    const userId = t.assignedTo || t.assigned_to || t.assigned_to_technical || t.assignedToTechnical
    if (!userId) return
    if (!metricsMap[userId]) metricsMap[userId] = { pending: 0, inProgress: 0, completed: 0 }
    if (t.status === TASK_STATUS.PENDING) metricsMap[userId].pending += 1
    else if (t.status === TASK_STATUS.IN_PROGRESS) metricsMap[userId].inProgress += 1
    else if (t.status === TASK_STATUS.COMPLETED) metricsMap[userId].completed += 1
  })
  metrics.value = metricsMap
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const handleDateChange = () => {
  loadData()
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const handlePageSizeChange = () => {
  currentPage.value = 1
}

const exportReport = () => {
  const headers = ['UserId', 'Ten', 'Vai tro', 'Dang cho', 'Dang lam', 'Hoan thanh']
  const rows = filteredMechanics.value.map((row) => {
    const m = metrics.value[row.userId || row.id] || {}
    return [
      row.userId || row.id,
      row.fullName || row.name,
      row.mechanicRoleName || row.roleName || row.role,
      m.pending || 0,
      m.inProgress || 0,
      m.completed || 0
    ]
  })
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'mechanic-report.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


const parseTotal = (res) => {
  return (
    res?.data?.total ??
    (Array.isArray(res?.data) ? res.data.length : 0)
  )
}

const buildTaskFilters = () => {
  const columnFilters = []
  if (filters.value.fromDate) {
    ;['assigned_date','assigned_at','CreatedDate'].forEach((col) => {
      columnFilters.push({
        columnName: col,
        operator: 'greater_or_equal',
        value: filters.value.fromDate
      })
    })
  }
  if (filters.value.toDate) {
    ;['assigned_date','assigned_at','CreatedDate'].forEach((col) => {
      columnFilters.push({
        columnName: col,
        operator: 'less_or_equal',
        value: filters.value.toDate
      })
    })
  }
  return columnFilters
}

const normalizeTask = (item = {}) => ({
  assignedTo: item.assignedToTechnical || item.assigned_to_technical || item.assignedTo || item.assigned_to,
  status: item.taskStatus ?? item.status,
  assignedAt:
    item.assignedDate ||
    item.assigned_date ||
    item.assigned_at ||
    item.createdDate ||
    item.created_at ||
    item.createdAt ||
    item.confirmed_at ||
    item.confirmedAt,
  createdAt:
    item.createdDate ||
    item.created_at ||
    item.createdAt ||
    item.assignedDate ||
    item.assigned_date ||
    item.assigned_at
})

const loadData = async (skipRefresh = false) => {
  try {
    loading.value = true
    const resMechanics = await userService.getTechnicalStaff()
    const mechanicsData = resMechanics?.data ?? []
    mechanics.value = Array.isArray(mechanicsData) ? mechanicsData : []

    const resTasks = await technicalTaskService.getPaging({
      page: 1,
      pageSize: 1000,
      columnSorts: [{ columnName: 'CreatedDate', sortDirection: 'DESC' }],
      columnFilters: buildTaskFilters()
    })
    const taskItems = resTasks?.data?.items || resTasks?.data?.data || resTasks?.data || []
    tasks.value = Array.isArray(taskItems) ? taskItems.map(normalizeTask) : []

    rebuildMetrics()
    lastRefreshed.value = new Date()
  } catch (error) {
    metrics.value = {}
    mechanics.value = []
    tasks.value = []
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/home')
}

onMounted(() => {
  const user = authService.getCurrentUser()
  if (user) {
    menuItems.value = getMenuByRole(user.role)
  }

  loadData()
})
</script>

<style scoped>
.mechanic-report-page {
  display: flex;
}

.page-shell {
  margin-left: 260px;
  width: 100%;
}

.page {
  padding: 1.5rem;
  background: #f7f8fb;
  min-height: 100vh;
}

.page-header {
  padding-top: 75px;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1.25rem;
  align-items: flex-start;
}

/* .page-header h1 {
  margin: 0.15rem 0;
  font-size: 1.75rem;
  color: #1f2937;
} */

.subtitle {
  color: #6b7280;
  max-width: 780px;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.filters .filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filters label {
  font-size: 0.9rem;
  color: #6b7280;
}

.filters input,
.filters select {
  padding: 0.65rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: white;
}

.filters .wide {
  grid-column: span 2;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(31, 41, 55, 0.05);
  border: 1px solid #eef0f4;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: white;
  margin-bottom: 0.65rem;
}

.soft-green {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.soft-blue {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.soft-purple {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
}

.soft-amber {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.stat-label {
  font-size: 0.95rem;
  color: #6b7280;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0.1rem 0;
  color: #111827;
}

.stat-meta {
  color: #6b7280;
  font-size: 0.9rem;
}

.panel {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #eef0f4;
  box-shadow: 0 10px 30px rgba(31, 41, 55, 0.05);
}

.chart-card {
  min-height: 260px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.panel-header h3 {
  margin: 0.2rem 0;
}

.eyebrow {
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #9ca3af;
  letter-spacing: 0.05em;
  margin: 0;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
  background: #eef2ff;
  color: #4338ca;
}

.pill.ghost {
  background: #f3f4f6;
  color: #6b7280;
}

.pill-success {
  background: #dcfce7;
  color: #166534;
}

.pill-warning {
  background: #fef3c7;
  color: #92400e;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bar {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bar-label {
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
  border-radius: 999px;
}

.bar-fill.pending {
  background: #f59e0b;
}

.bar-fill.progress {
  background: #60a5fa;
}

.bar-fill.success {
  background: #22c55e;
}

.stacked-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stacked-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.row-head {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: center;
}

.stacked-track {
  width: 100%;
  height: 12px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
  display: flex;
}

.stacked-track .seg {
  height: 100%;
}

.stacked-track .pending {
  background: #f59e0b;
}

.stacked-track .progress {
  background: #60a5fa;
}

.stacked-track .success {
  background: #22c55e;
}

.row-meta {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.donut-wrapper {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  align-items: center;
}

.donut {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: relative;
  display: grid;
  place-items: center;
}

.donut-hole {
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: white;
  display: grid;
  place-items: center;
  text-align: center;
  box-shadow: inset 0 0 0 1px #eef0f4;
}

.donut-hole strong {
  font-size: 1.35rem;
  color: #111827;
}

.donut-hole small {
  color: #6b7280;
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

.legend-dot.pending {
  background: #f59e0b;
}

.legend-dot.progress {
  background: #60a5fa;
}

.legend-dot.success {
  background: #22c55e;
}

.legend-label {
  font-weight: 600;
  color: #111827;
}

.legend-meta {
  color: #6b7280;
  font-size: 0.9rem;
}

.table-card {
  margin-top: 1rem;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #f3f4f6;
}

.table th,
.table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eef0f4;
  text-align: left;
}

.cell-name {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4338ca;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.avatar.tiny {
  width: 32px;
  height: 32px;
  font-size: 0.9rem;
}

.name {
  font-weight: 600;
}

.muted {
  color: #6b7280;
}

.warning-panel ul {
  margin: 0.4rem 0 0;
  padding-left: 1.2rem;
  color: #6b7280;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
