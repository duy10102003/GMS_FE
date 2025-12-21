<template>
  <div class="manager-parts-view">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader title="Quản lý phụ tùng" :show-search="false" :notifications="notifications" @logout="handleLogout" />

      <main class="main-content">
        <header class="page-header">
          <div>
            <p class="page-subtitle">Manager</p>
            <h1>Danh sách phụ tùng</h1>
            <p class="subtitle">Xem giá hiện tại, giá đã lên lịch và lịch sử hiệu lực giá.</p>
          </div>
        </header>

        <section class="filters-card">
          <div class="search-field">
            <i class="fas fa-search"></i>
            <input
              v-model.trim="searchKeyword"
              type="text"
              placeholder="Tìm theo mã, tên phụ tùng..."
              @keyup.enter.prevent
            />
          </div>
          <div class="status-tabs">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              class="status-tab"
              :class="{ active: statusFilter === tab.value }"
              @click="statusFilter = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
          <div class="filter-icons">
            <button type="button" class="icon-btn" title="Lọc nâng cao" @click="openFilterModal">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M3 5h18l-6.5 8v6l-5 2v-8L3 5z" fill="currentColor" />
              </svg>
            </button>
            <button type="button" class="icon-btn" title="Sắp xếp (mặc định DESC)">
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M10 4l4 4H6l4-4zm0 12l-4-4h8l-4 4z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </section>

        <section class="layout-grid">
          <div class="card table-card">
            <div class="card-header">
              <div>
                <h2>Danh sách phụ tùng</h2>
                <p class="subtitle">Hiển thị 3 mẫu dữ liệu mock.</p>
              </div>
              <div v-if="columnFilters.length" class="active-filters">
                <span class="filter-label">Đang áp dụng:</span>
                <div class="filter-tags">
                  <span v-for="filter in columnFilters" :key="filter.field" class="filter-tag">
                    {{ getFilterLabel(filter) }}
                    <button type="button" class="tag-close" aria-label="Xóa lọc" @click="removeFilter(filter.field)">
                      &times;
                    </button>
                  </span>
                </div>
                <button type="button" class="btn ghost sm" @click="clearAllFilters">Xóa tất cả</button>
              </div>
            </div>

            <div class="table-wrapper">
              <table class="parts-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mã phụ tùng</th>
                    <th>Tên phụ tùng</th>
                    <th>Danh mục</th>
                    <th>Đơn vị</th>
                    <th>Giá nhập</th>
                    <th>Giá bán</th>
                    <th>Hiệu lực</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="part in paginatedParts"
                    :key="part.partId"
                    :class="{ selected: selectedPart && selectedPart.partId === part.partId }"
                  >
                    <td>{{ part.partId }}</td>
                    <td>{{ part.partCode }}</td>
                    <td>{{ part.partName }}</td>
                    <td>{{ part.partCategory }}</td>
                    <td>{{ part.partUnit }}</td>
                    <td>{{ formatPrice(part.importPrice) }}</td>
                    <td>{{ formatPrice(part.currentPrice) }}</td>
                    <td>
                      <div class="effective">
                        <span class="tag neutral">Từ {{ formatDate(part.effectiveFrom) }}</span>
                        <span v-if="part.effectiveTo" class="tag neutral">Đến {{ formatDate(part.effectiveTo) }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="part.status === 'ACTIVE' ? 'success' : 'warning'">
                        {{ part.status }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button type="button" class="icon-btn view" title="Xem" @click="openDetail(part)">
                          <i class="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          class="icon-btn edit"
                          title="Sửa ngày hiệu lực"
                          @click="openDetail(part, { editEffective: true })"
                        >
                          <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          v-if="canActivateScheduled(part)"
                          type="button"
                          class="icon-btn activate"
                          :disabled="!canActivateScheduledToday(part)"
                          :title="canActivateScheduledToday(part) ? 'Kích hoạt giá SCHEDULED' : 'Chưa đến ngày hiệu lực'"
                          @click="requestActivateScheduled(part)"
                        >
                          <i class="fa-solid fa-circle-check"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pagination">
              <div class="pagination-info">
                Hiển thị {{ displayRange.start }} - {{ displayRange.end }} / {{ pagination.totalItems }} phụ tùng
              </div>
              <div class="pagination-controls">
                <button class="btn ghost" :disabled="pagination.page === 1" @click="goToPage(pagination.page - 1)">
                  Trước
                </button>
                <button
                  v-for="page in pageNumbers"
                  :key="page"
                  class="btn ghost"
                  :class="{ active: page === pagination.page }"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <button class="btn ghost" :disabled="pagination.page === totalPages" @click="goToPage(pagination.page + 1)">
                  Sau
                </button>
                <label class="page-size">
                  <span>Hiển thị</span>
                  <select v-model.number="pagination.size" @change="handlePageSizeChange">
                    <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
                  </select>
                  <span>/ trang</span>
                </label>
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>

    <teleport to="body">
      <div v-if="detailVisible && selectedPart" class="modal-overlay" @click.self="detailVisible = false; isEditEffective = false">
        <div class="modal-container detail-modal">
          <div class="modal-header">
            <div>
              <h3>Giá bán & lịch sử</h3>
              <p class="subtitle">Xem giá đang áp dụng và timeline đã nhập.</p>
            </div>
            <button class="close-btn" @click="detailVisible = false; isEditEffective = false" aria-label="Đóng">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <div v-if="loadingDetail" class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Đang tải...</span>
            </div>
            <template v-else>
              <div class="selected-info">
                <h3>{{ selectedPart.partName }}</h3>
                <p class="muted">
                  Mã: {{ selectedPart.partCode }} • Đơn vị: {{ selectedPart.partUnit }} • Danh mục: {{ selectedPart.partCategory }}
                </p>
                <div class="status-line">
                  <span class="badge" :class="selectedPart.currentStatus === 'ACTIVE' || selectedPart.status === 'ACTIVE' ? 'success' : selectedPart.currentStatus === 'SCHEDULED' || selectedPart.status === 'SCHEDULED' ? 'warning' : 'secondary'">
                    {{ selectedPart.currentStatus || selectedPart.status }}
                  </span>
                  <span class="muted">Giá hiện tại: {{ formatPrice(activePrice?.newPrice || activePrice?.price || selectedPart.currentPrice) }}</span>
                </div>
              </div>

            <div v-if="activePrice" class="current-block">
              <div>
                <p class="muted">Giá đang áp dụng</p>
                <h3 class="price-text">{{ formatPrice(activePrice.newPrice || activePrice.price) }}</h3>
                <p class="muted">
                  Hiệu lực từ: {{ formatDate(activePrice.effectiveFrom || activePrice.from) }}<span v-if="activePrice.effectiveTo || activePrice.to">
                    • Đến: {{ formatDate(activePrice.effectiveTo || activePrice.to) }}</span
                  >
                </p>
                <p class="muted">Giá nhập: {{ formatPrice(activePrice.purchasePrice) }}</p>
                <p class="muted">Trạng thái: <span class="tag success">ACTIVE</span></p>
                <p v-if="activePrice.modifiedByName" class="muted">Cập nhật bởi: {{ activePrice.modifiedByName }}</p>
              </div>
            </div>

            <div v-else class="current-block">
              <div>
                <p class="muted">Chưa có giá đang áp dụng</p>
                <p class="muted">Giá nhập: {{ formatPrice(selectedPart.importPrice) }}</p>
              </div>
            </div>

            <div v-if="isEditEffective" class="effective-edit">
              <label class="field">
                <span>Hiệu lực (ngày bắt đầu áp dụng)</span>
                <input v-model="editEffectiveDate" type="date" :min="todayISO" />
              </label>
              <button type="button" class="btn primary sm" @click="saveEffectiveDate">Lưu ngày hiệu lực</button>
            </div>

            <div v-if="scheduledPrice" class="scheduled-block">
              <div style="flex: 1;">
                <p class="muted">Lịch giá sắp áp dụng</p>
                <h3 class="price-text">{{ formatPrice(scheduledPrice.newPrice || scheduledPrice.price) }}</h3>
                <p class="muted">Giá nhập: {{ formatPrice(scheduledPrice.purchasePrice) }}</p>
                <p v-if="scheduledPrice.oldPrice" class="muted">Giá cũ: {{ formatPrice(scheduledPrice.oldPrice) }}</p>
                <p class="muted">Từ: {{ formatDate(scheduledPrice.effectiveFrom || scheduledPrice.from) }}</p>
                <p class="muted">Trạng thái: <span class="tag warning">SCHEDULED</span></p>
                <p v-if="scheduledPrice.modifiedByName" class="muted">Cập nhật bởi: {{ scheduledPrice.modifiedByName }}</p>
              </div>
              <div class="scheduled-actions">
                <button
                  type="button"
                  class="btn primary"
                  @click="requestActivateScheduled(selectedPart)"
                >
                  <i class="fa-solid fa-circle-check"></i>
                  Xác nhận kích hoạt ngay
                </button>
                <p class="muted" style="margin-top: 0.5rem; font-size: 0.85rem;">
                  Kích hoạt giá đã lên lịch
                </p>
              </div>
            </div>

            <div class="history">
              <div class="history-header">
                <h4>Lịch sử giá</h4>
                <span class="muted">Từ ngày - đến ngày</span>
              </div>
              <ul class="history-list">
                <li v-for="item in selectedPart.priceHistory" :key="item.priceHistoryId || item.id" class="history-item">
                  <div style="flex: 1;">
                    <div style="margin-bottom: 0.5rem;">
                      <strong style="font-size: 1.1rem;">{{ formatPrice(item.newPrice || item.price) }}</strong>
                      <span v-if="item.oldPrice" class="muted" style="margin-left: 0.5rem;">
                        (từ {{ formatPrice(item.oldPrice) }})
                      </span>
                    </div>
                    <p class="muted" style="margin-bottom: 0.25rem;">
                      {{ formatDate(item.effectiveFrom || item.from) }}
                      → {{ (item.effectiveTo || item.to) ? formatDate(item.effectiveTo || item.to) : 'Hiện tại' }}
                    </p>
                    <p v-if="item.purchasePrice" class="muted" style="font-size: 0.85rem;">
                      Giá nhập: {{ formatPrice(item.purchasePrice) }}
                    </p>
                    <p v-if="item.modifiedByName || item.modifiedBy" class="muted" style="font-size: 0.85rem;">
                      Cập nhật bởi: {{ item.modifiedByName || item.modifiedBy }}
                    </p>
                  </div>
                  <span class="tag" :class="item.status === 'ACTIVE' ? 'success' : item.status === 'SCHEDULED' ? 'warning' : 'secondary'">
                    {{ item.status }}
                  </span>
                </li>
              </ul>
            </div>
            </template>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showActivateModal && pendingActivation" class="modal-overlay" @click.self="closeActivateModal">
        <div class="modal-container confirm-modal">
          <div class="modal-header">
            <h3>Kích hoạt giá SCHEDULED</h3>
            <button class="close-btn" @click="closeActivateModal" aria-label="Đóng">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <p class="confirm-text">
              Kích hoạt giá cho <strong>{{ pendingActivation.partName }}</strong> từ ngày
              <strong>{{ formatDate(getScheduledPriceFor(pendingActivation)?.from || pendingActivation.effectiveFrom) }}</strong>?
            </p>
            <div class="modal-actions filter-modal-actions">
              <button type="button" class="btn ghost" @click="closeActivateModal">Hủy</button>
              <button type="button" class="btn primary" @click="activateScheduled(pendingActivation)">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showFilterModal" class="modal-overlay" @click.self="closeFilterModal">
        <div class="modal-container filter-modal" @click.stop>
          <div class="modal-header">
            <h3>Lọc nâng cao</h3>
            <button class="close-btn" @click="closeFilterModal" aria-label="Đóng">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <form class="filter-form" @submit.prevent="applyFilter">
              <label class="field">
                <span>Cột</span>
                <select v-model="filterForm.field" @change="filterForm.operator = isNumericField(filterForm.field) ? 'equals' : 'contains'">
                  <option value="partCode">Mã phụ tùng</option>
                  <option value="partName">Tên phụ tùng</option>
                  <option value="partCategoryName">Danh mục</option>
                  <option value="status">Trạng thái</option>
                  <option value="partPrice">Giá bán</option>
                  <option value="importPrice">Giá nhập</option>
                  <option value="partId">ID</option>
                </select>
              </label>

              <label class="field">
                <span>Toán tử</span>
                <select v-model="filterForm.operator">
                  <template v-if="isNumericField(filterForm.field)">
                    <option value="equals">Bằng</option>
                    <option value="not_equals">Không bằng</option>
                    <option value="greater_than">Lớn hơn</option>
                    <option value="less_than">Nhỏ hơn</option>
                    <option value="greater_or_equal">Lớn hơn hoặc bằng</option>
                    <option value="less_or_equal">Nhỏ hơn hoặc bằng</option>
                  </template>
                  <template v-else>
                    <option value="equals">Bằng</option>
                    <option value="not_equals">Không bằng</option>
                    <option value="contains">Chứa</option>
                    <option value="not_contains">Không chứa</option>
                    <option value="starts_with">Bắt đầu bằng</option>
                    <option value="ends_with">Kết thúc bằng</option>
                    <option value="empty">Rỗng</option>
                    <option value="not_empty">Không rỗng</option>
                  </template>
                </select>
              </label>

              <label v-if="!['empty', 'not_empty'].includes(filterForm.operator)" class="field">
                <span>Giá trị</span>
                <input
                  v-model.trim="filterForm.value"
                  :type="isNumericField(filterForm.field) ? 'number' : 'text'"
                  :placeholder="isNumericField(filterForm.field) ? 'Nhập số...' : 'Nhập giá trị...'"
                  :min="isNumericField(filterForm.field) ? 0 : undefined"
                />
              </label>

              <div class="modal-actions filter-modal-actions">
                <button type="button" class="btn ghost" @click="closeFilterModal">Hủy</button>
                <button type="submit" class="btn primary">Áp dụng</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </teleport>

    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsToast } from '@/components'
import { setToastInstance, useToast } from '@/composables/useToast'
import { getMenuByRole } from '@/utils/menu'
import authService from '@/services/auth'
import partService from '@/services/part'

const toastRef = ref(null)
const toast = useToast()

const sidebarCollapsed = ref(false)
const notifications = ref([])
const menuItems = ref([])

const searchKeyword = ref('')
const statusFilter = ref('ALL')
const statusTabs = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'SCHEDULED', label: 'SCHEDULED' },
  { value: 'PENDING', label: 'PENDING' }
]
const showFilterModal = ref(false)
const columnFilters = ref([])
const filterForm = ref({
  field: 'partName',
  operator: 'contains',
  value: ''
})
const editEffectiveDate = ref('')
const todayISO = new Date().toISOString().slice(0, 10)
const loadingDetail = ref(false)
const stockOutIdForEdit = ref(null)
const pagination = reactive({
  page: 1,
  size: 10,
  totalItems: 0
})
const pageSizeOptions = [5, 10, 15, 20]

