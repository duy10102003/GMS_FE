<template>
  <div class="booking-create">
    <TheSideBar
      v-if="isAuthenticated"
      :collapsed="sidebarCollapsed"
      :menu-items="sidebarMenu"
      :collapsible="true"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div
      class="booking-create__content"
      :style="isAuthenticated ? { marginLeft: sidebarCollapsed ? '80px' : '260px' } : { marginLeft: '0' }"
    >
      <header class="page-header">
        <div>
          <h1>Tạo đặt lịch mới</h1>
          <p>Điền thông tin khách hàng và xe để đặt lịch</p>
        </div>
      </header>

      <div class="layout">
        <div class="main-column">
          <section class="card" id="step-customer">
            <div class="card-title">
              <i class="fa-regular fa-user"></i>
              <div>
                <h2>Thông tin khách hàng</h2>
                <p>Thông tin liên hệ cơ bản</p>
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
                <input v-model="form.email" type="email" placeholder="Nhập email" />
              </div>
            </div>
          </section>

          <section class="card" id="step-booking">
            <div class="card-title">
              <i class="fa-regular fa-calendar"></i>
              <div>
                <h2>Thông tin đặt lịch</h2>
                <p>Chọn thời gian và xe</p>
              </div>
            </div>
            <div class="form-grid">
              <div class="form-control">
                <label>Thời gian đặt lịch <span class="required">*</span></label>
                <div class="input-icon">
                  <i class="fa-regular fa-calendar"></i>
                  <input v-model="form.bookingTime" type="datetime-local" />
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

          <section class="card" id="step-notes">
            <div class="card-title">
              <i class="fa-solid fa-location-dot"></i>
              <div>
                <h2>Ghi chú bổ sung</h2>
                <p>Thông tin thêm bạn muốn gửi</p>
              </div>
            </div>
            <div class="form-control full">
              <label>Ghi chú</label>
              <textarea v-model="form.notes" rows="4" placeholder="Thêm ghi chú cho lịch đặt"></textarea>
            </div>

            <div class="summary-card">
              <h3>Tóm tắt đặt lịch</h3>
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
                <strong>{{ form.bookingTime ? formatDate(form.bookingTime) : '-' }}</strong>
              </div>
              <div class="summary-row">
                <span>Lý do:</span>
                <strong>{{ form.reason || '-' }}</strong>
              </div>
            </div>
          </section>

          <div class="form-actions">
            <button class="btn-outline" @click="goBack">Hủy</button>
            <button class="btn-primary" :disabled="submitting" @click="handleSubmit">
              <span v-if="submitting">Đang lưu...</span>
              <span v-else>Tạo lịch</span>
            </button>
          </div>
        </div>

        <aside class="process-card">
          <h3>Tiến trình</h3>
          <div class="step" @click="scrollTo('step-customer')">
            <strong>Bước 1: Thông tin khách</strong>
            <p>Họ tên, Số điện thoại, Email</p>
          </div>
          <div class="step" @click="scrollTo('step-booking')">
            <strong>Bước 2: Thông tin đặt lịch</strong>
            <p>Ngày giờ, Xe, Lý do</p>
          </div>
          <div class="step" @click="scrollTo('step-notes')">
            <strong>Bước 3: Xem lại</strong>
            <p>Ghi chú & Tóm tắt</p>
          </div>
        </aside>
      </div>

      <GmsToast ref="toastRef" />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TheSideBar from '../../layout/TheSideBar.vue'
import authService from '@/services/auth'
import bookingService from '@/services/booking'
import { useToast } from '@/composables/useToast'
import { GmsToast } from '@/components'

const router = useRouter()
const toast = useToast()
const toastRef = ref(null)
const sidebarCollapsed = ref(false)
const isAuthenticated = computed(() => authService.isAuthenticated())
const submitting = ref(false)
const currentUser = ref(authService.getCurrentUser())

const sidebarMenu = [
  { key: 'bookings', label: 'Bookings', icon: 'fa-calendar-check', path: '/customer/bookings', exact: true },
  { key: 'vehicles', label: 'Vehicles', icon: 'fa-car', path: '#' },
  { key: 'customers', label: 'Customers', icon: 'fa-user', path: '#' },
  { key: 'reports', label: 'Reports', icon: 'fa-chart-column', path: '#' }
]

const form = reactive({
  customerName: '',
  phone: '',
  email: '',
  bookingTime: '',
  vehicleName: '',
  reason: '',
  notes: ''
})

