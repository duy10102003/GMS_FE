<template>
  <header class="the-header">
    <div class="the-header-left">
      <h4 v-if="title" class="the-header-title">{{ title }}</h4>
      <slot name="left"></slot>
    </div>

    <div class="the-header-right">
      <div v-if="showSearch" class="the-header-search">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          @input="handleSearch"
        />
      </div>

      <!-- Notifications -->
      <div v-if="showNotifications" class="the-header-notifications">
        <button
          class="the-header-notification-btn"
          @click="toggleNotifications"
        >
          <i class="fas fa-bell"></i>
          <span v-if="notificationCount > 0" class="the-header-notification-badge">
            {{ notificationCount > 99 ? '99+' : notificationCount }}
          </span>
        </button>

        <div
          v-if="notificationsOpen"
          class="the-header-notification-dropdown"
          @click.stop
        >
          <div class="the-header-notification-header">
            <h6>Thông báo</h6>
            <button
              v-if="notifications.length > 0"
              class="the-header-notification-clear"
              @click="clearNotifications"
            >
              Xóa tất cả
            </button>
          </div>

          <div v-if="notifications.length === 0" class="the-header-notification-empty">
            <i class="fas fa-inbox"></i>
            <p>Không có thông báo</p>
          </div>

          <div v-else class="the-header-notification-list">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              :class="['the-header-notification-item', { unread: !notification.read }]"
              @click="handleNotificationClick(notification)"
            >
              <div :class="['the-header-notification-icon', `bg-${notification.type}`]">
                <i :class="getNotificationIcon(notification.type)"></i>
              </div>
              <div class="the-header-notification-content">
                <strong>{{ notification.title }}</strong>
                <p>{{ notification.message }}</p>
                <span class="the-header-notification-time">{{ formatTime(notification.time) }}</span>
              </div>
            </div>
          </div>

          <div v-if="notifications.length > 0" class="the-header-notification-footer">
            <a href="#" @click.prevent="viewAllNotifications">Xem tất cả</a>
          </div>
        </div>
      </div>

      <!-- User Menu -->
      <div v-if="user" class="the-header-user">
        <button
          class="the-header-user-btn"
          @click="toggleUserMenu"
        >
          <img
            :src="user.avatar || getAvatarUrl(user.name)"
            :alt="user.name"
            class="the-header-user-avatar"
          />
          <span v-if="showUserName" class="the-header-user-name">{{ user.name }}</span>
          <i class="fas fa-chevron-down"></i>
        </button>

        <div
          v-if="userMenuOpen"
          class="the-header-user-dropdown"
          @click.stop
        >
          <div class="the-header-user-info">
            <img
              :src="user.avatar || getAvatarUrl(user.name)"
              :alt="user.name"
            />
            <div>
              <strong>{{ user.name }}</strong>
              <small>{{ getUserRoleLabel(user.role) }}</small>
            </div>
          </div>

          <div class="the-header-user-menu">
            <a href="#" class="the-header-user-menu-item" @click.prevent="goToProfile">
              <i class="fas fa-user"></i>
              <span>Hồ sơ cá nhân</span>
            </a>
            <a href="#" class="the-header-user-menu-item" @click.prevent="goToSettings">
              <i class="fas fa-cog"></i>
              <span>Cài đặt</span>
            </a>
            <hr />
            <a href="#" class="the-header-user-menu-item text-danger" @click.prevent="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </a>
          </div>
        </div>
      </div>

      <slot name="right"></slot>
    </div>

    <!-- Click outside to close dropdowns -->
    <div
      v-if="notificationsOpen || userMenuOpen"
      class="the-header-overlay"
      @click="closeAllDropdowns"
    ></div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import authService from '../services/auth.js'
import { ROLES } from '../constant/roles.js'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showSearch: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: 'Tìm kiếm...'
  },
  showNotifications: {
    type: Boolean,
    default: true
  },
  showUserName: {
    type: Boolean,
    default: true
  },
  notifications: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['search', 'notification-click', 'logout'])

const user = ref(authService.getCurrentUser())
const searchQuery = ref('')
const notificationsOpen = ref(false)
const userMenuOpen = ref(false)

const notificationCount = computed(() => {
  return props.notifications.filter(n => !n.read).length
})