const operatorLabels = {
  equals: '=',
  not_equals: '≠',
  contains: 'Chứa',
  not_contains: 'Không chứa',
  starts_with: 'Bắt đầu bằng',
  ends_with: 'Kết thúc bằng',
  empty: 'Rỗng',
  not_empty: 'Không rỗng',
  greater_than: '>',
  less_than: '<',
  greater_or_equal: '≥',
  less_or_equal: '≤'
}

const parts = ref([])

const selectedPart = ref(null)
const detailVisible = ref(false)
const isEditEffective = ref(false)
const showActivateModal = ref(false)
const pendingActivation = ref(null)

const totalPages = computed(() => {
  if (!pagination.size || pagination.size <= 0) return 1
  if (!pagination.totalItems) return 1
  return Math.max(1, Math.ceil(pagination.totalItems / pagination.size))
})

const pageNumbers = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i += 1) {
    pages.push(i)
  }

  return pages
})

const displayRange = computed(() => {
  if (!pagination.totalItems) {
    return { start: 0, end: 0 }
  }
  const start = (pagination.page - 1) * pagination.size + 1
  const end = Math.min(start + pagination.size - 1, pagination.totalItems)
  return { start, end }
})

const paginatedParts = computed(() => parts.value)

const scheduledPrice = computed(() => {
  if (!selectedPart.value) return null
  const scheduled = getScheduledPriceFor(selectedPart.value)
  if (!scheduled) return null

  // Map to normalized format for display
  return {
    ...scheduled,
    price: scheduled.newPrice || scheduled.price,
    from: scheduled.effectiveFrom || scheduled.from
  }
})

