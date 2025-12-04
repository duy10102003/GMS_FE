# GMS Components Documentation

## Tổng quan

Dự án đã được thiết kế với các component tùy chỉnh, layout components, base API service và hệ thống phân quyền hoàn chỉnh.

## Components

### 1. GmsInput

Component input tùy chỉnh với nhiều tính năng.

**Props:**
- `modelValue`: Giá trị (v-model)
- `label`: Nhãn hiển thị
- `type`: Loại input (text, password, email, number, tel, url, search)
- `placeholder`: Placeholder text
- `disabled`: Vô hiệu hóa input
- `readonly`: Chỉ đọc
- `required`: Bắt buộc
- `errorMessage`: Thông báo lỗi
- `hint`: Gợi ý
- `prefixIcon`: Icon bên trái
- `suffixIcon`: Icon bên phải
- `clearable`: Hiển thị nút xóa
- `showPasswordToggle`: Hiển thị nút toggle password

**Ví dụ:**
```vue
<GmsInput
  v-model="email"
  label="Email"
  type="email"
  placeholder="Nhập email của bạn"
  prefix-icon="fa-envelope"
  :required="true"
/>
```

### 2. GmsButton

Component button tùy chỉnh.

**Props:**
- `label`: Text hiển thị
- `variant`: primary, secondary, success, danger, warning, info, outline, ghost
- `size`: small, medium, large
- `type`: button, submit, reset
- `disabled`: Vô hiệu hóa
- `loading`: Trạng thái loading
- `icon`: Icon hiển thị
- `iconRight`: Icon bên phải
- `block`: Full width
- `rounded`: Bo tròn

**Ví dụ:**
```vue
<GmsButton
  variant="primary"
  size="large"
  icon="fa-save"
  :loading="saving"
  @click="handleSave"
>
  Lưu
</GmsButton>
```

### 3. GmsTable

Component table với pagination và sorting.

**Props:**
- `data`: Dữ liệu mảng
- `columns`: Cấu hình cột
- `title`: Tiêu đề
- `loading`: Trạng thái loading
- `emptyText`: Text khi không có dữ liệu
- `pagination`: Bật pagination
- `pageSize`: Số items mỗi trang
- `scrollable`: Cho phép scroll

**Ví dụ:**
```vue
<GmsTable
  :data="users"
  :columns="columns"
  title="Danh sách người dùng"
  :pagination="true"
  :page-size="10"
  @row-click="handleRowClick"
/>
```

### 4. GmsToast

Component hiển thị thông báo toast.

**Sử dụng với composable:**
```vue
<script setup>
import { useToast } from '@/composables/useToast'

const toast = useToast()

const showSuccess = () => {
  toast.success('Thao tác thành công!')
}
</script>
```

### 5. GmsDialog

Component dialog/modal.

**Props:**
- `modelValue`: Hiển thị dialog (v-model)
- `title`: Tiêu đề
- `size`: small, medium, large, full
- `closable`: Cho phép đóng
- `closeOnOverlay`: Đóng khi click overlay
- `closeOnEscape`: Đóng khi nhấn Escape

**Ví dụ:**
```vue
<GmsDialog
  v-model="showDialog"
  title="Xác nhận"
  size="medium"
>
  <p>Bạn có chắc chắn muốn xóa?</p>
  <template #footer>
    <GmsButton @click="showDialog = false">Hủy</GmsButton>
    <GmsButton variant="danger" @click="handleDelete">Xóa</GmsButton>
  </template>
</GmsDialog>
```

## Layout Components

### TheHeader

Header component với search, notifications và user menu.

**Props:**
- `title`: Tiêu đề
- `showSearch`: Hiển thị search box
- `searchPlaceholder`: Placeholder cho search
- `showNotifications`: Hiển thị notifications
- `showUserName`: Hiển thị tên user
- `notifications`: Mảng notifications

**Events:**
- `@search`: Khi search
- `@notification-click`: Khi click notification
- `@logout`: Khi logout

### TheSideBar

Sidebar component với menu navigation.

**Props:**
- `collapsed`: Trạng thái collapse
- `collapsible`: Cho phép collapse
- `menuItems`: Mảng menu items

**Events:**
- `@update:collapsed`: Khi thay đổi collapsed
- `@menu-click`: Khi click menu
- `@logout`: Khi logout

## API Service

### Sử dụng API Service

```javascript
import api from '@/services/api'
import { API_ENDPOINTS } from '@/constant/api'

// GET request
const users = await api.get(API_ENDPOINTS.MANAGER.STAFF)

// POST request
const result = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
  email: 'user@example.com',
  password: 'password'
})

// PUT request
await api.put(`/users/${id}`, userData)

// DELETE request
await api.delete(`/users/${id}`)

// Upload file
await api.upload('/upload', file, { additionalData: 'value' })
```

## Authentication Service

```javascript
import authService from '@/services/auth'

// Login
await authService.login({ email, password })

// Logout
await authService.logout()

// Get current user
const user = authService.getCurrentUser()

// Check authenticated
const isAuth = authService.isAuthenticated()

// Get current role
const role = authService.getCurrentRole()
```

## Permission System

### Sử dụng Permission

```vue
<script setup>
import { usePermission } from '@/composables/usePermission'

const { checkPermission, isManager, isStaff } = usePermission()

// Check permission
if (checkPermission('MANAGE_INVENTORY')) {
  // Do something
}

// Check role
if (isManager.value) {
  // Manager only
}
</script>
```

### Router Guards

```javascript
import { requireAuth, requireRole, requirePermission } from '@/router/guards'
import { ROLES, PERMISSIONS } from '@/constant/roles'

// Require authentication
{
  path: '/dashboard',
  beforeEnter: requireAuth
}

// Require role
{
  path: '/manager/dashboard',
  beforeEnter: requireRole(ROLES.MANAGER)
}

// Require permission
{
  path: '/manager/inventory',
  beforeEnter: requirePermission(PERMISSIONS.MANAGE_INVENTORY)
}
```

## Menu Configuration

```javascript
import { getMenuByRole } from '@/utils/menu'
import { ROLES } from '@/constant/roles'

const menuItems = getMenuByRole(ROLES.CUSTOMER)
```

## Example Usage

Xem file `src/examples/ExampleUsage.vue` để xem ví dụ sử dụng đầy đủ.



