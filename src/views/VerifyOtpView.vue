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
