<template>
  <div class="example-page">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />
    
    <div class="example-content" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Ví dụ sử dụng Components"
        :show-search="true"
        :notifications="notifications"
        @search="handleSearch"
        @logout="handleLogout"
      />
      
      <main class="main-content" style="margin-top: 70px; padding: 2rem;">
        <h1>Ví dụ sử dụng GMS Components</h1>
        
        <!-- GmsInput Examples -->
        <section class="example-section">
          <h2>GmsInput</h2>
          <div class="example-grid">
            <GmsInput
              v-model="form.email"
              label="Email"
              type="email"
              placeholder="Nhập email"
              prefix-icon="fa-envelope"
              :required="true"
            />
            
            <GmsInput
              v-model="form.password"
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              :show-password-toggle="true"
              :required="true"
            />
            
            <GmsInput
              v-model="form.search"
              label="Tìm kiếm"
              type="search"
              placeholder="Tìm kiếm..."
              prefix-icon="fa-search"
              :clearable="true"
            />
          </div>
        </section>
        
        <!-- GmsButton Examples -->
        <section class="example-section">
          <h2>GmsButton</h2>
          <div class="example-buttons">
            <GmsButton variant="primary" @click="showToast('success', 'Primary button clicked')">
              Primary
            </GmsButton>
            <GmsButton variant="secondary">Secondary</GmsButton>
            <GmsButton variant="success">Success</GmsButton>
            <GmsButton variant="danger">Danger</GmsButton>
            <GmsButton variant="warning">Warning</GmsButton>
            <GmsButton variant="info">Info</GmsButton>
            <GmsButton variant="outline">Outline</GmsButton>
            <GmsButton variant="ghost">Ghost</GmsButton>
            <GmsButton :loading="loading" @click="handleLoading">Loading</GmsButton>
          </div>
        </section>
        
        <!-- GmsTable Example -->
        <section class="example-section">
          <h2>GmsTable</h2>
          <GmsTable
            :data="tableData"
            :columns="tableColumns"
            title="Danh sách người dùng"
            :pagination="true"
            :page-size="5"
            @row-click="handleRowClick"
          >
            <template #cell-status="{ value }">
              <span :class="`badge badge-${value === 'active' ? 'success' : 'danger'}`">
                {{ value === 'active' ? 'Hoạt động' : 'Không hoạt động' }}
              </span>
            </template>
          </GmsTable>
        </section>
        
        <!-- GmsDialog Example -->
        <section class="example-section">
          <h2>GmsDialog</h2>
          <GmsButton @click="showDialog = true">Mở Dialog</GmsButton>
          
          <GmsDialog
            v-model="showDialog"
            title="Xác nhận xóa"
            size="medium"
          >
            <p>Bạn có chắc chắn muốn xóa mục này không?</p>
            <template #footer>
              <GmsButton variant="outline" @click="showDialog = false">Hủy</GmsButton>
              <GmsButton variant="danger" @click="handleDelete">Xóa</GmsButton>
            </template>
          </GmsDialog>
        </section>
        
        <!-- Permission Example -->
        <section class="example-section">
          <h2>Permission System</h2>
          <div v-if="isManager">
            <p>Bạn là Manager - có quyền quản lý</p>
          </div>
          <div v-if="checkPermission('MANAGE_INVENTORY')">
            <p>Bạn có quyền quản lý kho</p>
          </div>
        </section>
      </main>
    </div>
    
    <!-- Toast Component -->
    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsInput, GmsButton, GmsTable, GmsDialog, GmsToast } from '@/components'
import { useToast } from '@/composables/useToast'
import { usePermission } from '@/composables/usePermission'
import { getMenuByRole } from '@/utils/menu'
import { ROLES } from '@/constant/roles'
import authService from '@/services/auth'

const toastRef = ref(null)
const toast = useToast()
const { checkPermission, isManager } = usePermission()

const sidebarCollapsed = ref(false)
const showDialog = ref(false)
const loading = ref(false)

const form = ref({
  email: '',
  password: '',
  search: ''
})

const notifications = ref([
  {
    id: 1,
    type: 'success',
    title: 'Thành công',
    message: 'Đã lưu thành công',
    time: new Date(),
    read: false
  }
])

const menuItems = ref([])

const tableData = ref([
  { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', role: 'Customer', status: 'active' },
  { id: 2, name: 'Trần Thị B', email: 'b@example.com', role: 'Staff', status: 'active' },
  { id: 3, name: 'Lê Văn C', email: 'c@example.com', role: 'Manager', status: 'inactive' }
])

const tableColumns = ref([
  { key: 'name', label: 'Tên', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Vai trò' },
  { key: 'status', label: 'Trạng thái' }
])

onMounted(() => {
  // Set toast instance
  if (toastRef.value) {
    const { setToastInstance } = require('@/composables/useToast')
    setToastInstance(toastRef.value)
  }
  
  // Get menu based on role
  const user = authService.getCurrentUser()
  if (user) {
    menuItems.value = getMenuByRole(user.role)
  } else {
    menuItems.value = getMenuByRole(ROLES.CUSTOMER)
  }
})

const handleSearch = (query) => {
  console.log('Search:', query)
}

const handleLogout = async () => {
  await authService.logout()
  // Redirect to login
}

const showToast = (type, message) => {
  toast[type](message)
}

const handleLoading = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    toast.success('Hoàn thành!')
  }, 2000)
}

const handleRowClick = (row) => {
  console.log('Row clicked:', row)
  toast.info(`Đã chọn: ${row.name}`)
}

const handleDelete = () => {
  showDialog.value = false
  toast.success('Đã xóa thành công!')
}
</script>

<style scoped>
.example-page {
  min-height: 100vh;
  background: var(--light, #f8f9fa);
}

.example-content {
  transition: margin-left 0.3s ease;
}

.main-content {
  padding: 2rem;
}

.example-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.example-section h2 {
  margin-bottom: 1.5rem;
  color: var(--dark, #2c3a47);
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.example-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>