const activePrice = computed(() => {
  if (!selectedPart.value) return null
  const active = getActivePriceFor(selectedPart.value)
  if (!active) return null

  // Map to normalized format for display
  return {
    ...active,
    price: active.newPrice || active.price,
    from: active.effectiveFrom || active.from,
    to: active.effectiveTo || active.to
  }
})

const isNumericField = (field) => {
  const numericFields = ['partPrice', 'importPrice', 'partId']
  return numericFields.includes(field)
}

const formatPrice = (value) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('vi-VN').format(Number(value)) + ' ₫'
}

const formatDate = (value) => {
  if (!value) return '—'
  try {
    // Handle both ISO strings and date strings without timezone
    const dateObj = new Date(value)
    if (isNaN(dateObj.getTime())) return value
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj)
  } catch {
    return value
  }
}

const openDetail = async (part, { editEffective = false } = {}) => {
  if (selectedPart.value && selectedPart.value.partId === part.partId && detailVisible.value) {
    detailVisible.value = false
    return
  }
  selectedPart.value = part
  isEditEffective.value = editEffective
  detailVisible.value = false

  // Load price history from API
  loadingDetail.value = true
  try {
    const response = await partService.getPriceHistory(part.partId)
    const historyData = response?.data?.data || response?.data || {}

    // Update selectedPart with full data from API
    if (historyData) {
      selectedPart.value = {
        ...selectedPart.value,
        partCode: historyData.partCode || selectedPart.value.partCode,
        partName: historyData.partName || selectedPart.value.partName,
        partUnit: historyData.partUnit || selectedPart.value.partUnit,
        partCategoryName: historyData.partCategoryName || selectedPart.value.partCategoryName || selectedPart.value.partCategory,
        partCategory: historyData.partCategoryName || selectedPart.value.partCategoryName || selectedPart.value.partCategory,
        currentPrice: historyData.currentPrice || selectedPart.value.currentPrice,
        importPrice: historyData.importPrice || selectedPart.value.importPrice,
        currentStatus: historyData.currentStatus || selectedPart.value.status,
        status: historyData.currentStatus || selectedPart.value.status
      }
    }

    // Normalize price history items
    if (historyData.priceHistory && Array.isArray(historyData.priceHistory)) {
      selectedPart.value.priceHistory = normalizePriceHistoryItems(historyData.priceHistory)
    }

    // Set effective date for editing
    const scheduled = getScheduledPriceFor(selectedPart.value)
    editEffectiveDate.value = scheduled?.effectiveFrom || scheduled?.from
      ? new Date(scheduled.effectiveFrom || scheduled.from).toISOString().slice(0, 10)
      : (selectedPart.value?.effectiveFrom
        ? new Date(selectedPart.value.effectiveFrom).toISOString().slice(0, 10)
        : '')

    // Get stockOutId (partStockOutId) from multiple possible sources
    // Priority: 1. From part data (already has partStockOutId from list-with-price-info), 2. From historyData, 3. From price history items
    const foundStockOutId =
      part.partStockOutId || // First priority: from list API response
      part.stockOutId ||
      historyData.partStockOutId ||
      historyData.stockOutId ||
      scheduled?.partStockOutId ||
      scheduled?.stockOutId ||
      (historyData.priceHistory && historyData.priceHistory.length > 0
        ? (historyData.priceHistory.find(item => item.partStockOutId || item.stockOutId)?.partStockOutId ||
           historyData.priceHistory.find(item => item.partStockOutId || item.stockOutId)?.stockOutId)
        : null)

    stockOutIdForEdit.value = foundStockOutId || null

    // Log for debugging
    if (!stockOutIdForEdit.value) {
      console.warn('No partStockOutId found when opening detail:', {
        partId: part.partId,
        partPartStockOutId: part.partStockOutId,
        part,
        historyData,
        scheduled
      })
    } else {
      console.log('Found partStockOutId for update-effective-dates:', stockOutIdForEdit.value)
    }
  } catch (error) {
    toast.error(error?.message || 'Không thể tải lịch sử giá')
    console.error('Error loading price history:', error)
    // Try to get stockOutId from part data as fallback
    stockOutIdForEdit.value = part.stockOutId || part.partStockOutId || null
  } finally {
    loadingDetail.value = false
  }

  nextTick(() => {
    detailVisible.value = true
  })
}

