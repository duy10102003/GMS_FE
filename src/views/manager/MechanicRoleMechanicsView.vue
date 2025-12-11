<template>
  <div class="role-mechanics-page">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="page-shell" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        :title="`Thợ của vai trò #${roleId}`"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />

      <main class="page">
        <div class="page-head">
          <div>
            <h2>Danh sách thợ</h2>
            <p>Hiển thị thợ thuộc vai trò đang chọn</p>
          </div>
          <GmsButton variant="outline" icon="fa-arrow-left" @click="goBack">Quay lại vai trò</GmsButton>
        </div>

        <div class="card">
          <div v-if="loading" class="state state--loading">
            <i class="fas fa-spinner fa-spin"></i>
            Đang tải...
          </div>

          <div v-else-if="mechanics.length" class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Kinh nghiệm (năm)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in mechanics" :key="m.mechanicRolePermissionId || m.userId || m.email">
                  <td>{{ m.mechanicRolePermissionId || m.userId || '-' }}</td>
                  <td>{{ m.fullName || m.name || 'N/A' }}</td>
                  <td>{{ m.email || 'N/A' }}</td>
                  <td>{{ m.phone || 'N/A' }}</td>
                  <td>{{ m.yearExp ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="state">
            <i class="fas fa-users-slash"></i>
            Không có thợ nào cho vai trò này
          </div>
        </div>
      </main>
    </div>

    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { TheHeader, TheSideBar } from "@/layout"
import { GmsButton, GmsToast } from "@/components"
import { getMenuByRole } from "@/utils/menu"
import authService from "@/services/auth"
import mechanicRoleService from "@/services/mechanicRole"
import { useToast } from "@/composables/useToast"

const route = useRoute()
const router = useRouter()
const toastRef = ref(null)
const toast = useToast()

const roleId = route.params.id
const sidebarCollapsed = ref(false)
const notifications = ref([])
const menuItems = ref([])
const loading = ref(false)
const mechanics = ref([])

const loadMechanics = async () => {
  if (!roleId) return
  try {
    loading.value = true
    const res = await mechanicRoleService.getMechanicsByRoleId(roleId)
    const items =
      res?.data?.items ??
      res?.data ??
      res?.items ??
      res ??
      []
    mechanics.value = Array.isArray(items) ? items : []
  } catch (error) {
    toast.error("Không thể tải danh sách thợ", error.message || "Đã xảy ra lỗi")
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push("/manager/mechanic-roles")
}

const handleLogout = async () => {
  await authService.logout()
  router.push("/home")
}

onMounted(async () => {
  if (toastRef.value) {
    const { setToastInstance } = await import("@/composables/useToast")
    setToastInstance(toastRef.value)
  }

  const user = authService.getCurrentUser()
  if (user) {
    menuItems.value = getMenuByRole(user.role)
  }

  await loadMechanics()
})
</script>

<style scoped>
.role-mechanics-page {
  min-height: 100vh;
  background: var(--light, #f8f9fa);
}

.page-shell {
  transition: margin-left 0.3s ease;
}

.page {
  padding: 2rem;
  margin-top: 70px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1rem;
}

.state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
  padding: 2rem 0;
}

.state--loading {
  color: var(--primary, #ff7a00);
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eef0f4;
  text-align: left;
}

.table th {
  background: #f7f8fb;
}
</style>
