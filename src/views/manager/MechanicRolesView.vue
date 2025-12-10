<template>
  <div class="mechanic-roles-view">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Vai trò thợ máy"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />

      <main class="main-content">
        <div class="toolbar">
          <div class="toolbar-left">
            <GmsInput
              v-model="searchQuery"
              placeholder="Tìm theo tên hoặc mô tả vai trò..."
              prefix-icon="fa-search"
              :clearable="true"
              class="search-input"
            />
          </div>
          <div class="toolbar-right">
            <GmsButton variant="outline" icon="fa-sync" :loading="loading" @click="loadRoles">
              Làm mới
            </GmsButton>
          </div>
        </div>

        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-title">Tổng vai trò</div>
            <div class="summary-value">{{ filteredRoles.length }}</div>
          </div>
          <div class="summary-card secondary">
            <div class="summary-title">Có mô tả</div>
            <div class="summary-value">{{ describedCount }}</div>
          </div>
          <div class="summary-card ghost">
            <div class="summary-title">Số thợ/role (nếu có)</div>
            <div class="summary-value">{{ assignedTotal }}</div>
          </div>
        </div>

        <div class="table-container">
          <GmsTable
            :data="filteredRoles"
            :columns="tableColumns"
            title="Danh sách vai trò thợ máy"
            :loading="loading"
            :pagination="false"
            :scrollable="true"
            empty-text="Chưa có dữ liệu vai trò"
            @row-click="openDetail"
          >
            <template #cell-displayDescription="{ value }">
              <span class="truncate" :title="value">{{ value || '—' }}</span>
            </template>

            <template #cell-assignedCount="{ value }">
              <span v-if="value !== null && value !== undefined">{{ value }}</span>
              <span v-else class="text-muted">-</span>
            </template>

            <template #cell-actions="{ row }">
              <div class="action-buttons">
                <GmsButton size="small" variant="outline" icon="fa-edit" @click.stop="openEdit(row)">
                  Sửa
                </GmsButton>
                <GmsButton size="small" variant="danger" icon="fa-trash" @click.stop="confirmDelete(row)">
                  Xóa
                </GmsButton>
              </div>
            </template>
          </GmsTable>
        </div>
      </main>
    </div>

    <GmsDialog v-model="showDetailDialog" title="Chi tiết vai trò" size="medium">
      <template v-if="selectedRole">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">ID</span>
            <span class="detail-value">{{ selectedRole.displayId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tên vai trò</span>
            <span class="detail-value">{{ selectedRole.displayName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Mô tả</span>
            <span class="detail-value">{{ selectedRole.displayDescription || '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Số thợ</span>
            <span class="detail-value">{{ selectedRole.assignedCount ?? '—' }}</span>
          </div>
        </div>
      </template>
    </GmsDialog>

    <GmsDialog v-model="showFormDialog" :title="isEditing ? 'Cập nhật vai trò' : 'Tạo vai trò'" size="small">
      <form @submit.prevent="submitForm">
        <div class="mb-3">
          <label class="form-label">Tên vai trò</label>
          <GmsInput v-model="formData.mechanicRoleName" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Mô tả</label>
          <GmsInput v-model="formData.mechanicRoleDescription" />
        </div>
        <div class="dialog-actions">
          <GmsButton type="button" variant="outline" @click="closeForm">Hủy</GmsButton>
          <GmsButton type="submit" variant="primary" :loading="submitting">
            {{ isEditing ? 'Lưu' : 'Tạo' }}
          </GmsButton>
        </div>
      </form>
    </GmsDialog>

    <GmsDialog v-model="showDeleteDialog" title="Xác nhận xóa" size="small">
      <p>Bạn có chắc muốn xóa vai trò <strong>{{ selectedRole?.displayName }}</strong>?</p>
      <div class="dialog-actions">
        <GmsButton type="button" variant="outline" @click="showDeleteDialog = false">Hủy</GmsButton>
        <GmsButton variant="danger" :loading="deleting" @click="deleteRole">Xóa</GmsButton>
      </div>
    </GmsDialog>

    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { TheHeader, TheSideBar } from "@/layout"
import { GmsButton, GmsDialog, GmsInput, GmsTable, GmsToast } from "@/components"
import { useToast } from "@/composables/useToast"
import { getMenuByRole } from "@/utils/menu"
import authService from "@/services/auth"
import mechanicRoleService from "@/services/mechanicRole"

const router = useRouter()
const toastRef = ref(null)
const toast = useToast()

const sidebarCollapsed = ref(false)
const notifications = ref([])
const menuItems = ref([])

const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const searchQuery = ref("")
const mechanicRoles = ref([])
const selectedRole = ref(null)
const showDetailDialog = ref(false)
const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const formData = ref({
  mechanicRoleName: "",
  mechanicRoleDescription: ""
})

const tableColumns = ref([
  { key: "displayId", label: "ID", sortable: true },
  { key: "displayName", label: "Tên vai trò", sortable: true },
  { key: "displayDescription", label: "Mô tả" },
  { key: "assignedCount", label: "Số thợ", sortable: true },
  { key: "actions", label: "Thao tác" }
])

const normalizedRoles = computed(() => {
  return mechanicRoles.value.map((role) => ({
    ...role,
    displayId: role?.mechanicRoleId ?? "-",
    displayName: role?.mechanicRoleName ?? "Không tên",
    displayDescription: role?.mechanicRoleDescription ?? "",
    assignedCount: role?.assignedCount ?? null
  }))
})

const filteredRoles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return normalizedRoles.value

  return normalizedRoles.value.filter((item) =>
    [item.displayId, item.displayName, item.displayDescription]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  )
})

const describedCount = computed(() => filteredRoles.value.filter((r) => r.displayDescription).length)

const assignedTotal = computed(() =>
  filteredRoles.value.reduce((sum, r) => (typeof r.assignedCount === "number" ? sum + r.assignedCount : sum), 0)
)

const parseListResponse = (response) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.items)) return response.data.items
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.result)) return response.result
  return []
}

