<template>
  <div class="mechanic-role-page">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="page-shell" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Danh sách vai trò thợ máy"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />

      <main class="page">
        <div class="filters filters--with-action">
          <div class="filter-item wide">
            <label>Tìm kiếm (tên, mô tả)</label>
            <input
              v-model="searchText"
              type="text"
              placeholder="Tìm nhanh..."
              @keyup.enter="applyFilters"
            />
          </div>
          <GmsButton variant="primary" icon="fa-plus" @click="openCreate">
            Thêm vai trò
          </GmsButton>
        </div>

        <div class="active-filters" v-if="activeFilters.length">
          <span class="active-filters__label">Đang lọc:</span>
          <div class="active-filters__chips">
            <button
              v-for="(f, idx) in activeFilters"
              :key="idx"
              class="filter-chip"
              @click="removeFilter(f.key)"
            >
              <span>{{ f.label }}</span>
              <i class="fa-solid fa-xmark"></i>
            </button>
            <button class="clear-all" @click="clearAllFilters">Xóa tất cả</button>
          </div>
        </div>

        <div class="card">
          <div v-if="loading" class="state state--loading">
            <i class="fas fa-spinner fa-spin"></i>
            Đang tải...
          </div>

          <div v-else-if="sortedRoles.length" class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>
                    <div class="th-with-filter">
                      <span>ID</span>
                      <button class="sort-btn" @click.stop="changeSort('id')">
                        <i :class="getSortIcon('id')"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <div class="th-with-filter">
                      <span>Tên vai trò</span>
                      <button class="filter-btn" @click.stop="openFilterModal('name')">
                        <i class="fa-solid fa-filter"></i>
                      </button>
                      <button class="sort-btn" @click.stop="changeSort('name')">
                        <i :class="getSortIcon('name')"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <div class="th-with-filter">
                      <span>Mô tả</span>
                      <button class="filter-btn" @click.stop="openFilterModal('description')">
                        <i class="fa-solid fa-filter"></i>
                      </button>
                      <button class="sort-btn" @click.stop="changeSort('description')">
                        <i :class="getSortIcon('description')"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <div class="th-with-filter">
                      <span>Số thợ</span>
                      <button class="filter-btn" @click.stop="openFilterModal('total')">
                        <i class="fa-solid fa-filter"></i>
                      </button>
                      <button class="sort-btn" @click.stop="changeSort('total')">
                        <i :class="getSortIcon('total')"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <div class="th-with-filter">
                      <span>Thợ khả dụng</span>
                      <button class="filter-btn" @click.stop="openFilterModal('available')">
                        <i class="fa-solid fa-filter"></i>
                      </button>
                      <button class="sort-btn" @click.stop="changeSort('available')">
                        <i :class="getSortIcon('available')"></i>
                      </button>
                    </div>
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="role in sortedRoles" :key="role.displayId" @click="openDetail(role)">
    <td>{{ role.displayId }}</td>
    <td>{{ role.displayName }}</td>
    <td>{{ role.displayDescription || '—' }}</td>
    <td>{{ role.assignedCount ?? '—' }}</td>
    <td>{{ role.availableCount ?? '—' }}</td>
              <td class="actions" @click.stop>
                <GmsButton size="small" variant="info" @click="viewMechanics(role)">Thợ</GmsButton>
                <GmsButton size="small" variant="info" @click="openDetail(role)">Xem</GmsButton>
                <GmsButton size="small" variant="primary" @click="openEdit(role)">Sửa</GmsButton>
                <GmsButton size="small" variant="danger" @click="confirmDelete(role)">Xóa</GmsButton>
              </td>
            </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="state">
            <i class="fas fa-list"></i>
            Chưa có dữ liệu
          </div>

          <div class="pager" v-if="totalItems > 0">
            <div class="pager-info">
              <label>Hiển thị</label>
              <select v-model.number="pageSize" @change="handlePageSizeChange" class="page-size-select">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
              <span>
                <strong>{{ startIndex }} - {{ endIndex }}</strong>
                / {{ totalItems }} vai trò
              </span>
            </div>
            <div class="pager-actions">
              <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">&lt;</button>
              <span>Trang {{ currentPage }} / {{ totalPages }}</span>
              <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">&gt;</button>
            </div>
          </div>
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

    <GmsDialog v-model="filterModal.show" :title="`Lọc theo ${filterModal.label}`" size="small">
      <div class="filter-modal">
        <div class="mb-3">
          <label class="form-label">Toán tử</label>
          <select v-model="filterModal.operator" class="form-select">
            <option v-for="op in currentOperatorOptions" :key="op.value" :value="op.value">
              {{ op.label }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Giá trị</label>
          <GmsInput v-model="filterModal.value" placeholder="Nhập giá trị..." />
        </div>
        <div class="dialog-actions">
          <GmsButton type="button" variant="outline" @click="closeFilterModal">Hủy</GmsButton>
          <GmsButton variant="primary" @click="applyFilterModal">Áp dụng</GmsButton>
        </div>
      </div>
    </GmsDialog>

    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { TheHeader, TheSideBar } from "@/layout"
import { GmsButton, GmsDialog, GmsInput, GmsToast } from "@/components"
import { useToast } from "@/composables/useToast"
import { getMenuByRole } from "@/utils/menu"
import authService from "@/services/auth"
import mechanicRoleService from "@/services/mechanicRole"
import technicalTaskService from "@/services/technicalTask"
import { TASK_STATUS } from "@/constant/serviceTicketStatus"

const router = useRouter()
const toastRef = ref(null)
const toast = useToast()

const sidebarCollapsed = ref(false)
const notifications = ref([])
const menuItems = ref([])

const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const searchText = ref("")
const filterName = ref({ operator: "contains", value: "" })
const filterDescription = ref({ operator: "contains", value: "" })
const filterTotalCount = ref({ operator: "greater_or_equal", value: "" })
const filterAvailableCount = ref({ operator: "greater_or_equal", value: "" })
const sortConfig = ref({ key: "id", direction: "DESC", backend: true })

const textOperatorOptions = [
  { value: "contains", label: "Chứa" },
  { value: "not_contains", label: "Không chứa" },
  { value: "equals", label: "Bằng" },
  { value: "not_equals", label: "Khác" },
  { value: "starts_with", label: "Bắt đầu bằng" },
  { value: "ends_with", label: "Kết thúc bằng" }
]

const numberOperatorOptions = [
  { value: "equals", label: "Bằng" },
  { value: "not_equals", label: "Khác" },
  { value: "greater_than", label: "Lớn hơn" },
  { value: "less_than", label: "Nhỏ hơn" },
  { value: "greater_or_equal", label: "Lớn hơn hoặc bằng" },
  { value: "less_or_equal", label: "Nhỏ hơn hoặc bằng" }
]

const filterConfig = {
  name: { type: "text" },
  description: { type: "text" },
  total: { type: "number" },
  available: { type: "number" }
}
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const roles = ref([])
const selectedRole = ref(null)
const showDetailDialog = ref(false)
const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const filterModal = ref({
  show: false,
  type: "",
  label: "",
  operator: "contains",
  value: ""
})
const isEditing = ref(false)
const formData = ref({
  mechanicRoleName: "",
  mechanicRoleDescription: ""
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))
const startIndex = computed(() => (totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1))
const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalItems.value))

