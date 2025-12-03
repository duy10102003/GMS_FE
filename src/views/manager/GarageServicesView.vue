<template>
  <div class="garage-services-view">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />
    
    <div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Quản lý dịch vụ garage"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />
      
      <main class="main-content" style="margin-top: 70px; padding: 2rem;">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-left">
            <GmsInput
              v-model="searchQuery"
              placeholder="Tìm theo tên dịch vụ..."
              prefix-icon="fa-search"
              :clearable="true"
              class="search-input"
              @input="handleSearch"
            />
          </div>
          
          <div class="toolbar-right">
            <GmsButton
              variant="primary"
              icon="fa-plus"
              @click="openCreateDialog"
            >
              Tạo dịch vụ mới
            </GmsButton>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Giá từ:</label>
            <input
              v-model="filters.priceFrom"
              type="number"
              class="filter-input"
              placeholder="0"
              min="0"
              @change="applyFilters"
            />
          </div>
          
          <div class="filter-group">
            <label>Giá đến:</label>
            <input
              v-model="filters.priceTo"
              type="number"
              class="filter-input"
              placeholder="999999999"
              min="0"
              @change="applyFilters"
            />
          </div>
          
          <GmsButton
            variant="outline"
            icon="fa-times"
            @click="clearFilters"
          >
            Xóa bộ lọc
          </GmsButton>
        </div>
        
        <!-- Table -->
        <div class="table-container">
          <GmsTable
            :data="services"
            :columns="tableColumns"
            title="Danh sách dịch vụ garage"
            :loading="loading"
            :pagination="false"
            :scrollable="true"
            @sort="handleSort"
          >
          <template #cell-garageServicePrice="{ row }">
            <span v-if="row.garageServicePrice !== null && row.garageServicePrice !== undefined">
              {{ formatPrice(row.garageServicePrice) }}
            </span>
            <span v-else class="text-muted">Chưa có giá</span>
          </template>
          
          <template #cell-actions="{ row }">
            <div class="action-buttons">
              <GmsButton
                variant="outline"
                size="small"
                icon="fa-edit"
                @click.stop="openEditDialog(row)"
              >
                Sửa
              </GmsButton>
              
              <GmsButton
                variant="danger"
                size="small"
                icon="fa-trash"
                @click.stop="openDeleteDialog(row)"
              >
                Xóa
              </GmsButton>
            </div>
          </template>
          </GmsTable>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalItems > 0" class="pagination mt-4">
          <div class="pagination-left">
            <div class="pagination-info">
              Hiển thị {{ startIndex + 1 }}-{{ endIndex }} trong tổng {{ totalItems }} dịch vụ
            </div>
            <div class="pagination-size">
              <label>Số lượng/trang:</label>
              <select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
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
              <i class="fas fa-chevron-left"></i>
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
              <i class="fas fa-chevron-right"></i>
            </GmsButton>
          </div>
        </div>
      </main>
    </div>
    
    <!-- Create/Edit Dialog -->
    <GmsDialog
      v-model="showFormDialog"
      :title="isEditing ? 'Cập nhật dịch vụ' : 'Tạo dịch vụ mới'"
      size="medium"
    >
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">Tên dịch vụ *</label>
          <GmsInput
            v-model="formData.garageServiceName"
            placeholder="Nhập tên dịch vụ..."
            required
            :maxlength="255"
          />
        </div>
        
        <div class="mb-3">
          <label class="form-label">Giá dịch vụ (VNĐ)</label>
          <GmsInput
            v-model.number="formData.garageServicePrice"
            type="number"
            placeholder="Nhập giá dịch vụ..."
            :min="0"
            step="1000"
          />
          <small class="text-muted">Để trống nếu chưa có giá</small>
        </div>
        
        <div class="dialog-actions">
          <GmsButton type="button" variant="outline" @click="closeFormDialog">Hủy</GmsButton>
          <GmsButton type="submit" variant="primary" :loading="submitting">
            {{ isEditing ? 'Cập nhật' : 'Tạo mới' }}
          </GmsButton>
        </div>
      </form>
    </GmsDialog>
    
    <!-- Delete Confirmation Dialog -->
    <GmsDialog
      v-model="showDeleteDialog"
      title="Xác nhận xóa"
      size="small"
    >
      <template v-if="selectedService">
        <p>Bạn có chắc chắn muốn xóa dịch vụ <strong>{{ selectedService.garageServiceName }}</strong>?</p>
        <p class="text-muted small">Dịch vụ sẽ bị xóa mềm (soft delete) và có thể khôi phục sau.</p>
        
        <div class="dialog-actions">
          <GmsButton type="button" variant="outline" @click="showDeleteDialog = false">Hủy</GmsButton>
          <GmsButton variant="danger" :loading="deleting" @click="confirmDelete">
            Xóa
          </GmsButton>
        </div>
      </template>
    </GmsDialog>
    
    <!-- Toast -->
    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsInput, GmsButton, GmsTable, GmsDialog, GmsToast } from '@/components'
