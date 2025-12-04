<template>
  <div class="verify-otp-view" ref="pageRef">
    <div class="galaxy-bg" aria-hidden="true"></div>
    <div class="particles" id="particles" aria-hidden="true"></div>
    <div class="shooting-stars" id="shootingStars" aria-hidden="true"></div>

    <div class="otp-container">
      <div class="logo-icon">
        <i class="fas fa-shield-check"></i>
      </div>

      <h1 class="title">Xác minh danh tính</h1>
      <p class="subtitle">
        Nhập mã xác minh 6 số đã được gửi đến<br />
        <span class="email-badge" id="emailDisplay">email@example.com</span>
      </p>

      <div class="error-message" id="errorMessage">
        <i class="fas fa-exclamation-circle"></i>
        <span>Mã OTP không chính xác. Vui lòng thử lại.</span>
      </div>

      <form id="otpForm" novalidate>
        <div class="otp-inputs" id="otpInputs">
          <input type="text" maxlength="1" pattern="[0-9]" inputmode="numeric" autocomplete="one-time-code" />
          <input type="text" maxlength="1" pattern="[0-9]" inputmode="numeric" />
          <input type="text" maxlength="1" pattern="[0-9]" inputmode="numeric" />
          <input type="text" maxlength="1" pattern="[0-9]" inputmode="numeric" />
          <input type="text" maxlength="1" pattern="[0-9]" inputmode="numeric" />
          <input type="text" maxlength="1" pattern="[0-9]" inputmode="numeric" />
        </div>

        <button type="submit" class="btn-verify" id="verifyBtn">Xác nhận</button>
      </form>

      <div class="resend-section">
        <span class="resend-text">
          Không nhận được mã?
          <a href="#" class="resend-link" id="resendLink">Gửi lại</a>
        </span>
      </div>
    </div>

    <div class="success-overlay" id="successOverlay">
      <div class="success-content">
        <div class="success-icon">
          <i class="fas fa-check"></i>
        </div>
        <h2 class="success-title">Xác minh thành công!</h2>
        <p class="success-message">Đang chuyển hướng...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { initVerifyOtpPage } from '../assets/js/VerifyOtp'
import '../assets/style/VerifyOtp.css'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const pageRef = ref(null)
const email = ref('')
let teardownHandler

const roleRedirectMap = {
  MANAGER: '/manager/dashboard',
  STAFF: '/staff/dashboard',
  CUSTOMER: '/customer/home',
  STOCKER: '/stocker/dashboard'
}

const redirectToRolePage = () => {
  const target = roleRedirectMap[auth.role] || '/login'
  router.replace(target)
}

onMounted(() => {
  const queryEmail = route.query.email?.toString() || ''
  if (!queryEmail) {
    router.replace({ name: 'login' })
    return
  }

  email.value = queryEmail

  teardownHandler = initVerifyOtpPage(pageRef.value, {
    email: email.value,
    mode: route.query.mode?.toString() || 'login',
    onVerify: async ({ otp }) => {
      const ok = await auth.verifyOtp(email.value, otp)
      if (!ok) {
        throw new Error(auth.error || 'OTP không hợp lệ')
      }
    },
    onResend: async () => {
      const ok = await auth.requestOtp(email.value)
      if (!ok) {
        throw new Error(auth.error || 'Không gửi được OTP')
      }
    },
    onSuccessRedirect: redirectToRolePage
  })
})

onBeforeUnmount(() => {
  if (typeof teardownHandler === 'function') {
    teardownHandler()
  }
})
</script>

<style scoped>
.verify-otp-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.otp-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.otp-header {
  text-align: center;
  margin-bottom: 2rem;
}

.otp-header h2 {
  color: var(--primary, #ff7a00);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.otp-header p {
  color: #666;
  font-size: 0.9rem;
}

.otp-inputs {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.otp-input {
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s;
}

.otp-input:focus {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.text-center a {
  color: var(--primary, #ff7a00);
  text-decoration: none;
}

.text-center a.disabled {
  color: #999;
  cursor: not-allowed;
  pointer-events: none;
}
</style>


