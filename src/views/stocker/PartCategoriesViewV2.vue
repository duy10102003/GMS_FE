<template>
  <div class="part-categories-v2">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Danh mục phụ tùng"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />

      <main class="main-content">
        <header class="page-header">
          <div>
            <h1>Danh mục phụ tùng cho Stocker</h1>
          </div>
          <button type="button" class="btn primary" @click="openCreateModal">
            Tạo danh mục mới
          </button>
        </header>

        <section class="card filters-card">
          <div class="card-header">
            <div>
              <h2>Tìm kiếm danh mục</h2>
              <p class="subtitle">Lọc nhanh theo mã hoặc tên danh mục.</p>
            </div>
            <div class="filter-actions">
              <button type="button" class="btn ghost" @click="resetFilters">Làm mới</button>
              <button type="button" class="btn secondary" @click="handleSearch">Tìm kiếm</button>
            </div>
          </div>
          <div class="filters">
            <label class="field">
              <input
                v-model.trim="filters.keyword"
                type="text"
                placeholder="Tìm theo tên hoặc mã danh mục..."
                @keyup.enter="handleSearch"
              />
            </label>
          </div>
        </section>


        <section class="card table-card">
          <div class="card-header">
            <div>
              <h2>Danh sách danh mục phụ tùng</h2>
              <p class="subtitle">Có {{ pagination.totalItems }} danh mục được tìm thấy.</p>
            </div>
          </div>

          <div v-if="loading" class="status">Đang tải dữ liệu...</div>
          <div v-else-if="listError" class="status error">{{ listError }}</div>

          <div v-else>
            <div v-if="columnFilters.length" class="active-filters">
              <span class="filter-label">Đang áp dụng:</span>
              <div class="filter-tags">
                <span v-for="filter in columnFilters" :key="filter.columnName" class="filter-tag">
                  {{ getFilterLabel(filter) }}
                  <button
                    type="button"
                    class="tag-close"
                    aria-label="Xóa lọc"
                    @click="removeFilter(filter)"
                  >
                    &times;
                  </button>
                </span>
              </div>
              <button type="button" class="btn ghost" @click="clearAllColumnFilters">
                Xóa tất cả
              </button>
            </div>

            <table class="category-table">
              <thead>
                <tr>
                  <th v-for="column in tableColumns" :key="column.key">
                    <div class="th-content">
                      <span>{{ column.label }}</span>
                      <div v-if="column.sortable || column.filterable" class="th-actions">
                        <button
                          v-if="column.sortable"
                          type="button"
                          class="icon-btn"
                          :class="{ active: isSortedColumn(column) }"
                          :title="isSortedColumn(column) ? `Sắp xếp ${sortConfig.direction}` : 'Sắp xếp'"
                          @click="handleSortClick(column)"
                        >
                          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                            <path d="M10 4l4 4H6l4-4zm0 12l-4-4h8l-4 4z" fill="currentColor" />
                          </svg>
                          <span v-if="isSortedColumn(column)" class="sort-label">{{ sortConfig.direction }}</span>
                        </button>
                        <button
                          v-if="column.filterable"
                          type="button"
                          class="icon-btn"
                          :class="{ active: hasFilter(column) }"
                          title="Bộ lọc"
                          @click="openColumnFilter(column)"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M3 5h18l-6.5 8v6l-5 2v-8L3 5z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in categories" :key="item.partCategoryId">
                  <td v-for="column in tableColumns" :key="column.key">
                    <span
                      v-if="column.key === 'status'"
                      :class="[
                        'badge',
                        (item.status || '').toUpperCase() === 'ACTIVE' ? 'success' : 'secondary'
                      ]"
                    >
                      {{ item.status || 'N/A' }}
                    </span>
                    <div v-else-if="column.key === 'actions'" class="action-buttons">
                      <button type="button" class="icon-btn" title="Xem chi tiết" @click="openViewModal(item)">
                        <i class="fa-solid fa-eye"></i>
                      </button>
                      <button type="button" class="icon-btn" title="Chỉnh sửa" @click="openEditModal(item)">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                    </div>
                    <span v-else>{{ getCellValue(item, column) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="showEmptyState" class="empty-state">
              Không có danh mục nào phù hợp với điều kiện tìm kiếm.
            </div>

            <div v-if="!showEmptyState && pagination.totalItems > 0" class="pagination">
              <div class="pagination-info">
                Hiển thị {{ displayRange.start }} - {{ displayRange.end }} / {{ pagination.totalItems }} danh mục
              </div>
              <div class="pagination-controls">
                <button
                  class="btn ghost"
                  :disabled="currentPage === 1"
                  @click="goToPage(currentPage - 1)"
                >
                  Trước
                </button>
                <button
                  v-for="page in pageNumbers"
                  :key="page"
                  class="btn ghost"
                  :class="{ active: page === currentPage }"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <button
                  class="btn ghost"
                  :disabled="currentPage === totalPages"
                  @click="goToPage(currentPage + 1)"
                >
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
      <div v-if="isModalOpen" class="modal-overlay">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3>{{ modalMode === 'edit' ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới' }}</h3>
            <button class="close-btn" @click="closeModal" aria-label="Đóng">
              &times;
            </button>
          </div>

          <div class="modal-body">
            <form class="form-grid" @submit.prevent="handleSubmit">
              <label class="field required">
                <span>Mã danh mục</span>
                <input
                  v-model.trim="formData.partCategoryCode"
                  type="text"
                  maxlength="50"
                  placeholder="VD: OIL"
                  required
                  autofocus
                />
              </label>

              <label class="field required">
                <span>Tên danh mục</span>
                <input
                  v-model.trim="formData.partCategoryName"
                  type="text"
                  maxlength="300"
                  placeholder="VD: Dầu động cơ"
                  required
                />
              </label>

              <label class="field">
                <span>Mô tả</span>
                <textarea
                  v-model.trim="formData.partCategoryDiscription"
                  rows="3"
                  maxlength="300"
                  placeholder="Ghi chú mô tả ngắn"
                ></textarea>
              </label>

              <label class="field">
                <span>Số điện thoại</span>
                <input
                  v-model.trim="formData.partCategoryPhone"
                  type="text"
                  maxlength="11"
                  placeholder="VD: 09012345671"
                />
              </label>

              <label class="field">
                <span>Trạng thái</span>
                <select v-model="formData.status">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </label>

              <div class="modal-actions">
                <button type="button" class="btn ghost" @click="closeModal">
                  Hủy
                </button>
                <button type="submit" class="btn primary" :disabled="submitting">
                  {{ submitting ? 'Đang lưu...' : modalMode === 'edit' ? 'Cập nhật' : 'Lưu danh mục' }}
                </button>
              </div>

              <p v-if="formError" class="status error mt-3">{{ formError }}</p>
              <p v-if="formSuccess" class="status success mt-3">{{ formSuccess }}</p>
            </form>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showFilterModal" class="modal-overlay" @click.self="closeFilterModal">
        <div class="modal-container filter-modal" @click.stop>
          <div class="modal-header">
            <h3>Bộ lọc {{ currentFilterColumn ? currentFilterColumn.label : '' }}</h3>
            <button class="close-btn" @click="closeFilterModal" aria-label="Đóng">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <form class="filter-form" @submit.prevent="applyColumnFilter">
              <label class="field">
                <span>Toán tử</span>
                <select v-model="filterForm.operator">
                  <option v-if="isNumericColumn(currentFilterColumn)" value="equals">Bằng</option>
                  <option v-if="isNumericColumn(currentFilterColumn)" value="not_equals">Không bằng</option>
                  <option v-if="!isNumericColumn(currentFilterColumn)" value="equals">Bằng</option>
                  <option v-if="!isNumericColumn(currentFilterColumn)" value="not_equals">Không bằng</option>
                  <option v-if="!isNumericColumn(currentFilterColumn)" value="contains">Chứa</option>
                  <option v-if="!isNumericColumn(currentFilterColumn)" value="not_contains">Không chứa</option>
                  <option v-if="!isNumericColumn(currentFilterColumn)" value="starts_with">Bắt đầu bằng</option>
                  <option v-if="!isNumericColumn(currentFilterColumn)" value="ends_with">Kết thúc bằng</option>
                  <option v-if="isNumericColumn(currentFilterColumn)" value="greater_than">Lớn hơn</option>
                  <option v-if="isNumericColumn(currentFilterColumn)" value="less_than">Nhỏ hơn</option>
                  <option v-if="isNumericColumn(currentFilterColumn)" value="greater_or_equal">Lớn hơn hoặc bằng</option>
                  <option v-if="isNumericColumn(currentFilterColumn)" value="less_or_equal">Nhỏ hơn hoặc bằng</option>
                  <option value="empty">Rỗng</option>
                  <option value="not_empty">Không rỗng</option>
                </select>
              </label>

              <label v-if="operatorNeedsValue(filterForm.operator)" class="field">
                <span>Giá trị</span>
                <input
                  v-if="isNumericColumn(currentFilterColumn)"
                  v-model.number="filterForm.value"
                  type="number"
                  placeholder="Nhập giá trị..."
                />
                <input
                  v-else
                  v-model.trim="filterForm.value"
                  type="text"
                  placeholder="Nhập giá trị..."
                />
              </label>

              <div class="modal-actions filter-modal-actions">
                <button
                  type="button"
                  class="btn ghost"
                  :disabled="!currentFilterColumn || !hasFilter(currentFilterColumn)"
                  @click="clearCurrentFilter"
                >
                  Xóa lọc cột này
                </button>
                <div class="filter-modal-actions__right">
                  <button type="button" class="btn ghost" @click="closeFilterModal">
                    Hủy
                  </button>
                  <button type="submit" class="btn primary">
                    Áp dụng
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="isViewModalOpen && viewingCategory" class="modal-overlay" @click.self="closeViewModal">
        <div class="modal-container filter-modal" @click.stop>
          <div class="modal-header">
            <h3>Chi tiết danh mục</h3>
            <button class="close-btn" @click="closeViewModal" aria-label="Đóng">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <dl class="detail-grid">
              <div>
                <dt>ID</dt>
                <dd>{{ viewingCategory.partCategoryId }}</dd>
              </div>
              <div>
                <dt>Mã danh mục</dt>
                <dd>{{ viewingCategory.partCategoryCode || '--' }}</dd>
              </div>
              <div>
                <dt>Tên danh mục</dt>
                <dd>{{ viewingCategory.partCategoryName || '--' }}</dd>
              </div>
              <div>
                <dt>Trạng thái</dt>
                <dd>{{ viewingCategory.status || '--' }}</dd>
              </div>
              <div class="full-row">
                <dt>Mô tả</dt>
                <dd>{{ viewingCategory.partCategoryDescription || viewingCategory.partCategoryDiscription || '--' }}</dd>
              </div>
              <div class="full-row">
                <dt>Số điện thoại</dt>
                <dd>{{ viewingCategory.partCategoryPhone || '--' }}</dd>
              </div>
            </dl>
            <div class="modal-actions" style="justify-content: flex-end">
              <button type="button" class="btn primary" @click="closeViewModal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsToast } from '@/components'
import { setToastInstance, useToast } from '@/composables/useToast'
import { getMenuByRole } from '@/utils/menu'
import authService from '@/services/auth'
import partCategoryService from '@/services/partCategory'

const toastRef = ref(null)
const toast = useToast()

const sidebarCollapsed = ref(false)
const notifications = ref([])
const menuItems = ref([])

const filters = reactive({
  keyword: ''
})

const categories = ref([])
const loading = ref(false)
const listError = ref('')
const pagination = reactive({
  page: 0,
  size: 10,
  totalItems: 0
})
const currentPage = ref(1)
const pageSizeOptions = [5, 10, 15, 20]

const totalPages = computed(() => {
  if (!pagination.size || pagination.size <= 0) return 1
  if (!pagination.totalItems) return 1
  return Math.max(1, Math.ceil(pagination.totalItems / pagination.size))
})

const pageNumbers = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
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
  const start = (currentPage.value - 1) * pagination.size + 1
  const end = Math.min(start + pagination.size - 1, pagination.totalItems)
  return { start, end }
})

const showEmptyState = computed(() => !loading.value && categories.value.length === 0)

const tableColumns = [
  { key: 'partCategoryId', backendKey: 'Id', label: 'ID', sortable: true, filterable: true, isNumeric: true },
  { key: 'partCategoryCode', backendKey: 'partCategoryCode', label: 'Mã danh mục', sortable: false, filterable: true },
  { key: 'partCategoryName', backendKey: 'partCategoryName', label: 'Tên danh mục', sortable: false, filterable: true },
  {
    key: 'partCategoryDescription',
    backendKey: 'partCategoryDescription',
    label: 'Mô tả',
    filterable: true,
    sortable: false,
    valueGetter: (item) => item.partCategoryDescription || item.partCategoryDiscription || '--'
  },
  { key: 'partCategoryPhone', backendKey: 'partCategoryPhone', label: 'Số điện thoại', filterable: true, sortable: false },
  { key: 'status', backendKey: 'status', label: 'Trạng thái', sortable: false, filterable: true },
  { key: 'actions', label: 'Hành động', sortable: false, filterable: false }
]

const sortConfig = reactive({
  columnKey: 'partCategoryId',
  direction: 'DESC'
})

const columnFilters = ref([])
const showFilterModal = ref(false)
const currentFilterColumn = ref(null)
const filterForm = reactive({
  operator: 'contains',
  value: ''
})

const operatorLabels = {
  equals: 'Bằng',
  not_equals: 'Không bằng',
  contains: 'Chứa',
  not_contains: 'Không chứa',
  starts_with: 'Bắt đầu bằng',
  ends_with: 'Kết thúc bằng',
  empty: 'Rỗng',
  not_empty: 'Không rỗng',
  greater_than: '>',
  less_than: '<',
  greater_or_equal: '>=',
  less_or_equal: '<='
}

const operatorNeedsValue = (operator) => !['empty', 'not_empty'].includes(operator)

const getBackendColumnName = (column) => column?.backendKey || column?.key || ''

const isNumericColumn = (column) => Boolean(column?.isNumeric)

const hasFilter = (column) => {
  if (!column) return false
  const target = getBackendColumnName(column)
  return columnFilters.value.some((filter) => filter.columnName === target)
}

const normalizeValue = (value) => {
  if (value === 0) return 0
  if (value === null || value === undefined || value === '') return '--'
  return value
}

const getCellValue = (item, column) => {
  if (!column) return '--'
  if (typeof column.valueGetter === 'function') {
    return normalizeValue(column.valueGetter(item))
  }
  return normalizeValue(item?.[column.key])
}

const isSortedColumn = (column) => column?.key === sortConfig.columnKey

const handleSortClick = (column) => {
  if (!column?.sortable) return
  if (sortConfig.columnKey === column.key) {
    sortConfig.direction = sortConfig.direction === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortConfig.columnKey = column.key
    sortConfig.direction = 'ASC'
  }
  loadCategories()
}

const openColumnFilter = (column) => {
  if (!column?.filterable) return
  currentFilterColumn.value = column
  const backendName = getBackendColumnName(column)
  const existing = columnFilters.value.find((filter) => filter.columnName === backendName)

  filterForm.operator = existing?.operator || (isNumericColumn(column) ? 'equals' : 'contains')
  filterForm.value = existing?.value ?? ''
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
  currentFilterColumn.value = null
  filterForm.operator = 'contains'
  filterForm.value = ''
}

const applyColumnFilter = () => {
  if (!currentFilterColumn.value) return
  const requiresValue = operatorNeedsValue(filterForm.operator)
  let valueToUse = filterForm.value

  if (typeof valueToUse === 'string') {
    valueToUse = valueToUse.trim()
  }

  if (requiresValue && (valueToUse === '' || valueToUse === null || Number.isNaN(valueToUse))) {
    toast.error('Vui lòng nhập giá trị lọc')
    return
  }

  const backendName = getBackendColumnName(currentFilterColumn.value)
  columnFilters.value = columnFilters.value.filter((filter) => filter.columnName !== backendName)

  columnFilters.value.push({
    columnName: backendName,
    operator: filterForm.operator,
    value: requiresValue ? String(valueToUse) : null
  })

  currentPage.value = 1
  loadCategories()
  closeFilterModal()
}

const clearCurrentFilter = () => {
  if (!currentFilterColumn.value) return
  const backendName = getBackendColumnName(currentFilterColumn.value)
  columnFilters.value = columnFilters.value.filter((filter) => filter.columnName !== backendName)
  currentPage.value = 1
  loadCategories()
  closeFilterModal()
}

const removeFilter = (filter) => {
  columnFilters.value = columnFilters.value.filter((item) => item.columnName !== filter.columnName)
  currentPage.value = 1
  loadCategories()
}

const clearAllColumnFilters = () => {
  if (!columnFilters.value.length) return
  columnFilters.value = []
  currentPage.value = 1
  loadCategories()
}

const getFilterLabel = (filter) => {
  const column = tableColumns.find((col) => getBackendColumnName(col) === filter.columnName)
  const columnLabel = column?.label || filter.columnName
  const operatorLabel = operatorLabels[filter.operator] || filter.operator
  const valueText = operatorNeedsValue(filter.operator) && filter.value ? ` ${filter.value}` : ''
  return `${columnLabel}: ${operatorLabel}${valueText}`
}

const isModalOpen = ref(false)
const modalMode = ref('create')
const editingId = ref(null)
const isViewModalOpen = ref(false)
const viewingCategory = ref(null)
const formData = reactive({
  partCategoryCode: '',
  partCategoryName: '',
  partCategoryDiscription: '',
  partCategoryPhone: '',
  status: 'ACTIVE'
})

const submitting = ref(false)
const formError = ref('')
const formSuccess = ref('')

const handleLogout = async () => {
  // authService.logout() sẽ tự động redirect và reload trang
  await authService.logout(true)
}

const resetForm = () => {
  formData.partCategoryCode = ''
  formData.partCategoryName = ''
  formData.partCategoryDiscription = ''
  formData.partCategoryPhone = ''
  formData.status = 'ACTIVE'
  formError.value = ''
  formSuccess.value = ''
}

const openEditModal = (item) => {
  if (!item) return
  modalMode.value = 'edit'
  editingId.value = item.partCategoryId
  formData.partCategoryCode = item.partCategoryCode || ''
  formData.partCategoryName = item.partCategoryName || ''
  formData.partCategoryDiscription = item.partCategoryDescription || item.partCategoryDiscription || ''
  formData.partCategoryPhone = item.partCategoryPhone || ''
  formData.status = item.status || 'ACTIVE'
  formError.value = ''
  formSuccess.value = ''
  isModalOpen.value = true
}

const openCreateModal = () => {
  modalMode.value = 'create'
  editingId.value = null
  resetForm()
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  modalMode.value = 'create'
  editingId.value = null
  resetForm()
}

const openViewModal = (item) => {
  viewingCategory.value = { ...item }
  isViewModalOpen.value = true
}

const closeViewModal = () => {
  viewingCategory.value = null
  isViewModalOpen.value = false
}

const buildPagingPayload = () => {
  const payload = {
    page: Math.max(0, currentPage.value - 1),
    size: pagination.size
  }

  const activeSortColumn = tableColumns.find((column) => column.key === sortConfig.columnKey)
  const sortByValue = getBackendColumnName(activeSortColumn) || sortConfig.columnKey || 'Id'
  // Đảm bảo sortBy là 'Id' (chữ I viết hoa) khi sort theo ID
  payload.sortBy = sortByValue === 'partCategoryId' || sortByValue === 'Id' ? 'Id' : sortByValue
  payload.direction = sortConfig.direction || 'DESC'

  if (filters.keyword && filters.keyword.trim()) {
    payload.keyword = filters.keyword.trim()
  }

  return payload
}

const loadCategories = async () => {
  try {
    loading.value = true
    listError.value = ''
    // Clear categories trước khi load để tránh hiển thị dữ liệu cũ
    categories.value = []

    const requestPayload = buildPagingPayload()
    const response = await partCategoryService.getList(requestPayload)

    // Response structure: response = { data: { success: true, data: { items: [...], totalItems, page, size }, message } }
    const rawData = response?.data || {}

    // Parse payload - xử lý cả 2 trường hợp: có success wrapper và không có
    let payload = rawData
    if (rawData?.success && rawData?.data) {
      payload = rawData.data
    } else if (rawData?.data) {
      payload = rawData.data
    }

    // Lấy items từ payload - ưu tiên payload.items
    let items = []
    if (Array.isArray(payload?.items)) {
      items = payload.items
    } else if (Array.isArray(payload)) {
      items = payload
    } else if (Array.isArray(payload?.content)) {
      items = payload.content
    }

    // Gán items vào categories - đảm bảo là array mới để trigger reactivity
    categories.value = Array.isArray(items) ? [...items] : []

    // Parse pagination info từ payload
    const totalFromPayload = payload?.totalItems ?? payload?.total ?? payload?.totalElements ?? payload?.totalRecords ?? items.length
    const pageFromPayload = payload?.page ?? payload?.currentPage ?? payload?.number ?? requestPayload.page ?? 0
    const sizeFromPayload = payload?.size ?? payload?.pageSize ?? requestPayload.size ?? 10

    pagination.totalItems = Number.isFinite(Number(totalFromPayload)) && Number(totalFromPayload) >= 0
      ? Number(totalFromPayload)
      : items.length
    pagination.page = Number.isFinite(Number(pageFromPayload)) && Number(pageFromPayload) >= 0
      ? Number(pageFromPayload)
      : 0
    pagination.size = Number.isFinite(Number(sizeFromPayload)) && Number(sizeFromPayload) > 0
      ? Number(sizeFromPayload)
      : 10
    currentPage.value = pagination.totalItems === 0 ? 1 : Number(pagination.page) + 1

    // Đảm bảo Vue đã update DOM trước khi tắt loading
    await nextTick()
  } catch (error) {
    console.error('Error loading categories:', error)
    listError.value = error?.message || 'Không thể tải danh mục'
    categories.value = []
    pagination.totalItems = 0
    pagination.page = 0
    currentPage.value = 1
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadCategories()
}

const handlePageSizeChange = () => {
  if (!pagination.size || pagination.size <= 0) {
    pagination.size = 10
  }
  currentPage.value = 1
  loadCategories()
}

const handleSearch = () => {
  currentPage.value = 1
  loadCategories()
}

const resetFilters = () => {
  filters.keyword = ''
  columnFilters.value = []
  handleSearch()
}


const handleSubmit = async () => {
  if (!formData.partCategoryCode) {
    formError.value = 'Vui lòng nhập mã danh mục'
    formSuccess.value = ''
    return
  }

  try {
    submitting.value = true
    formError.value = ''
    formSuccess.value = ''

    const descriptionValue = formData.partCategoryDiscription?.trim() || null
    const payload = {
      partCategoryCode: formData.partCategoryCode.trim(),
      partCategoryName: formData.partCategoryName?.trim() || null,
      partCategoryDescription: descriptionValue,
      partCategoryDiscription: descriptionValue,
      partCategoryPhone: formData.partCategoryPhone?.trim() || null,
      status: formData.status || 'ACTIVE'
    }

    if (modalMode.value === 'edit' && editingId.value) {
      await partCategoryService.update(editingId.value, payload)
      toast.success('Cập nhật danh mục thành công', `Mã ${payload.partCategoryCode}`)
      closeModal()
    } else {
      await partCategoryService.create(payload)
      toast.success('Thêm danh mục thành công', `Mã ${payload.partCategoryCode}`)
      resetForm()
      formSuccess.value = 'Đã tạo danh mục mới thành công'
    }

    await loadCategories()
  } catch (error) {
    const message = error?.message || 'Không thể tạo danh mục'
    formError.value = message
    toast.error(message)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }

  const user = authService.getCurrentUser()
  if (user?.role) {
    menuItems.value = getMenuByRole(user.role)
  }

  await loadCategories()
})
</script>

<style scoped>
.part-categories-v2 {
  min-height: 100vh;
  background: #f7f8fa;
}

.main-content {
  padding: 2rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  margin-top: 70px;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field textarea:focus,
.field select:focus {
  outline: none;
  border-color: #ff7a00;
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.15);
}

.field.required span::after {
  content: '*';
  color: #ef4444;
  margin-left: 4px;
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn.primary {
  background: #ff7a00;
  color: #fff;
}

.btn.secondary {
  background: #1f2937;
  color: #fff;
}

.btn.ghost {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #1f2937;
}

.btn.primary:hover {
  background: #f97316;
}

.btn.secondary:hover {
  background: #111827;
}

.btn.ghost:hover:not(:disabled) {
  border-color: #ff7a00;
  color: #ff7a00;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.form-actions {
  display: flex;
  align-items: center;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
}

.category-table th,
.category-table td {
  border-bottom: 1px solid #f0f1f5;
  padding: 0.75rem;
  text-align: left;
  font-size: 0.95rem;
}

.category-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
}

.th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.th-actions {
  display: inline-flex;
  gap: 0.25rem;
}

.icon-btn {
  border: 1px solid transparent;
  background: transparent;
  padding: 0.15rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

.icon-btn i {
  font-size: 0.9rem;
}

.icon-btn .sort-label {
  margin-left: 0.15rem;
  font-size: 0.65rem;
  font-weight: 600;
}

.icon-btn:hover {
  color: #111827;
  border-color: #d1d5db;
}

.icon-btn.active {
  color: #ff7a00;
  border-color: rgba(255, 122, 0, 0.4);
  background: rgba(255, 122, 0, 0.08);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.85rem;
}

.badge.success {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.badge.secondary {
  background: rgba(107, 114, 128, 0.15);
  color: #4b5563;
}

.action-buttons {
  display: inline-flex;
  gap: 0.35rem;
}

.action-buttons .icon-btn {
  border: 1px solid #e5e7eb;
  color: #4b5563;
  background: #fff;
}

.action-buttons .icon-btn:hover {
  color: #111827;
  border-color: #cbd5f5;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 1rem;
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
  padding: 0.4rem 0.75rem;
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

.status {
  font-weight: 500;
  padding: 0.75rem 0;
}

.status.error {
  color: #dc2626;
}

.status.success {
  color: #16a34a;
}

.empty-state {
  text-align: center;
  padding: 1rem;
  color: #6b7280;
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-header {
    flex-direction: column;
  }
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
  animation: fadeIn 0.25s ease-out;
}

.modal-container {
  background: #fff;
  border-radius: 16px;
  width: min(90vw, 640px);
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f1f5;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.modal-container.filter-modal {
  width: min(90vw, 420px);
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
  padding: 1.5rem;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f1f5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-container input:focus,
.modal-container textarea:focus,
.modal-container select:focus {
  outline: 2px solid #ff7a00;
  outline-offset: 2px;
}

.filter-modal-actions {
  justify-content: space-between;
  align-items: center;
  border-top: none;
  padding-top: 0;
  margin-top: 1rem;
}

.filter-modal-actions__right {
  display: flex;
  gap: 0.5rem;
}

.filter-form .field + .field {
  margin-top: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.detail-grid dt {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.detail-grid dd {
  margin: 0;
  color: #1f2937;
}

.detail-grid .full-row {
  grid-column: 1 / -1;
}

.mt-3 {
  margin-top: 0.75rem;
}
</style>