import { useToast } from '@/composables/useToast'
import { getMenuByRole } from '@/utils/menu'
import authService from '@/services/auth'
import garageServiceService from '@/services/garageService'

const router = useRouter()
const toastRef = ref(null)
const toast = useToast()

const sidebarCollapsed = ref(false)
const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const selectedService = ref(null)

const searchQuery = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const sortConfig = ref({ key: '', order: 'asc' })

const services = ref([])
const notifications = ref([])
const menuItems = ref([])
const totalItems = ref(0)

const filters = ref({
  priceFrom: '',
  priceTo: ''
})

const formData = ref({
  garageServiceName: '',
  garageServicePrice: null
})

const tableColumns = ref([
  { key: 'garageServiceId', label: 'ID', sortable: true },
  { key: 'garageServiceName', label: 'Tên dịch vụ', sortable: true },
  { key: 'garageServicePrice', label: 'Giá (VNĐ)', sortable: true },
  { key: 'actions', label: 'Hành động' }
])

// Computed
const totalPages = computed(() => {
  return Math.ceil(totalItems.value / pageSize.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + pageSize.value, totalItems.value)
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

// Methods
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Chưa có giá'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const handleSearch = () => {
  currentPage.value = 1
  loadServices()
}

const applyFilters = () => {
  currentPage.value = 1
  loadServices()
}

const clearFilters = () => {
  filters.value = {
    priceFrom: '',
    priceTo: ''
  }
  searchQuery.value = ''
  currentPage.value = 1
  loadServices()
}

const handleSort = ({ key, order }) => {
  sortConfig.value = { key, order }
  loadServices()
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadServices()
  }
}

const handlePageSizeChange = () => {
  currentPage.value = 1
  loadServices()
}

const openCreateDialog = () => {
  isEditing.value = false
  selectedService.value = null
  formData.value = {
    garageServiceName: '',
    garageServicePrice: null
  }
  showFormDialog.value = true
}

const openEditDialog = (service) => {
  isEditing.value = true
  selectedService.value = service
  formData.value = {
    garageServiceName: service.garageServiceName,
    garageServicePrice: service.garageServicePrice
  }
  showFormDialog.value = true
}

const closeFormDialog = () => {
  showFormDialog.value = false
  isEditing.value = false
  selectedService.value = null
  formData.value = {
    garageServiceName: '',
    garageServicePrice: null
  }
}

const handleSubmit = async () => {
  if (!formData.value.garageServiceName || formData.value.garageServiceName.trim() === '') {
    toast.error('Vui lòng nhập tên dịch vụ')
    return
  }
  
  try {
    submitting.value = true
    
    const data = {
      garageServiceName: formData.value.garageServiceName.trim(),
      garageServicePrice: formData.value.garageServicePrice || null
    }
    
    if (isEditing.value && selectedService.value) {
      await garageServiceService.update(selectedService.value.garageServiceId, data)
      toast.success('Cập nhật thành công!', `Đã cập nhật dịch vụ "${data.garageServiceName}"`)
    } else {
      await garageServiceService.create(data)
      toast.success('Tạo mới thành công!', `Đã tạo dịch vụ "${data.garageServiceName}"`)
    }
    
    closeFormDialog()
    await loadServices()
  } catch (error) {
    toast.error('Lỗi', error.message || 'Có lỗi xảy ra')
  } finally {
    submitting.value = false
  }
}

