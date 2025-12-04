# Service Ticket Implementation Guide

## Đã hoàn thành

### 1. Service Files
- ✅ `src/services/customer.js` - Search customer
- ✅ `src/services/vehicle.js` - Search vehicle
- ✅ `src/services/technicalTask.js` - Technical task operations
- ✅ `src/services/invoice.js` - Invoice operations
- ✅ `src/services/serviceTicket.js` - Updated with `createWithPartsServices`
- ✅ `src/services/part.js` - Added `search` method
- ✅ `src/services/garageService.js` - Added `search` method

### 2. Views
- ✅ `src/views/staff/CreateServiceTicketView.vue` - Tạo phiếu dịch vụ với search Customer/Vehicle/Part/Service

## Cần hoàn thiện

### 1. ServiceTicketDetailView
Cần thêm:
- Hiển thị Technical Tasks với status
- Button "Xác nhận điều chỉnh" khi status = AdjustedByTechnical (1)
- Button "Tạo hóa đơn" khi status = Completed (3)
- Hiển thị parts/services đã được technical điều chỉnh

### 2. MechanicTaskDetailView
Cần cập nhật:
- Button "Điều chỉnh Parts/Services" khi status = PendingTechnicalConfirmation (0)
- Form điều chỉnh với search Parts/Services
- Button "Hoàn thành" khi status = InProgress (2)

### 3. MechanicTasksView
Cần cập nhật:
- Filter theo `assignedToTechnical`
- Filter theo `serviceTicketStatus`
- Hiển thị đúng theo API mới

### 4. InvoiceView
Cần tạo mới:
- Danh sách invoices với pagination
- Tạo invoice từ service ticket
- Chi tiết invoice

## API Endpoints sử dụng

### Customer
- `POST /api/Customer/search` - Tìm kiếm customer

### Vehicle
- `POST /api/Vehicle/search` - Tìm kiếm vehicle

### Part
- `GET /api/Part/search` - Tìm kiếm part

### GarageService
- `POST /api/GarageService/search` - Tìm kiếm service

### ServiceTicket
- `POST /api/ServiceTicket/create-with-parts-services` - Tạo service ticket
- `POST /api/ServiceTicket/paging` - Phân trang
- `GET /api/ServiceTicket/{id}` - Chi tiết
- `DELETE /api/ServiceTicket/{id}` - Hủy

### TechnicalTask
- `POST /api/TechnicalTask/paging` - Phân trang
- `GET /api/TechnicalTask/{id}` - Chi tiết
- `PUT /api/TechnicalTask/{id}/adjust` - Điều chỉnh
- `PUT /api/TechnicalTask/{id}/confirm?confirmedBy={staffId}` - Xác nhận
- `PUT /api/TechnicalTask/{id}/complete` - Hoàn thành

### Invoice
- `POST /api/Invoice` - Tạo invoice
- `POST /api/Invoice/paging` - Phân trang
- `GET /api/Invoice/{id}` - Chi tiết

## Status Codes

### Service Ticket Status
- `0` - PendingTechnicalConfirmation
- `1` - AdjustedByTechnical
- `2` - InProgress
- `3` - Completed
- `4` - Cancelled

### Technical Task Status
- `0` - Pending
- `1` - InProgress
- `2` - Completed

## Luồng nghiệp vụ

1. **Staff tạo Service Ticket** → Status: PendingTechnicalConfirmation (0)
2. **Technical điều chỉnh** → Status: AdjustedByTechnical (1)
3. **Staff xác nhận** → Status: InProgress (2)
4. **Technical hoàn thành** → Status: Completed (3)
5. **Staff tạo Invoice**


