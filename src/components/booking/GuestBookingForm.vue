<template>
  <div class="booking-form" :class="{ 'booking-form--modal': variant === 'modal' }">
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
                <input v-model="form.bookingTime" type="datetime-local" :min="minDateTime" required />
              </div>
            </div>
            <div class="form-control">
              <label>Tên xe <span class="required">*</span></label>
              <input v-model="form.vehicleName" type="text" placeholder="Nhập tên hoặc dòng xe" />
            </div>
            <div class="form-control">
              <label>Lý do <span class="required">*</span></label>
              <select v-model="form.reason" required>
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
            <h3>Tổng tắt đặt lịch</h3>
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
          <button v-if="showCancel" class="btn-outline" @click="handleCancel">Hủy</button>
          <button class="btn-primary" :disabled="submitting" @click="handleSubmit">
            <span v-if="submitting">Đang lưu...</span>
            <span v-else>Tạo lịch</span>
          </button>
        </div>
      </div>

      <aside v-if="showProcess" class="process-card">
        <h3>Tiến trình</h3>
        <div class="step" @click="scrollTo('step-customer')">
          <strong>Bước 1: Thông tin khách hàng</strong>
          <p>Họ tên, Số điện thoại, Email</p>
        </div>
        <div class="step" @click="scrollTo('step-booking')">
          <strong>Bước 2: Thông tin đặt lịch</strong>
          <p>Ngày giờ, Xe, Lý do</p>
        </div>
        <div class="step" @click="scrollTo('step-notes')">
          <strong>Bước 3: Xem lại</strong>
          <p>Ghi chú & Tổng tắt</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth'
import bookingService from '@/services/booking'
import customerService from '@/services/customer'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  showProcess: { type: Boolean, default: true },
  showCancel: { type: Boolean, default: true },
  variant: { type: String, default: 'page' },
  onCancel: { type: Function, default: null },
  onSuccess: { type: Function, default: null }
})

const emit = defineEmits(['cancel', 'success'])

const router = useRouter()
const toast = useToast()
const submitting = ref(false)
const currentUser = ref(authService.getCurrentUser())
const isAuthenticated = computed(() => authService.isAuthenticated())
const isOnHome = computed(() => router.currentRoute.value.path === '/home')

const minDateTime = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
})

const form = reactive({
  customerName: '',
  phone: '',
  email: '',
  bookingTime: '',
  vehicleName: '',
  reason: '',
  notes: ''
})

const handleCancel = () => {
  emit('cancel')
  if (props.onCancel) {
    props.onCancel()
    return
  }
  if (isAuthenticated.value) {
    router.push('/customer/home')
  } else {
    router.push('/home')
  }
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
  const phonePattern = /^0[35789][0-9]{8}$/
  const phoneCleaned = form.phone.trim().replace(/\s+/g, '').replace(/[-\/]/g, '')
  if (!phonePattern.test(phoneCleaned)) {
    toast.error('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10 chữ số bắt đầu bằng 0 (ví dụ: 0912345678)')
    return false
  }

  if (form.email.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(form.email.trim())) {
      toast.error('Email không hợp lệ. Vui lòng kiểm tra lại.')
      return false
    }
  }

  if (!form.bookingTime) {
    toast.error('Vui lòng chọn thời gian đặt lịch')
    return false
  }
  const selectedDate = new Date(form.bookingTime)
  const now = new Date()
  now.setSeconds(0, 0)
  selectedDate.setSeconds(0, 0)
  if (selectedDate < now) {
    toast.error('Thời gian đặt lịch không được trước thời điểm hiện tại')
    return false
  }

  if (!form.vehicleName.trim()) {
    toast.error('Vui lòng nhập tên xe')
    return false
  }

  if (!form.reason || !form.reason.trim()) {
    toast.error('Vui lòng chọn lý do đặt lịch')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  try {
    submitting.value = true
    const noteText = form.notes?.trim() || ''
    const payload = {
      customerName: form.customerName?.trim() || 'Guest',
      customerPhone: form.phone.trim(),
      customerEmail: form.email?.trim() || null,
      vehicleName: form.vehicleName?.trim() || null,
      bookingTime: form.bookingTime ? new Date(form.bookingTime).toISOString() : null,
      reason: form.reason?.trim() || '',
      notes: noteText,
      note: noteText
    }

    if (isAuthenticated.value) {
      const phone = form.phone.trim()
      const userId = currentUser.value?.userId || currentUser.value?.id

      await bookingService.createByUser({
        ...payload,
        customerPhone: phone,
        userId
      })
      toast.success('Đặt lịch thành công.')
      emit('success')
      if (props.onSuccess) {
        props.onSuccess()
      }
      setTimeout(() => router.push('/customer/home'), 1000)
    } else {
      await bookingService.createByGuest(payload)
      toast.success('Đặt lịch thành công. Vui lòng đăng nhập bằng Gmail để xem chi tiết lịch đặt.')
      emit('success')
      if (props.onSuccess) {
        props.onSuccess()
      }
      if (!isOnHome.value) {
        setTimeout(() => router.push('/home'), 1000)
      }
    }
  } catch (error) {
    toast.error('Không tạo được đặt lịch', error.message || error.userMsg || '')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const prefillFromUser = (user, customer = null) => {
    if (!user && !customer) return
    const customerPhone = customer?.customerPhone || customer?.phone || customer?.phoneNumber || ''
    form.customerName =
      user?.fullName ||
      user?.name ||
      customer?.fullName ||
      customer?.name ||
      form.customerName
    form.email = user?.email || customer?.email || form.email
    form.phone =
      user?.customerPhone ||
      user?.phone ||
      user?.phoneNumber ||
      customerPhone ||
      form.phone
  }

  prefillFromUser(currentUser.value)

  const token = localStorage.getItem('token')
  if (token) {
    try {
      const profile = await authService.getProfile()
      currentUser.value = profile || currentUser.value
      prefillFromUser(currentUser.value)
      if (!form.phone && currentUser.value?.customerId) {
      const customerRes = await customerService.getByUserId(userId)
      console.log('customerRes', customerRes)
      const customer = customerRes?.data || customerRes
      console.log('customer', customer)
        prefillFromUser(currentUser.value, customer)
      }
    } catch (error) {
      console.warn('Không lấy được profile, đang dùng cache local.', error)
    }
  }
})
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

.booking-form {
  width: 100%;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
  gap: 20px;
  align-items: start;
}

.booking-form--modal .layout {
  grid-template-columns: minmax(0, 1fr);
}

.main-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 120% at 10% 10%, rgba(255, 122, 0, 0.06), transparent),
    radial-gradient(120% 120% at 90% 0%, rgba(59, 130, 246, 0.05), transparent);
  pointer-events: none;
}

.card > * {
  position: relative;
  z-index: 1;
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
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
  height: fit-content;
  position: sticky;
  top: 90px;
}

.booking-form--modal .process-card {
  position: static;
}

.process-card h3 {
  margin: 0 0 12px;
  color: #0f172a;
}

.step {
  padding: 12px 10px;
  border-bottom: 1px solid #f1f2f4;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  border-radius: 10px;
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
  background: linear-gradient(90deg, rgba(255, 122, 0, 0.08), rgba(255, 255, 255, 0));
  box-shadow: inset 0 0 0 1px #ffe8d6;
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .form-grid.three-cols {
    grid-template-columns: 1fr;
  }
}
</style>