const getScheduledPriceFor = (part) => {
  if (!part?.priceHistory) return null
  return part.priceHistory.find((item) => item.status === 'SCHEDULED') || null
}

const getActivePriceFor = (part) => {
  if (!part?.priceHistory) return null
  return part.priceHistory.find((item) => item.status === 'ACTIVE') || null
}

const canActivateScheduled = (part) => {
  if (!part) return false
  if (part.status === 'SCHEDULED' || part.currentStatus === 'SCHEDULED') return true
  return Boolean(getScheduledPriceFor(part))
}

const canActivateScheduledToday = (part) => {
  const scheduled = getScheduledPriceFor(part)
  const effectiveFrom = scheduled?.effectiveFrom || scheduled?.from || part?.effectiveFrom
  if (!effectiveFrom) return false

  // Extract date part (YYYY-MM-DD) from effectiveFrom
  const dateStr = String(effectiveFrom).split('T')[0]
  const [year, month, day] = dateStr.split('-').map(Number)

  // Get current date in UTC+7 (Vietnam timezone)
  const now = new Date()
  // Convert to UTC+7: get UTC time and add 7 hours
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)
  const vietnamTime = new Date(utcTime + (7 * 60 * 60 * 1000))

  // Get today's date components in UTC+7
  const todayYear = vietnamTime.getUTCFullYear()
  const todayMonth = vietnamTime.getUTCMonth() // 0-11
  const todayDay = vietnamTime.getUTCDate()

  // Compare dates directly: scheduled date (year, month-1, day) vs today (todayYear, todayMonth, todayDay)
  // scheduled month is 1-based (1-12), convert to 0-based (0-11) for comparison
  const scheduledMonth = month - 1

  let canActivate = false

  if (year < todayYear) {
    canActivate = true // Past year
  } else if (year === todayYear) {
    if (scheduledMonth < todayMonth) {
      canActivate = true // Past month
    } else if (scheduledMonth === todayMonth) {
      canActivate = day <= todayDay // Today or past day in same month
    }
    // else future month, canActivate stays false
  }
  // else future year, canActivate stays false

  console.log('Checking canActivateScheduledToday (UTC+7):', {
    effectiveFrom,
    scheduledDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    todayDate: `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`,
    canActivate,
    year,
    month: scheduledMonth,
    day,
    todayYear,
    todayMonth,
    todayDay
  })

  return canActivate
}


