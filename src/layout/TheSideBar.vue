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
