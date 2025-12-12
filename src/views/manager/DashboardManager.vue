<template>
  <div class="dashboard-manager">
    <TheSideBar @logout="handleLogout" />
    <div class="dashboard-manager-body">
      <TheHeader
        title="Dashboard nhÃ¢n sá»± ká»¹ thuáº­t"
        :show-search="false"
        @logout="handleLogout"
      />

      <main class="main-content hr-dashboard">
        <div class="page-header">
          <div>
            <p class="eyebrow">Quáº£n lÃ½ tÃ i nguyÃªn thá»±c thi</p>
            <h1>Thá»£ báº­n/ráº£nh, kinh nghiá»‡m vÃ  phÃ¢n bá»• task</h1>
            <p class="subtitle">
              Nhanh chÃ³ng nhÃ¬n ra nguá»“n lá»±c Ä‘ang báº­n, ai Ä‘ang ráº£nh vÃ  cáº£nh bÃ¡o quÃ¡ táº£i Ä‘á»ƒ manager ra quyáº¿t Ä‘á»‹nh.
            </p>
          </div>
          <div class="actions">
            <GmsButton variant="outline" icon="fa-rotate-right" :loading="refreshing" @click="refreshDashboard">
              LÃ m má»›i
            </GmsButton>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon soft-green">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-label">Thá»£ ráº£nh</div>
            <div class="stat-value">{{ formatNumber(mechanicMetrics.free) }}</div>
            <div class="stat-meta">Tá»•ng: {{ mechanicMetrics.total }} | Báº­n: {{ mechanicMetrics.busy }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon soft-amber">
              <i class="fas fa-fire"></i>
            </div>
            <div class="stat-label">Thá»£ Ä‘ang báº­n</div>
            <div class="stat-value">{{ formatNumber(mechanicMetrics.busy) }}</div>
            <div class="stat-meta">
              QuÃ¡ táº£i: {{ mechanicMetrics.overloaded }} | Ráº£nh: {{ mechanicMetrics.idle }}
            </div>
            <div class="progress-bar">
              <span class="progress-fill" :style="{ width: workloadRate + '%' }"></span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon soft-blue">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="stat-label">Task Ä‘ang lÃ m</div>
            <div class="stat-value">{{ formatNumber(taskSummary.inProgress) }}</div>
            <div class="stat-meta">Chá» xá»­ lÃ½: {{ formatNumber(taskSummary.pending) }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon soft-purple">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div class="stat-label">Kinh nghiá»‡m TB</div>
            <div class="stat-value">{{ mechanicMetrics.avgExp }} nÄƒm</div>
            <div class="stat-meta">Top: {{ topExperience.map(m => m.fullName).join(', ') || 'N/A' }}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Nguá»“n lá»±c</p>
                <h3>TÃ¬nh tráº¡ng thá»£</h3>
              </div>
              <span class="pill">{{ formatNumber(mechanics.length) }} thá»£</span>
            </div>

            <div v-if="loading" class="state">
              <i class="fas fa-spinner fa-spin"></i> Äang táº£i dá»¯ liá»‡u...
            </div>
            <div v-else-if="!mechanics.length" class="state">
              <i class="fas fa-users"></i> ChÆ°a cÃ³ dá»¯ liá»‡u thá»£
            </div>
            <div v-else class="mechanic-list">
              <div
                v-for="mechanic in mechanics"
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
            </div>
          </div>
          <div class="panel alerts">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Cáº£nh bÃ¡o</p>
                <h3>QuÃ¡ táº£i / khÃ´ng cÃ³ viá»‡c</h3>
              </div>
              <span class="pill ghost">NgÆ°á»¡ng quÃ¡ táº£i >= {{ overloadThreshold }} task</span>
            </div>
            <div v-if="loading" class="state">
              <i class="fas fa-spinner fa-spin"></i> Äang kiá»ƒm tra...
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
                <p class="eyebrow">PhÃ¢n bá»•</p>
                <h3>Task theo thá»£</h3>
              </div>
              <span class="pill ghost">Top phÃ¹ há»£p Ä‘á»ƒ Ä‘iá»u phá»‘i</span>
            </div>

            <div v-if="!allocationRows.length" class="state">
              <i class="fas fa-clipboard-list"></i> ChÆ°a cÃ³ dá»¯ liá»‡u phÃ¢n bá»•
            </div>
            <div v-else class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Thá»£</th>
                    <th>Äang lÃ m</th>
                    <th>Chá»</th>
                    <th>ÄÃ£ xong</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in allocationRows" :key="row.key">
                    <td>
                      <div class="cell-name">
                        <span class="avatar tiny">{{ getInitials(row.name) }}</span>
                        <div>
                          <div class="name">{{ row.name || 'ChÆ°a rÃµ' }}</div>
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
                <p class="eyebrow">Tráº¡ng thÃ¡i task</p>
                <h3>Pipeline</h3>
              </div>
              <span class="pill ghost">Tá»•ng {{ formatNumber(taskSummary.total) }} task</span>
            </div>

            <div class="pipeline">
              <div class="pipeline-row">
                <div>
                  <div class="pipeline-label">Chá» thá»±c thi</div>
                  <small>TaskStatus: Pending</small>
                </div>
                <span class="pill ghost">{{ formatNumber(taskSummary.pending) }}</span>
              </div>
              <div class="pipeline-row">
                <div>
                  <div class="pipeline-label">Äang lÃ m</div>
                  <small>TaskStatus: In progress</small>
                </div>
                <span class="pill pill-warning">{{ formatNumber(taskSummary.inProgress) }}</span>
              </div>
              <div class="pipeline-row">
                <div>
                  <div class="pipeline-label">ÄÃ£ xong</div>
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
const taskSummary = ref({
  pending: 0,
  inProgress: 0,
  completed: 0,
  total: 0
})

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
      name: task.assignedToTechnicalName || 'Chua gan',
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
        title: m.fullName || 'Thá»£',
        message: `Äang cÃ³ ${count} task, cáº§n giáº£m táº£i hoáº·c phÃ¢n cÃ´ng láº¡i`
      })
    }

    if (count <= idleThreshold || m.isAvailable) {
      list.push({
        type: 'warning',
        icon: 'fas fa-coffee',
        title: m.fullName || 'Thá»£',
        message: 'Äang ráº£nh, cÃ¢n bá»• sung task hoáº·c há»— trá»£ team khÃ¡c'
      })
    }
  })

  if (!list.length) {
    list.push({
      type: 'success',
      icon: 'fas fa-check-circle',
      title: 'á»”n Ä‘á»‹nh',
      message: 'KhÃ´ng cÃ³ cáº£nh bÃ¡o vá» nhÃ¢n sá»±'
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
  if (count >= overloadThreshold) return 'QuÃ¡ táº£i'
  if (count === 0) return 'KhÃ´ng cÃ³ task'
  if (mechanic.isAvailable) return 'Ráº£nh'
  return 'Äang báº­n'
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
  const count = m.currentTaskCount ?? m.activeTaskCount ?? 0
  return {
    userId: m.userId ?? m.id,
    fullName: m.fullName ?? m.name ?? 'Thá»£',
    email: m.email ?? '',
    phone: m.phone ?? '',
    isAvailable: m.isAvailable ?? m.available ?? m.status === 'AVAILABLE' ?? count === 0,
    currentTaskCount: count,
    mechanicRoleName: m.mechanicRoleName ?? m.roleName ?? m.role ?? 'Thá»£',
    yearExp: getExp(m)
  }
}

const loadMechanics = async () => {
  try {
    const res = await userService.getTechnicalStaff()
    const items = res?.data ?? []
    mechanics.value = Array.isArray(items) ? items.map(normalizeMechanic) : []
  } catch (error) {
    mechanics.value = []
    toast.error('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch thá»£', error?.message || error?.userMsg || 'CÃ³ lá»—i xáº£y ra')
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
    toast.error('Lá»—i táº£i dashboard nhÃ¢n sá»±', error?.message || error?.userMsg || 'CÃ³ lá»—i xáº£y ra')
  } finally {
    loading.value = false
    refreshing.value = false
  }
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
  max-height: 480px;
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