const requestActivateScheduled = async (part) => {
  if (!part?.partId) return

  let scheduled = getScheduledPriceFor(part)

  if (!scheduled) {
    try {
      const historyResponse = await partService.getPriceHistory(part.partId)
      const historyData = historyResponse?.data?.data || historyResponse?.data || {}
      const historyItems = Array.isArray(historyData.priceHistory)
        ? normalizePriceHistoryItems(historyData.priceHistory)
        : []
      part.priceHistory = historyItems
      scheduled = getScheduledPriceFor(part)
    } catch (error) {
      console.error('Error loading price history before activation:', error)
    }
  }

  if (!scheduled && part.status !== 'SCHEDULED' && part.currentStatus !== 'SCHEDULED') {
    toast.error('Không tìm thấy giá đã lên lịch')
    return
  }

  pendingActivation.value = part
  showActivateModal.value = true
}

const closeActivateModal = () => {
  showActivateModal.value = false
  pendingActivation.value = null
}

const activateScheduled = async (part) => {
  if (!part?.partId) return

  try {
    await partService.confirmScheduledPrice(part.partId)

    // Update local state
    const scheduled = getScheduledPriceFor(part)
    if (scheduled) {
      scheduled.status = 'ACTIVE'
    }
    const active = getActivePriceFor(part)
    if (active && active !== scheduled) {
      active.status = 'EXPIRED'
      active.to = todayISO
    }

    part.status = 'ACTIVE'
    if (scheduled) {
      part.currentPrice = scheduled.price
      part.effectiveFrom = scheduled.from
      part.effectiveTo = scheduled.to || null
    }

    toast.success('Đã kích hoạt giá SCHEDULED thành công')
    closeActivateModal()

    // Reload parts list to reflect changes
    await loadParts()
  } catch (error) {
    toast.error(error?.message || 'Không thể kích hoạt giá SCHEDULED')
    console.error('Error activating scheduled price:', error)
  }
}

const handleLogout = async () => {
  await authService.logout(true)
}

