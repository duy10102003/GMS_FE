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
        :title="`Thợ của vai trò #${roleName}`"
        :show-search="false"
        :notifications="notifications"
        @logout="handleLogout"
      />

      <main class="page">
        <div class="page-head">
          <div>
            <!-- <h2>Danh sách thợ</h2> -->
            <p>Hiển thị thợ thuộc vai trò đang chọn</p>
          </div>
          <div class="page-head__actions">
            <GmsButton variant="primary" icon="fa-user-plus" @click="openAssignDialog">Thêm thợ</GmsButton>
            <GmsButton variant="outline" icon="fa-arrow-left" @click="goBack">Quay lại vai trò</GmsButton>
          </div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <span class="label">Tổng thợ</span>
            <strong>{{ mechanicSummary.total }}</strong>
          </div>
          <div class="summary-item">
            <span class="label">Đang có việc</span>
            <strong class="text-warning">{{ mechanicSummary.active }}</strong>
          </div>
          <div class="summary-item">
            <span class="label">Chưa có việc</span>
            <strong class="text-success">{{ mechanicSummary.idle }}</strong>
          </div>
          <div v-if="mechanicsStatusLoading" class="summary-loading">
            <i class="fas fa-spinner fa-spin"></i>
            Đang kiểm tra trạng thái thợ...
          </div>
        </div>

        <div class="active-filters" v-if="activeFilters.length">
          <span class="active-filters__label">Đang lọc:</span>
          <div class="active-filters__chips">
            <button
              v-for="(f, idx) in activeFilters"
              :key="idx"
              class="filter-chip"
              @click="clearFilter(f.key)"
            >
              <span>{{ f.label }}</span>
              <i class="fa-solid fa-xmark"></i>
            </button>
            <button class="filter-chip clear-all" @click="clearAllFilters">
              <span>Xóa tất cả</span>
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <div class="card">
          <div v-if="loading" class="state state--loading">
            <i class="fas fa-spinner fa-spin"></i>
            Đang tải...
          </div>

          <div v-else class="table-wrapper">
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
                      <span>Tên</span>
                      <button class="filter-btn" :class="{ active: isFilterActive('name') }" @click.stop="openFilterModal('name')">
                        <i class="fa-solid fa-filter"></i>
                      </button>
                      <button class="sort-btn" @click.stop="changeSort('name')">
                        <i :class="getSortIcon('name')"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <div class="th-with-filter">
                      <span>Email</span>
                      <button class="filter-btn" :class="{ active: isFilterActive('email') }" @click.stop="openFilterModal('email')">
                        <i class="fa-solid fa-filter"></i>
                      </button>
                      <button class="sort-btn" @click.stop="changeSort('email')">
                        <i :class="getSortIcon('email')"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <div class="th-with-filter">
                      <span>Điện thoại</span>
                      <button class="filter-btn" :class="{ active: isFilterActive('phone') }" @click.stop="openFilterModal('phone')">
                        <i class="fa-solid fa-filter"></i>
                      </button>
                      <button class="sort-btn" @click.stop="changeSort('phone')">
                        <i :class="getSortIcon('phone')"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <div class="th-with-filter">
                      <span>Kinh nghiệm (năm)</span>
                      <button class="filter-btn" :class="{ active: isFilterActive('exp') }" @click.stop="openFilterModal('exp')">
                        <i class="fa-solid fa-filter"></i>
                      </button>
                      <button class="sort-btn" @click.stop="changeSort('exp')">
                        <i :class="getSortIcon('exp')"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <div class="th-with-filter">
                      <span>Số việc</span>
                      <button class="filter-btn" :class="{ active: isFilterActive('taskCount') }" @click.stop="openFilterModal('taskCount')">
                        <i class="fa-solid fa-filter"></i>
                      </button>
                      <button class="sort-btn" @click.stop="changeSort('taskCount')">
                        <i :class="getSortIcon('taskCount')"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <div class="th-with-filter">
                      <span>Trạng thái</span>
                      <button class="filter-btn" :class="{ active: isFilterActive('status') }" @click.stop="openFilterModal('status')">
                        <i class="fa-solid fa-filter"></i>
                      </button>
                      <button class="sort-btn" @click.stop="changeSort('status')">
                        <i :class="getSortIcon('status')"></i>
                      </button>
                    </div>
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!sortedMechanics.length">
                  <td colspan="8" class="empty-cell">Không tìm thấy thợ</td>
                </tr>
                <tr v-else v-for="m in sortedMechanics" :key="m.mechanicRolePermissionId || m.userId || m.email">
                  <td>{{ m.mechanicRolePermissionId || m.userId || '-' }}</td>
                  <td>{{ m.fullName || m.name || 'N/A' }}</td>
                  <td>{{ m.email || 'N/A' }}</td>
                  <td>{{ m.phone || 'N/A' }}</td>
                  <td>{{ m.yearExp ?? '-' }}</td>
                  <td>{{ m.activeTaskCount > 0 ? m.activeTaskCount : '-' }}</td>
                  <td>
                    <span v-if="m.activeTaskStatus !== null" :class="['status-badge', getTaskBadgeClass(m.activeTaskStatus)]">
                      {{ getTaskStatusLabel(m.activeTaskStatus) }}
                    </span>
                    <span v-else class="status-badge status-idle">
                      Rảnh
                    </span>
                  </td>
                  <td class="actions-cell">
                    <GmsButton
                      size="small"
                      variant="info"
                      icon="fa-eye"
                      @click="openTasksDialog(m)"
                    >
                      Xem việc
                    </GmsButton>
                    <GmsButton
                      size="small"
                      variant="danger"
                      icon="fa-trash"
                      :loading="removingId === m.userId"
                      @click="removeMechanic(m)"
                    >
                      Xóa
                    </GmsButton>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="pager">
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
                  / {{ totalItems }} thợ
                </span>
              </div>
              <div class="pager-actions">
                <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">&lt;</button>
                <span>Trang {{ currentPage }} / {{ totalPages }}</span>
                <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

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
          <template v-if="columnMap[filterModal.columnKey]?.type === 'status'">
            <select v-model="filterModal.value" class="form-select">
              <option value="">-- Chọn trạng thái --</option>
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </template>
          <template v-else-if="columnMap[filterModal.columnKey]?.type === 'number'">
            <input
              v-model.number="filterModal.value"
              type="number"
              min="0"
              class="form-control"
              placeholder="Nhập giá trị số"
            />
          </template>
          <template v-else>
            <input
              v-model="filterModal.value"
              type="text"
              class="form-control"
              placeholder="Nhập giá trị..."
            />
          </template>
        </div>
        <div class="dialog-actions">
          <GmsButton variant="outline" @click="closeFilterDialog">Hủy</GmsButton>
          <GmsButton variant="primary" @click="applyFilterModal">Áp dụng</GmsButton>
        </div>
      </div>
    </GmsDialog>

    <GmsDialog v-model="showAssignDialog" title="Thêm thợ vào vai trò" size="small">
      <form @submit.prevent="assignMechanic">
        <div class="mb-3">
          <label class="form-label">Chọn thợ</label>
          <select v-model="selectedMechanicId" class="form-select" required>
            <option value="">-- Chọn thợ --</option>
            <option v-for="m in availableMechanics" :key="m.userId" :value="m.userId">
              {{ m.fullName || m.name || m.email }}
            </option>
          </select>
          <p v-if="!availableMechanics.length" class="helper-text">Không còn thợ khả dụng để gán.</p>
        </div>
        <div class="mb-3">
          <label class="form-label">Kinh nghiệm (năm)</label>
          <input
            v-model.number="mechanicExperience"
            type="number"
            min="0"
            max="60"
            step="1"
            class="form-control"
            placeholder="Nhập số năm kinh nghiệm"
            required
          />
        </div>
        <div class="dialog-actions">
          <GmsButton type="button" variant="outline" @click="showAssignDialog = false">Hủy</GmsButton>
          <GmsButton
            type="submit"
            variant="primary"
            :loading="assigning"
            :disabled="!availableMechanics.length"
          >
            Thêm thợ
          </GmsButton>
        </div>
      </form>
    </GmsDialog>

    <GmsDialog v-model="showTasksDialog" :title="`Công việc của ${selectedMechanic?.fullName || selectedMechanic?.email || 'thợ'}`" size="medium">
      <div v-if="tasksLoading" class="state state--loading">
        <i class="fas fa-spinner fa-spin"></i>
        Đang tải công việc...
      </div>
      <div v-else>
        <div v-if="!mechanicTasks.length" class="state">
          <i class="fas fa-inbox"></i>
          Không có công việc nào.
        </div>
        <div v-else class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Task ID</th>
                <th>Trạng thái</th>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Ngày giao</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in mechanicTasks" :key="task.technicalTaskId">
                <td>{{ task.serviceTicketCode || 'N/A' }}</td>
                <td>{{ task.technicalTaskId || 'N/A' }}</td>
                <td>
                  <span :class="['status-badge', getTaskBadgeClass(task.taskStatus)]">
                    {{ getTaskStatusLabel(task.taskStatus) }}
                  </span>
                </td>
                <td>{{ task.customerName || 'N/A' }}</td>
                <td>
                  <span>{{ task.vehicleName || 'N/A' }}</span>
                  <span v-if="task.vehicleLicensePlate" class="plate">({{ task.vehicleLicensePlate }})</span>
                </td>
                <td>{{ formatDate(task.assignedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </GmsDialog>

    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { TheHeader, TheSideBar } from "@/layout"
import { GmsButton, GmsDialog, GmsToast } from "@/components"
import { TASK_STATUS, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "@/constant/serviceTicketStatus"
import { getMenuByRole } from "@/utils/menu"
import authService from "@/services/auth"
import mechanicRoleService from "@/services/mechanicRole"
import userService from "@/services/user"
import technicalTaskService from "@/services/technicalTask"
import { useToast } from "@/composables/useToast"

const route = useRoute()
const router = useRouter()
const toastRef = ref(null)
const toast = useToast()

const roleId = route.params.id
const roleIdNumber = computed(() => Number(roleId))

const roleName = route.params.roleName || ""
const sidebarCollapsed = ref(false)
const notifications = ref([])
const menuItems = ref([])
const loading = ref(false)
const mechanics = ref([])
const mechanicsStatusLoading = ref(false)
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const mechanicSummary = ref({
  total: 0,
  active: 0,
  idle: 0
})
const sortConfig = ref({ key: "id", direction: "DESC" })

const showAssignDialog = ref(false)
const availableMechanics = ref([])
const selectedMechanicId = ref("")
const mechanicExperience = ref(null)
const assigning = ref(false)
const removingId = ref(null)
const showTasksDialog = ref(false)
const selectedMechanic = ref(null)
const mechanicTasks = ref([])
const tasksLoading = ref(false)

const operatorOptionsText = [
  { value: "contains", label: "Chứa" },
  { value: "not_contains", label: "Không chứa" },
  { value: "equals", label: "Bằng" },
  { value: "not_equals", label: "Khác" },
  { value: "starts_with", label: "Bắt đầu với" },
  { value: "ends_with", label: "Kết thúc với" }
]

const operatorOptionsNumber = [
  { value: "equals", label: "Bằng" },
  { value: "not_equals", label: "Khác" },
  { value: "greater_than", label: "Lớn hơn" },
  { value: "less_than", label: "Nhỏ hơn" },
  { value: "greater_or_equal", label: "Lớn hơn hoặc bằng" },
  { value: "less_or_equal", label: "Nhỏ hơn hoặc bằng" }
]

const statusOptions = [
  { value: "idle", label: "Rảnh" },
  { value: TASK_STATUS.PENDING, label: TASK_STATUS_LABELS[TASK_STATUS.PENDING] },
  { value: TASK_STATUS.IN_PROGRESS, label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS] }
]

const defaultFilters = {
  name: { operator: "contains", value: "" },
  email: { operator: "contains", value: "" },
  phone: { operator: "contains", value: "" },
  exp: { operator: "greater_or_equal", value: "" },
  taskCount: { operator: "greater_or_equal", value: "" },
  status: { operator: "equals", value: "" }
}

const filters = ref(structuredClone(defaultFilters))

const filterModal = ref({
  show: false,
  columnKey: "",
  label: "",
  operator: "contains",
  value: ""
})

const columnMap = {
  // Backend expects PascalCase column names for filtering
  name: { label: "Tên", columnName: "FullName", type: "text" },
  email: { label: "Email", columnName: "Email", type: "text" },
  phone: { label: "Điện thoại", columnName: "Phone", type: "text" },
  exp: { label: "Kinh nghiệm", columnName: "YearExp", type: "number" },
  taskCount: { label: "Số việc", columnName: null, type: "number", localOnly: true },
  status: { label: "Trạng thái", columnName: null, type: "status", localOnly: true }
}

const ACTIVE_TASK_STATUSES = [TASK_STATUS.IN_PROGRESS, TASK_STATUS.PENDING]
const operatorLabelMap = [...operatorOptionsText, ...operatorOptionsNumber].reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})

const getOperatorOptions = key => {
  const type = columnMap[key]?.type
  if (type === "status") return [{ value: "equals", label: "Bằng" }]
  return type === "number" ? operatorOptionsNumber : operatorOptionsText
}

const currentOperatorOptions = computed(() => getOperatorOptions(filterModal.value.columnKey))

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize.value)))
const startIndex = computed(() =>
  totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
)
const endIndex = computed(() => Math.min(totalItems.value, currentPage.value * pageSize.value))

