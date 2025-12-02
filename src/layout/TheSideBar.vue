<template>
  <aside class="the-sidebar" :class="{ collapsed: collapsed }">
    <div class="the-sidebar-header">
      <a href="/" class="the-sidebar-logo">
        <span class="orange">Garage</span><span class="dark">Pro</span>
      </a>
      <button
        v-if="collapsible"
        class="the-sidebar-toggle"
        @click="toggleCollapse"
      >
        <i :class="collapsed ? 'fa-chevron-right' : 'fa-chevron-left'" class="fas"></i>
      </button>
    </div>

    <div class="the-sidebar-user">
      <img
        :src="user?.avatar || getAvatarUrl(user?.name)"
        :alt="user?.name"
      />
      <div v-if="!collapsed" class="the-sidebar-user-info">
        <h6>{{ user?.name || 'User' }}</h6>
        <small>{{ getUserRoleLabel(user?.role) }}</small>
      </div>
    </div>

    <nav class="the-sidebar-nav">
      <ul class="the-sidebar-menu">
        <li
          v-for="item in menuItems"
          :key="item.key"
          :class="['the-sidebar-menu-item', { active: isActive(item), 'has-submenu': item.children }]"
        >
          <a
            v-if="!item.children"
            :href="item.path"
            class="the-sidebar-menu-link"
            @click.prevent="handleMenuClick(item)"
          >
            <i :class="item.icon" class="fas"></i>
            <span v-if="!collapsed">{{ item.label }}</span>
            <span v-if="item.badge && !collapsed" class="the-sidebar-menu-badge">{{ item.badge }}</span>
          </a>
          
          <div v-else class="the-sidebar-menu-group">
            <a
              href="#"
              class="the-sidebar-menu-link"
              @click.prevent="toggleSubmenu(item.key)"
            >
              <i :class="item.icon" class="fas"></i>
              <span v-if="!collapsed">{{ item.label }}</span>
              <i
                :class="openSubmenus.includes(item.key) ? 'fa-chevron-up' : 'fa-chevron-down'"
                class="fas the-sidebar-menu-arrow"
              ></i>
            </a>
            
            <ul
              v-if="!collapsed"
              v-show="openSubmenus.includes(item.key)"
              class="the-sidebar-submenu"
            >
              <li
                v-for="child in item.children"
                :key="child.key"
                :class="{ active: isActive(child) }"
              >
                <a
                  :href="child.path"
                  class="the-sidebar-submenu-link"
                  @click.prevent="handleMenuClick(child)"
                >
                  <i :class="child.icon" class="fas"></i>
                  <span>{{ child.label }}</span>
                </a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </nav>

    <button class="the-sidebar-logout" @click="handleLogout">
      <i class="fas fa-sign-out-alt"></i>
      <span v-if="!collapsed">Đăng xuất</span>
    </button>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '../services/auth.js'
import { ROLES } from '../constant/roles.js'
import { hasPermission } from '../constant/roles.js'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  collapsible: {
    type: Boolean,
    default: true
  },
  menuItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:collapsed', 'menu-click', 'logout'])

const route = useRoute()
const router = useRouter()
const openSubmenus = ref([])
const user = ref(authService.getCurrentUser())