const normalizedRoles = computed(() =>
  roles.value.map((role) => ({
    ...role,
    displayId: role?.mechanicRoleId ?? role?.id ?? "-",
    displayName: role?.mechanicRoleName ?? "Không tên",
    displayDescription: role?.mechanicRoleDescription ?? "",
    assignedCount: role?.assignedCount ?? role?.mechanicsCount ?? role?.usersCount ?? null,
    availableCount: role?.availableCount ?? null
  }))
)

const matchesNumberFilter = (value, filter) => {
  if (value === null || value === undefined || value === "—") return false
  const num = Number(value)
  const filterVal = Number(filter?.value)
  if (Number.isNaN(num) || Number.isNaN(filterVal)) return false
  switch (filter?.operator) {
    case "equals":
      return num === filterVal
    case "not_equals":
      return num !== filterVal
    case "greater_than":
      return num > filterVal
    case "less_than":
      return num < filterVal
    case "greater_or_equal":
      return num >= filterVal
    case "less_or_equal":
      return num <= filterVal
    default:
      return true
  }
}

const filteredRoles = computed(() => {
  return normalizedRoles.value.filter((role) => {
    const totalFilterOn = filterTotalCount.value.value !== "" && filterTotalCount.value.value !== null && filterTotalCount.value.value !== undefined
    const availableFilterOn =
      filterAvailableCount.value.value !== "" && filterAvailableCount.value.value !== null && filterAvailableCount.value.value !== undefined

    if (totalFilterOn && !matchesNumberFilter(role.assignedCount ?? 0, filterTotalCount.value)) return false
    if (availableFilterOn && !matchesNumberFilter(role.availableCount ?? 0, filterAvailableCount.value)) return false

    return true
  })
})