const buildColumnFilters = () => {
  const list = []
  Object.entries(filters.value).forEach(([key, obj]) => {
    const { value, operator } = obj || {}
    const mapping = columnMap[key]
    if (!mapping || mapping.localOnly) return

    const normalizedValue =
      typeof value === "string" ? value.trim() : value

    if (normalizedValue !== null && normalizedValue !== undefined && normalizedValue !== "") {
      list.push({
        columnName: mapping.columnName,
        operator,
        value: normalizedValue?.toString() ?? normalizedValue
      })
    }
  })
  return list
}

const sortedMechanics = computed(() => {
  const list = [...displayedMechanics.value]
  const dir = sortConfig.value.direction === "DESC" ? -1 : 1
  switch (sortConfig.value.key) {
    case "name":
      return list.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || "") * dir)
    case "email":
      return list.sort((a, b) => (a.email || "").localeCompare(b.email || "") * dir)
    case "phone":
      return list.sort((a, b) => (a.phone || "").localeCompare(b.phone || "") * dir)
    case "exp":
      return list.sort((a, b) => ((a.yearExp ?? 0) - (b.yearExp ?? 0)) * dir)
    case "taskCount":
      return list.sort((a, b) => ((a.activeTaskCount ?? 0) - (b.activeTaskCount ?? 0)) * dir)
    case "status":
      return list.sort((a, b) => ((a.activeTaskStatus ?? -1) - (b.activeTaskStatus ?? -1)) * dir)
    case "id":
    default:
      return list.sort((a, b) => ((a.mechanicRolePermissionId ?? a.userId ?? 0) - (b.mechanicRolePermissionId ?? b.userId ?? 0)) * dir)
  }
})

