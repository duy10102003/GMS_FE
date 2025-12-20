<template>
  <div
    class="booking-create"
    :style="{
      '--sidebar-space': isAuthenticated ? (sidebarCollapsed ? '80px' : '260px') : '0px'
    }"
  >
    <TheSideBar
      v-if="isAuthenticated"
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="content-wrapper">
      <TheHeader
        v-if="isAuthenticated"
        title="Tạo đặt lịch mới"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />

      <div class="booking-create__content">
        <GuestBookingForm />
      </div>
      <GmsToast ref="toastRef" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GuestBookingForm from '@/components/booking/GuestBookingForm.vue'
import TheSideBar from '../../layout/TheSideBar.vue'
import authService from '@/services/auth'
import { GmsToast } from '@/components'
import TheHeader from '@/layout/TheHeader.vue'
import { getMenuByRole } from '@/utils/menu'

const router = useRouter()
const toastRef = ref(null)
const sidebarCollapsed = ref(false)
const menuItems = ref([])
const notifications = ref([])
const isAuthenticated = computed(() => authService.isAuthenticated())

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

onMounted(async () => {
  if (toastRef.value) {
    const { setToastInstance } = await import('@/composables/useToast')
    setToastInstance(toastRef.value)
  }

  const currentUser = authService.getCurrentUser()
  const role = currentUser?.role
  if (role) {
    menuItems.value = getMenuByRole(role)
  }
})
</script>

<style scoped>
.booking-create {
  --sidebar-space: 260px;
  padding-top: 80px;
  padding-right: 0;
  display: flex;
  min-height: 100vh;
  background: #f4f7fb;
}

.content-wrapper {
  flex: 1;
  width: 100%;
  min-width: 0;
  margin-left: var(--sidebar-space);
  transition: margin-left 0.2s ease;
  padding-right: 0;
  box-sizing: border-box;
}

.booking-create__content {
  width: 100%;
  max-width: 1200px;
  padding: 32px 24px 48px;
  margin: 0 auto;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .booking-create {
    padding-top: 70px;
  }
  .content-wrapper {
    margin-left: 0;
    padding: 0 16px 32px;
  }
  .booking-create__content {
    padding: 20px 0 32px;
  }
}
</style>