const goBack = () => {
  router.push('/customer/home')
}

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const validateForm = () => {
  if (!form.customerName.trim()) {
    toast.error('Vui lòng nhập tên khách hàng')
    return false
  }
  if (!form.phone.trim()) {
    toast.error('Vui lòng nhập số điện thoại')
    return false
  }
  if (!form.email.trim()) {
    toast.error('Vui lòng nhập email')
    return false
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(form.email.trim())) {
    toast.error('Email không hợp lệ')
    return false
  }
  if (!form.bookingTime) {
    toast.error('Vui lòng chọn thời gian đặt lịch')
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
  try {
    submitting.value = true
    const reasonText = form.reason ? `Lý do: ${form.reason}` : ''
    const noteText = form.notes?.trim() || ''
    let finalNotes = null
    if (reasonText && noteText) {
      finalNotes = `${reasonText} - ${noteText}`
    } else {
      finalNotes = reasonText || noteText || null
    }

    const payload = {
      customerName: form.customerName?.trim() || 'Guest',
      customerPhone: form.phone.trim(),
      customerEmail: form.email?.trim() || null,
      vehicleName: form.vehicleName?.trim() || null,
      bookingTime: form.bookingTime ? new Date(form.bookingTime).toISOString() : null,
      notes: finalNotes || '',
      note: finalNotes || '' // phòng trường hợp BE dùng field note
    }

    if (isAuthenticated.value) {
      await bookingService.createByUser(payload)
    } else {
      await bookingService.createByGuest(payload)
    }

    toast.success('Đặt lịch thành công. Vui lòng đăng nhập bằng email để xem danh sách booking.')
    form.customerName = ''
    form.phone = ''
    form.email = ''
    form.bookingTime = ''
    form.vehicleName = ''
    form.reason = ''
    form.notes = ''
  } catch (error) {
    toast.error('Không tạo được đặt lịch', error.message || error.userMsg || '')
  } finally {
    submitting.value = false
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

onMounted(async () => {
  if (toastRef.value) {
    const { setToastInstance } = await import('@/composables/useToast')
    setToastInstance(toastRef.value)
  }

  const prefillFromUser = (user) => {
    if (!user) return
    form.customerName = user.fullName || user.name || form.customerName
    form.email = user.email || form.email
    form.phone = user.phone || user.phoneNumber || form.phone
  }

  prefillFromUser(currentUser.value)

  const token = localStorage.getItem('token')
  if (token) {
    try {
      const profile = await authService.getProfile()
      currentUser.value = profile || currentUser.value
      prefillFromUser(currentUser.value)
    } catch (error) {
      console.warn('Không lấy được profile, dùng cache local.', error)
    }
  }
})
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

.booking-create {
  display: flex;
  min-height: 100vh;
  background: #f4f7fb;
}

.booking-create__content {
  flex: 1;
  padding: 28px 32px 40px;
  transition: margin-left 0.2s ease;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.page-header h1 {
  margin: 0 0 6px;
  font-size: 26px;
  color: #1f2933;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px 22px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-title h2 {
  margin: 0;
  font-size: 22px;
  color: #0f172a;
}

.card-title p {
  margin: 2px 0 0;
  color: #6b7280;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px 16px;
}

.form-grid.three-cols {
  grid-template-columns: repeat(3, minmax(200px, 1fr));
}

.form-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-control.full {
  grid-column: 1 / -1;
}

label {
  font-weight: 700;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #f97316;
}

input,
textarea,
select {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #ff7a00;
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.15);
}

.input-icon {
  position: relative;
}

.input-icon i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.input-icon input {
  padding-left: 38px;
}

textarea {
  resize: vertical;
}

.summary-card {
  margin-top: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  background: #f9fafb;
}

.summary-card h3 {
  margin: 0 0 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: #4b5563;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-primary,
.btn-outline {
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--primary, #ff7a00);
  color: #fff;
  box-shadow: 0 12px 30px rgba(255, 122, 0, 0.25);
}

.btn-primary:hover {
  background: var(--primary-dark, #e66d00);
}

.btn-outline {
  background: #fff;
  color: #1f2933;
  border-color: #d1d5db;
}

.btn-outline:hover {
  border-color: #ff7a00;
  color: #ff7a00;
}

.process-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  height: fit-content;
  position: sticky;
  top: 16px;
}

.process-card h3 {
  margin: 0 0 12px;
  color: #0f172a;
}

.step {
  padding: 10px 0;
  border-bottom: 1px solid #f1f2f4;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.step:last-child {
  border-bottom: none;
}

.step strong {
  color: #0f172a;
  font-weight: 700;
}

.step p {
  margin: 4px 0 0;
  color: #6b7280;
}

.step:hover {
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .form-grid.three-cols {
    grid-template-columns: 1fr;
  }
  .booking-create__content {
    margin-left: 0 !important;
    padding: 20px;
  }
}
</style>
