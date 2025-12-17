<template>
  <div class="manager-dashboard">
    <TheSideBar @logout="handleLogout" />
    <div class="content">
      <TheHeader title="Dashboard quản lý" :show-search="false" @logout="handleLogout" />
      <main class="page">
        <section class="card">
          <h2>Dashboard đang cập nhật</h2>
          <p>Bạn có thể truy cập các báo cáo và tính năng khác ở menu bên trái.</p>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import authService from '@/services/auth'

const router = useRouter()

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}
</script>

<style scoped>
.manager-dashboard {
  display: flex;
  min-height: 100vh;
  background: #f4f7fb;
}
.content {
  flex: 1;
  margin-left: var(--sidebar-width, 260px);
  display: flex;
  flex-direction: column;
}
.page {
  padding: 90px 24px 32px;
}
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}
</style>