const getRoleKey = (role) => role?.mechanicRoleId ?? role?.id ?? null

const fetchMechanicCounts = async (roles) => {
  const entries = await Promise.all(
    roles.map(async (role) => {
      const key = getRoleKey(role)
      if (!key) return [null, null]
      try {
        const res = await mechanicRoleService.getMechanicsByRoleId(key)
        const mechanics = parseListResponse(res)
        const count = Array.isArray(mechanics) ? mechanics.length : 0
        return [key, count]
      } catch (error) {
        console.error("Fetch mechanics count failed for role", key, error)
        return [key, null]
      }
    })
  )

  return Object.fromEntries(entries.filter(([key]) => key !== null))
}

const loadRoles = async () => {
  try {
    loading.value = true
    const response = await mechanicRoleService.getAll()
    const roles = parseListResponse(response)
    const countMap = await fetchMechanicCounts(roles)
    mechanicRoles.value = roles.map((role) => {
      const key = getRoleKey(role)
      return {
        ...role,
        assignedCount: countMap[key] ?? role.assignedCount ?? null
      }
    })
  } catch (error) {
    toast.error("Lỗi khi tải danh sách mechanic role", error.message || "Không thể tải dữ liệu")
  } finally {
    loading.value = false
  }
}

const openDetail = (row) => {
  selectedRole.value = row
  showDetailDialog.value = true
}

const openEdit = (row) => {
  selectedRole.value = row
  isEditing.value = true
  formData.value = {
    mechanicRoleName: row.mechanicRoleName || "",
    mechanicRoleDescription: row.mechanicRoleDescription || ""
  }
  showFormDialog.value = true
}

const closeForm = () => {
  showFormDialog.value = false
  isEditing.value = false
  formData.value = {
    mechanicRoleName: "",
    mechanicRoleDescription: ""
  }
}

const submitForm = async () => {
  if (!formData.value.mechanicRoleName.trim()) {
    toast.error("Vui lòng nhập tên vai trò")
    return
  }

  try {
    submitting.value = true
    const payload = {
      mechanicRoleName: formData.value.mechanicRoleName.trim(),
      mechanicRoleDescription: formData.value.mechanicRoleDescription?.trim() || ""
    }
    await mechanicRoleService.update(selectedRole.value.mechanicRoleId, payload)
    toast.success("Cập nhật thành công")
    closeForm()
    await loadRoles()
  } catch (error) {
    toast.error("Lỗi khi cập nhật", error.message || "Không thể cập nhật")
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (row) => {
  selectedRole.value = row
  showDeleteDialog.value = true
}

const deleteRole = async () => {
  if (!selectedRole.value?.mechanicRoleId) return
  try {
    deleting.value = true
    await mechanicRoleService.delete(selectedRole.value.mechanicRoleId)
    toast.success("Xóa thành công")
    showDeleteDialog.value = false
    await loadRoles()
  } catch (error) {
    toast.error("Lỗi khi xóa", error.message || "Không thể xóa")
  } finally {
    deleting.value = false
  }
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

  await loadRoles()
})
</script>

<style scoped>
.mechanic-roles-view {
  min-height: 100vh;
  background: var(--light, #f8f9fa);
}

.content-wrapper {
  transition: margin-left 0.3s ease;
}

.main-content {
  padding: 2rem;
  margin-top: 70px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.toolbar-left {
  flex: 1;
  min-width: 280px;
}

.search-input {
  max-width: 420px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
}

.summary-card.secondary {
  background: linear-gradient(135deg, #f4f7ff 0%, #ffffff 100%);
}

.summary-card.ghost {
  background: linear-gradient(135deg, #fff8f1 0%, #ffffff 100%);
}

.summary-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--dark, #2c3a47);
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-container :deep(.gms-table-container) {
  max-height: 520px;
}

.truncate {
  display: inline-block;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-muted {
  color: #8c8c8c;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-item {
  background: #f8f9fb;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #eef0f4;
}

.detail-label {
  display: block;
  font-size: 0.85rem;
  color: #7a7a7a;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 600;
  color: #2c3a47;
  word-break: break-word;
}

.json-block {
  margin-top: 1rem;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9rem;
  overflow: auto;
}

.json-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.json-block pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.85rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