const describedCount = computed(() => normalizedRoles.value.filter((r) => r.displayDescription).length)

const assignedTotal = computed(() =>
  filteredRoles.value.reduce((sum, r) => (typeof r.assignedCount === "number" ? sum + r.assignedCount : sum), 0)
)

const sortedRoles = computed(() => {
  const list = [...filteredRoles.value]
  const dir = sortConfig.value.direction === "DESC" ? -1 : 1
  switch (sortConfig.value.key) {
    case "name":
      return list.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || "") * dir)
    case "description":
      return list.sort((a, b) => (a.displayDescription || "").localeCompare(b.displayDescription || "") * dir)
    case "total":
      return list.sort((a, b) => ((a.assignedCount ?? 0) - (b.assignedCount ?? 0)) * dir)
    case "available":
      return list.sort((a, b) => ((a.availableCount ?? 0) - (b.availableCount ?? 0)) * dir)
    case "id":
    default:
      return list.sort((a, b) => ((a.displayId ?? 0) - (b.displayId ?? 0)) * dir)
  }
})

const activeFilters = computed(() => {
  const chips = []
  if (filterName.value.value) {
    chips.push({
      key: "name",
      label: `Tên: ${filterName.value.value} (${operatorLabel(filterName.value.operator)})`
    })
  }
  if (filterDescription.value.value) {
    chips.push({
      key: "description",
      label: `Mô tả: ${filterDescription.value.value} (${operatorLabel(filterDescription.value.operator)})`
    })
  }
  if (filterTotalCount.value.value !== "" && filterTotalCount.value.value !== null && filterTotalCount.value.value !== undefined) {
    chips.push({
      key: "total",
      label: `Số thợ: ${operatorLabel(filterTotalCount.value.operator)} ${filterTotalCount.value.value}`
    })
  }
  if (
    filterAvailableCount.value.value !== "" &&
    filterAvailableCount.value.value !== null &&
    filterAvailableCount.value.value !== undefined
  ) {
    chips.push({
      key: "available",
      label: `Thợ khả dụng: ${operatorLabel(filterAvailableCount.value.operator)} ${filterAvailableCount.value.value}`
    })
  }
  return chips
})

const currentOperatorOptions = computed(() => {
  const type = filterConfig[filterModal.value.type]?.type
  if (type === "number") return numberOperatorOptions
  return textOperatorOptions
})

const parsePagingResponse = (response) => {
  const items =
    response?.data?.items ??
    response?.data?.data ??
    response?.items ??
    response?.data ??
    response?.result ??
    response ??
    []

  const total =
    response?.data?.total ??
    response?.total ??
    (Array.isArray(items) ? items.length : 0)

  return {
    items: Array.isArray(items) ? items : [],
    total: typeof total === "number" ? total : 0
  }
}

const getRoleKey = (role) => role?.mechanicRoleId ?? role?.id ?? null

const ACTIVE_TASK_STATUSES = [TASK_STATUS.IN_PROGRESS, TASK_STATUS.PENDING]

const hasActiveTask = async (userId) => {
  if (!userId) return false
  for (const status of ACTIVE_TASK_STATUSES) {
    const res = await technicalTaskService.getPaging({
      page: 1,
      pageSize: 1,
      assignedToTechnical: userId,
      taskStatus: status,
      columnSorts: [{ columnName: "TechnicalTaskId", sortDirection: "DESC" }]
    })
    const items = res?.data?.items ?? res?.items ?? res?.data ?? []
    const total =
      res?.data?.total ??
      res?.data?.totalItems ??
      res?.total ??
      res?.totalItems ??
      (Array.isArray(items) ? items.length : 0)
    if (typeof total === "number" && total > 0) {
      return true
    }
  }
  return false
}

const fetchMechanicStats = async (items) => {
  const entries = await Promise.all(
    items.map(async (role) => {
      const key = getRoleKey(role)
      if (!key) return [null, { total: null, available: null }]
      try {
        const res = await mechanicRoleService.getMechanicsByRoleId(key)
        const mechanics = parsePagingResponse(res).items || parsePagingResponse(res).data || []
        const list = Array.isArray(mechanics) ? mechanics : []
        const total = list.length

        const availability = await Promise.allSettled(
          list.map(async (m) => ({
            userId: m.userId,
            busy: await hasActiveTask(m.userId)
          }))
        )

        const available = availability.reduce((count, r) => {
          if (r.status === "fulfilled" && r.value && !r.value.busy) {
            return count + 1
          }
          return count
        }, 0)

        return [key, { total, available }]
      } catch (error) {
        console.error("Fetch mechanics stats failed for role", key, error)
        return [key, { total: null, available: null }]
      }
    })
  )
  return Object.fromEntries(entries.filter(([k]) => k !== null))
}

