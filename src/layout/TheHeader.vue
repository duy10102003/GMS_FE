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




