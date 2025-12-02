<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="gms-toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['gms-toast', `gms-toast--${toast.type}`]"
      >
        <div class="gms-toast-icon">
          <i :class="getIcon(toast.type)"></i>
        </div>
        <div class="gms-toast-content">
          <p v-if="toast.title" class="gms-toast-title">{{ toast.title }}</p>
          <p class="gms-toast-message">{{ toast.message }}</p>
        </div>
        <button
          v-if="toast.closable"
          class="gms-toast-close"
          @click="removeToast(toast.id)"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const toasts = ref([])

const getIcon = (type) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[type] || icons.info
}

const addToast = (toast) => {
  const id = Date.now() + Math.random()
  const newToast = {
    id,
    type: toast.type || 'info',
    title: toast.title,
    message: toast.message,
    duration: toast.duration || 3000,
    closable: toast.closable !== false
  }
  
  toasts.value.push(newToast)
  
  if (newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }
  
  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const clearAll = () => {
  toasts.value = []
}

// Expose methods for use in composable
defineExpose({
  addToast,
  removeToast,
  clearAll
})
</script>

<style scoped>
.gms-toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.gms-toast {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  min-width: 320px;
  max-width: 400px;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  pointer-events: all;
  animation: slideIn 0.4s ease;
}

.gms-toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.gms-toast--success .gms-toast-icon {
  color: var(--success, #10ac84);
}

.gms-toast--error .gms-toast-icon {
  color: var(--danger, #ee5253);
}

.gms-toast--warning .gms-toast-icon {
  color: var(--warning, #f7b731);
}

.gms-toast--info .gms-toast-icon {
  color: var(--info, #54a0ff);
}

.gms-toast-content {
  flex: 1;
}

.gms-toast-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--dark, #2c3a47);
  margin: 0 0 0.25rem 0;
}

.gms-toast-message {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.gms-toast-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.gms-toast-close:hover {
  background: #f0f0f0;
  color: var(--dark, #2c3a47);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

