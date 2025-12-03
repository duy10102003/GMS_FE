<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="modelValue"
        class="gms-dialog-overlay"
        @click="handleOverlayClick"
      >
        <div
          :class="['gms-dialog', `gms-dialog--${size}`]"
          @click.stop
        >
          <div v-if="title || $slots.header" class="gms-dialog-header">
            <h5 v-if="title" class="gms-dialog-title">{{ title }}</h5>
            <slot name="header"></slot>
            <button
              v-if="closable"
              class="gms-dialog-close"
              @click="handleClose"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="gms-dialog-body">
            <slot></slot>
          </div>
          
          <div v-if="$slots.footer" class="gms-dialog-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  closeOnEscape: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && props.modelValue && props.closeOnEscape) {
    handleClose()
  }
}

watch(() => props.modelValue, (value) => {
  if (value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.gms-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 1rem;
}

.gms-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  animation: dialogSlideIn 0.3s ease;
}

.gms-dialog--small {
  width: 100%;
  max-width: 400px;
}

.gms-dialog--medium {
  width: 100%;
  max-width: 600px;
}

.gms-dialog--large {
  width: 100%;
  max-width: 900px;
}

.gms-dialog--full {
  width: 100%;
  max-width: 95vw;
  height: 95vh;
}

.gms-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.gms-dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
  margin: 0;
}

.gms-dialog-close {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
}

.gms-dialog-close:hover {
  background: #f0f0f0;
  color: var(--dark, #2c3a47);
}

.gms-dialog-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.gms-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .gms-dialog,
.dialog-leave-to .gms-dialog {
  transform: scale(0.9) translateY(-20px);
}
</style>