const getAvatarUrl = (name) => {
  if (!name) return 'https://ui-avatars.com/api/?name=User&background=FF7A00&color=fff'
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

const isActive = (item) => {
  if (item.exact) {
    return route.path === item.path
  }
  return route.path.startsWith(item.path)
}

const toggleCollapse = () => {
  emit('update:collapsed', !props.collapsed)
}

const toggleSubmenu = (key) => {
  const index = openSubmenus.value.indexOf(key)
  if (index > -1) {
    openSubmenus.value.splice(index, 1)
  } else {
    openSubmenus.value.push(key)
  }
}

const handleMenuClick = (item) => {
  if (item.path) {
    if (item.path.startsWith('http')) {
      window.open(item.path, '_blank')
    } else {
      router.push(item.path)
    }
  }
  emit('menu-click', item)
}

const handleLogout = () => {
  emit('logout')
}

// Filter menu items based on permissions
const filteredMenuItems = computed(() => {
  if (!user.value) return []
  
  return props.menuItems.filter(item => {
    if (item.permission) {
      return hasPermission(user.value.role, item.permission)
    }
    return true
  })
})

onMounted(() => {
  // Auto-open submenu if current route is in submenu
  props.menuItems.forEach(item => {
    if (item.children) {
      const hasActiveChild = item.children.some(child => isActive(child))
      if (hasActiveChild) {
        openSubmenus.value.push(item.key)
      }
    }
  })
})
</script>

<style scoped>
.the-sidebar {
  width: var(--sidebar-width, 260px);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: linear-gradient(180deg, #fff 0%, #f8f9fa 100%);
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: width 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.the-sidebar.collapsed {
  width: 80px;
}

.the-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70px;
  border-bottom: 1px solid #eee;
  padding: 25px 20px;
  background: white;
  position: relative;
}

.the-sidebar-logo {
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s;
}

.the-sidebar-logo:hover {
  text-decoration: none;
  transform: scale(1.08) rotate(-1deg);
  filter: brightness(1.1);
  text-shadow: 0 2px 6px rgba(255, 122, 0, 0.4);
}

.the-sidebar-logo .orange {
  color: var(--primary, #ff7a00);
}

.the-sidebar-logo .dark {
  color: var(--dark, #2c3a47);
}

.the-sidebar-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.the-sidebar-toggle:hover {
  background: #f0f0f0;
  color: var(--primary, #ff7a00);
}

.the-sidebar-user {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, var(--primary, #ff7a00) 0%, var(--primary-dark, #e56e00) 100%);
  color: white;
  margin: 0;
  gap: 12px;
}

.the-sidebar-user img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.the-sidebar-user-info {
  flex: 1;
  min-width: 0;
}

.the-sidebar-user-info h6 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.the-sidebar-user-info small {
  opacity: 0.9;
  font-size: 0.8rem;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.the-sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 15px 0;
}

.the-sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.the-sidebar-nav::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.the-sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.the-sidebar-menu-item {
  margin: 5px 10px;
}

.the-sidebar-menu-link {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: var(--dark, #2c3a47);
  text-decoration: none;
  border-radius: 8px;
  transition: 0.2s;
  font-size: 0.9rem;
  position: relative;
}

.the-sidebar-menu-link:hover {
  background: rgba(255, 122, 0, 0.1);
  color: var(--primary, #ff7a00);
  transform: translateX(5px);
}

.the-sidebar-menu-item.active > .the-sidebar-menu-link {
  background: linear-gradient(135deg, var(--primary, #ff7a00) 0%, var(--primary-dark, #e56e00) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 122, 0, 0.3);
}

.the-sidebar-menu-link i {
  width: 24px;
  margin-right: 10px;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.the-sidebar.collapsed .the-sidebar-menu-link span {
  display: none;
}

.the-sidebar-menu-badge {
  margin-left: auto;
  background: var(--danger, #ee5253);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.the-sidebar-menu-arrow {
  margin-left: auto;
  margin-right: 0;
  font-size: 0.8rem;
  transition: transform 0.2s;
}

.the-sidebar-submenu {
  list-style: none;
  padding: 0;
  margin: 5px 0 5px 15px;
}

.the-sidebar-submenu-link {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: #666;
  text-decoration: none;
  border-radius: 8px;
  transition: 0.2s;
  font-size: 0.85rem;
}

.the-sidebar-submenu-link:hover {
  background: rgba(255, 122, 0, 0.1);
  color: var(--primary, #ff7a00);
}

.the-sidebar-submenu li.active .the-sidebar-submenu-link {
  background: rgba(255, 122, 0, 0.15);
  color: var(--primary, #ff7a00);
  font-weight: 600;
}

.the-sidebar-submenu-link i {
  width: 20px;
  margin-right: 10px;
  font-size: 0.9rem;
}

.the-sidebar-logout {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  padding: 12px;
  background: #fff;
  border: 2px solid var(--danger, #ee5253);
  color: var(--danger, #ee5253);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.the-sidebar-logout:hover {
  background: var(--danger, #ee5253);
  color: white;
}

.the-sidebar.collapsed .the-sidebar-logout span {
  display: none;
}
</style>