const activeFilters = computed(() => {
  const chips = []
  Object.entries(filters.value).forEach(([key, obj]) => {
    const mapping = columnMap[key]
    if (!mapping) return
    const raw = obj?.value
    const normalized = typeof raw === "string" ? raw.trim() : raw
    if (normalized !== null && normalized !== undefined && normalized !== "") {
      const displayValue =
        mapping.type === "status" ? getStatusLabelFromValue(normalized) : normalized
      const opLabel = operatorLabelMap[obj?.operator] || obj?.operator || ""
      chips.push({ key, label: `${mapping.label}: ${opLabel} ${displayValue}` })
    }
  })
  return chips
})

const matchesNumberFilter = (value, filter) => {
  if (filter?.value === "" || filter?.value === null || filter?.value === undefined) return true
  const num = Number(value)
  const target = Number(filter.value)
  if (Number.isNaN(num) || Number.isNaN(target)) return false
  switch (filter.operator) {
    case "equals":
      return num === target
    case "not_equals":
      return num !== target
    case "greater_than":
      return num > target
    case "less_than":
      return num < target
    case "greater_or_equal":
      return num >= target
    case "less_or_equal":
      return num <= target
    default:
      return true
  }
}

const matchesTextFilter = (value, filter) => {
  if (filter?.value === "" || filter?.value === null || filter?.value === undefined) return true
  const text = (value ?? "").toString().toLowerCase()
  const target = filter.value.toString().toLowerCase().trim()
  switch (filter.operator) {
    case "contains":
      return text.includes(target)
    case "not_contains":
      return !text.includes(target)
    case "equals":
      return text === target
    case "not_equals":
      return text !== target
    case "starts_with":
      return text.startsWith(target)
    case "ends_with":
      return text.endsWith(target)
    default:
      return true
  }
}