const saveEffectiveDate = async () => {
  if (!selectedPart.value || !editEffectiveDate.value) {
    toast.error('Vui lòng chọn ngày hiệu lực')
    return
  }

  // Try to get stockOutId (partStockOutId) from multiple sources if not already set
  // Priority: 1. Already set from openDetail, 2. From part data (from list-with-price-info API), 3. From price history
  let stockOutId = stockOutIdForEdit.value

  if (!stockOutId) {
    // First priority: Get from part data (from list-with-price-info API which includes partStockOutId)
    stockOutId = selectedPart.value.partStockOutId || selectedPart.value.stockOutId

    // Second priority: Try to get from scheduled price
    if (!stockOutId && scheduledPrice.value) {
      stockOutId = scheduledPrice.value.partStockOutId || scheduledPrice.value.stockOutId
    }

    // Third priority: Try to get from price history items
    if (!stockOutId && selectedPart.value.priceHistory && selectedPart.value.priceHistory.length > 0) {
      const historyItem = selectedPart.value.priceHistory.find(item =>
        item.partStockOutId || item.stockOutId
      )
      stockOutId = historyItem?.partStockOutId || historyItem?.stockOutId
    }
  }

  if (!stockOutId) {
    toast.error('Không tìm thấy thông tin partStockOutId để cập nhật. Vui lòng thử lại sau khi tải lại dữ liệu.')
    console.warn('No partStockOutId found for part:', {
      partId: selectedPart.value?.partId,
      partPartStockOutId: selectedPart.value?.partStockOutId,
      part: selectedPart.value,
      scheduledPrice: scheduledPrice.value,
      priceHistory: selectedPart.value?.priceHistory,
      stockOutIdForEdit: stockOutIdForEdit.value
    })
    return
  }

  console.log('Using partStockOutId for update-effective-dates:', stockOutId)

  try {
    // Format date to ISO 8601 with timezone (e.g., "2025-12-30T00:00:00.000Z")
    // Use UTC time to avoid timezone conversion issues - preserve the exact date user selected
    const dateValue = editEffectiveDate.value // Format: YYYY-MM-DD
    const [year, month, day] = dateValue.split('-').map(Number)

    // Create date at midnight UTC (00:00:00.000Z) to preserve the selected date
    // This ensures user selects "2025-12-30" -> sends "2025-12-30T00:00:00.000Z" (not day 29)
    const effectiveFromISO = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString()

    console.log('Date conversion for update-effective-dates:', {
      selectedDate: dateValue,
      effectiveFromISO,
      partId: selectedPart.value.partId
    })

    const payload = {
      items: [
        {
          partId: selectedPart.value.partId,
          effectiveFrom: effectiveFromISO
        }
      ]
    }

    console.log('Updating effective date:', { stockOutId, payload })

    const response = await partService.updateEffectiveDates(stockOutId, payload)

    // Check response for success message
    const responseData = response?.data || response
    if (responseData.success || responseData.message) {
      toast.success(responseData.message || 'Đã cập nhật ngày hiệu lực thành công')
    } else {
      toast.success('Đã cập nhật ngày hiệu lực thành công')
    }

    // Update stockOutId for future edits
    stockOutIdForEdit.value = stockOutId

    // Reload price history to get updated data - this will trigger computed to recalculate
    if (selectedPart.value?.partId) {
      try {
        const historyResponse = await partService.getPriceHistory(selectedPart.value.partId)
        const historyData = historyResponse?.data?.data || historyResponse?.data || {}

        // Update selectedPart with full data from API
        if (historyData) {
          selectedPart.value = {
            ...selectedPart.value,
            partCode: historyData.partCode || selectedPart.value.partCode,
            partName: historyData.partName || selectedPart.value.partName,
            partUnit: historyData.partUnit || selectedPart.value.partUnit,
            partCategoryName: historyData.partCategoryName || selectedPart.value.partCategoryName || selectedPart.value.partCategory,
            partCategory: historyData.partCategoryName || selectedPart.value.partCategoryName || selectedPart.value.partCategory,
            currentPrice: historyData.currentPrice || selectedPart.value.currentPrice,
            importPrice: historyData.importPrice || selectedPart.value.importPrice,
            currentStatus: historyData.currentStatus || selectedPart.value.status,
            status: historyData.currentStatus || selectedPart.value.status
          }
        }

        // Normalize price history items with updated effectiveFrom
        if (historyData.priceHistory && Array.isArray(historyData.priceHistory)) {
          selectedPart.value.priceHistory = normalizePriceHistoryItems(historyData.priceHistory)

          // Update editEffectiveDate to match the updated scheduled price
          const updatedScheduled = selectedPart.value.priceHistory.find(item => item.status === 'SCHEDULED')
          if (updatedScheduled) {
            editEffectiveDate.value = updatedScheduled.effectiveFrom || updatedScheduled.from
              ? new Date(updatedScheduled.effectiveFrom || updatedScheduled.from).toISOString().slice(0, 10)
              : editEffectiveDate.value
          }
        }

        // Update stockOutId from reloaded data if available
        if (historyData.stockOutId || historyData.partStockOutId) {
          stockOutIdForEdit.value = historyData.stockOutId || historyData.partStockOutId
        }

         // Force Vue to reactively update - this ensures computed properties recalculate
         const scheduled = getScheduledPriceFor(selectedPart.value)
         console.log('Price history reloaded after effective date update:', {
           scheduledPrice: scheduled,
           effectiveFrom: scheduled?.effectiveFrom || scheduled?.from,
           canActivate: canActivateScheduledToday(selectedPart.value),
           today: new Date().toISOString().slice(0, 10)
         })

         // Auto-confirm scheduled price if effective date is today or in the past
         if (scheduled && canActivateScheduledToday(selectedPart.value)) {
           try {
             console.log('Auto-confirming scheduled price because effective date is today or past')
             await partService.confirmScheduledPrice(selectedPart.value.partId)

             // Reload price history again to get updated status
             const confirmResponse = await partService.getPriceHistory(selectedPart.value.partId)
             const confirmHistoryData = confirmResponse?.data?.data || confirmResponse?.data || {}

             if (confirmHistoryData.priceHistory && Array.isArray(confirmHistoryData.priceHistory)) {
               selectedPart.value.priceHistory = normalizePriceHistoryItems(confirmHistoryData.priceHistory)
               selectedPart.value.currentStatus = confirmHistoryData.currentStatus || 'ACTIVE'
               selectedPart.value.status = confirmHistoryData.currentStatus || 'ACTIVE'
             }

             toast.success('Đã tự động kích hoạt giá vì ngày hiệu lực là hôm nay')
           } catch (confirmError) {
             console.warn('Could not auto-confirm scheduled price:', confirmError)
             // Don't show error toast, just log it
           }
         }
       } catch (historyError) {
         console.warn('Could not reload price history:', historyError)
       }
     }
   } catch (error) {
     const errorMsg = error?.response?.data?.message || error?.message || 'Không thể cập nhật ngày hiệu lực'
     toast.error(errorMsg)
     console.error('Error updating effective date:', error)
   }
 }

