import { ref } from 'vue'

const toastInstance = ref(null)

export function setToastInstance(instance) {
  toastInstance.value = instance
}

export function useToast() {
  const showToast = (type, message, title = '', options = {}) => {
    if (!toastInstance.value) {
      console.warn('Toast instance not initialized')
      return
    }
    
    return toastInstance.value.addToast({
      type,
      title,
      message,
      ...options
    })
  }

  return {
    success: (message, title = 'Thành công', options) => showToast('success', message, title, options),
    error: (message, title = 'Lỗi', options) => showToast('error', message, title, options),
    warning: (message, title = 'Cảnh báo', options) => showToast('warning', message, title, options),
    info: (message, title = 'Thông tin', options) => showToast('info', message, title, options),
    show: showToast
  }
}