const getStatusLabelFromValue = value => {
  if (value === "idle") return "Rảnh"
  return TASK_STATUS_LABELS[value] || "Đang bận"
}

const displayedMechanics = computed(() => {
  return mechanics.value.filter(m => {
    const taskFilter = filters.value.taskCount
    if (!matchesNumberFilter(m.activeTaskCount ?? 0, taskFilter)) return false

    const statusFilter = filters.value.status
    if (statusFilter?.value !== "" && statusFilter?.value !== null && statusFilter?.value !== undefined) {
      if (statusFilter.value === "idle") {
        if (m.activeTaskStatus !== null) return false
      } else {
        if (Number(m.activeTaskStatus) !== Number(statusFilter.value)) return false
      }
    }

    return true
  })
})

const resetFilter = key => {
  const defaults = defaultFilters[key]
  filters.value[key] = defaults ? { ...defaults } : { operator: "contains", value: "" }
}

const clearFilter = async key => {
  resetFilter(key)
  currentPage.value = 1
  await loadMechanics()
}

const clearAllFilters = async () => {
  filters.value = structuredClone(defaultFilters)
  currentPage.value = 1
  await loadMechanics()
}

const fetchActiveTaskInfo = async mechanicId => {
  // Ưu tiên task đang làm, sau đó đến chờ bắt đầu; cộng tổng số task đang mở
  let pickedStatus = null
  let total = 0

  for (const status of ACTIVE_TASK_STATUSES) {
    const res = await technicalTaskService.getPaging({
      page: 1,
      pageSize: 1,
      assignedToTechnical: mechanicId,
      taskStatus: status,
      columnSorts: [{ columnName: "TechnicalTaskId", sortDirection: "DESC" }]
    })
    const items = res?.data?.items ?? res?.data ?? []
    const count =
      res?.data?.total ??
      res?.data?.totalItems ??
      res?.total ??
      res?.totalItems ??
      (Array.isArray(items) ? items.length : 0)

    if (count > 0) {
      total += count
      if (!pickedStatus) {
        pickedStatus = status
      }
    }
  }

  return { status: pickedStatus, count: total }
}