const buildFilters = () => {
  const columnFilters = []
  if (searchText.value.trim()) {
    columnFilters.push({
      columnName: "MechanicRoleName",
      operator: "contains",
      value: searchText.value.trim()
    })
  }
  if (filterName.value.value.trim()) {
    columnFilters.push({
      columnName: "MechanicRoleName",
      operator: filterName.value.operator || "contains",
      value: filterName.value.value.trim()
    })
  }
  if (filterDescription.value.value.trim()) {
    columnFilters.push({
      columnName: "MechanicRoleDescription",
      operator: filterDescription.value.operator || "contains",
      value: filterDescription.value.value.trim()
    })
  }
  return columnFilters
}

const loadRoles = async () => {
  try {
    loading.value = true
    const backendSortMap = {
      id: "MechanicRoleId",
      name: "MechanicRoleName",
      description: "MechanicRoleDescription"
    }
    const isBackendSort = backendSortMap[sortConfig.value.key]

    const params = {
      // Backend dùng trang 1-based, gửi thẳng currentPage
      page: currentPage.value,
      pageSize: pageSize.value,
      columnFilters: buildFilters(),
      columnSorts: isBackendSort
        ? [{ columnName: backendSortMap[sortConfig.value.key], sortDirection: sortConfig.value.direction }]
        : [{ columnName: "MechanicRoleId", sortDirection: "DESC" }]
    }
    const response = await mechanicRoleService.getPaging(params)
    const { items, total } = parsePagingResponse(response)
    const statsMap = await fetchMechanicStats(items)
    roles.value = items.map((role) => {
      const key = getRoleKey(role)
      const stats = statsMap[key] || {}
      return {
        ...role,
        assignedCount: stats.total ?? role.assignedCount ?? null,
        availableCount: stats.available ?? null
      }
    })
    totalItems.value = total
  } catch (error) {
    toast.error("Lỗi khi tải danh sách mechanic role", error.message || "Không thể tải dữ liệu")
  } finally {
    loading.value = false
  }
}

const changePage = async (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await loadRoles()
}

const handlePageSizeChange = async () => {
  currentPage.value = 1
  await loadRoles()
}

const applyFilters = async () => {
  currentPage.value = 1
  await loadRoles()
}

const changeSort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === "ASC" ? "DESC" : "ASC"
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = "ASC"
    sortConfig.value.backend = ["id", "name", "description"].includes(key)
  }
  loadRoles()
}

const getSortIcon = (key) => {
  if (sortConfig.value.key !== key) return "fa-solid fa-sort"
  return sortConfig.value.direction === "ASC" ? "fa-solid fa-sort-up" : "fa-solid fa-sort-down"
}

const removeFilter = (key) => {
  if (key === "name") {
    filterName.value = { operator: "contains", value: "" }
  } else if (key === "description") {
    filterDescription.value = { operator: "contains", value: "" }
  } else if (key === "total") {
    filterTotalCount.value = { operator: "greater_or_equal", value: "" }
  } else if (key === "available") {
    filterAvailableCount.value = { operator: "greater_or_equal", value: "" }
  }
  applyFilters()
}

const clearAllFilters = () => {
  filterName.value = { operator: "contains", value: "" }
  filterDescription.value = { operator: "contains", value: "" }
  filterTotalCount.value = { operator: "greater_or_equal", value: "" }
  filterAvailableCount.value = { operator: "greater_or_equal", value: "" }
  searchText.value = ""
  applyFilters()
}

const operatorLabel = (op) => {
  const map = {
    contains: "chứa",
    not_contains: "không chứa",
    equals: "bằng",
    not_equals: "khác",
    starts_with: "bắt đầu",
    ends_with: "kết thúc",
    greater_than: ">",
    less_than: "<",
    greater_or_equal: "≥",
    less_or_equal: "≤"
  }
  return map[op] || op
}

const openFilterModal = (type) => {
  const preset = type === "name" ? filterName.value : filterDescription.value
  const isNumber = type === "total" || type === "available"
  const presetNumber = type === "total" ? filterTotalCount.value : type === "available" ? filterAvailableCount.value : null

  filterModal.value = {
    show: true,
    type,
    label:
      type === "name"
        ? "Tên vai trò"
        : type === "description"
        ? "Mô tả"
        : type === "total"
        ? "Số thợ"
        : "Thợ khả dụng",
    operator: (isNumber ? presetNumber?.operator : preset?.operator) || (isNumber ? "greater_or_equal" : "contains"),
    value: (isNumber ? presetNumber?.value : preset?.value) || ""
  }
}

