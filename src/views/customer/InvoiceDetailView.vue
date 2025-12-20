<template>
  <div class="customer-invoice-detail-view">
    <TheSideBar @logout="handleLogout" />

    <div class="dashboard-customer-body">
      <TheHeader
        title="Chi tiết hóa đơn"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />

      <main class="main-content">
        <section v-if="loading" class="card loading">
          Đang tải chi tiết hóa đơn...
        </section>

        <section v-else-if="invoice" class="card">
          <header class="card-header">
            <div>
              <h2>Hóa đơn #{{ invoice.invoiceCode || invoice.invoiceId }}</h2>
              <p class="sub">
                Ngày tạo:
                <strong>{{ formatDate(invoice.createdDate || invoice.issueDate) }}</strong>
              </p>
            </div>

            <span class="status-pill" :class="statusClass(invoice.status ?? invoice.invoiceStatus)">
              {{ statusLabel(invoice.status ?? invoice.invoiceStatus) }}
            </span>
          </header>

          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Khách hàng</span>
                <span class="value">{{ invoice.customerName || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Số điện thoại</span>
                <span class="value">{{ invoice.customerPhone || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Biển số xe</span>
                <span class="value">{{ invoice.vehicleLicensePlate || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Tổng tiền</span>
                <span class="value amount">
                  {{ formatMoney(invoice.totalAmount || 0) }}
                </span>
              </div>
            </div>

            <h3 class="section-title">Dịch vụ & phụ tùng</h3>
            <table class="detail-table">
              <thead>
                <tr>
                  <th>Hạng mục</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in invoice.items || []"
                  :key="idx"
                >
                  <td>{{ item.name || item.serviceName || item.partName }}</td>
                  <td>{{ item.quantity || 1 }}</td>
                  <td>{{ formatMoney(item.unitPrice || item.price || 0) }}</td>
                  <td>{{ formatMoney(item.total || item.amount || 0) }}</td>
                </tr>
                <tr v-if="!(invoice.items && invoice.items.length)">
                  <td colspan="4" class="text-center muted">
                    Không có dữ liệu chi tiết hóa đơn
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="card-footer">
            <GmsButton variant="outline" icon="fa-arrow-left" @click="goBack">
              Quay lại danh sách
            </GmsButton>

            <GmsButton
              v-if="(invoice.status ?? invoice.invoiceStatus) === 0"
              variant="primary"
              icon="fa-credit-card"
              :loading="paying"
              @click="handlePay"
            >
              Thanh toán
            </GmsButton>
          </footer>
        </section>

        <section v-else class="card empty">
          Không tìm thấy hóa đơn.
        </section>
      </main>
    </div>

    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsButton, GmsToast } from '@/components'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import invoiceService from '@/services/invoice'
import paymentService from '@/services/payment'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const toastRef = ref(null)
const toast = useToast()

const notifications = ref([])
const loading = ref(false)
const paying = ref(false)
const invoice = ref(null)

const loadInvoice = async () => {
  try {
    loading.value = true
    const id = route.params.id
    const res = await invoiceService.getById(id)
    invoice.value = res.data || res
  } catch (error) {
    toast.error('Lỗi khi tải chi tiết hóa đơn', error.message || error.userMsg || 'Có lỗi xảy ra')
  } finally {
    loading.value = false
  }
}

const handlePay = async () => {
  if (!invoice.value) return
  try {
    paying.value = true
    const res = await paymentService.createVnPay({
      invoiceId: invoice.value.invoiceId
    })
    // Backend PaymentController trả về { paymentUrl }
    const url = res.paymentUrl || res.data?.paymentUrl
    if (url) {
      window.location.href = url
    } else {
      toast.error('Không lấy được đường dẫn thanh toán')
    }
  } catch (error) {
    toast.error('Lỗi khi tạo thanh toán', error.message || error.userMsg || 'Có lỗi xảy ra')
  } finally {
    paying.value = false
  }
}

const goBack = () => {
  router.push('/customer/invoices')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const formatDate = (d) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleString('vi-VN')
}

const formatMoney = (v) => Number(v || 0).toLocaleString('vi-VN') + ' đ'

const statusLabel = (s) => {
  switch (Number(s)) {
    case 0: return 'Chưa thanh toán'
    case 1: return 'Đã thanh toán'
    case 2: return 'Thất bại'
    default: return 'Không rõ'
  }
}

const statusClass = (s) => {
  switch (Number(s)) {
    case 0: return 'pending'
    case 1: return 'paid'
    case 2: return 'failed'
    default: return 'unknown'
  }
}

onMounted(async () => {
  if (toastRef.value) {
    const { setToastInstance } = await import('@/composables/useToast')
    setToastInstance(toastRef.value)
  } 
  await loadInvoice()
})
</script>

<style scoped>
.customer-invoice-detail-view {
  min-height: 100vh;
  background: var(--light, #f8f9fa);
}

.dashboard-customer-body {
  flex: 1;
  margin-left: var(--sidebar-width, 260px);
  min-height: 100vh;
  background: #f8f9fc;
  display: flex;
  flex-direction: column;
}

.main-content {
  padding: 0.5rem;
  padding-top: 4.5rem;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card.loading,
.card.empty {
  text-align: center;
  color: #666;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.card-header .sub {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.9rem;
}

.status-pill {
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-pill.pending {
  background: #fffbeb;
  color: #d97706;
}

.status-pill.paid {
  background: #ecfdf3;
  color: #16a34a;
}

.status-pill.failed {
  background: #fef2f2;
  color: #dc2626;
}

.status-pill.unknown {
  background: #e5e7eb;
  color: #374151;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
}

.info-item .value {
  font-weight: 600;
  color: #111827;
}

.info-item .value.amount {
  font-size: 1.1rem;
  color: #dc2626;
}

.section-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
}

.detail-table th,
.detail-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  font-size: 0.9rem;
}

.detail-table thead th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.detail-table .text-center {
  text-align: center;
}

.detail-table .muted {
  color: #6b7280;
}

.card-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 992px) {
  .dashboard-customer-body {
    margin-left: 0;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>


