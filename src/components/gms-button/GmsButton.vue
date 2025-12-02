<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <i v-if="loading" class="fas fa-spinner fa-spin gms-button-icon"></i>
    <i v-else-if="icon && !iconRight" :class="icon" class="gms-button-icon"></i>
    
    <span v-if="$slots.default || label">
      <slot>{{ label }}</slot>
    </span>
    
    <i v-if="icon && iconRight" :class="icon" class="gms-button-icon"></i>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'outline', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  iconRight: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  return [
    'gms-button',
    `gms-button--${props.variant}`,
    `gms-button--${props.size}`,
    {
      'gms-button--block': props.block,
      'gms-button--rounded': props.rounded,
      'gms-button--loading': props.loading
    }
  ]
})

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.gms-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  position: relative;
  overflow: hidden;
}

.gms-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gms-button-icon {
  font-size: 1rem;
}

/* Variants */
.gms-button--primary {
  background: linear-gradient(135deg, var(--primary, #ff7a00) 0%, var(--primary-dark, #e56e00) 100%);
  color: white;
}

.gms-button--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 122, 0, 0.4);
}

.gms-button--secondary {
  background: var(--secondary, #4b6584);
  color: white;
}

.gms-button--secondary:hover:not(:disabled) {
  background: #3d5470;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(75, 101, 132, 0.4);
}

.gms-button--success {
  background: var(--success, #10ac84);
  color: white;
}

.gms-button--success:hover:not(:disabled) {
  background: #0d8f6d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 172, 132, 0.4);
}

.gms-button--danger {
  background: var(--danger, #ee5253);
  color: white;
}

.gms-button--danger:hover:not(:disabled) {
  background: #e63946;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(238, 82, 83, 0.4);
}

.gms-button--warning {
  background: var(--warning, #f7b731);
  color: white;
}

.gms-button--warning:hover:not(:disabled) {
  background: #f5a623;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(247, 183, 49, 0.4);
}

.gms-button--info {
  background: var(--info, #54a0ff);
  color: white;
}

.gms-button--info:hover:not(:disabled) {
  background: #3d8bfd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(84, 160, 255, 0.4);
}

.gms-button--outline {
  background: transparent;
  border: 2px solid var(--primary, #ff7a00);
  color: var(--primary, #ff7a00);
}

.gms-button--outline:hover:not(:disabled) {
  background: var(--primary, #ff7a00);
  color: white;
  transform: translateY(-2px);
}

.gms-button--ghost {
  background: transparent;
  color: var(--primary, #ff7a00);
}

.gms-button--ghost:hover:not(:disabled) {
  background: rgba(255, 122, 0, 0.1);
}

/* Sizes */
.gms-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.gms-button--medium {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
}

.gms-button--large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Block */
.gms-button--block {
  width: 100%;
}

/* Rounded */
.gms-button--rounded {
  border-radius: 25px;
}

/* Loading */
.gms-button--loading {
  pointer-events: none;
}
</style>

