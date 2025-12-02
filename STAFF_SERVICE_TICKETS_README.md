# Staff Service Tickets View

## Tổng quan

View này cho phép staff xem và quản lý danh sách service tickets với đầy đủ tính năng:
- **Search**: Tìm kiếm theo mã phiếu, khách hàng, biển số, dịch vụ
- **Filter**: Lọc theo trạng thái, thợ phụ trách, khoảng thời gian
- **Sort**: Sắp xếp theo các cột
- **Pagination**: Phân trang dữ liệu
- **Actions**: Phân công thợ, hoàn thành, tạo hóa đơn

## Tính năng

### 1. Search
- Tìm kiếm real-time trong các trường:
  - Mã phiếu
  - Tên khách hàng
  - Số điện thoại
  - Biển số xe
  - Dịch vụ

### 2. Filters
- **Trạng thái**: New, Assigned, In Progress, Completed, Invoiced, Paid, Cancelled
- **Thợ phụ trách**: Lọc theo thợ đã được phân công
- **Từ ngày / Đến ngày**: Lọc theo khoảng thời gian tạo phiếu

### 3. Sort
- Sắp xếp theo:
  - Mã phiếu
  - Biển số
  - Trạng thái
  - Ngày tạo
- Hỗ trợ sort tăng dần/giảm dần

### 4. Pagination
- Hiển thị 10 items mỗi trang (có thể thay đổi)
- Navigation với prev/next và page numbers

### 5. Actions
Tùy theo trạng thái của phiếu:
- **New**: Nút "Phân công" - Mở dialog chọn thợ
- **Assigned/In Progress**: Nút "Hoàn thành" - Xác nhận hoàn thành
- **Completed**: Nút "Tạo hóa đơn" - Tạo hóa đơn cho phiếu
- **Tất cả**: Nút "Chi tiết" - Xem chi tiết phiếu

## Cấu trúc Component

```
ServiceTicketsView.vue
├── TheSideBar (Navigation)
├── TheHeader (Header với notifications)
├── Toolbar
│   ├── Search Input
│   └── Create Button
├── Filters
│   ├── Status Filter
│   ├── Mechanic Filter
│   ├── Date Range Filters
│   └── Clear Filters Button
├── GmsTable
│   ├── Columns với custom cells
│   ├── Customer info (name + phone)
│   ├── Mechanic info (avatar + name)
│   ├── Status badge
│   └── Action buttons
├── Assign Dialog
│   └── Mechanic selection grid
├── Complete Dialog
│   └── Confirmation
└── GmsToast (Notifications)
```

## API Endpoints

View này sử dụng các API endpoints:

```javascript
// Lấy danh sách service tickets
GET /api/staff/service-tickets

// Phân công thợ
PUT /api/staff/service-tickets/:id/assign
Body: { mechanicId: number }

// Hoàn thành phiếu
PUT /api/staff/service-tickets/:id/complete

// Tạo hóa đơn
POST /api/staff/service-tickets/:id/invoice

// Lấy danh sách thợ
GET /api/mechanics
```

## Data Structure

### Service Ticket
```typescript
{
  id: number
  code: string // "SV001"
  customerName: string
  customerPhone: string
  plateNumber: string
  service: string
  mechanic: {
    id: number
    name: string
  } | null
  status: 'New' | 'Assigned' | 'In Progress' | 'Completed' | 'Invoiced' | 'Paid' | 'Cancelled'
  createdAt: string // ISO date
}
```

### Mechanic
```typescript
{
  id: number
  name: string
  tickets: number // Số phiếu đang xử lý
  status: 'available' | 'busy'
}
```

## Usage

### Route
```javascript
{
  path: '/staff/service-tickets',
  name: 'staff-service-tickets',
  component: ServiceTicketsView,
  beforeEnter: [requireAuth, requireStaff]
}
```

### Import
```vue
<script setup>
import ServiceTicketsView from '@/views/staff/ServiceTicketsView.vue'
</script>
```

## Customization

### Thay đổi page size
```vue
<GmsTable
  :page-size="20"
  ...
/>
```

### Thêm filter mới
1. Thêm vào `filters` ref:
```javascript
const filters = ref({
  status: '',
  mechanic: '',
  fromDate: '',
  toDate: '',
  newFilter: '' // Thêm filter mới
})
```

2. Thêm vào template:
```vue
<div class="filter-group">
  <label>Filter mới:</label>
  <select v-model="filters.newFilter" @change="applyFilters">
    ...
  </select>
</div>
```

3. Thêm logic vào `filteredTickets` computed:
```javascript
if (filters.value.newFilter) {
  result = result.filter(ticket => ticket.field === filters.value.newFilter)
}
```

### Thêm column mới
```javascript
const tableColumns = ref([
  // ... existing columns
  { key: 'newField', label: 'Field mới', sortable: true }
])
```

## Styling

View sử dụng CSS variables từ design system:
- `--primary`: #FF7A00
- `--success`: #10AC84
- `--danger`: #EE5253
- `--warning`: #F7B731
- `--info`: #54A0FF

Các class utility:
- `.badge`: Badge styles
- `.text-muted`: Muted text
- `.text-success`: Success color
- `.text-warning`: Warning color

## Notes

- View tự động load data khi mount
- Toast notifications cho các actions
- Loading state khi fetch data
- Error handling với toast messages
- Permission check với router guards

