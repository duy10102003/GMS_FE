<template>
  <div class="payment-success-page">
    <div class="card">
      <div class="icon-wrapper">
        <i class="fas fa-check-circle"></i>
      </div>
      <h1>Thanh toán thành công</h1>
      <p class="subtitle">
        Cảm ơn bạn đã thanh toán. Hóa đơn của bạn đã được cập nhật trạng thái.
      </p>

      <div class="actions">
        <button class="btn primary" @click="goToInvoiceDetail" :disabled="!invoiceId">
          Xem chi tiết hóa đơn
        </button>
        <button class="btn outline" @click="goToInvoiceList">
          Quay lại danh sách hóa đơn
        </button>
      </div>

      <p v-if="!invoiceId" class="note">
        Không tìm thấy mã hóa đơn trên đường dẫn, bạn có thể xem lại trong danh sách hóa đơn.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Backend nên redirect dạng: /payment-success?invoiceId=123
const invoiceId = computed(() => route.query.invoiceId)

const goToInvoiceDetail = () => {
  if (!invoiceId.value) return
  router.push(`/customer/invoices/${invoiceId.value}`)
}

const goToInvoiceList = () => {
  router.push('/customer/invoices')
}
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fdfcfb, #e2d1f9);
  padding: 16px;
}

.card {
  max-width: 480px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
  text-align: center;
}

.icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecfdf3;
  color: #16a34a;
  font-size: 40px;
}

h1 {
  margin: 8px 0 4px;
  font-size: 1.6rem;
  color: #111827;
}

.subtitle {
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}

.btn {
  width: 100%;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn.primary {
  background: #ff7a00;
  color: white;
}

.btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.outline {
  background: white;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.btn.primary:hover:not(:disabled) {
  background: #f97316;
}

.btn.outline:hover {
  border-color: #ff7a00;
  color: #111827;
}

.note {
  margin-top: 16px;
  font-size: 0.85rem;
  color: #6b7280;
}
</style>



