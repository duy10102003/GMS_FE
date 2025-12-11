<template>
  <div class="booking-detail">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      :collapsible="true"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="booking-detail__body" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Chi tiết lịch đặt"
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

        <!-- <div class="progress-nav">
          <button class="progress-link" @click="scrollTo('overview')">Tóm tắt</button>
          <button class="progress-link" @click="scrollTo('customer')">Khách hàng</button>
          <button class="progress-link" @click="scrollTo('booking')">Lịch</button>
          <button class="progress-link" @click="scrollTo('notes')">Ghi chú</button>
        </div> -->

        <div class="state" v-if="loading">
          <i class="fas fa-spinner fa-spin"></i> Đang tải chi tiết booking...
        </div>
        <div class="state state--error" v-else-if="error">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
        </div>

        <div v-else class="booking-detail__content">
          <div class="layout">
            <div class="main-column">
              <section ref="sectionRefs.customer" class="card" id="step-customer">
                <div class="card-title">
                  <i class="fa-regular fa-user"></i>
                  <div>
                    <h2>Thông tin khách hàng</h2>
                    <p>Thông tin liên hệ cơ bản</p>
                  </div>
                </div>
                <div class="form-grid three-cols">
                  <div class="form-control">
                    <label>Họ tên</label>
                    <input v-model="form.customerName" type="text" disabled />
                  </div>
                  <div class="form-control">
                    <label>Số điện thoại</label>
                    <input v-model="form.phone" type="tel" disabled />
                  </div>
                  <div class="form-control">
                    <label>Email</label>
                    <input v-model="form.email" type="email" disabled />
                  </div>
                </div>
              </section>

              <section ref="sectionRefs.booking" class="card" id="step-booking">
                <div class="card-title">
                  <i class="fa-regular fa-calendar"></i>
                  <div>
                    <h2>Thông tin lịch</h2>
                    <p>Thời gian, xe, lý do</p>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-control">
                    <label>Thời gian đặt lịch</label>
                    <div class="input-icon">
                      <i class="fa-regular fa-calendar"></i>
                      <input v-model="form.bookingTime" type="text" disabled />
                    </div>
                  </div>
                  <div class="form-control">
                    <label>Tên xe</label>
                    <input v-model="form.vehicleName" type="text" disabled />
                  </div>
                  <div class="form-control">
                    <label>Lý do</label>
                    <input v-model="form.reason" type="text" disabled />
                  </div>
                </div>
              </section>

              <section ref="sectionRefs.notes" class="card" id="step-notes">
                <div class="card-title">
                  <i class="fa-solid fa-location-dot"></i>
                  <div>
                    <h2>Ghi chú bổ sung</h2>
                    <p>Thông tin thêm</p>
                  </div>
                </div>
                <div class="form-control full">
                  <label>Ghi chú</label>
                  <textarea v-model="form.notes" rows="4" disabled></textarea>
                </div>

                <div class="summary-card">
                  <h3>Tóm tắt lịch</h3>
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
                    <strong>{{ form.bookingTime || '-' }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Lý do:</span>
                    <strong>{{ form.reason || '-' }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Trạng thái:</span>
                    <strong>{{ statusLabel(form.status) }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Mã lịch:</span>
                    <strong>{{ bookingCode }}</strong>
                  </div>
                </div>
              </section>
            </div>

            <aside class="process-card sticky">
              <h3>Tiến trình</h3>
              <div class="step" @click="scrollTo('customer')">
                <strong>Bước 1: Thông tin khách</strong>
                <p>Họ tên, SĐT, Email</p>
              </div>
              <div class="step" @click="scrollTo('booking')">
                <strong>Bước 2: Thông tin lịch</strong>
                <p>Ngày giờ, Xe, Lý do</p>
              </div>
              <div class="step" @click="scrollTo('notes')">
                <strong>Bước 3: Tóm tắt</strong>
                <p>Ghi chú & tổng quan</p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsButton } from '@/components'
import bookingService from '@/services/booking'
import authService from '@/services/auth'
import { useToast } from '@/composables/useToast'
import { getMenuByRole } from '@/utils/menu'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const sidebarCollapsed = ref(false)
const menuItems = ref([])
const notifications = ref([])

const loading = ref(false)
const error = ref('')
const userEmail = ref('')
const form = reactive({
  status: '',
  createdDate: '',
  bookingTimeRaw: '',
  bookingTime: '',
  customerName: '',
  phone: '',
  email: '',
  vehicleName: '',
  reason: '',
  notes: ''
})
const booking = ref(null)
const sectionRefs = {
  overview: ref(null),
  customer: ref(null),
  booking: ref(null),
  notes: ref(null)
}

const bookingCode = computed(() => booking.value?.bookingCode || booking.value?.bookingId || booking.value?.id || '-')

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
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
    booking.value = data
    form.status = data.status ?? data.bookingStatus ?? ''
    form.createdDate = data.createdDate || ''
    form.bookingTimeRaw = data.bookingTime || ''
    form.bookingTime = data.bookingTime ? formatDate(data.bookingTime) : ''
    form.customerName = data.customerName || ''
    form.phone = data.customerPhone || data.phone || ''
    form.email = data.customerEmail || data.email || userEmail.value
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

const goBack = () => {
  router.back()
}

const scrollTo = (key) => {
  const el = sectionRefs[key]?.value
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

onMounted(async () => {
  const user = authService.getCurrentUser()
  if (user?.role) {
    menuItems.value = getMenuByRole(user.role)
  }
  await loadBooking()
})
</script>

<style scoped>
.booking-detail {
  display: flex;
  background: #f4f7fb;
  min-height: 100vh;
}

.booking-detail__body {
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page {
  padding: 90px 24px 32px;
}

.progress-nav {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.progress-link {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  color: #374151;
  font-weight: 600;
  transition: all 0.2s ease;
}

.progress-link:hover {
  border-color: #2563eb;
  color: #2563eb;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
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

.booking-detail__content {
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
  scroll-margin-top: 90px;
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
  background: #f9fafb;
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
  background: #f9fafb;
}

.input-icon input {
  border: none;
  outline: none;
  flex: 1;
  padding: 10px 4px;
  background: transparent;
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

.process-card.sticky {
  position: sticky;
  top: 90px;
}

.process-card .step {
  border: 1px dashed #e5e7eb;
  padding: 10px;
  border-radius: 10px;
}

.process-card .step.step-link {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.process-card .step.step-link:hover {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
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
  .booking-detail__body {
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
