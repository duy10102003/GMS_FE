/**
 * Service Ticket Status Constants
 */
export const SERVICE_TICKET_STATUS = {
  PENDING: 0,
  ASSIGNED: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  CANCELLED: 4
}

export const SERVICE_TICKET_STATUS_LABELS = {
  [SERVICE_TICKET_STATUS.PENDING]: 'Chờ xử lý',
  [SERVICE_TICKET_STATUS.ASSIGNED]: 'Đã phân công',
  [SERVICE_TICKET_STATUS.IN_PROGRESS]: 'Đang xử lý',
  [SERVICE_TICKET_STATUS.COMPLETED]: 'Hoàn thành',
  [SERVICE_TICKET_STATUS.CANCELLED]: 'Đã hủy'
}

export const SERVICE_TICKET_STATUS_COLORS = {
  [SERVICE_TICKET_STATUS.PENDING]: 'info',
  [SERVICE_TICKET_STATUS.ASSIGNED]: 'primary',
  [SERVICE_TICKET_STATUS.IN_PROGRESS]: 'warning',
  [SERVICE_TICKET_STATUS.COMPLETED]: 'success',
  [SERVICE_TICKET_STATUS.CANCELLED]: 'danger'
}

/**
 * Technical Task Status Constants
 */
export const TASK_STATUS = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'Chờ bắt đầu',
  [TASK_STATUS.IN_PROGRESS]: 'Đang thực hiện',
  [TASK_STATUS.COMPLETED]: 'Hoàn thành'
}

export const TASK_STATUS_COLORS = {
  [TASK_STATUS.PENDING]: 'info',
  [TASK_STATUS.IN_PROGRESS]: 'warning',
  [TASK_STATUS.COMPLETED]: 'success'
}

