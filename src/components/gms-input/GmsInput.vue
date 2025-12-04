<template>
  <div class="gms-input-wrapper" :class="{ 'has-error': hasError, 'disabled': disabled }">
    <label v-if="label" class="gms-input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <div class="gms-input-container">
      <i v-if="prefixIcon" :class="prefixIcon" class="gms-input-icon prefix"></i>
      
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        class="gms-input"
        :class="{ 'has-prefix': prefixIcon, 'has-suffix': suffixIcon || showPasswordToggle }"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <i
        v-if="showPasswordToggle"
        :class="type === 'password' ? 'fa-eye' : 'fa-eye-slash'"
        class="fas gms-input-icon suffix password-toggle"
        @click="togglePassword"
      ></i>
      
      <i v-else-if="suffixIcon" :class="suffixIcon" class="gms-input-icon suffix"></i>
      
      <button
        v-if="clearable && modelValue"
        type="button"
        class="gms-input-clear"
        @click="handleClear"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div v-if="hasError && errorMessage" class="gms-input-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ errorMessage }}
    </div>
    
    <div v-if="hint && !hasError" class="gms-input-hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'password', 'email', 'number', 'tel', 'url', 'search'].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  prefixIcon: {
    type: String,
    default: ''
  },
  suffixIcon: {
    type: String,
    default: ''
  },
  clearable: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: Number,
    default: null
  },
  min: {
    type: [Number, String],
    default: null
  },
  max: {
    type: [Number, String],
    default: null
  },
  step: {
    type: [Number, String],
    default: null
  },
  showPasswordToggle: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'clear'])

const inputId = ref(`gms-input-${Math.random().toString(36).substr(2, 9)}`)
const currentType = ref(props.type)
const hasError = computed(() => !!props.errorMessage)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

const togglePassword = () => {
  currentType.value = currentType.value === 'password' ? 'text' : 'password'
}
</script>

<style scoped>
.gms-input-wrapper {
  margin-bottom: 1rem;
}

.gms-input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
  margin-bottom: 0.5rem;
}

.gms-input-label .required {
  color: var(--danger, #ee5253);
  margin-left: 2px;
}

.gms-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.gms-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s ease;
  outline: none;
}

.gms-input.has-prefix {
  padding-left: 2.5rem;
}

.gms-input.has-suffix {
  padding-right: 2.5rem;
}

.gms-input:focus {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.gms-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.6;
}

.gms-input-wrapper.has-error .gms-input {
  border-color: var(--danger, #ee5253);
}

.gms-input-wrapper.has-error .gms-input:focus {
  border-color: var(--danger, #ee5253);
  box-shadow: 0 0 0 3px rgba(238, 82, 83, 0.1);
}

.gms-input-icon {
  position: absolute;
  color: #999;
  font-size: 1rem;
  pointer-events: none;
}

.gms-input-icon.prefix {
  left: 1rem;
}

.gms-input-icon.suffix {
  right: 1rem;
}

.gms-input-icon.password-toggle {
  pointer-events: all;
  cursor: pointer;
  transition: color 0.2s;
}

.gms-input-icon.password-toggle:hover {
  color: var(--primary, #ff7a00);
}

.gms-input-clear {
  position: absolute;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  transition: all 0.2s;
}

.gms-input-clear:hover {
  background: #f0f0f0;
  color: var(--danger, #ee5253);
}

.gms-input-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--danger, #ee5253);
}

.gms-input-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}
</style>