const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF7A00&color=fff`
}

const getUserRoleLabel = (role) => {
  const labels = {
    [ROLES.CUSTOMER]: 'Khách hàng',
    [ROLES.STAFF]: 'Nhân viên',
    [ROLES.MANAGER]: 'Quản lý',
    [ROLES.STOCKER]: 'Thủ kho',
    [ROLES.MECHANIC]: 'Thợ sửa chữa',
    [ROLES.ADMIN]: 'Quản trị viên'
  }
  return labels[role] || role
}

const getNotificationIcon = (type) => {
  const icons = {
    success: 'fa-check-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
    error: 'fa-exclamation-circle'
  }
  return `fas ${icons[type] || icons.info}`
}

const formatTime = (time) => {
  if (!time) return ''
  const now = new Date()
  const timeDate = new Date(time)
  const diff = now - timeDate
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value
  userMenuOpen.value = false
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
  notificationsOpen.value = false
}

const closeAllDropdowns = () => {
  notificationsOpen.value = false
  userMenuOpen.value = false
}

const handleNotificationClick = (notification) => {
  emit('notification-click', notification)
}

const clearNotifications = () => {
  // Emit event to parent to clear notifications
  emit('clear-notifications')
}

const viewAllNotifications = () => {
  // Navigate to notifications page
  closeAllDropdowns()
}

const goToProfile = () => {
  closeAllDropdowns()
  // Navigate to profile
}

const goToSettings = () => {
  closeAllDropdowns()
  // Navigate to settings
}

const handleLogout = () => {
  closeAllDropdowns()
  emit('logout')
}

onMounted(() => {
  document.addEventListener('click', closeAllDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeAllDropdowns)
})
</script>

<style scoped>
.the-header {
  position: fixed;
  top: 0;
  left: var(--sidebar-width, 260px);
  right: 0;
  height: 70px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  z-index: 999;
}

.the-header-left {
  display: flex;
  align-items: center;
}

.the-header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark, #2c3a47);
  margin: 0;
}

.the-header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.the-header-search {
  position: relative;
  width: 300px;
}

.the-header-search i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.the-header-search input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 0.9rem;
  transition: 0.3s;
  outline: none;
}

.the-header-search input:focus {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.the-header-notifications {
  position: relative;
}

.the-header-notification-btn {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--light, #f8f9fa);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.the-header-notification-btn:hover {
  background: var(--primary, #ff7a00);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 122, 0, 0.4);
}

.the-header-notification-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 18px;
  height: 18px;
  background: var(--danger, #ee5253);
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.the-header-notification-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 340px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: fadeInDown 0.25s ease;
}

.the-header-notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}

.the-header-notification-header h6 {
  margin: 0;
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.the-header-notification-clear {
  background: transparent;
  border: none;
  color: var(--primary, #ff7a00);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.the-header-notification-clear:hover {
  background: rgba(255, 122, 0, 0.1);
}

.the-header-notification-empty {
  padding: 3rem 1.5rem;
  text-align: center;
  color: #999;
}

.the-header-notification-empty i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.the-header-notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.the-header-notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

.the-header-notification-item:hover {
  background: rgba(255, 122, 0, 0.08);
}

.the-header-notification-item.unread {
  background: rgba(255, 122, 0, 0.05);
}

.the-header-notification-icon {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.the-header-notification-icon.bg-success {
  background: var(--success, #10ac84);
}

.the-header-notification-icon.bg-warning {
  background: var(--warning, #f7b731);
}

.the-header-notification-icon.bg-info {
  background: var(--info, #54a0ff);
}

.the-header-notification-icon.bg-error {
  background: var(--danger, #ee5253);
}

.the-header-notification-content {
  flex: 1;
}

.the-header-notification-content strong {
  display: block;
  font-size: 0.9rem;
  color: var(--dark, #2c3a47);
  margin-bottom: 0.25rem;
}

.the-header-notification-content p {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.25rem 0;
}

.the-header-notification-time {
  font-size: 0.75rem;
  color: #999;
}

.the-header-notification-footer {
  padding: 0.75rem 1.25rem;
  text-align: center;
  border-top: 1px solid #f0f0f0;
}

.the-header-notification-footer a {
  color: var(--primary, #ff7a00);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
}

.the-header-user {
  position: relative;
}

.the-header-user-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.25s ease;
}

.the-header-user-btn:hover {
  background: rgba(255, 122, 0, 0.1);
}

.the-header-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.the-header-user-name {
  font-weight: 600;
  color: var(--dark, #2c3a47);
  font-size: 0.9rem;
}

.the-header-user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: fadeInDown 0.25s ease;
}

.the-header-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #fff7f2, #ffffff);
  border-bottom: 1px solid #f1f1f1;
}

.the-header-user-info img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.the-header-user-info strong {
  display: block;
  font-size: 0.95rem;
  color: var(--dark, #2c3a47);
  margin-bottom: 0.25rem;
}

.the-header-user-info small {
  display: block;
  font-size: 0.8rem;
  color: #666;
}

.the-header-user-menu {
  padding: 0.5rem;
}

.the-header-user-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.the-header-user-menu-item:hover {
  background: rgba(255, 122, 0, 0.1);
  color: var(--primary, #ff7a00);
}

.the-header-user-menu-item.text-danger {
  color: var(--danger, #ee5253);
}

.the-header-user-menu-item.text-danger:hover {
  background: rgba(238, 82, 83, 0.1);
}

.the-header-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>



