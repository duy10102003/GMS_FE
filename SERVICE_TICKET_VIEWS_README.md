# Service Ticket Views Documentation

## 📁 Cấu trúc Views

```
src/views/
├── staff/
│   ├── ServiceTicketsView.vue          # Danh sách service tickets (Staff)
│   ├── ServiceTicketDetailView.vue      # Chi tiết service ticket (Staff)
│   └── CreateServiceTicketView.vue      # Tạo service ticket mới (Staff)
└── mechanic/
    ├── MechanicTasksView.vue            # Danh sách tasks (Mechanic)
    └── MechanicTaskDetailView.vue        # Chi tiết task (Mechanic)
```

## 👨‍💼 Staff Views

### 1. ServiceTicketsView.vue
**Route:** `/staff/service-tickets`

**Tính năng:**
- ✅ Xem danh sách service tickets với phân trang
- ✅ Search theo mã phiếu, khách hàng, biển số
- ✅ Filter theo trạng thái, thợ phụ trách, khoảng thời gian
- ✅ Sort theo các cột
- ✅ Phân công thợ cho phiếu mới
- ✅ Xem chi tiết phiếu

**API sử dụng:**
- `POST /api/serviceticket/paging` - Lấy danh sách có phân trang
- `POST /api/serviceticket/{id}/assign` - Phân công thợ

**Status mapping:**
- `0` - PENDING → "Chờ xử lý"
- `1` - ASSIGNED → "Đã phân công"
- `2` - IN_PROGRESS → "Đang xử lý"
- `3` - COMPLETED → "Hoàn thành"
- `4` - CANCELLED → "Đã hủy"

### 2. ServiceTicketDetailView.vue
**Route:** `/staff/service-tickets/:id`

**Tính năng:**
- ✅ Xem chi tiết đầy đủ service ticket
- ✅ Thêm/xóa Parts
- ✅ Thêm/xóa Garage Services
- ✅ Phân công thợ (nếu chưa assign)
- ✅ Xem thông tin customer, vehicle, technical tasks

**API sử dụng:**
- `GET /api/serviceticket/{id}` - Lấy chi tiết
- `POST /api/serviceticket/{id}/parts` - Thêm part
- `POST /api/serviceticket/{id}/garage-services` - Thêm service
- `DELETE /api/serviceticket/{id}/details/{detailId}` - Xóa part/service
- `POST /api/serviceticket/{id}/assign` - Phân công thợ

### 3. CreateServiceTicketView.vue
**Route:** `/staff/service-tickets/create`

**Tính năng:**
- ✅ Tạo service ticket mới
- ✅ Chọn hoặc tạo customer mới
- ✅ Chọn hoặc tạo vehicle mới
- ✅ Phân công thợ ngay khi tạo (tùy chọn)

**API sử dụng:**
- `POST /api/serviceticket` - Tạo service ticket

**Form fields:**
- Customer: `customerId` hoặc `customerInfo` (name, phone, email)
- Vehicle: `vehicleId` hoặc `vehicleInfo` (name, licensePlate, make, model, currentKm)
- `initialIssue` - Vấn đề ban đầu (required)
- `assignedToTechnical` - Thợ phụ trách (optional)
- `assignDescription` - Mô tả công việc (optional)

## 🔧 Mechanic Views

### 1. MechanicTasksView.vue
**Route:** `/mechanic/tasks`

**Tính năng:**
- ✅ Xem danh sách tasks được assign
- ✅ Filter theo trạng thái task và service ticket
- ✅ Bắt đầu task (Pending → InProgress)
- ✅ Xác nhận hoàn thành task (InProgress → Completed)
- ✅ Xem chi tiết task

**API sử dụng:**
- `POST /api/serviceticket/mechanic/{mechanicId}/tasks` - Lấy danh sách tasks

**Task Status:**
- `0` - PENDING → "Chờ bắt đầu"
- `1` - IN_PROGRESS → "Đang thực hiện"
- `2` - COMPLETED → "Hoàn thành"

### 2. MechanicTaskDetailView.vue
**Route:** `/mechanic/tasks/:id`

