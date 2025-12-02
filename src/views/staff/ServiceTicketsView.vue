<template>
  <div class="service-tickets-view">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />
    
    <div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Quản lý phiếu dịch vụ"
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
              placeholder="Tìm theo mã phiếu, khách hàng, biển số..."
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
              @click="showCreateDialog = true"
            >
              Tạo phiếu mới
            </GmsButton>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Trạng thái:</label>
            <select v-model="filters.status" class="filter-select" @change="applyFilters">
              <option value="">Tất cả trạng thái</option>
              <option value="New">Mới</option>
              <option value="Assigned">Đã phân công</option>
              <option value="In Progress">Đang xử lý</option>
              <option value="Completed">Hoàn tất</option>
              <option value="Invoiced">Đã tạo hóa đơn</option>
              <option value="Paid">Đã thanh toán</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Thợ phụ trách:</label>
            <select v-model="filters.mechanic" class="filter-select" @change="applyFilters">
              <option value="">Tất cả thợ</option>
              <option
                v-for="mechanic in mechanics"
                :key="mechanic.id"
                :value="mechanic.id"
              >
                {{ mechanic.name }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Từ ngày:</label>
            <input
              v-model="filters.fromDate"
              type="date"
              class="filter-input"
              @change="applyFilters"
            />
          </div>
          
          <div class="filter-group">
            <label>Đến ngày:</label>
            <input
              v-model="filters.toDate"
              type="date"
              class="filter-input"
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
        <GmsTable
          :data="filteredTickets"
          :columns="tableColumns"
          title="Danh sách phiếu dịch vụ"
          :loading="loading"
          :pagination="true"
          :page-size="pageSize"
          @row-click="handleRowClick"
          @sort="handleSort"
          @page-change="handlePageChange"
        >
          <template #cell-customer="{ row }">
            <div>
              <div class="customer-name">{{ row.customerName }}</div>
              <div class="customer-phone">{{ row.customerPhone }}</div>
            </div>
          </template>
          
          <template #cell-mechanic="{ row }">
            <div v-if="row.mechanic" class="mechanic-info">
              <img
                :src="getAvatarUrl(row.mechanic.name)"
                :alt="row.mechanic.name"
                class="mechanic-avatar"
              />
              <span>{{ row.mechanic.name }}</span>
            </div>
            <span v-else class="text-muted">Chưa phân công</span>
          </template>
          
          <template #cell-status="{ row }">
            <span :class="getStatusClass(row.status)">
              {{ getStatusLabel(row.status) }}
            </span>
          </template>
          
          <template #cell-actions="{ row }">
            <div class="action-buttons">
              <GmsButton
                v-if="row.status === 'New'"
                variant="primary"
                size="small"
                icon="fa-user-plus"
                @click.stop="openAssignDialog(row)"
              >
                Phân công
              </GmsButton>
              
              <GmsButton
                v-else-if="row.status === 'Assigned' || row.status === 'In Progress'"
                variant="success"
                size="small"
                icon="fa-check-circle"
                @click.stop="openCompleteDialog(row)"
              >
                Hoàn thành
              </GmsButton>
              
              <GmsButton
                v-else-if="row.status === 'Completed'"
                variant="info"
                size="small"
                icon="fa-file-invoice"
                @click.stop="createInvoice(row)"
              >
                Tạo hóa đơn
              </GmsButton>
              
              <GmsButton
                variant="outline"
                size="small"
                icon="fa-eye"
                @click.stop="viewDetail(row)"
              >
                Chi tiết
              </GmsButton>
            </div>
          </template>
        </GmsTable>
      </main>
    </div>
    
    <!-- Assign Mechanic Dialog -->
    <GmsDialog
      v-model="showAssignDialog"
      title="Phân công thợ sửa"
      size="medium"
    >
      <div v-if="selectedTicket">
        <p class="mb-3">
          Chọn thợ phụ trách phiếu <strong>#{{ selectedTicket.code }}</strong>
        </p>
        
        <div class="mechanic-grid">
          <div
            v-for="mechanic in availableMechanics"
            :key="mechanic.id"
            :class="['mechanic-card', { selected: selectedMechanic === mechanic.id }]"
            @click="selectMechanic(mechanic.id)"
          >
            <img
              :src="getAvatarUrl(mechanic.name)"
              :alt="mechanic.name"
              class="mechanic-card-avatar"
            />
            <div class="mechanic-card-name">{{ mechanic.name }}</div>
            <div class="mechanic-card-info">
              <span :class="mechanic.status === 'available' ? 'text-success' : 'text-warning'">
                {{ mechanic.status === 'available' ? '🟢 Rảnh' : '🟠 Đang làm' }}
              </span>
              <span class="text-muted">{{ mechanic.tickets }} phiếu</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <GmsButton variant="outline" @click="showAssignDialog = false">Hủy</GmsButton>
        <GmsButton
          variant="primary"
          :disabled="!selectedMechanic"
          @click="confirmAssign"
        >
          Xác nhận phân công
        </GmsButton>
      </template>
    </GmsDialog>
    
    <!-- Complete Dialog -->
    <GmsDialog
      v-model="showCompleteDialog"
      title="Xác nhận hoàn thành"
      size="small"
    >
      <div v-if="selectedTicket">
        <p>Bạn có chắc chắn phiếu <strong>#{{ selectedTicket.code }}</strong> đã hoàn tất sửa chữa?</p>
      </div>
      
      <template #footer>
        <GmsButton variant="outline" @click="showCompleteDialog = false">Hủy</GmsButton>
        <GmsButton variant="success" @click="confirmComplete">Xác nhận</GmsButton>
      </template>
    </GmsDialog>
    
    <!-- Toast -->
    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsInput, GmsButton, GmsTable, GmsDialog, GmsToast } from '@/components'