const refreshMechanicStatuses = async () => {
  if (!mechanics.value.length) {
    mechanicSummary.value = { total: 0, active: 0, idle: 0 }
    return
  }

  const pageTotal = mechanics.value.length
  mechanicsStatusLoading.value = true
  try {
    const results = await Promise.allSettled(
      mechanics.value.map(async m => {
        if (!m.userId) return { userId: m.userId, status: null, count: 0 }
        const info = await fetchActiveTaskInfo(m.userId)
        return { userId: m.userId, status: info.status, count: info.count }
      })
    )

    const statusMap = new Map()
    results.forEach(r => {
      if (r.status === "fulfilled" && r.value) {
        statusMap.set(r.value.userId, {
          status: r.value.status ?? null,
          count: r.value.count ?? 0
        })
      }
    })

    mechanics.value = mechanics.value.map(m => {
      const info = statusMap.get(m.userId) ?? { status: null, count: 0 }
      return {
        ...m,
        activeTaskStatus: info.status,
        activeTaskCount: info.count
      }
    })

    const active = Array.from(statusMap.values()).filter(
      s => s?.count > 0
    ).length
    mechanicSummary.value = {
      total: pageTotal,
      active,
      idle: Math.max(0, pageTotal - active)
    }
  } catch (error) {
    mechanicSummary.value = { total: pageTotal, active: 0, idle: pageTotal }
  } finally {
    mechanicsStatusLoading.value = false
  }
}

const loadMechanics = async () => {
  if (!roleIdNumber.value || Number.isNaN(roleIdNumber.value)) {
    toast.error("Không xác định được vai trò thợ")
    return
  }
  try {
    loading.value = true
    const payload = {
      page: currentPage.value,
      pageSize: pageSize.value,
      columnFilters: buildColumnFilters(),
      columnSorts: []
    }
    const res = await mechanicRoleService.getMechanicsPaging(roleIdNumber.value, payload)
    const items =
      res?.data?.items ??
      res?.data?.data ??
      res?.items ??
      res?.data ??
      []
    mechanics.value = Array.isArray(items)
      ? items.map(m => ({ ...m, activeTaskStatus: null, activeTaskCount: 0 }))
      : []
    totalItems.value =
      res?.data?.totalItems ??
      res?.data?.total ??
      res?.totalItems ??
      res?.total ??
      mechanics.value.length

    await refreshMechanicStatuses()
  } catch (error) {
    mechanics.value = []
    totalItems.value = 0
    mechanicSummary.value = { total: 0, active: 0, idle: 0 }
    const message = error?.response?.data?.message || error.message || "Đã xảy ra lỗi"
    toast.error("Không thể tải danh sách thợ", message)
  } finally {
    loading.value = false
  }
}

