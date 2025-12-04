<template>
  <header class="main-header">
    <div class="search-box">
      <i class="fas fa-search"></i>
      <input type="text" placeholder="Tim kiem bao cao hoac nhan su..." />
    </div>

    <div class="d-flex align-items-center">
      <div class="dropdown me-3 position-relative">
        <button
          class="notification-btn"
          id="notifDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="fas fa-bell"></i>
          <span class="notification-badge">5</span>
        </button>

        <ul
          class="dropdown-menu dropdown-menu-end notification-dropdown shadow-lg border-0 p-0"
          aria-labelledby="notifDropdown"
        >
          <li class="dropdown-header py-3 px-3 border-bottom bg-light fw-semibold text-dark">
            Thong bao quan ly
          </li>

          <li>
            <a href="#" class="dropdown-item">
              <div class="d-flex align-items-start">
                <div class="notif-icon bg-success text-white me-3">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div>
                  <strong>Doanh thu tang 12%</strong>
                  <div class="small text-muted">So voi thang truoc.</div>
                  <div class="notif-time">5 phut truoc</div>
                </div>
              </div>
            </a>
          </li>

          <li>
            <a href="#" class="dropdown-item">
              <div class="d-flex align-items-start">
                <div class="notif-icon bg-warning text-white me-3">
                  <i class="fas fa-box"></i>
                </div>
                <div>
                  <strong>Kho phu tung sap het hang</strong>
                  <div class="small text-muted">Dau 5W30, loc nhot...</div>
                  <div class="notif-time">20 phut truoc</div>
                </div>
              </div>
            </a>
          </li>

          <li><hr class="dropdown-divider" /></li>
          <li>
            <a href="#" class="dropdown-item text-center text-primary fw-semibold view-all">
              Xem tat ca
            </a>
          </li>
        </ul>
      </div>

      <div class="dropdown user-menu">
        <a
          href="#"
          class="d-flex align-items-center text-decoration-none dropdown-toggle"
          id="userDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            src="https://ui-avatars.com/api/?name=K&background=FF7A00&color=fff"
            alt="Avatar"
            class="rounded-circle me-2"
            width="40"
            height="40"
          />
          <span class="fw-semibold text-dark d-none d-md-inline">{{ auth.user?.fullName }}</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" aria-labelledby="userDropdown">
          <li>
            <a class="dropdown-item" href="#"><i class="fas fa-user me-2 text-primary"></i> Ho so ca nhan</a>
          </li>
          <li>
            <a class="dropdown-item" href="#"><i class="fas fa-cog me-2 text-secondary"></i> Cai dat</a>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a class="dropdown-item text-danger" href="#" @click.prevent="emitLogout">
              <i class="fas fa-sign-out-alt me-2"></i> Dang xuat
            </a>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>

import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()

const emit = defineEmits(['logout'])

const emitLogout = () => {
  emit('logout')
}
</script>
