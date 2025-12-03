<template>
  <div class="gms-table-wrapper">
    <div v-if="title || $slots.header" class="gms-table-header">
      <h5 v-if="title" class="gms-table-title">{{ title }}</h5>
      <slot name="header"></slot>
    </div>
    
    <div class="gms-table-container" :class="{ 'scrollable': scrollable }">
      <table class="gms-table">
        <thead>
          <tr>
            <th
              v-for="(column, index) in columns"
              :key="index"
              :class="column.class"
              :style="column.style"
            >
              <div class="gms-table-th-content">
                {{ column.label }}
                <i
                  v-if="column.sortable"
                  :class="getSortIcon(column.key)"
                  class="fas gms-table-sort-icon"
                  @click="handleSort(column.key)"
                ></i>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="gms-table-loading">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Đang tải...</span>
            </td>
          </tr>
          <tr v-else-if="!data || data.length === 0">
            <td :colspan="columns.length" class="gms-table-empty">
              <i class="fas fa-inbox"></i>
              <span>{{ emptyText }}</span>
            </td>
          </tr>
          <tr
            v-else
            v-for="(row, rowIndex) in paginatedData"
            :key="rowIndex"
            :class="getRowClass(row, rowIndex)"
            @click="handleRowClick(row, rowIndex)"
          >
            <td
              v-for="(column, colIndex) in columns"
              :key="colIndex"
              :class="column.class"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :column="column"
                :value="getCellValue(row, column)"
              >
                <component
                  v-if="column.component"
                  :is="column.component"
                  :row="row"
                  :column="column"
                  :value="getCellValue(row, column)"
                />
                <span v-else>{{ formatCellValue(row, column) }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="pagination && totalPages > 1" class="gms-table-pagination">
      <div class="gms-table-pagination-info">
        Hiển thị {{ startIndex + 1 }}-{{ endIndex }} trong tổng {{ totalItems }} mục
      </div>
      <div class="gms-table-pagination-controls">
        <button
          class="gms-table-pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="gms-table-pagination-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="gms-table-pagination-page"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          class="gms-table-pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: 'Không có dữ liệu'
  },
  pagination: {
    type: Boolean,
    default: false
  },
  pageSize: {
    type: Number,
    default: 10
  },
  scrollable: {
    type: Boolean,
    default: false
  },
  rowClass: {
    type: [String, Function],
    default: ''
  },
  sortBy: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: String,
    default: 'asc',
    validator: (value) => ['asc', 'desc'].includes(value)
  }
})

const emit = defineEmits(['row-click', 'sort', 'page-change'])

const currentPage = ref(1)
const sortKey = ref(props.sortBy)
const sortOrder = ref(props.sortOrder)

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = getCellValue(a, { key: sortKey.value })
    const bVal = getCellValue(b, { key: sortKey.value })
    
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalItems = computed(() => sortedData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / props.pageSize))
const startIndex = computed(() => (currentPage.value - 1) * props.pageSize)
const endIndex = computed(() => Math.min(startIndex.value + props.pageSize, totalItems.value))

const paginatedData = computed(() => {
  if (!props.pagination) return sortedData.value
  return sortedData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const getCellValue = (row, column) => {
  if (column.key) {
    const keys = column.key.split('.')
    let value = row
    for (const key of keys) {
      value = value?.[key]
    }
    return value
  }
  return ''
}

const formatCellValue = (row, column) => {
  const value = getCellValue(row, column)
  
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value, row)
  }
  
  return value ?? ''
}

const getRowClass = (row, index) => {
  if (typeof props.rowClass === 'function') {
    return props.rowClass(row, index)
  }
  return props.rowClass
}

const handleRowClick = (row, index) => {
  emit('row-click', row, index)
}

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  emit('sort', { key: sortKey.value, order: sortOrder.value })
}

const getSortIcon = (key) => {
  if (sortKey.value !== key) return 'fa-sort'
  return sortOrder.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('page-change', page)
  }
}

watch(() => props.data, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.gms-table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.gms-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.gms-table-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
  margin: 0;
}

.gms-table-container {
  overflow-x: auto;
}

.gms-table-container.scrollable {
  max-height: 600px;
  overflow-y: auto;
}

.gms-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}

.gms-table thead th {
  background: var(--light, #f8f9fa);
  padding: 12px 15px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
  text-transform: uppercase;
  text-align: left;
  border: none;
}

.gms-table-th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gms-table-sort-icon {
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.gms-table-sort-icon:hover {
  color: var(--primary, #ff7a00);
}

.gms-table tbody tr {
  background: white;
  transition: all 0.2s;
  cursor: pointer;
}

.gms-table tbody tr:hover {
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.gms-table tbody td {
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.gms-table tbody td:first-child {
  border-left: 1px solid #f0f0f0;
  border-radius: 8px 0 0 8px;
}

.gms-table tbody td:last-child {
  border-right: 1px solid #f0f0f0;
  border-radius: 0 8px 8px 0;
}

.gms-table-loading,
.gms-table-empty {
  text-align: center;
  padding: 3rem !important;
  color: #999;
}

.gms-table-loading i,
.gms-table-empty i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.gms-table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.gms-table-pagination-info {
  font-size: 0.9rem;
  color: #666;
}

.gms-table-pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gms-table-pagination-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.gms-table-pagination-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: var(--primary, #ff7a00);
}

.gms-table-pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gms-table-pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.gms-table-pagination-page {
  min-width: 36px;
  height: 36px;
  padding: 0 0.75rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.gms-table-pagination-page:hover {
  background: #f8f9fa;
  border-color: var(--primary, #ff7a00);
}

.gms-table-pagination-page.active {
  background: var(--primary, #ff7a00);
  color: white;
  border-color: var(--primary, #ff7a00);
}
</style>