const applyFilterModal = () => {
  if (filterModal.value.type === "name") {
    filterName.value = {
      operator: filterModal.value.operator,
      value: filterModal.value.value.trim()
    }
  } else if (filterModal.value.type === "description") {
    filterDescription.value = {
      operator: filterModal.value.operator,
      value: filterModal.value.value.trim()
    }
  } else if (filterModal.value.type === "total") {
    filterTotalCount.value = {
      operator: filterModal.value.operator,
      value: filterModal.value.value
    }
  } else if (filterModal.value.type === "available") {
    filterAvailableCount.value = {
      operator: filterModal.value.operator,
      value: filterModal.value.value
    }
  }
  filterModal.value.show = false
  applyFilters()
}

const closeFilterModal = () => {
  filterModal.value.show = false
}

const openFilterPrompt = (type) => {
  const currentValue = type === "name" ? filterName.value : filterDescription.value
  const label = type === "name" ? "tên vai trò" : "mô tả"
  const value = window.prompt(`Nhập ${label} để lọc:`, currentValue)
  if (value === null) return
  if (type === "name") {
    filterName.value = value.trim()
  } else {
    filterDescription.value = value.trim()
  }
  applyFilters()
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

const openCreate = () => {
  selectedRole.value = null
  isEditing.value = false
  formData.value = {
    mechanicRoleName: "",
    mechanicRoleDescription: ""
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
    if (isEditing.value && selectedRole.value?.mechanicRoleId) {
      await mechanicRoleService.update(selectedRole.value.mechanicRoleId, payload)
      toast.success("Cập nhật thành công")
    } else {
      await mechanicRoleService.create(payload)
      toast.success("Tạo mới thành công")
    }
    closeForm()
    await loadRoles()
  } catch (error) {
    const actionText = isEditing.value ? "cập nhật" : "tạo mới"
    toast.error(`Lỗi khi ${actionText}`, error.message || "Không thể xử lý")
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

const viewMechanics = (role) => {
  const id = role?.mechanicRoleId || role?.id
  if (!id) {
    toast.error("Không xác định được vai trò")
    return
  }
  // Điều hướng sang trang danh sách thợ cho role (cần có route target nếu có sẵn)
  router.push(`/manager/mechanic-roles/${id}/mechanics`)
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
.mechanic-role-page {
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

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filters--with-action {
  justify-content: space-between;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-item.wide {
  flex: 0 0 320px;
  max-width: 360px;
  width: 100%;
}

.filter-item input,
.filter-item select {
  padding: 0.45rem 0.65rem;
  border: 1px solid #dfe4ea;
  border-radius: 8px;
  font-size: 0.95rem;
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
  gap: 0.5rem;
  color: #666;
  justify-content: center;
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
  margin-top: 0.5rem;
}

.table th,
.table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eef0f4;
  text-align: left;
}

.table th {
  background: #f7f8fb;
  font-weight: 700;
  font-size: 0.95rem;
}

.th-with-filter {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.sort-btn {
  border: 1px solid #dfe4ea;
  background: white;
  border-radius: 6px;
  padding: 4px 6px;
  cursor: pointer;
  color: #888;
}

.sort-btn:hover {
  border-color: var(--primary, #ff7a00);
  color: var(--primary, #ff7a00);
}

.filter-btn {
  border: 1px solid #dfe4ea;
  background: white;
  border-radius: 6px;
  padding: 4px 6px;
  cursor: pointer;
}

.filter-btn:hover {
  border-color: var(--primary, #ff7a00);
  color: var(--primary, #ff7a00);
}

.table tr:hover {
  background: #f6f7fb;
}

.actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.form-select {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #dfe4ea;
  border-radius: 8px;
}

.pager {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.pager-info {
  color: #555;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pager-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pager-actions button {
  min-width: 32px;
  height: 32px;
  border: 1px solid #dfe4ea;
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.pager-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-size-select {
  padding: 0.35rem 0.5rem;
  border: 1px solid #dfe4ea;
  border-radius: 8px;
  background: white;
  min-width: 70px;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 0 0 12px;
}

.active-filters__label {
  font-weight: 600;
  color: #2c3a47;
}

.active-filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.55rem;
  border: 1px solid #e0e0e0;
  border-radius: 999px;
  background: #f7f8fb;
  cursor: pointer;
}

.filter-chip i {
  font-size: 0.85rem;
}

.clear-all {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
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

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}
</style>
