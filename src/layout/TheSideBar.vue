<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <span class="orange">Garage</span><span class="dark">Pro</span>
      </div>
    </div>

    <div class="user-profile">
      <img
        src="https://ui-avatars.com/api/?name=Nguyen+Van+Khoa&background=FF7A00&color=fff"
        alt="Avatar"
      />
      <div class="user-info">
        <h6>{{ displayName }}</h6>
        <div class="user-meta">
          <small>ID: {{ displayId }}</small>
          <span class="role-pill">{{ displayRole }}</span>
        </div>
      </div>
    </div>

    <ul class="nav-menu">
      <li class="nav-item">
        <a href="#" class="nav-link active"><i class="fas fa-gauge"></i> Dashboard</a>
      </li>

      <li class="nav-item">
        <a href="#" class="nav-link"><i class="fas fa-chart-pie"></i> Bao cao tong hop</a>
      </li>

      <li class="nav-item">
        <a href="#" class="nav-link"><i class="fas fa-users"></i> Nhan su</a>
      </li>

      <li class="nav-item">
        <a href="#" class="nav-link"><i class="fas fa-warehouse"></i> Kho phu tung</a>
        <ul class="sub-menu">
          <li>
            <a href="/FE_ver_0.0.3_SWP/FE_ver_0.0.3_SWP/template/manager/inventory/manage-parts.html" class="nav-link"
              ><i class="fas fa-cogs"></i> Quan ly phu tung</a
            >
          </li>
          <li>
            <a href="/FE_ver_0.0.3_SWP/FE_ver_0.0.3_SWP/template/manager/inventory/low-stock.html" class="nav-link"
              ><i class="fas fa-exclamation-triangle"></i> Canh bao ton</a
            >
          </li>
          <li>
            <a href="/FE_ver_0.0.3_SWP/FE_ver_0.0.3_SWP/template/manager/inventory/restock.html" class="nav-link"
              ><i class="fas fa-shopping-cart"></i> Nhap kho</a
            >
          </li>
        </ul>
      </li>

      <li class="nav-item">
        <a href="#" class="nav-link"><i class="fas fa-dollar-sign"></i> Doanh thu</a>
      </li>

      <li class="nav-item">
        <a href="#" class="nav-link"><i class="fas fa-cog"></i> Cai dat he thong</a>
      </li>
    </ul>

    <button class="logout-btn" @click="emitLogout">
      <i class="fas fa-sign-out-alt"></i> Dang xuat
    </button>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const ROLE_LABELS = {
  MANAGER: 'Quản lý',
  STAFF: 'Nhân viên',
  MECHANIC: 'Thợ sửa',
  CUSTOMER: 'Khách hàng',
  STOCKER: 'Nhân viên kho'
}

const displayName = computed(() => auth.user?.fullName || 'Người dùng')
const displayId = computed(() => auth.user?.userId || '---')
const displayRole = computed(() => {
  const role = auth.user?.role
  return ROLE_LABELS[role] || 'Chưa phân quyền'
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



