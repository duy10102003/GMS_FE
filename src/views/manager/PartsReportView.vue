<template>
  <div class="parts-report-page">
    <TheSideBar @logout="handleLogout" />
    <div class="page-shell">
      <TheHeader title="Báo cáo phụ tùng" :show-search="false" @logout="handleLogout" />

      <main class="page">

        <div class="summary-grid">
          <div class="stat-card">
            <div class="stat-icon soft-blue"><i class="fas fa-cubes"></i></div>
            <div class="stat-label">Tổng phụ tùng</div>
            <div class="stat-value">{{ formatNumber(filteredParts.length) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon soft-green"><i class="fas fa-boxes-stacked"></i></div>
            <div class="stat-label">Giá trị tồn</div>
            <div class="stat-value">{{ formatCurrency(inventoryValue) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon soft-amber"><i class="fas fa-triangle-exclamation"></i></div>
            <div class="stat-label">Sắp hết (&#60; 10)</div>
            <div class="stat-value">{{ formatNumber(lowStockCount) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon soft-red"><i class="fas fa-ban"></i></div>
            <div class="stat-label">Hết hàng</div>
            <div class="stat-value">{{ formatNumber(outOfStockCount) }}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="panel chart-card">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Tồn kho</p>
                <h3>Tròn trạng thái</h3>
              </div>
              <span class="pill ghost">{{ formatNumber(filteredParts.length) }} phụ tùng</span>
            </div>
            <div class="donut-wrapper">
              <div class="donut" :style="donutStyle">
                <div class="donut-hole">
                  <strong>{{ formatNumber(filteredParts.length) }}</strong>
                  <small>mặt hàng</small>
                </div>
              </div>
              <div class="legend">
                <div class="legend-item">
                  <span class="legend-dot ok"></span>
                  <div>
                    <div class="legend-label">Còn hàng</div>
                    <div class="legend-meta">{{ formatNumber(inStockCount) }} ({{ percentStatus.inStock }}%)</div>
                  </div>
                </div>
                <div class="legend-item">
                  <span class="legend-dot low"></span>
                  <div>
                    <div class="legend-label">Sắp hết</div>
                    <div class="legend-meta">{{ formatNumber(lowStockCount) }} ({{ percentStatus.low }}%)</div>
                  </div>
                </div>
                <div class="legend-item">
                  <span class="legend-dot out"></span>
                  <div>
                    <div class="legend-label">Hết hàng</div>
                    <div class="legend-meta">{{ formatNumber(outOfStockCount) }} ({{ percentStatus.out }}%)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel chart-card">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Theo danh mục</p>
                <h3>Top thiếu hụt</h3>
              </div>
              <span class="pill ghost">Top 5 tồn thấp</span>
            </div>
            <div class="bar-chart">
              <div v-for="row in topLowStock" :key="row.key" class="bar">
                <div class="bar-label">
                  <strong>{{ row.name }}</strong>
                  <small class="muted">SL {{ row.quantity }}</small>
                </div>
                <div class="bar-track">
                  <span class="bar-fill danger" :style="{ width: row.percent + '%' }"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel table-card">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Chi tiết</p>
              <h3>Bảng phụ tùng</h3>
            </div>
            <span class="pill ghost">{{ filteredParts.length }} mục</span>
          </div>

          <div v-if="loading" class="state">
            <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
          </div>

          <div v-else-if="!pagedParts.length" class="state">
            <i class="fas fa-inbox"></i> Không có dữ liệu
          </div>

          <div v-else class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Mã</th>
                  <th>Danh mục</th>
                  <th>Tồn</th>
                  <th>Đơn giá</th>
                  <th>Giá trị tồn</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in pagedParts" :key="row.partId || row.id">
                  <td>{{ row.partName || 'N/A' }}</td>
                  <td>{{ row.partCode || 'N/A' }}</td>
                  <td>{{ row.partCategoryName || 'N/A' }}</td>
                  <td :class="row.partQuantity <= 0 ? 'text-danger' : row.partQuantity < 10 ? 'text-warning' : ''">
                    {{ formatNumber(row.partQuantity || 0) }} {{ row.partUnit || '' }}
                  </td>
                  <td>{{ row.partPrice != null ? formatCurrency(row.partPrice) : 'Chưa có giá' }}</td>
                  <td>{{ formatCurrency((row.partQuantity || 0) * (row.partPrice || 0)) }}</td>
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
                  / {{ filteredParts.length }} mục
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
import partService from '@/services/partV2'

const router = useRouter()
const menuItems = ref([])
const loading = ref(false)

const parts = ref([])
const filters = ref({
  search: '',
  minQuantity: null,
  maxPrice: null
})

const currentPage = ref(1)
const pageSize = ref(10)

const filteredParts = computed(() => {
  return parts.value.filter((p) => {
    const search = filters.value.search.trim().toLowerCase()
    if (search) {
      const haystack = `${p.partName || ''} ${p.partCode || ''} ${p.partCategoryName || ''}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    if (filters.value.minQuantity != null && p.partQuantity < filters.value.minQuantity) return false
    if (filters.value.maxPrice != null && p.partPrice != null && p.partPrice > filters.value.maxPrice) return false
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredParts.value.length / pageSize.value)))
const startIndex = computed(() => (filteredParts.value.length ? (currentPage.value - 1) * pageSize.value + 1 : 0))
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, filteredParts.value.length))
const pagedParts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredParts.value.slice(start, start + pageSize.value)
})

watch(
  () => filteredParts.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  }
)

const inStockCount = computed(() => filteredParts.value.filter((p) => (p.partQuantity || 0) >= 10).length)
const lowStockCount = computed(() => filteredParts.value.filter((p) => (p.partQuantity || 0) > 0 && p.partQuantity < 10).length)
const outOfStockCount = computed(() => filteredParts.value.filter((p) => (p.partQuantity || 0) <= 0).length)
const inventoryValue = computed(() =>
  filteredParts.value.reduce((sum, p) => sum + (p.partQuantity || 0) * (p.partPrice || 0), 0)
)

const percentStatus = computed(() => {
  const total = filteredParts.value.length || 1
  return {
    inStock: Math.round((inStockCount.value / total) * 100),
    low: Math.round((lowStockCount.value / total) * 100),
    out: Math.round((outOfStockCount.value / total) * 100)
  }
})

const topLowStock = computed(() => {
  return [...filteredParts.value]
    .sort((a, b) => (a.partQuantity || 0) - (b.partQuantity || 0))
    .slice(0, 5)
    .map((p) => ({
      key: p.partId || p.id || p.partCode || Math.random(),
      name: p.partName || 'N/A',
      quantity: p.partQuantity || 0,
      percent: Math.min(100, Math.round(((p.partQuantity || 0) / Math.max(1, maxQuantity.value)) * 100))
    }))
})

const maxQuantity = computed(() => Math.max(...filteredParts.value.map((p) => p.partQuantity || 0), 1))

const donutStyle = computed(() => {
  const segments = [
    { color: '#22c55e', value: inStockCount.value },
    { color: '#f59e0b', value: lowStockCount.value },
    { color: '#ef4444', value: outOfStockCount.value }
  ]
  const total = filteredParts.value.length || 1
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

const applyFilters = () => {
  currentPage.value = 1
}

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

const normalizePart = (item = {}) => ({
  partId: item.partId ?? item.id ?? item.part_id,
  partCode: item.partCode ?? item.code ?? item.part_code,
  partName: item.partName ?? item.name ?? item.part_name,
  partCategoryName: item.partCategoryName ?? item.category ?? item.partCategory ?? item.part_category,
  partQuantity: Number(item.partQuantity ?? item.quantity ?? item.qty ?? 0),
  partUnit: item.partUnit ?? item.unit ?? item.part_unit ?? '',
  partPrice: Number(item.partPrice ?? item.price ?? item.selling_price ?? item.importPrice ?? 0)
})

const loadData = async () => {
  try {
    loading.value = true
    const res = await partService.getPaging({ page: 1, pageSize: 500, direction: 'DESC' })
    const payload = res?.data?.data || res?.data || res || {}
    const items =
      (Array.isArray(payload) && payload) ||
      payload.items ||
      payload.data?.items ||
      payload.content ||
      payload.results ||
      payload.data ||
      []
    parts.value = Array.isArray(items) ? items.map(normalizePart) : []
  } catch (error) {
    console.warn('Load parts report failed', error)
    parts.value = []
  } finally {
    loading.value = false
  }
}

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0))
const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0))

const handleLogout = async () => {
  await authService.logout()
  router.push('/home')
}

onMounted(async () => {
  const user = authService.getCurrentUser()
  if (user) {
    menuItems.value = getMenuByRole(user.role)
  }
  await loadData()
})
</script>

<style scoped>
.parts-report-page {
  display: flex;
}
.page-shell {
  margin-left: 260px;
  width: 100%;
}
.page {
  padding-top: 90px;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 2rem;
  background: #f7f8fb;
  min-height: 100vh;
}
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.filters .filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  grid-column: span 2;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #eef0f4;
  box-shadow: 0 10px 30px rgba(31, 41, 55, 0.05);
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: white;
  margin-bottom: 0.6rem;
}
.soft-blue {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}
.soft-green {
  background: linear-gradient(135deg, #10b981, #34d399);
}
.soft-amber {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}
.soft-red {
  background: linear-gradient(135deg, #ef4444, #f87171);
}
.stat-label {
  color: #6b7280;
}
.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
}
.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.panel {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #eef0f4;
  box-shadow: 0 10px 30px rgba(31, 41, 55, 0.05);
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
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
.chart-card {
  min-height: 260px;
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
.legend-dot.ok {
  background: #22c55e;
}
.legend-dot.low {
  background: #f59e0b;
}
.legend-dot.out {
  background: #ef4444;
}
.legend-label {
  font-weight: 600;
}
.legend-meta {
  color: #6b7280;
}
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
.bar-fill.danger {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #f87171, #ef4444);
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
.text-danger {
  color: #dc2626;
}
.text-warning {
  color: #d97706;
}
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
  .filter-actions {
    grid-column: span 1;
    justify-content: flex-start;
  }
  .donut-wrapper {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}
</style>
