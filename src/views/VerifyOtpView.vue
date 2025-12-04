<template>
  <div class="verify-otp-view">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-5">
          <div class="otp-card">
            <div class="otp-header">
              <h2>Xác thực OTP</h2>
              <p>Nhập mã OTP đã được gửi đến email: <strong>{{ email }}</strong></p>
            </div>
            <form @submit.prevent="handleVerify">
              <div class="otp-inputs">
                <input
                  v-for="(digit, index) in otpDigits"
                  :key="index"
                  v-model="otpDigits[index]"
                  type="text"
                  maxlength="1"
                  class="otp-input"
                  :ref="(el) => setInputRef(el, index)"
                  @input="handleOtpInput(index, $event)"
                  @keydown="handleKeydown(index, $event)"
                  @paste="handlePaste"
                />
              </div>
              <GmsButton
                type="submit"
                variant="primary"
                block
                :loading="loading"
                class="mt-4"
              >
                Xác thực
              </GmsButton>
              <div class="text-center mt-3">
                <a href="#" @click.prevent="resendOtp" :class="{ disabled: resendCooldown > 0 }">
                  {{ resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP' }}
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GmsButton, GmsToast } from '@/components'
import { useToast } from '@/composables/useToast'
import authService from '@/services/auth'
import api from '@/services/api'
import { API_ENDPOINTS } from '@/constant/api'

const route = useRoute()
const router = useRouter()
const toastRef = ref(null)
const toast = useToast()

const email = ref(route.query.email || '')
const mode = ref(route.query.mode || 'login')
const otpDigits = ref(['', '', '', '', '', ''])
const inputRefs = ref([])
const loading = ref(false)
const resendCooldown = ref(0)

const setInputRef = (el, index) => {
  if (el) {
    inputRefs.value[index] = el
  }
}

const handleOtpInput = (index, event) => {
  const value = event.target.value.replace(/[^0-9]/g, '')
  otpDigits.value[index] = value

  if (value && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
  pastedData.split('').forEach((digit, index) => {
    if (index < 6) {
      otpDigits.value[index] = digit
    }
  })
  inputRefs.value[Math.min(pastedData.length, 5)]?.focus()
}

const handleVerify = async () => {
  const otp = otpDigits.value.join('')
  if (otp.length !== 6) {
    toast.error('Vui lòng nhập đầy đủ 6 số OTP')
    return
  }

  try {
    loading.value = true
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: email.value,
      otp: otp,
      mode: mode.value
    })

    if (response.token) {
      authService.saveUser(response.user)
      toast.success('Đăng nhập thành công!')
      
      // Redirect based on role
      const role = response.user.role
      const dashboardPaths = {
        customer: '/customer/dashboard',
        staff: '/staff/service-tickets',
        manager: '/manager/dashboard',
        stocker: '/stocker/dashboard',
        mechanic: '/mechanic/dashboard'
      }
      router.push(dashboardPaths[role] || '/')
    }
  } catch (error) {
    toast.error('Mã OTP không đúng', error.message)
    // Clear OTP on error
    otpDigits.value = ['', '', '', '', '', '']
    inputRefs.value[0]?.focus()
  } finally {
    loading.value = false
  }
}

const resendOtp = async () => {
  if (resendCooldown.value > 0) return

  try {
    await api.post('/auth/resend-otp', { email: email.value, mode: mode.value })
    toast.success('Đã gửi lại mã OTP')
    resendCooldown.value = 60
    const interval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(interval)
      }
    }, 1000)
  } catch (error) {
    toast.error('Lỗi khi gửi lại OTP', error.message)
  }
}

onMounted(async () => {
  if (toastRef.value) {
    const { setToastInstance } = await import('@/composables/useToast')
    setToastInstance(toastRef.value)
  }
  
  inputRefs.value[0]?.focus()
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



