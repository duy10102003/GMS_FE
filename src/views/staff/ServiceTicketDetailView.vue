<template>
  <div class="service-ticket-detail-view">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />
    
    <div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Chi tiết phiếu dịch vụ"
        :show-search="false"
        @logout="handleLogout"
      />
      
      <main class="main-content" style="margin-top: 70px; padding: 2rem;">
        <GmsButton
          variant="outline"
          icon="fa-arrow-left"
          @click="$router.back()"
        >
          Quay lại
        </GmsButton>
        
        <div class="detail-content">
          <h2>Chi tiết phiếu dịch vụ #{{ ticketId }}</h2>
          <p>View này sẽ được implement sau...</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsButton } from '@/components'
import { getMenuByRole } from '@/utils/menu'
import authService from '@/services/auth'

const route = useRoute()
const router = useRouter()

const sidebarCollapsed = ref(false)
const menuItems = ref([])
const ticketId = ref(route.params.id)

const handleLogout = async () => {
  await authService.logout()
  router.push('/login')
}

onMounted(() => {
  const user = authService.getCurrentUser()
  if (user) {
    menuItems.value = getMenuByRole(user.role)
  }
})
</script>

<style scoped>
.service-ticket-detail-view {
  min-height: 100vh;
  background: var(--light, #f8f9fa);
}

.content-wrapper {
  transition: margin-left 0.3s ease;
}

.detail-content {
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>