const openFilterModal = key => {
  const mapping = columnMap[key]
  if (!mapping) return
  const isNumber = mapping.type === "number"
  const isStatus = mapping.type === "status"
  const preset = filters.value[key] || {}
  filterModal.value = {
    show: true,
    columnKey: key,
    label: mapping.label,
    operator: preset.operator || (isStatus ? "equals" : isNumber ? "greater_or_equal" : "contains"),
    value: preset.value || ""
  }
}

const closeFilterDialog = () => {
  filterModal.value.show = false
}

const applyFilterModal = async () => {
  const { columnKey, operator, value } = filterModal.value
  if (!columnKey) return
  const mapping = columnMap[columnKey]
  const isNumber = mapping?.type === "number"
  filters.value[columnKey] = {
    operator,
    value: isNumber ? value : typeof value === "string" ? value.trim() : value
  }
  currentPage.value = 1
  await loadMechanics()
  closeFilterDialog()
}

const isFilterActive = key => {
  const f = filters.value[key]
  return f && f.value !== null && f.value !== undefined && f.value !== ""
}

const handlePageSizeChange = async () => {
  currentPage.value = 1
  await loadMechanics()
}

const changePage = async page => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await loadMechanics()
}

const changeSort = key => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === "ASC" ? "DESC" : "ASC"
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = "ASC"
  }
}

const getSortIcon = key => {
  if (sortConfig.value.key !== key) return "fa-solid fa-sort"
  return sortConfig.value.direction === "ASC" ? "fa-solid fa-sort-up" : "fa-solid fa-sort-down"
}

const getTaskStatusLabel = status => TASK_STATUS_LABELS[status] || "Đang bận"

const getTaskBadgeClass = status => {
  const color = TASK_STATUS_COLORS[status] || "warning"
  return `status-${color}`
}

const loadAvailableMechanics = async () => {
  try {
    const res = await userService.getTechnicalStaff()
    const data = res?.data ?? res ?? []
    const assignedIds = new Set(mechanics.value.map(m => m.userId))
    availableMechanics.value = Array.isArray(data) ? data.filter(m => !assignedIds.has(m.userId)) : []
  } catch (error) {
    availableMechanics.value = []
    toast.error("Không thể tải danh sách thợ", error.message || "Đã xảy ra lỗi")
  }
}

const openAssignDialog = async () => {
  selectedMechanicId.value = ""
  mechanicExperience.value = null
  await loadAvailableMechanics()
  showAssignDialog.value = true
}

const assignMechanic = async () => {
  if (!selectedMechanicId.value) {
    toast.error("Vui lòng chọn thợ")
    return
  }
  if (mechanicExperience.value === null || mechanicExperience.value === "" || mechanicExperience.value < 0) {
    toast.error("Vui lòng nhập kinh nghiệm hợp lệ")
    return
  }
  try {
    assigning.value = true
    await mechanicRoleService.assign({
      userId: selectedMechanicId.value,
      mechanicRoleId: roleIdNumber.value,
      yearExp: mechanicExperience.value
    })
    toast.success("Đã thêm thợ vào vai trò")
    showAssignDialog.value = false
    selectedMechanicId.value = ""
    mechanicExperience.value = null
    await loadMechanics()
    await loadAvailableMechanics()
  } catch (error) {
    toast.error("Không thể thêm thợ", error.response?.data?.message || error.message || "Đã xảy ra lỗi")
  } finally {
    assigning.value = false
  }
}

