<template>
  <div class="customer-warranty-view">
    <TheSideBar @logout="handleLogout" />
    <div class="dashboard-customer-body">
      <TheHeader
        title="Bảo hành của tôi"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />

      <main class="main-content">
        <div class="toolbar">
          <div class="toolbar-left">
            <GmsInput
              v-model="searchQuery"
              placeholder="Tìm theo phụ tùng, biển số..."
              prefix-icon="fa-search"
              :clearable="true"
              class="search-input"
              @input="handleSearch"
            />
          </div>
        </div>

        <div class="table-container">
          <GmsTable
            :data="warranties"
            :columns="columns"
            title="Danh sách bảo hành"
            :loading="loading"
            :pagination="false"
            :scrollable="true"
          >
            <template #cell-part="{ row }">
              <div class="part-cell">
                <div class="part-name">{{ row.partName }}</div>
                <div class="part-code">{{ row.partCode }}</div>
              </div>
            </template>

            <template #cell-vehicle="{ row }">
              <span class="plate-pill">{{ row.vehicleLicensePlate }}</span>
            </template>

            <template #cell-startDate="{ row }">
              {{ formatDate(row.startDate) }}
            </template>

            <template #cell-endDate="{ row }">
              {{ formatDate(row.endDate) }}
            </template>

            <template #cell-status="{ row }">
              <span :class="`badge badge-${getStatusColor(row.status)}`">
                {{ getStatusLabel(row.status) }}
              </span>
            </template>
          </GmsTable>
        </div>

        <div v-if="totalItems > 0" class="pagination mt-4">
          <div class="pagination-left">
            <div class="pagination-info">
              Hiển thị {{ startIndex + 1 }}-{{ endIndex }} trong tổng
              {{ totalItems }} bảo hành
            </div>
            <div class="pagination-size">
              <label>Số lượng/trang:</label>
              <select v-model.number="pageSize" class="page-size-select" @change="handlePageSizeChange">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="15">15</option>
                <option :value="20">20</option>
              </select>
            </div>
          </div>
          <div class="pagination-controls">
            <GmsButton
              variant="outline"
              size="small"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <i class="fas fa-chevron-left" />
            </GmsButton>

            <div class="pagination-pages">
              <button
                v-for="page in visiblePages"
                :key="page"
                class="pagination-page"
                :class="{ active: page === currentPage }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>

            <GmsButton
              variant="outline"
              size="small"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <i class="fas fa-chevron-right" />
            </GmsButton>
          </div>
        </div>

        <div v-else-if="!loading" class="empty-state">
          <i class="fas fa-shield-alt" />
          <p>Bạn chưa có bảo hành nào.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsInput, GmsButton, GmsTable } from '@/components'
import { useToast } from '@/composables/useToast'
import authService from '@/services/auth'
import warrantyService from '@/services/warranty'

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const warranties = ref([])
const notifications = ref([])
const searchQuery = ref('')

const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

const columns = [
  { key: 'part', label: 'Phụ tùng' },
  { key: 'vehicle', label: 'Biển số' },
  { key: 'startDate', label: 'Bắt đầu' },
  { key: 'endDate', label: 'Kết thúc' },
  { key: 'status', label: 'Trạng thái' }
]

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value) || 1)

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, totalItems.value))

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('vi-VN')
}

const getStatusLabel = (status) => {
  if (status === 0) return 'Còn hiệu lực'
  if (status === 1) return 'Hết hạn'
  return 'Không xác định'
}

const getStatusColor = (status) => {
  if (status === 0) return 'success'
  if (status === 1) return 'danger'
  return 'secondary'
}

const buildFilters = () => {
  const filters = []
  const q = searchQuery.value.trim()
  if (q) {
    filters.push({
      columnName: 'PartCode',
      operator: 'contains',
      value: q
    })
    filters.push({
      columnName: 'VehicleLicensePlate',
      operator: 'contains',
      value: q
    })
  }
  return filters
}

const loadWarranties = async () => {
  try {
    loading.value = true
    const currentUser = authService.getCurrentUser()
    if (!currentUser?.userId) {
      toast.error('Không tìm thấy thông tin người dùng')
      return
    }

    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      columnFilters: buildFilters(),
      columnSorts: [{ columnName: 'EndDate', sortDirection: 'DESC' }]
    }

    const res = await warrantyService.getPagingByCustomer(currentUser.userId, params)
    const payload = res.data || res

    warranties.value = payload.items || []
    totalItems.value = payload.total || 0
  } catch (error) {
    console.error('Error loading warranties:', error)
    toast.error('Không tải được danh sách bảo hành', error.message || error.userMsg || '')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadWarranties()
}

const handlePageSizeChange = () => {
  currentPage.value = 1
  loadWarranties()
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadWarranties()
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

onMounted(loadWarranties)
</script>

<style scoped>
.customer-warranty-view {
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
  padding: 1.5rem;
  padding-top: 4.5rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-input {
  width: 320px;
}

.table-container {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.part-name {
  font-weight: 600;
}

.part-code {
  font-size: 0.85rem;
  color: #6b7280;
}

.plate-pill {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 600;
  font-size: 0.85rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.pagination-info {
  font-size: 0.9rem;
  color: #6b7280;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.page-size-select {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-page {
  min-width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
}

.pagination-page.active {
  background: var(--primary, #ff7a00);
  color: #fff;
  border-color: var(--primary, #ff7a00);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
</style>