import { useToast } from '@/composables/useToast'
import { getMenuByRole } from '@/utils/menu'
import authService from '@/services/auth'
import api from '@/services/api'
import { API_ENDPOINTS } from '@/constant/api'

const router = useRouter()
const toastRef = ref(null)
const toast = useToast()

const sidebarCollapsed = ref(false)
const loading = ref(false)
const showCreateDialog = ref(false)
const showAssignDialog = ref(false)
const showCompleteDialog = ref(false)
const selectedTicket = ref(null)
const selectedMechanic = ref(null)
const searchQuery = ref('')
const pageSize = ref(10)
const currentPage = ref(1)
const sortConfig = ref({ key: '', order: 'asc' })

const tickets = ref([])
const mechanics = ref([])
const notifications = ref([])
const menuItems = ref([])

const filters = ref({
  status: '',
  mechanic: '',
  fromDate: '',
  toDate: ''
})

const tableColumns = ref([
  { key: 'code', label: 'Mã phiếu', sortable: true },
  { key: 'customer', label: 'Khách hàng' },
  { key: 'plateNumber', label: 'Biển số', sortable: true },
  { key: 'service', label: 'Dịch vụ' },
  { key: 'mechanic', label: 'Thợ phụ trách' },
  { key: 'status', label: 'Trạng thái', sortable: true },
  { key: 'createdAt', label: 'Ngày tạo', sortable: true },
  { key: 'actions', label: 'Hành động' }
])

// Computed
const filteredTickets = computed(() => {
  let result = [...tickets.value]
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(ticket =>
      ticket.code.toLowerCase().includes(query) ||
      ticket.customerName.toLowerCase().includes(query) ||
      ticket.customerPhone.includes(query) ||
      ticket.plateNumber.toLowerCase().includes(query) ||
      ticket.service.toLowerCase().includes(query)
    )
  }
  
  // Status filter
  if (filters.value.status) {
    result = result.filter(ticket => ticket.status === filters.value.status)
  }
  
  // Mechanic filter
  if (filters.value.mechanic) {
    result = result.filter(ticket =>
      ticket.mechanic && ticket.mechanic.id === parseInt(filters.value.mechanic)
    )
  }
  
  // Date filters
  if (filters.value.fromDate) {
    result = result.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt)
      return ticketDate >= new Date(filters.value.fromDate)
    })
  }
  
  if (filters.value.toDate) {
    result = result.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt)
      const toDate = new Date(filters.value.toDate)
      toDate.setHours(23, 59, 59, 999)
      return ticketDate <= toDate
    })
  }
  
  // Sort
  if (sortConfig.value.key) {
    result.sort((a, b) => {
      const aVal = getNestedValue(a, sortConfig.value.key)
      const bVal = getNestedValue(b, sortConfig.value.key)
      
      if (aVal < bVal) return sortConfig.value.order === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.value.order === 'asc' ? 1 : -1
      return 0
    })
  }
  
  return result
})

const availableMechanics = computed(() => {
  return mechanics.value.filter(m => m.status === 'available' || m.tickets < 5)
})