const openDeleteDialog = (service) => {
  selectedService.value = service
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedService.value) return
  
  try {
    deleting.value = true
    await garageServiceService.delete(selectedService.value.garageServiceId)
    toast.success('Xóa thành công!', `Đã xóa dịch vụ "${selectedService.value.garageServiceName}"`)
    showDeleteDialog.value = false
    selectedService.value = null
    await loadServices()
  } catch (error) {
    toast.error('Lỗi khi xóa', error.message || 'Có lỗi xảy ra')
  } finally {
    deleting.value = false
  }
}

const loadServices = async () => {
  try {
    loading.value = true
    
    // Build column filters
    const columnFilters = []
    
    // Search filter
    if (searchQuery.value && searchQuery.value.trim()) {
      columnFilters.push({
        columnName: 'GarageServiceName',
        operator: 'contains',
        value: searchQuery.value.trim()
      })
    }
    
    // Price filters
    if (filters.value.priceFrom) {
      columnFilters.push({
        columnName: 'GarageServicePrice',
        operator: 'greater_or_equal',
        value: filters.value.priceFrom.toString()
      })
    }
    
    if (filters.value.priceTo) {
      columnFilters.push({
        columnName: 'GarageServicePrice',
        operator: 'less_or_equal',
        value: filters.value.priceTo.toString()
      })
    }
    
    // Build sort
    const columnSorts = []
    if (sortConfig.value.key) {
      columnSorts.push({
        columnName: sortConfig.value.key,
        sortDirection: sortConfig.value.order === 'asc' ? 'ASC' : 'DESC'
      })
    } else {
      // Default sort by ID DESC
      columnSorts.push({
        columnName: 'GarageServiceId',
        sortDirection: 'DESC'
      })
    }
    
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      columnFilters,
      columnSorts
    }
    
    const response = await garageServiceService.getPaging(params)
    services.value = response.data.items || []
    totalItems.value = response.data.total || 0
  } catch (error) {
    toast.error('Lỗi khi tải danh sách dịch vụ', error.message || 'Có lỗi xảy ra')
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/home')
}

onMounted(async () => {
  // Set toast instance
  if (toastRef.value) {
    const { setToastInstance } = await import('@/composables/useToast')
    setToastInstance(toastRef.value)
  }
  
  // Get menu
  const user = authService.getCurrentUser()
  if (user) {
    menuItems.value = getMenuByRole(user.role)
  }
  
  // Load data
  await loadServices()
})
</script>

<style scoped>
.garage-services-view {
  min-height: 100vh;
  background: var(--light, #f8f9fa);
}

.content-wrapper {
  transition: margin-left 0.3s ease;
}

.main-content {
  padding: 2rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.toolbar-left {
  flex: 1;
  min-width: 300px;
}

.search-input {
  max-width: 400px;
}

.toolbar-right {
  display: flex;
  gap: 0.75rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 150px;
  outline: none;
  transition: border-color 0.3s;
}

.filter-input:focus {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.table-container :deep(.gms-table-wrapper) {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
}

.table-container :deep(.gms-table-container) {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  max-height: calc(600px - 120px); /* Trừ header và title */
}

.table-container :deep(.gms-table) {
  margin: 0;
}

.table-container :deep(.gms-table thead) {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--light, #f8f9fa);
}

.table-container :deep(.gms-table thead th) {
  background: var(--light, #f8f9fa);
  position: sticky;
  top: 0;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.text-muted {
  color: #999;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-size label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.page-size-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  min-width: 70px;
}

.page-size-select:hover {
  border-color: var(--primary, #ff7a00);
}

.page-size-select:focus {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
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
  min-width: 36px;
  height: 36px;
  padding: 0 0.75rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  color: var(--dark, #2c3a47);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page:hover {
  background: #f8f9fa;
  border-color: var(--primary, #ff7a00);
}

.pagination-page.active {
  background: var(--primary, #ff7a00);
  color: white;
  border-color: var(--primary, #ff7a00);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.mb-3 {
  margin-bottom: 1rem;
}

.small {
  font-size: 0.875rem;
}
</style>

