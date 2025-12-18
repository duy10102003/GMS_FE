<template>
  <div class="manager-warranty-detail">
    <TheSideBar @logout="handleLogout" />

    <div class="content">
      <TheHeader
        :title="headerTitle"
        :show-search="false"
        @logout="handleLogout"
      />

      <main class="page">
        <div class="page-head">
          <button class="btn-ghost" @click="goBack">
            <i class="fa-solid fa-arrow-left"></i>
            Quay lại
          </button>
          <div class="head-actions">
            <GmsButton variant="primary" icon="fa-rotate" @click="loadWarranty">
              Làm mới
            </GmsButton>
          </div>
        </div>

        <div v-if="loading" class="state">
          <i class="fas fa-spinner fa-spin"></i>
          Đang tải chi tiết bảo hành...
        </div>
        <div v-else-if="error" class="state state--error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          {{ error }}
        </div>

        <div v-else-if="warranty" class="warranty-detail-content">
          <section class="card">
            <div class="card-title">
              <i class="fa-solid fa-shield-halved"></i>
              <div>
                <h2>Thông tin bảo hành</h2>
                <p>Thông tin chung về phiếu bảo hành</p>
              </div>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <label>Mã bảo hành</label>
                <span class="value">{{ warranty.warrantyCode || warranty.id || warranty.warrantyId || '-' }}</span>
              </div>
              <div class="info-item">
                <label>Trạng thái</label>
                <span :class="`badge badge-${getStatusColor(warranty.status)}`">
                  {{ getStatusLabel(warranty.status) }}
                </span>
              </div>
              <div class="info-item">
                <label>Ngày bắt đầu</label>
                <span class="value">{{ formatDate(warranty.startDate) }}</span>
              </div>
              <div class="info-item">
                <label>Ngày kết thúc</label>
                <span class="value">{{ formatDate(warranty.endDate) }}</span>
              </div>
              <!-- <div class="info-item">
                <label>Số tháng bảo hành</label>
                <span class="value">
                  {{ warranty.warrantyMonth != null ? `${warranty.warrantyMonth} tháng` : '-' }}
                </span>
              </div> -->
              <div class="info-item" v-if="warranty.createdDate">
                <label>Ngày tạo</label>
                <span class="value">{{ formatDate(warranty.createdDate) }}</span>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-title">
              <i class="fa-solid fa-user"></i>
              <div>
                <h2>Khách hàng</h2>
                <p>Thông tin khách hàng được bảo hành</p>
              </div>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <label>Tên khách hàng</label>
                <span class="value">
                    {{ warranty.customerName
      || warranty.customer?.customerName
      || route.query.customerName
      || '-' }}
                </span>
              </div>
              <div class="info-item">
                <label>Số điện thoại</label>
                <span class="value">
                    {{ warranty.customerPhone
      || warranty.customer?.customerPhone
      || route.query.customerPhone
      || '-' }}
                </span>
              </div>
              <div class="info-item">
                <label>Email</label>
                <span class="value">
  {{ warranty.customerEmail
      || warranty.customer?.customerEmail
      || route.query.customerEmail
      || '-' }}
                </span>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-title">
              <i class="fa-solid fa-car-side"></i>
              <div>
                <h2>Thông tin xe</h2>
                <p>Xe được áp dụng bảo hành</p>
              </div>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <label>Biển số</label>
<span class="value">
  {{ warranty.vehicleLicensePlate
      || warranty.vehicle?.vehicleLicensePlate
      || route.query.vehicleLicensePlate
      || '-' }}
</span>
              </div>
              <div class="info-item">
                <label>Tên xe</label>
<span class="value">
  {{ warranty.vehicleName
      || warranty.vehicle?.vehicleName
      || route.query.vehicleName
      || '-' }}
</span>
              </div>
              <div class="info-item">
                <label>Hãng</label>
<span class="value">
  {{ warranty.vehicleMake
      || warranty.vehicle?.make
      || route.query.vehicleMake
      || '-' }}
</span>
              </div>
              <div class="info-item">
                <label>Model</label>
<span class="value">
  {{ warranty.vehicleModel
      || warranty.vehicle?.model
      || route.query.vehicleModel
      || '-' }}
</span>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-title">
              <i class="fa-solid fa-gear"></i>
              <div>
                <h2>Phụ tùng</h2>
                <p>Phụ tùng/linh kiện được bảo hành</p>
              </div>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <label>Tên phụ tùng</label>
                <span class="value">
  {{ warranty.partName
      || warranty.part?.partName
      || route.query.partName
      || '-' }}
                </span>
              </div>
              <div class="info-item">
                <label>Mã phụ tùng</label>
<span class="value">
  {{ warranty.partCode
      || warranty.part?.partCode
      || route.query.partCode
      || '-' }}
</span>
              </div>
              <div class="info-item">
                <label>Đơn vị tính</label>
<span class="value">
  {{ warranty.partUnit
      || warranty.part?.partUnit
      || route.query.partUnit
      || '-' }}
</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsButton } from '@/components'
import authService from '@/services/auth'
import warrantyService from '@/services/warranty'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const error = ref('')
const warranty = ref(null)

const headerTitle = computed(() => {
  const code = warranty.value?.warrantyCode || warranty.value?.id || warranty.value?.warrantyId
  return code ? `Chi tiết bảo hành #${code}` : 'Chi tiết bảo hành'
})

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

const getStatusLabel = (status) => {
  if (status === 0) return 'Còn hiệu lực'
  if (status === 1) return 'Hết hạn'
  return 'Không xác định'
}

const getStatusColor = (status) => {
  if (status === 0) return 'success'
  if (status === 1) return 'danger'
  return 'secondary'
}

const loadWarranty = async () => {
  try {
    loading.value = true
    error.value = ''

    const id = route.params.id
    if (!id) {
      error.value = 'Không tìm thấy mã bảo hành'
      return
    }

    const res = await warrantyService.getById(id)
    const payload = res.data || res
    warranty.value = payload || null

    if (!warranty.value) {
      error.value = 'Không tìm thấy chi tiết bảo hành'
    }
  } catch (err) {
    console.error('Error loading warranty detail:', err)
    error.value = err.userMsg || err.message || 'Không tải được chi tiết bảo hành'
    toast.error('Không tải được chi tiết bảo hành', error.value)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'managerWarranties' })
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

onMounted(loadWarranty)
</script>

<style scoped>
.manager-warranty-detail {
  display: flex;
  min-height: 100vh;
  background: #f4f7fb;
}

.content {
  flex: 1;
  margin-left: var(--sidebar-width, 260px);
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
  margin-bottom: 16px;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-ghost i {
  font-size: 0.9rem;
}

.head-actions {
  display: flex;
  gap: 8px;
}

.state {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
}

.state--error {
  color: #b91c1c;
}

.warranty-detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-title i {
  font-size: 1.25rem;
  color: var(--primary, #ff7a00);
}

.card-title h2 {
  font-size: 1.1rem;
  margin: 0;
}

.card-title p {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px 24px;
}

.info-item label {
  display: block;
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-item .value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-success {
  background: #dcfce7;
  color: #15803d;
}

.badge-danger {
  background: #fee2e2;
  color: #b91c1c;
}

.badge-secondary {
  background: #e5e7eb;
  color: #4b5563;
}
</style>