// Methods
const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF7A00&color=fff`
}

const getStatusLabel = (status) => {
  const labels = {
    'New': 'Mới',
    'Assigned': 'Đã phân công',
    'In Progress': 'Đang xử lý',
    'Completed': 'Hoàn tất',
    'Invoiced': 'Đã tạo hóa đơn',
    'Paid': 'Đã thanh toán',
    'Cancelled': 'Đã hủy'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    'New': 'badge badge-info',
    'Assigned': 'badge badge-primary',
    'In Progress': 'badge badge-warning',
    'Completed': 'badge badge-success',
    'Invoiced': 'badge badge-info',
    'Paid': 'badge badge-success',
    'Cancelled': 'badge badge-danger'
  }
  return classes[status] || 'badge'
}

const getNestedValue = (obj, path) => {
  const keys = path.split('.')
  let value = obj
  for (const key of keys) {
    value = value?.[key]
  }
  return value
}

const handleSearch = () => {
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    status: '',
    mechanic: '',
    fromDate: '',
    toDate: ''
  }
  searchQuery.value = ''
  currentPage.value = 1
}

const handleSort = ({ key, order }) => {
  sortConfig.value = { key, order }
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handleRowClick = (row) => {
  viewDetail(row)
}

const viewDetail = (ticket) => {
  router.push(`/staff/service-tickets/${ticket.id}`)
}

const openAssignDialog = (ticket) => {
  selectedTicket.value = ticket
  selectedMechanic.value = null
  showAssignDialog.value = true
  loadMechanics()
}

const selectMechanic = (mechanicId) => {
  selectedMechanic.value = mechanicId
}

const confirmAssign = async () => {
  if (!selectedMechanic.value || !selectedTicket.value) return
  
  try {
    loading.value = true
    await api.put(`${API_ENDPOINTS.STAFF.SERVICE_TICKETS}/${selectedTicket.value.id}/assign`, {
      mechanicId: selectedMechanic.value
    })
    
    // Update local data
    const ticket = tickets.value.find(t => t.id === selectedTicket.value.id)
    if (ticket) {
      const mechanic = mechanics.value.find(m => m.id === selectedMechanic.value)
      ticket.mechanic = mechanic
      ticket.status = 'Assigned'
      if (mechanic) {
        mechanic.tickets++
        mechanic.status = 'busy'
      }
    }
    
    showAssignDialog.value = false
    toast.success('Phân công thành công!', `Đã giao phiếu #${selectedTicket.value.code} cho thợ`)
  } catch (error) {
    toast.error('Lỗi khi phân công', error.message)
  } finally {
    loading.value = false
  }
}

const openCompleteDialog = (ticket) => {
  selectedTicket.value = ticket
  showCompleteDialog.value = true
}

const confirmComplete = async () => {
  if (!selectedTicket.value) return
  
  try {
    loading.value = true
    await api.put(`${API_ENDPOINTS.STAFF.SERVICE_TICKETS}/${selectedTicket.value.id}/complete`)
    
    // Update local data
    const ticket = tickets.value.find(t => t.id === selectedTicket.value.id)
    if (ticket) {
      ticket.status = 'Completed'
      if (ticket.mechanic) {
        ticket.mechanic.tickets = Math.max(0, ticket.mechanic.tickets - 1)
        if (ticket.mechanic.tickets === 0) {
          ticket.mechanic.status = 'available'
        }
      }
    }
    
    showCompleteDialog.value = false
    toast.success('Hoàn thành!', `Phiếu #${selectedTicket.value.code} đã hoàn tất`)
  } catch (error) {
    toast.error('Lỗi khi hoàn thành', error.message)
  } finally {
    loading.value = false
  }
}

const createInvoice = async (ticket) => {
  try {
    loading.value = true
    await api.post(`${API_ENDPOINTS.STAFF.SERVICE_TICKETS}/${ticket.id}/invoice`)
    
    // Update local data
    const t = tickets.value.find(t => t.id === ticket.id)
    if (t) {
      t.status = 'Invoiced'
    }
    
    toast.success('Tạo hóa đơn thành công!', `Phiếu #${ticket.code} đã có hóa đơn`)
  } catch (error) {
    toast.error('Lỗi khi tạo hóa đơn', error.message)
  } finally {
    loading.value = false
  }
}

const loadTickets = async () => {
  try {
    loading.value = true
    const response = await api.get(API_ENDPOINTS.STAFF.SERVICE_TICKETS)
    tickets.value = response.data || response
  } catch (error) {
    toast.error('Lỗi khi tải danh sách phiếu', error.message)
  } finally {
    loading.value = false
  }
}

const loadMechanics = async () => {
  try {
    const response = await api.get('/mechanics')
    mechanics.value = response.data || response
  } catch (error) {
    console.error('Error loading mechanics:', error)
    // Fallback data
    mechanics.value = [
      { id: 1, name: 'Nguyễn Văn Thợ', tickets: 2, status: 'busy' },
      { id: 2, name: 'Trần Công Sửa', tickets: 1, status: 'busy' },
      { id: 3, name: 'Lê Kỹ Thuật', tickets: 0, status: 'available' }
    ]
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/login')
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
  await loadTickets()
  await loadMechanics()
})
</script>

<style scoped>
.service-tickets-view {
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

.filter-select,
.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 150px;
  outline: none;
  transition: border-color 0.3s;
}

.filter-select:focus,
.filter-input:focus {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.customer-name {
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.customer-phone {
  font-size: 0.85rem;
  color: #666;
}

.mechanic-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mechanic-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.mechanic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.mechanic-card {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.mechanic-card:hover {
  border-color: var(--primary, #ff7a00);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 122, 0, 0.2);
}

.mechanic-card.selected {
  border-color: var(--primary, #ff7a00);
  background: rgba(255, 122, 0, 0.1);
}

.mechanic-card-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 0.5rem;
}

.mechanic-card-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--dark, #2c3a47);
}

.mechanic-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.text-muted {
  color: #999;
}

.text-success {
  color: var(--success, #10ac84);
}

.text-warning {
  color: var(--warning, #f7b731);
}
</style>