**Tính năng:**
- ✅ Xem chi tiết task
- ✅ Xem thông tin service ticket, customer, vehicle
- ✅ Xem danh sách parts và services
- ✅ Đề xuất parts/services mới
- ✅ Bắt đầu task
- ✅ Xác nhận hoàn thành task

**API sử dụng:**
- `GET /api/serviceticket/mechanic/{mechanicId}/tasks/{technicalTaskId}` - Lấy chi tiết
- `POST /api/serviceticket/technical-tasks/{id}/propose?mechanicId={id}` - Đề xuất
- `POST /api/serviceticket/technical-tasks/{id}/start?mechanicId={id}` - Bắt đầu
- `POST /api/serviceticket/technical-tasks/{id}/confirm?mechanicId={id}` - Hoàn thành

## 🔌 Service Layer

### serviceTicket.js
Service layer để gọi API, bao gồm tất cả methods:
- `getPaging()` - Phân trang
- `getById()` - Chi tiết
- `create()` - Tạo mới
- `update()` - Cập nhật
- `assign()` - Phân công
- `addPart()` - Thêm part
- `addGarageService()` - Thêm service
- `deleteDetail()` - Xóa detail
- `approveProposal()` - Duyệt đề xuất (Staff)
- `getMechanicTasks()` - Lấy tasks của mechanic
- `getMechanicTaskDetail()` - Chi tiết task
- `proposePartsServices()` - Đề xuất (Mechanic)
- `startTask()` - Bắt đầu task
- `confirmTask()` - Xác nhận hoàn thành

## 📊 Constants

### serviceTicketStatus.js
Định nghĩa các constants:
- `SERVICE_TICKET_STATUS` - Status values (0-4)
- `SERVICE_TICKET_STATUS_LABELS` - Labels tiếng Việt
- `SERVICE_TICKET_STATUS_COLORS` - Màu sắc cho badges
- `TASK_STATUS` - Task status values (0-2)
- `TASK_STATUS_LABELS` - Labels tiếng Việt
- `TASK_STATUS_COLORS` - Màu sắc cho badges

## 🛣️ Routes

```javascript
// Staff routes
/staff/service-tickets              → ServiceTicketsView
/staff/service-tickets/create       → CreateServiceTicketView
/staff/service-tickets/:id         → ServiceTicketDetailView

// Mechanic routes
/mechanic/tasks                     → MechanicTasksView
/mechanic/tasks/:id                 → MechanicTaskDetailView
```

Tất cả routes đều có guards:
- `requireAuth` - Yêu cầu đăng nhập
- `requireStaff` - Yêu cầu role Staff
- `requireMechanic` - Yêu cầu role Mechanic

## 💡 Usage Examples

### Staff - Tạo Service Ticket
```vue
<GmsButton @click="router.push('/staff/service-tickets/create')">
  Tạo phiếu mới
</GmsButton>
```

### Staff - Phân công thợ
```javascript
await serviceTicketService.assign(ticketId, {
  assignedToTechnical: mechanicId,
  description: 'Mô tả công việc'
})
```

### Mechanic - Bắt đầu task
```javascript
await serviceTicketService.startTask(taskId, mechanicId)
```

### Mechanic - Đề xuất parts
```javascript
await serviceTicketService.proposePartsServices(taskId, mechanicId, {
  parts: [
    { partId: 1, quantity: 2 }
  ],
  garageServices: [
    { garageServiceId: 1, quantity: 1 }
  ]
})
```

## 📝 Notes

1. **Status Flow:**
   - Service Ticket: PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
   - Task: PENDING → IN_PROGRESS → COMPLETED

2. **Permissions:**
   - Staff có thể tạo, sửa, assign, thêm parts/services
   - Mechanic chỉ có thể xem tasks của mình và đề xuất

3. **Validation:**
   - Tất cả forms đều có validation
   - API sẽ trả về lỗi nếu validation fail

4. **Error Handling:**
   - Tất cả errors đều được hiển thị qua Toast
   - Loading states được quản lý đúng cách