const getFilterLabel = (filter) => {
  const fieldLabels = {
    partCode: 'Mã phụ tùng',
    partName: 'Tên phụ tùng',
    partCategoryName: 'Danh mục',
    status: 'Trạng thái',
    partPrice: 'Giá bán',
    importPrice: 'Giá nhập',
    partId: 'ID'
  }
  const label = fieldLabels[filter.field] || filter.field
  const opLabel = operatorLabels[filter.operator] || filter.operator
  return `${label}: ${opLabel} ${filter.value || ''}`
}

const openFilterModal = () => {
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

const applyFilter = () => {
  const { field, operator } = filterForm.value
  let { value } = filterForm.value
  if (!field || !operator) return
  if (['empty', 'not_empty'].includes(operator)) {
    value = ''
  } else if (!value && value !== 0) {
    toast.error('Vui lòng nhập giá trị lọc')
    return
  }

  // Convert numeric value to number if field is numeric
  const processedValue = isNumericField(field) && value !== ''
    ? Number(value)
    : value?.toString().trim() || ''

  columnFilters.value = [
    ...columnFilters.value.filter((f) => f.field !== field),
    { field, operator, value: processedValue }
  ]
  pagination.page = 1
  loadParts()
  closeFilterModal()
}

const clearAllFilters = () => {
  columnFilters.value = []
  pagination.page = 1
  loadParts()
}

const removeFilter = (field) => {
  columnFilters.value = columnFilters.value.filter((f) => f.field !== field)
  pagination.page = 1
  loadParts()
}

const normalizePartItem = (item = {}) => ({
  ...item,
  partCategory: item.partCategoryName || item.partCategory || '',
  currentPrice: item.partPrice ?? item.currentPrice ?? item.sellingPrice ?? null,
  priceHistory: Array.isArray(item.priceHistory) ? item.priceHistory : [],
  // Preserve partStockOutId from API response (this is the ID needed for update-effective-dates)
  partStockOutId: item.partStockOutId || item.stockOutId || null,
  stockOutId: item.partStockOutId || item.stockOutId || null // Alias for compatibility
})

const normalizePriceHistoryItems = (priceHistory = []) => priceHistory.map(item => ({
  id: item.priceHistoryId || item.id,
  priceHistoryId: item.priceHistoryId || item.id,
  price: item.newSellingPrice || item.price || item.sellingPrice,
  purchasePrice: item.purchasePrice,
  oldPrice: item.oldSellingPrice,
  newPrice: item.newSellingPrice,
  from: item.effectiveFrom,
  effectiveFrom: item.effectiveFrom,
  to: item.effectiveTo,
  effectiveTo: item.effectiveTo,
  status: item.status,
  modifiedBy: item.modifiedByName || item.modifiedBy,
  modifiedByName: item.modifiedByName || item.modifiedBy
}))

const loadParts = async () => {
  try {
    // Build column filters from advanced filters
    const payloadFilters = columnFilters.value.map((filter) => ({
      columnName: filter.field,
      operator: filter.operator,
      value: isNumericField(filter.field) ? String(filter.value) : filter.value
    }))

    // Add status filter if not ALL
    if (statusFilter.value && statusFilter.value !== 'ALL') {
      payloadFilters.push({
        columnName: 'status',
        operator: 'equals',
        value: statusFilter.value
      })
    }

    // Build request payload with keyword separate from columnFilters
    const requestPayload = {
      page: pagination.page,
      pageSize: pagination.size,
      keyword: searchKeyword.value?.trim() || '', // Keyword is sent separately for search
      columnFilters: payloadFilters,
      columnSorts: [
        {
          columnName: 'partId',
          sortDirection: 'desc'
        }
      ]
    }

    const response = await partService.listWithPriceInfo(requestPayload)
    const raw = response?.data || {}
    const dataset = raw?.data || raw
    const items = Array.isArray(dataset) ? dataset : dataset.items || []

    parts.value = items.map((item) => normalizePartItem(item))

    const total = dataset.totalItems ?? dataset.total ?? items.length
    pagination.totalItems = Number(total) || 0
    pagination.size = dataset.size ?? requestPayload.pageSize ?? pagination.size
    const responsePage = Number(dataset.page)
    const resolvedPage = Number.isFinite(responsePage) && responsePage > 0
      ? responsePage
      : requestPayload.page
    pagination.page = pagination.totalItems === 0 ? 1 : Math.max(1, resolvedPage)
  } catch (error) {
    parts.value = []
    pagination.totalItems = 0
    pagination.page = 1
    toast.error(error?.message || 'Không thể tải danh sách phụ tùng')
  }
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  pagination.page = page
  loadParts()
}

const handlePageSizeChange = () => {
  if (!pagination.size || pagination.size <= 0) {
    pagination.size = 10
  }
  pagination.page = 1
  loadParts()
}

const initMenu = () => {
  const user = authService.getCurrentUser()
  if (user?.role) {
    menuItems.value = getMenuByRole(user.role)
  }
}

watch([searchKeyword, statusFilter], () => {
  pagination.page = 1
  loadParts()
})

watch(columnFilters, () => {
  pagination.page = 1
  loadParts()
}, { deep: true })

watch(() => pagination.size, () => {
  pagination.page = 1
  loadParts()
})

onMounted(() => {
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }
  initMenu()
  loadParts()
})
</script>