const removeMechanic = async mechanic => {
  const userId = mechanic?.userId
  if (!userId) {
    toast.error("Không xác định được thợ để xóa")
    return
  }
  const confirmed = window.confirm("Xóa thợ này khỏi vai trò?")
  if (!confirmed) return
  try {
    removingId.value = userId
    await mechanicRoleService.unassign({ userId, mechanicRoleId: roleIdNumber.value })
    toast.success("Đã xóa thợ khỏi vai trò")
    await loadMechanics()
    await loadAvailableMechanics()
  } catch (error) {
    toast.error("Không thể xóa thợ", error.response?.data?.message || error.message || "Đã xảy ra lỗi")
  } finally {
    removingId.value = null
  }
}

const goBack = () => {
  router.push("/manager/mechanic-roles")
}

const openTasksDialog = async mechanic => {
  selectedMechanic.value = mechanic
  mechanicTasks.value = []
  showTasksDialog.value = true
  await loadMechanicTasks(mechanic?.userId)
}

const formatDate = date => {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
}

const loadMechanicTasks = async mechanicId => {
  if (!mechanicId) return
  try {
    tasksLoading.value = true
    const res = await technicalTaskService.getPaging({
      page: 1,
      pageSize: 10,
      assignedToTechnical: mechanicId,
      columnSorts: [{ columnName: "TechnicalTaskId", sortDirection: "DESC" }]
    })
    const items =
      res?.data?.items ??
      res?.items ??
      res?.data ??
      []
    mechanicTasks.value = Array.isArray(items) ? items : []
  } catch (error) {
    mechanicTasks.value = []
    toast.error("Không thể tải công việc", error.message || "Đã xảy ra lỗi")
  } finally {
    tasksLoading.value = false
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

.summary {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-item {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.summary-item .label {
  color: #666;
  font-size: 0.9rem;
}

.summary-loading {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #888;
}

.text-warning {
  color: #f59e0b;
}

.text-success {
  color: #10b981;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.active-filters__label {
  color: #555;
  font-weight: 600;
}

.active-filters__chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #eef2ff;
  color: #4338ca;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.9rem;
  border: 1px solid #c7d2fe;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-chip.clear-all {
  background: #fee2e2;
  border-color: #fecdd3;
  color: #b91c1c;
}

.filter-chip.clear-all:hover {
  background: #fecaca;
}

.filter-chip:hover {
  background: #e0e7ff;
}

.filter-chip i {
  font-size: 0.85rem;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.page-head__actions {
  display: flex;
  gap: 0.5rem;
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

.plate {
  color: #475569;
  font-size: 0.9rem;
}

.table-wrapper {
  overflow-x: auto;
  width: 100%;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 1rem;
  border-bottom: 1px solid #eef0f4;
  text-align: left;
}

.table th {
  background: #f7f8fb;
  white-space: nowrap;
}

.table th:first-child,
.table td:first-child {
  width: 10%;
}

.table th:nth-child(2),
.table td:nth-child(2) {
  min-width: 180px;
}

.table th:nth-child(3),
.table td:nth-child(3),
.table th:nth-child(4),
.table td:nth-child(4) {
  min-width: 180px;
}

.table th:nth-child(5),
.table td:nth-child(5),
.table th:nth-child(6),
.table td:nth-child(6),
.table th:nth-child(7),
.table td:nth-child(7) {
  white-space: nowrap;
}

.th-with-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.filter-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #888;
  padding: 0;
}

.filter-btn.active {
  color: var(--primary, #ff7a00);
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

.pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.pager-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-select {
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #dde0e6;
}

.pager-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pager-actions button {
  padding: 0.35rem 0.65rem;
  border: 1px solid #dde0e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.pager-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-warning {
  background: #fff7ed;
  color: #d97706;
  border-color: #fde68a;
}

.status-info {
  background: #e0f2fe;
  color: #0369a1;
  border-color: #bae6fd;
}

.status-success {
  background: #ecfdf3;
  color: #166534;
  border-color: #bbf7d0;
}

.status-danger {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecdd3;
}

.status-idle {
  background: #f8fafc;
  color: #475569;
  border: 1px dashed #cbd5e1;
}

.status-badge + .status-badge {
  margin-left: 0.25rem;
}

.actions-cell {
  white-space: nowrap;
}

.table-wrapper table {
  min-width: 1000px;
}

.empty-cell {
  text-align: center;
  color: #777;
  padding: 1.5rem 0.5rem;
}

.helper-text {
  margin: 0.5rem 0 0;
  color: #777;
  font-size: 0.9rem;
}

.filter-modal {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
