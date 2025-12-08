<template>
  <div class="booking-edit">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="sidebarMenu"
      :collapsible="true"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="booking-edit__body" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Chỉnh sửa lịch đặt"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />

      <main class="page">
        <div class="page-head">
          <button class="btn-ghost" @click="goBack">
            <i class="fa-solid fa-arrow-left"></i>
            Quay lại
          </button>
          <div class="head-actions">
            <GmsButton variant="primary" icon="fa-rotate" @click="loadBooking">Làm mới</GmsButton>
          </div>
        </div>

        <div class="state" v-if="loading">
          <i class="fas fa-spinner fa-spin"></i> Đang tải thông tin booking...
        </div>
        <div class="state state--error" v-else-if="error">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
        </div>

        <div v-else class="booking-edit__content">
          <div class="layout">
            <div class="main-column">
              <section class="card highlight">
                <div class="card-header">
                  <div>
                    <p class="muted">Mã lịch</p>
                    <h2>{{ bookingCode }}</h2>
                  </div>
                  <span class="status" :class="statusClass(form.status)">
                    {{ statusLabel(form.status) }}
                  </span>
                </div>
                <div class="info-grid">
                  <div>
                    <p class="muted">Ngày tạo</p>
                    <strong>{{ formatDate(form.createdDate) }}</strong>
                  </div>
                  <div>
                    <p class="muted">Thời gian đặt</p>
                    <strong>{{ form.bookingTime ? formatDate(form.bookingTime) : '-' }}</strong>
                  </div>
                </div>
              </section>

              <section class="card">
                <div class="card-title">
                  <i class="fa-regular fa-user"></i>
                  <div>
                    <h2>Thông tin khách hàng</h2>
                    <p>Họ tên, SĐT, Email</p>
                  </div>
                </div>
                <div class="form-grid three-cols">
                  <div class="form-control">
                    <label>Họ tên <span class="required">*</span></label>
                    <input v-model="form.customerName" type="text" placeholder="Nhập họ tên" />
                  </div>
                  <div class="form-control">
                    <label>Số điện thoại <span class="required">*</span></label>
                    <input v-model="form.phone" type="tel" placeholder="Nhập số điện thoại" />
                  </div>
                  <div class="form-control">
                    <label>Email</label>
                    <input v-model="form.email" type="email" placeholder="Email tài khoản" disabled />
                  </div>
                </div>
              </section>

              <section class="card">
                <div class="card-title">
                  <i class="fa-regular fa-calendar"></i>
                  <div>
                    <h2>Thông tin lịch</h2>
                    <p>Thời gian, xe, lý do</p>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-control">
                    <label>Thời gian đặt <span class="required">*</span></label>
                    <div class="input-icon">
                      <i class="fa-regular fa-calendar"></i>
                      <input v-model="form.bookingTimeInput" type="datetime-local" />
                    </div>
                  </div>
                  <div class="form-control">
                    <label>Tên xe <span class="required">*</span></label>
                    <input v-model="form.vehicleName" type="text" placeholder="Nhập tên hoặc dòng xe" />
                  </div>
                  <div class="form-control">
                    <label>Lý do</label>
                    <select v-model="form.reason">
                      <option value="">Chọn lý do</option>
                      <option value="Bảo dưỡng">Bảo dưỡng</option>
                      <option value="Sửa chữa">Sửa chữa</option>
                      <option value="Kiểm tra">Kiểm tra</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>
              </section>

              <section class="card">
                <div class="card-title">
                  <i class="fa-solid fa-note-sticky"></i>
                  <div>
                    <h2>Ghi chú</h2>
                    <p>Thông tin bổ sung cho lịch</p>
                  </div>
                </div>
                <div class="form-control full">
                  <label>Ghi chú</label>
                  <textarea v-model="form.notes" rows="4" placeholder="Nhập ghi chú nếu có"></textarea>
                </div>

                <div class="summary-card">
                  <h3>Tóm tắt lịch đặt</h3>
                  <div class="summary-row">
                    <span>Khách hàng:</span>
                    <strong>{{ form.customerName || '-' }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Số điện thoại:</span>
                    <strong>{{ form.phone || '-' }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Xe:</span>
                    <strong>{{ form.vehicleName || '-' }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Thời gian:</span>
                    <strong>{{ form.bookingTimeInput || '-' }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Lý do:</span>
                    <strong>{{ form.reason || '-' }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Ghi chú:</span>
                    <strong>{{ form.notes || '-' }}</strong>
                  </div>
                </div>
              </section>

              <div class="form-actions">
                <button class="btn-outline" @click="goBack">Hủy</button>
                <button class="btn-primary" :disabled="saving" @click="handleSubmit">
                  <span v-if="saving">Đang lưu...</span>
                  <span v-else>Lưu thay đổi</span>
                </button>
              </div>
            </div>

            <aside class="process-card">
              <h3>Thông tin nhanh</h3>
              <div class="step">
                <strong>Mã lịch</strong>
                <p>{{ bookingCode }}</p>
              </div>
              <div class="step">
                <strong>Trạng thái</strong>
                <p>{{ statusLabel(form.status) }}</p>
              </div>
              <div class="step">
                <strong>Ngày tạo</strong>
                <p>{{ formatDate(form.createdDate) }}</p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsButton } from '@/components'
import bookingService from '@/services/booking'
import authService from '@/services/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const sidebarCollapsed = ref(false)
const sidebarMenu = [
  { key: 'home', label: 'Trang chủ', icon: 'fa-house', path: '/customer/home' },
  { key: 'bookings', label: 'Lịch đặt', icon: 'fa-calendar-check', path: '/customer/booking/all' },
  { key: 'create', label: 'Đặt lịch mới', icon: 'fa-plus', path: '/booking/Guest' }
]
const notifications = ref([])

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const userEmail = ref('')
const form = reactive({
  customerId: null,
  status: '',
  createdDate: '',
  bookingTime: '',
  bookingTimeInput: '',
  customerName: '',
  phone: '',
  email: '',
  vehicleName: '',
  reason: '',
  notes: ''
})

const bookingCode = computed(() => form.bookingId || route.params.id || '-')

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateInput = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => `${n}`.padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const statusLabel = (status) => {
  if (status === 0 || status === 'PENDING') return 'Chờ xử lý'
  if (status === 1 || status === 'IN_PROGRESS') return 'Đang thực hiện'
  if (status === 2 || status === 'COMPLETED') return 'Đã hoàn thành'
  return 'Không rõ'
}

const statusClass = (status) => {
  if (status === 0 || status === 'PENDING') return 'pending'
  if (status === 1 || status === 'IN_PROGRESS') return 'progress'
  if (status === 2 || status === 'COMPLETED') return 'done'
  return 'unknown'
}

const loadBooking = async () => {
  const id = route.params.id
  if (!id) {
    error.value = 'Không tìm thấy mã booking'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await bookingService.getById(id)
    const data = res?.data || res
    userEmail.value = authService.getCurrentUser()?.email || ''
    form.bookingId = data.bookingId || data.id
    form.customerId = data.customerId ?? null
    form.status = data.status ?? data.bookingStatus ?? ''
    form.createdDate = data.createdDate || ''
    form.bookingTime = data.bookingTime || ''
    form.bookingTimeInput = formatDateInput(data.bookingTime || data.createdDate)
    form.customerName = data.customerName || ''
    form.phone = data.customerPhone || data.phone || ''
    form.email = userEmail.value || data.customerEmail || data.email || ''
    form.vehicleName = data.vehicleName || data.vehicle || ''
    form.reason = data.reason || ''
    form.notes = data.notes || data.note || ''
  } catch (err) {
    console.error(err)
    error.value = err?.response?.data?.message || err?.message || 'Không tải được chi tiết booking'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  if (!form.customerName.trim()) {
    toast.error('Vui lòng nhập họ tên')
    return false
  }
  if (!form.phone.trim()) {
    toast.error('Vui lòng nhập số điện thoại')
    return false
  }
  if (!form.bookingTimeInput) {
    toast.error('Vui lòng chọn thời gian đặt')
    return false
  }
  if (!form.vehicleName.trim()) {
    toast.error('Vui lòng nhập tên xe')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  const id = route.params.id
  if (!id) {
    toast.error('Không xác định được booking cần cập nhật')
    return
  }
  try {
    saving.value = true
    const payload = {
      customerId: form.customerId ?? undefined,
      customerName: form.customerName.trim(),
      customerPhone: form.phone.trim(),
      customerEmail: userEmail.value || form.email?.trim() || null,
      vehicleName: form.vehicleName.trim(),
      bookingTime: form.bookingTimeInput ? new Date(form.bookingTimeInput).toISOString() : null,
      reason: form.reason || '',
      notes: form.notes || '',
      note: form.notes || ''
    }
    await bookingService.update(id, payload)
    toast.success('Đã lưu thay đổi booking')
    router.push(`/customer/booking/${id}`)
  } catch (err) {
    console.error(err)
    toast.error('Không lưu được booking', err?.message || err?.response?.data?.message || '')
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.back()
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

onMounted(loadBooking)
</script>

<style scoped>
.booking-edit {
  display: flex;
  background: #f4f7fb;
  min-height: 100vh;
}

.booking-edit__body {
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page {
  padding: 90px 24px 32px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.btn-ghost {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.head-actions {
  display: flex;
  gap: 10px;
}

.booking-edit__content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.layout {
  display: grid;
  grid-template-columns: 2.3fr 1fr;
  gap: 14px;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
  padding: 16px;
}

.card.highlight {
  border: 1px solid #c7d2fe;
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.muted {
  color: #6b7280;
  margin: 0 0 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.card-title h2 {
  margin: 0;
}

.card-title p {
  margin: 2px 0 0;
  color: #6b7280;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.form-grid.three-cols {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.form-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-control label {
  font-weight: 600;
  color: #374151;
}

.form-control input,
.form-control select,
.form-control textarea {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
  font-size: 14px;
  background: #fff;
}

.form-control textarea {
  resize: vertical;
}

.input-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0 10px;
}

.input-icon input {
  border: none;
  outline: none;
  flex: 1;
  padding: 10px 4px;
}

.form-control.full {
  grid-column: 1 / -1;
}

.summary-card {
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  background: #f9fafb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed #e5e7eb;
  font-size: 14px;
}

.summary-row:last-child {
  border-bottom: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-outline {
  border: 1px solid #d1d5db;
  background: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary, #ff7a00);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
}

.process-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.process-card .step {
  border: 1px dashed #e5e7eb;
  padding: 10px;
  border-radius: 10px;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.status.pending {
  background: #fef3c7;
  color: #92400e;
}

.status.progress {
  background: #e0f2fe;
  color: #1d4ed8;
}

.status.done {
  background: #dcfce7;
  color: #166534;
}

.status.unknown {
  background: #e5e7eb;
  color: #374151;
}

.state {
  text-align: center;
  padding: 40px 10px;
  color: #6b7280;
}

.state i {
  margin-right: 6px;
}

@media (max-width: 992px) {
  .booking-edit__body {
    margin-left: 0;
  }
  .page {
    padding: 80px 14px 24px;
  }
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
