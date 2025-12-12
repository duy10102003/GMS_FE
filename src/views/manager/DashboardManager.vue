<template>
  <div class="dashboard-manager">
    <TheSideBar @logout="handleLogout" />
    <div class="dashboard-manager-body">
      <TheHeader
        title="Dashboard nhân sự kỹ thuật"
        :show-search="false"
        @logout="handleLogout"
      />

      <main class="main-content hr-dashboard">
        <div class="page-header">
          <div>
            <p class="eyebrow">Quản lý tài nguyên thực thi</p>
            <h1>Thợ bận/rảnh, kinh nghiệm và phân bổ task</h1>
            <p class="subtitle">
              Nhanh chóng nhận ra nguồn lực đang bận, ai đang rảnh và cảnh báo quá tải để manager ra quyết định.
            </p>
          </div>
          <div class="actions">
            <GmsButton variant="outline" icon="fa-rotate-right" :loading="refreshing" @click="refreshDashboard">
              Làm mới
            </GmsButton>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon soft-green">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-label">Thợ rảnh</div>
            <div class="stat-value">{{ formatNumber(mechanicMetrics.free) }}</div>
            <div class="stat-meta">Tổng: {{ mechanicMetrics.total }} | Bận: {{ mechanicMetrics.busy }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon soft-amber">
              <i class="fas fa-fire"></i>
            </div>
            <div class="stat-label">Thợ đang bận</div>
            <div class="stat-value">{{ formatNumber(mechanicMetrics.busy) }}</div>
            <div class="stat-meta">
              Quá tải: {{ mechanicMetrics.overloaded }} | Rảnh: {{ mechanicMetrics.idle }}
            </div>
            <div class="progress-bar">
              <span class="progress-fill" :style="{ width: workloadRate + '%' }"></span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon soft-blue">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="stat-label">Task đang làm</div>
            <div class="stat-value">{{ formatNumber(taskSummary.inProgress) }}</div>
            <div class="stat-meta">Chờ xử lý: {{ formatNumber(taskSummary.pending) }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon soft-purple">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div class="stat-label">Kinh nghiệm TB</div>
            <div class="stat-value">{{ mechanicMetrics.avgExp }} năm</div>
            <div class="stat-meta">Top: {{ topExperience.map(m => m.fullName).join(', ') || 'N/A' }}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Nguồn lực</p>
                <h3>Tình trạng thợ</h3>
              </div>
              <span class="pill">{{ formatNumber(mechanics.length) }} thợ</span>
            </div>

            <div v-if="loading" class="state">
              <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </div>
            <div v-else-if="!mechanics.length" class="state">
              <i class="fas fa-users"></i> Chưa có dữ liệu thợ
            </div>
            <div v-else class="mechanic-list">
              <div
                v-for="mechanic in pagedMechanics"
                :key="mechanic.userId || mechanic.email"
                class="mechanic-card"
              >
                <div class="avatar">{{ getInitials(mechanic.fullName) }}</div>
                <div class="mechanic-info">
                  <div class="row-top">
                    <div>
                      <div class="name">{{ mechanic.fullName || 'Chưa rõ' }}</div>
                      <div class="meta">
                        <span class="pill ghost">{{ mechanic.mechanicRoleName || 'Thợ' }}</span>
                        <span class="pill ghost">{{ mechanic.yearExp ? `${mechanic.yearExp} năm exp` : 'Chưa cập nhật exp' }}</span>
                      </div>
                    </div>
                    <span :class="['pill', getStatusClass(mechanic)]">
                      <i :class="getStatusIcon(mechanic)"></i>
                      {{ getStatusLabel(mechanic) }}
                    </span>
                  </div>
                  <div class="row-bottom">
                    <div class="task-meter">
                      <div class="task-meter-fill" :style="{ width: getTaskLoad(mechanic) + '%' }"></div>
                    </div>
                    <div class="task-meta">
                      <span class="pill ghost">{{ mechanic.currentTaskCount || 0 }} task</span>
                      <small>{{ mechanic.email || 'N/A' }}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="pager" v-if="mechanics.length > mechanicPageSize">
                <button :disabled="mechanicPage === 1" @click="changeMechanicPage(-1)">Trước</button>
                <span>Trang {{ mechanicPage }} / {{ mechanicTotalPages }}</span>
                <button :disabled="mechanicPage === mechanicTotalPages" @click="changeMechanicPage(1)">Sau</button>
              </div>
            </div>
          </div>

          <div class="panel alerts">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Cảnh báo</p>
                <h3>Quá tải / không có việc</h3>
              </div>
              <span class="pill ghost">Ngưỡng quá tải ≥ {{ overloadThreshold }} task</span>
            </div>
            <div v-if="loading" class="state">
              <i class="fas fa-spinner fa-spin"></i> Đang kiểm tra...
            </div>
            <div v-else class="alert-list">
              <div v-for="(alert, index) in alerts" :key="index" :class="['alert-card', alert.type]">
                <div class="alert-icon">
                  <i :class="alert.icon"></i>
                </div>
                <div>
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-message">{{ alert.message }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Phân bổ</p>
                <h3>Task theo thợ</h3>
              </div>
              <span class="pill ghost">Top phù hợp để điều phối</span>
            </div>

            <div v-if="!allocationRows.length" class="state">
              <i class="fas fa-clipboard-list"></i> Chưa có dữ liệu phân bổ
            </div>
            <div v-else class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Thợ</th>
                    <th>Đang làm</th>
                    <th>Chờ</th>
                    <th>Đã xong</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in allocationRows" :key="row.key">
                    <td>
                      <div class="cell-name">
                        <span class="avatar tiny">{{ getInitials(row.name) }}</span>
                        <div>
                          <div class="name">{{ row.name || 'Chưa rõ' }}</div>
                          <small class="muted">#{{ row.key || 'N/A' }}</small>
                        </div>
                      </div>
                    </td>
                    <td><span class="pill pill-warning">{{ row.inProgress }}</span></td>
                    <td><span class="pill ghost">{{ row.pending }}</span></td>
                    <td><span class="pill pill-success">{{ row.completed }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Trạng thái task</p>
                <h3>Pipeline</h3>
              </div>
              <span class="pill ghost">Tổng {{ formatNumber(taskSummary.total) }} task</span>
            </div>

            <div class="pipeline">
              <div class="pipeline-row">
                <div>
                  <div class="pipeline-label">Chờ thực thi</div>
                  <small>TaskStatus: Pending</small>
                </div>
                <span class="pill ghost">{{ formatNumber(taskSummary.pending) }}</span>
              </div>
              <div class="pipeline-row">
                <div>
                  <div class="pipeline-label">Đang làm</div>
                  <small>TaskStatus: In progress</small>
                </div>
                <span class="pill pill-warning">{{ formatNumber(taskSummary.inProgress) }}</span>
              </div>
              <div class="pipeline-row">
                <div>
                  <div class="pipeline-label">Đã xong</div>
                  <small>TaskStatus: Completed</small>
                </div>
                <span class="pill pill-success">{{ formatNumber(taskSummary.completed) }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsButton } from '@/components'
import { useToast } from '@/composables/useToast'
import authService from '@/services/auth'
import userService from '@/services/user'
import technicalTaskService from '@/services/technicalTask'
import { TASK_STATUS } from '@/constant/serviceTicketStatus'

const router = useRouter()
const toast = useToast()

const loading = ref(true)
const refreshing = ref(false)
const mechanics = ref([])
const tasks = ref([])
// const mechanicPage = ref(1)
// const mechanicPageSize = ref(5)
const taskSummary = ref({
  pending: 0,
  inProgress: 0,
  completed: 0,
  total: 0
})
// Thợ
const mechanicPage = ref(1)
const mechanicPageSize = ref(4)
const mechanicTotalPages = computed(() => Math.max(1, Math.ceil(mechanics.value.length / mechanicPageSize.value)))
const pagedMechanics = computed(() => {
  const start = (mechanicPage.value - 1) * mechanicPageSize.value
  return mechanics.value.slice(start, start + mechanicPageSize.value)
})
const allocationTotalPages = computed(() => Math.max(1, Math.ceil(allocationRows.value.length / allocationPageSize.value)))
const pagedAllocations = computed(() => {
  const start = (allocationPage.value - 1) * allocationPageSize.value
  return allocationRows.value.slice(start, start + allocationPageSize.value)
})

const pipelineTotalPages = computed(() => Math.max(1, Math.ceil(pipelineItems.length / pipelinePageSize.value)))
const pagedPipeline = computed(() => {
  const start = (pipelinePage.value - 1) * pipelinePageSize.value
  return pipelineItems.slice(start, start + pipelinePageSize.value)
})
// Task theo thợ (bảng)
const allocationPage = ref(1)
const allocationPageSize = ref(4)
// Pipeline (nếu cần)
const pipelinePage = ref(1)
const pipelinePageSize = ref(4)

const overloadThreshold = 3
const idleThreshold = 0

const mechanicMetrics = computed(() => {
  const total = mechanics.value.length
  const busy = mechanics.value.filter(m => !m.isAvailable && (m.currentTaskCount ?? 0) > 0).length
  const free = mechanics.value.filter(m => m.isAvailable).length
  const overloaded = mechanics.value.filter(m => (m.currentTaskCount ?? 0) >= overloadThreshold).length
  const idle = mechanics.value.filter(m => (m.currentTaskCount ?? 0) <= idleThreshold).length
  const avgExp = total
    ? Number(
        (
          mechanics.value.reduce((sum, m) => sum + getExp(m), 0) / total
        ).toFixed(1)
      )
    : 0

  return { total, busy, free, overloaded, idle, avgExp }
})

const workloadRate = computed(() => {
  if (!mechanicMetrics.value.total) return 0
  return Math.min(100, Math.round((mechanicMetrics.value.busy / mechanicMetrics.value.total) * 100))
})

// const mechanicTotalPages = computed(() => {
//   if (mechanicPageSize.value <= 0) return 1
//   const total = Math.ceil(mechanics.value.length / mechanicPageSize.value)
//   return Math.max(1, total)
// })

// const pagedMechanics = computed(() => {
//   if (!mechanics.value.length) return []
//   const start = (mechanicPage.value - 1) * mechanicPageSize.value
//   return mechanics.value.slice(start, start + mechanicPageSize.value)
// })

const topExperience = computed(() => {
  return [...mechanics.value]
    .sort((a, b) => getExp(b) - getExp(a))
    .slice(0, 3)
})

const allocationRows = computed(() => {
  const map = new Map()

  tasks.value.forEach(task => {
    const key = task.assignedToTechnical || task.technicalTaskId
    const existing = map.get(key) || {
      key,
      name: task.assignedToTechnicalName || 'Chưa gán',
      pending: 0,
      inProgress: 0,
      completed: 0
    }

    if (task.taskStatus === TASK_STATUS.PENDING) existing.pending += 1
    if (task.taskStatus === TASK_STATUS.IN_PROGRESS) existing.inProgress += 1
    if (task.taskStatus === TASK_STATUS.COMPLETED) existing.completed += 1

    map.set(key, existing)
  })

  mechanics.value.forEach(m => {
    if (!map.has(m.userId)) {
      map.set(m.userId, {
        key: m.userId,
        name: m.fullName,
        pending: 0,
        inProgress: m.currentTaskCount ?? 0,
        completed: 0
      })
    }
  })

  return Array.from(map.values())
    .sort((a, b) => (b.inProgress + b.pending) - (a.inProgress + a.pending))
    .slice(0, 8)
})

const alerts = computed(() => {
  const list = []

  mechanics.value.forEach(m => {
    const count = m.currentTaskCount ?? 0
    if (count >= overloadThreshold) {
      list.push({
        type: 'danger',
        icon: 'fas fa-bolt',
        title: m.fullName || 'Thợ',
        message: `Đang có ${count} task, cần giảm tải hoặc phân công lại`
      })
    }

    if (count <= idleThreshold || m.isAvailable) {
      list.push({
        type: 'warning',
        icon: 'fas fa-coffee',
        title: m.fullName || 'Thợ',
        message: 'Đang rảnh/không có task, cần bổ sung task hoặc hỗ trợ team khác'
      })
    }
  })

  if (!list.length) {
    list.push({
      type: 'success',
      icon: 'fas fa-check-circle',
      title: 'Ổn định',
      message: 'Không có cảnh báo về nhân sự'
    })
  }

  return list.slice(0, 8)
})

const extractTotal = (response) => {
  return (
    response?.data?.total ??
    response?.data?.totalItems ??
    response?.total ??
    response?.totalItems ??
    (Array.isArray(response?.data?.items) ? response.data.items.length : 0)
  )
}

const getExp = (mechanic) => {
  return Number(mechanic.yearExp ?? mechanic.yearsExperience ?? mechanic.experienceYears ?? 0)
}

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

const getTaskLoad = (mechanic) => {
  const count = mechanic.currentTaskCount ?? 0
  if (!count) return 10
  return Math.min(100, (count / overloadThreshold) * 50 + 30)
}

const getStatusLabel = (mechanic) => {
  const count = mechanic.currentTaskCount ?? 0
  if (count >= overloadThreshold) return 'Quá tải'
  if (count === 0) return 'Không có task'
  if (mechanic.isAvailable) return 'Rảnh'
  return 'Đang bận'
}

const getStatusClass = (mechanic) => {
  const count = mechanic.currentTaskCount ?? 0
  if (count >= overloadThreshold) return 'pill-danger'
  if (count === 0) return 'pill-info'
  return mechanic.isAvailable ? 'pill-success' : 'pill-warning'
}

const getStatusIcon = (mechanic) => {
  const count = mechanic.currentTaskCount ?? 0
  if (count >= overloadThreshold) return 'fas fa-exclamation-triangle'
  if (count === 0) return 'fas fa-circle-dot'
  if (mechanic.isAvailable) return 'fas fa-check-circle'
  return 'fas fa-clock'
}

const normalizeMechanic = (m) => {
  const count = m.currentTaskCount ?? 0
  return {
    // userId: m.userId,
    fullName: m.fullName ?? m.name ?? 'Thợ',
    email: m.email ?? '',
    phone: m.phone ?? '',
    isAvailable: m.isAvailable ?? m.available ?? m.status === 'AVAILABLE' ?? count === 0,
    currentTaskCount: count,
    mechanicRoleName: m.mechanicRoleName ?? m.roleName ?? m.role ?? 'Thợ',
    yearExp: getExp(m)
  }
}

const loadMechanics = async () => {
  try {
    const res = await userService.getTechnicalStaff()
    const items = res?.data ?? []
    mechanics.value = Array.isArray(items) ? items.map(normalizeMechanic) : []
    mechanicPage.value = 1
  } catch (error) {
    mechanics.value = []
    toast.error('Không thể tải danh sách thợ', error?.message || error?.userMsg || 'Có lỗi xảy ra')
  }
}

const fetchTaskCount = async (status) => {
  try {
    const res = await technicalTaskService.getPaging({
      page: 1,
      pageSize: 1,
      taskStatus: status
    })
    return extractTotal(res)
  } catch (error) {
    return 0
  }
}

const loadTasks = async () => {
  const [pending, inProgress, completed, listResponse] = await Promise.all([
    fetchTaskCount(TASK_STATUS.PENDING),
    fetchTaskCount(TASK_STATUS.IN_PROGRESS),
    fetchTaskCount(TASK_STATUS.COMPLETED),
    technicalTaskService
      .getPaging({
        page: 1,
        pageSize: 200,
        columnSorts: [{ columnName: 'AssignedAt', sortDirection: 'DESC' }]
      })
      .catch(error => {
        console.error('Error loading task list', error)
        return null
      })
  ])

  taskSummary.value = {
    pending,
    inProgress,
    completed,
    total: pending + inProgress + completed
  }

  const items = listResponse?.data?.items ?? listResponse?.data ?? []
  tasks.value = Array.isArray(items) ? items : []
}

const refreshDashboard = async () => {
  try {
    refreshing.value = true
    await Promise.all([loadMechanics(), loadTasks()])
  } catch (error) {
    toast.error('Lỗi tải dashboard nhân sự', error?.message || error?.userMsg || 'Có lỗi xảy ra')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const changeMechanicPage = (delta) => {
  const next = mechanicPage.value + delta
  mechanicPage.value = Math.min(mechanicTotalPages.value, Math.max(1, next))
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

onMounted(async () => {
  await refreshDashboard()
})
</script>

<style scoped>
.dashboard-manager {
  display: flex;
}

.dashboard-manager-body {
  flex: 1;
  margin-left: var(--sidebar-width, 260px);
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f9fc 0%, #f0f3ff 100%);
}

.hr-dashboard {
  padding: 2rem 2.25rem 3rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  font-size: 0.75rem;
  margin: 0 0 0.2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #111827;
}

.subtitle {
  margin: 0.4rem 0 0;
  color: #4b5563;
  max-width: 760px;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 12px 35px rgba(17, 24, 39, 0.08);
  position: relative;
  overflow: hidden;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  margin-bottom: 0.5rem;
}

.soft-green {
  background: #e8f8f1;
  color: #0f9d58;
}

.soft-amber {
  background: #fff3e6;
  color: #f59e0b;
}

.soft-blue {
  background: #e7f1ff;
  color: #2563eb;
}

.soft-purple {
  background: #efe9ff;
  color: #7c3aed;
}

.stat-label {
  color: #6b7280;
  font-weight: 600;
  font-size: 0.9rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.stat-meta {
  color: #4b5563;
  font-size: 0.9rem;
  margin-top: 0.35rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  border-radius: 6px;
  background: #edf2f7;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #f97316, #f59e0b);
  transition: width 0.3s ease;
}

.grid-2 {
  display: grid;
  grid-template-columns: 2fr 1.3fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.panel {
  /* overflow-y: auto;
  max-height: 200px; */
  background: #fff;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 12px 35px rgba(17, 24, 39, 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.panel-header h3 {
  margin: 0.1rem 0 0;
  color: #111827;
}

.panel-header .pill {
  font-size: 0.8rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111827;
  font-weight: 600;
  font-size: 0.85rem;
}

.pill-success {
  background: #e8f8f1;
  color: #0f9d58;
}

.pill-warning {
  background: #fff3e6;
  color: #d97706;
}

.pill-danger {
  background: #fef2f2;
  color: #b91c1c;
}

.pill-info {
  background: #e0f2fe;
  color: #0369a1;
}

.pill.ghost {
  background: #f9fafb;
  color: #4b5563;
}

.mechanic-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 4px;
}

.mechanic-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.85rem;
  border: 1px solid #f1f5f9;
  padding: 0.85rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #fbfbff 100%);
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f97316;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.avatar.tiny {
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

.mechanic-info .row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.mechanic-info .name {
  font-weight: 700;
  color: #111827;
}

.mechanic-info .meta {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.task-meter {
  flex: 1;
  height: 6px;
  border-radius: 6px;
  background: #e5e7eb;
  overflow: hidden;
}

.task-meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.task-meta small {
  color: #6b7280;
}

.alerts .alert-list {
  overflow-x: auto;
  max-height: 480px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  background: #fff;
}

.alert-card .alert-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #111827;
}

.alert-card.danger .alert-icon {
  background: #fef2f2;
  color: #b91c1c;
}

.alert-card.warning .alert-icon {
  background: #fff7ed;
  color: #d97706;
}

.alert-card.success .alert-icon {
  background: #ecfdf3;
  color: #15803d;
}

.alert-title {
  font-weight: 700;
  color: #111827;
}

.alert-message {
  color: #4b5563;
  margin-top: 0.2rem;
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
  text-align: left;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.table th {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 700;
}

.cell-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cell-name .name {
  font-weight: 700;
}

.muted {
  color: #6b7280;
}

.pipeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pipeline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  background: #f9fafb;
}

.pipeline-label {
  font-weight: 700;
  color: #111827;
}

.state {
  padding: 1.5rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 1200px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-manager-body {
    margin-left: 0;
  }

  .page-header {
    flex-direction: column;
  }
}
</style>