<style scoped>
.manager-parts-view {
  min-height: 100vh;
  background: #f7f8fa;
}

.content-wrapper {
  min-height: 100vh;
}

.main-content {
  padding: 2rem;
  margin-top: 70px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.page-subtitle {
  margin: 0;
  color: #6b7280;
  font-weight: 600;
}

.page-header h1 {
  margin: 0.25rem 0;
}

.subtitle {
  margin: 0.1rem 0 0;
  color: #6b7280;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.filters-card {
  background: #fff;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  min-width: 260px;
}

.search-field input {
  border: none;
  outline: none;
  width: 100%;
}

.status-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-tab {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-tab.active {
  background: #ff7a00;
  color: #fff;
  border-color: #ff7a00;
}

.filter-icons {
  display: inline-flex;
  gap: 0.35rem;
  margin-left: auto;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: #374151;
}

.filter-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  color: #1f2937;
}

.tag-close {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tag-close:hover {
  color: #ef4444;
}

.layout-grid {
  display: flex;
  gap: 1rem;
  position: relative;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.table-card {
  width: 100%;
}

.table-wrapper {
  overflow: visible;
}

.parts-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.parts-table th,
.parts-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f0f1f5;
  text-align: left;
  white-space: normal;
  font-size: 1rem;
  word-break: break-word;
}

.action-buttons {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.icon-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 0.3rem 0.45rem;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  color: #111827;
  border-color: #cbd5f5;
}

.icon-btn.view {
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.3);
}

.icon-btn.edit {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.35);
}

.icon-btn.activate {
  color: #059669;
  border-color: rgba(5, 150, 105, 0.35);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-modal {
  width: min(90vw, 460px);
}

.confirm-text {
  margin: 0 0 1rem;
  color: #374151;
}
.parts-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-controls .btn.active {
  background: #ff7a00;
  border-color: #ff7a00;
  color: #fff;
}

.page-size {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.page-size select {
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.parts-table tr.selected {
  background: rgba(255, 122, 0, 0.05);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.badge.success {
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
}

.badge.warning {
  background: rgba(234, 179, 8, 0.15);
  color: #854d0e;
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.55rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 0.8rem;
  color: #374151;
}

.tag.neutral {
  background: #f9fafb;
}

.tag.success {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.tag.warning {
  background: rgba(234, 179, 8, 0.15);
  border-color: rgba(234, 179, 8, 0.3);
}

.tag.secondary {
  background: rgba(108, 117, 125, 0.15);
  border-color: rgba(108, 117, 125, 0.3);
  color: #495057;
}

.detail-card h3 {
  margin: 0 0 0.2rem;
}

.muted {
  color: #6b7280;
  font-size: 0.95rem;
}

.current-block,
.scheduled-block {
  margin-top: 0.75rem;
  padding: 0.9rem;
  border: 1px solid #f0f1f5;
  border-radius: 12px;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.scheduled-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 200px;
}

.price-text {
  margin: 0.1rem 0;
}

.effective-edit {
  margin-top: 0.75rem;
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.effective-edit .field {
  min-width: 220px;
}

.status-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.95rem;
}

.field input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.field.required span::after {
  content: '*';
  color: #ef4444;
  margin-left: 4px;
}

.note {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: #fff7ed;
  color: #9a3412;
  border: 1px solid #fed7aa;
}

.form-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn.primary {
  background: #ff7a00;
  color: #fff;
}

.btn.ghost {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.btn.sm {
  padding: 0.4rem 0.7rem;
}

.btn.primary:hover {
  background: #f97316;
}

.btn.ghost:hover {
  border-color: #ff7a00;
  color: #ff7a00;
}

.history {
  margin-top: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  padding: 0.75rem;
  border: 1px solid #f0f1f5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.effective {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-modal {
  width: min(92vw, 860px);
}

.detail-modal .modal-body {
  max-height: calc(90vh - 180px);
  overflow-y: auto;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: #fff;
  border-radius: 16px;
  width: min(90vw, 420px);
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.25rem 1.25rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f1f5;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  font-size: 2rem;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #ef4444;
}

.modal-body {
  padding: 1.25rem;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.filter-form .field + .field {
  margin-top: 1rem;
}

.filter-modal-actions {
  justify-content: flex-end;
  align-items: center;
  border-top: none;
  padding-top: 0;
  margin-top: 1rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

@media (max-width: 1100px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
