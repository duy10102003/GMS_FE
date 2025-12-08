<template>
  <div class="create-service-ticket-view">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="content-wrapper" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <TheHeader
        title="Tạo phiếu dịch vụ mới"
        :show-search="false"
        @logout="handleLogout"
      />

      <main class="main-content" style="margin-top: 70px; padding: 2rem;">
        <div class="page-header">
          <GmsButton variant="outline" icon="fa-arrow-left" @click="$router.back()">
            Quay lại
          </GmsButton>
        </div>

        <div class="form-container">
          <form @submit.prevent="handleSubmit">
            <!-- Thông tin khách hàng -->
            <div class="form-section">
              <h5 class="section-title">
                <i class="fas fa-user me-2"></i>Thông tin khách hàng
              </h5>

              <div class="search-container">
                <label class="form-label">Tìm kiếm khách hàng</label>
                <div class="search-input-wrapper">
                  <GmsInput
                    v-model="customerSearch"
                    placeholder="Tìm theo tên, số điện thoại, email..."
                    prefix-icon="fa-search"
                    :clearable="true"
                    @input="searchCustomers"
                    @focus="showCustomerDropdown = true"
                  />
                  <div v-if="showCustomerDropdown && customerSearchResults.length > 0" class="dropdown-results">
                    <div
                      v-for="customer in customerSearchResults"
                      :key="customer.customerId"
                      class="dropdown-item"
                      @click="selectCustomer(customer)"
                    >
                      <div class="item-name">{{ customer.customerName }}</div>
                      <div class="item-details">
                        <span v-if="customer.customerPhone">{{ customer.customerPhone }}</span>
                        <span v-if="customer.customerEmail">{{ customer.customerEmail }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedCustomer" class="selected-item">
                <div class="selected-info">
                  <strong>{{ selectedCustomer.customerName }}</strong>
                  <span v-if="selectedCustomer.customerPhone">{{ selectedCustomer.customerPhone }}</span>
                  <span v-if="selectedCustomer.customerEmail">{{ selectedCustomer.customerEmail }}</span>
                </div>
                <GmsButton variant="outline" size="small" icon="fa-times" @click="clearCustomer">
                  Xóa
                </GmsButton>
              </div>

              <div v-if="!selectedCustomer" class="form-row mt-3">
                <div class="col-md-4">
                  <GmsInput
                    v-model="newCustomer.customerName"
                    label="Họ và tên *"
                    placeholder="Nhập họ tên khách hàng"
                  />
                </div>
                <div class="col-md-4">
                  <GmsInput
                    v-model="newCustomer.customerPhone"
                    label="Số điện thoại *"
                    type="tel"
                    placeholder="0912345678"
                  />
                </div>
                <div class="col-md-4">
                  <GmsInput
                    v-model="newCustomer.customerEmail"
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            <!-- Thông tin xe -->
            <div class="form-section">
              <h5 class="section-title">
                <i class="fas fa-car me-2"></i>Thông tin xe *
              </h5>

              <div class="search-container">
                <label class="form-label">Tìm kiếm xe</label>
                <div class="search-input-wrapper">
                  <GmsInput
                    v-model="vehicleSearch"
                    placeholder="Tìm theo tên xe, biển số..."
                    prefix-icon="fa-search"
                    :clearable="true"
                    :disabled="!hasCustomer"
                    @input="searchVehicles"
                    @focus="showVehicleDropdown = true"
                  />
                  <div v-if="showVehicleDropdown && vehicleSearchResults.length > 0" class="dropdown-results">
                    <div
                      v-for="vehicle in vehicleSearchResults"
                      :key="vehicle.vehicleId"
                      class="dropdown-item"
                      @click="selectVehicle(vehicle)"
                    >
                      <div class="item-name">{{ vehicle.vehicleName }}</div>
                      <div class="item-details">
                        <span v-if="vehicle.vehicleLicensePlate">{{ vehicle.vehicleLicensePlate }}</span>
                        <span v-if="vehicle.make">{{ vehicle.make }} {{ vehicle.model }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedVehicle" class="selected-item">
                <div class="selected-info">
                  <strong>{{ selectedVehicle.vehicleName }}</strong>
                  <span v-if="selectedVehicle.vehicleLicensePlate">{{ selectedVehicle.vehicleLicensePlate }}</span>
                </div>
                <GmsButton variant="outline" size="small" icon="fa-times" @click="clearVehicle">
                  Xóa
                </GmsButton>
              </div>

              <div v-if="!selectedVehicle" class="form-row mt-3">
                <div class="col-md-3">
                  <GmsInput
                    v-model="newVehicle.vehicleName"
                    label="Tên xe *"
                    placeholder="Honda Civic"
                  />
                </div>
                <div class="col-md-3">
                  <GmsInput
                    v-model="newVehicle.vehicleLicensePlate"
                    label="Biển số *"
                    placeholder="30A-12345"
                  />
                </div>
                <div class="col-md-2">
                  <GmsInput
                    v-model.number="newVehicle.currentKm"
                    label="Số km hiện tại"
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div class="col-md-2">
                  <GmsInput
                    v-model="newVehicle.make"
                    label="Hãng xe"
                    placeholder="Honda"
                  />
                </div>
                <div class="col-md-2">
                  <GmsInput
                    v-model="newVehicle.model"
                    label="Model"
                    placeholder="Civic"
                  />
                </div>
              </div>
            </div>

            <!-- Mô tả vấn đề -->
            <div class="form-section">
              <h5 class="section-title">
                <i class="fas fa-clipboard-list me-2"></i>Mô tả vấn đề *
              </h5>
              <div class="mb-3">
                <label class="form-label">Mô tả vấn đề</label>
                <textarea
                  v-model="formData.initialIssue"
                  class="form-control"
                  rows="4"
                  placeholder="Nhập mô tả vấn đề của xe..."
                  required
                ></textarea>
              </div>
            </div>

            <!-- Phụ tùng -->
            <div class="form-section">
              <h5 class="section-title">
                <i class="fas fa-cog me-2"></i>Phụ tùng (tùy chọn)
              </h5>

              <div class="search-container">
                <label class="form-label">Tìm kiếm phụ tùng</label>
                <div class="search-input-wrapper">
                  <GmsInput
                    v-model="partSearch"
                    placeholder="Tìm theo tên, mã phụ tùng..."
                    prefix-icon="fa-search"
                    :clearable="true"
                    @input="searchParts"
                    @focus="showPartDropdown = true"
                  />
                  <div v-if="showPartDropdown && partSearchResults.length > 0" class="dropdown-results">
                    <div
                      v-for="part in partSearchResults"
                      :key="part.partId"
                      class="dropdown-item"
                      @click="addPart(part)"
                    >
                      <div class="item-name">{{ part.partName }} ({{ part.partCode }})</div>
                      <div class="item-details">
                        <span>Tồn kho: {{ part.partQuantity }} {{ part.partUnit }}</span>
                        <span v-if="part.partPrice">Giá: {{ formatPrice(part.partPrice) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedParts.length > 0" class="selected-items-list">
                <div
                  v-for="(part, index) in selectedParts"
                  :key="`${part.partId}-${index}`"
                  class="selected-item"
                >
                  <div class="selected-info">
                    <strong>{{ part.partName }}</strong>
                    <span>{{ part.partCode }} - Tồn kho: {{ part.partQuantity }} {{ part.partUnit }}</span>
                  </div>
                  <div class="quantity-input">
                    <label>Số lượng:</label>
                    <GmsInput
                      v-model.number="part.quantity"
                      type="number"
                      :min="1"
                      :max="part.partQuantity"
                      style="width: 100px;"
                    />
                  </div>
                  <GmsButton variant="outline" size="small" icon="fa-times" @click="removePart(index)">
                    Xóa
                  </GmsButton>
                </div>
              </div>
            </div>

            <!-- Dịch vụ -->
            <div class="form-section">
              <h5 class="section-title">
                <i class="fas fa-tools me-2"></i>Dịch vụ garage (tùy chọn)
              </h5>

              <div class="search-container">
                <label class="form-label">Tìm kiếm dịch vụ</label>
                <div class="search-input-wrapper">
                  <GmsInput
                    v-model="serviceSearch"
                    placeholder="Tìm theo tên dịch vụ..."
                    prefix-icon="fa-search"
                    :clearable="true"
                    @input="searchServices"
                    @focus="showServiceDropdown = true"
                  />
                  <div v-if="showServiceDropdown && serviceSearchResults.length > 0" class="dropdown-results">
                    <div
                      v-for="service in serviceSearchResults"
                      :key="service.garageServiceId"
                      class="dropdown-item"
                      @click="addService(service)"
                    >
                      <div class="item-name">{{ service.garageServiceName }}</div>
                      <div class="item-details">
                        <span v-if="service.garageServicePrice">
                          {{ formatPrice(service.garageServicePrice) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedServices.length > 0" class="selected-items-list">
                <div
                  v-for="(service, index) in selectedServices"
                  :key="`${service.garageServiceId}-${index}`"
                  class="selected-item"
                >
                  <div class="selected-info">
                    <strong>{{ service.garageServiceName }}</strong>
                    <span v-if="service.garageServicePrice">
                      {{ formatPrice(service.garageServicePrice) }}
                    </span>
                  </div>
                  <GmsButton variant="outline" size="small" icon="fa-times" @click="removeService(index)">
                    Xóa
                  </GmsButton>
                </div>
              </div>
            </div>

            <!-- Phân công thợ -->
            <div class="form-section">
              <h5 class="section-title">
                <i class="fas fa-user-cog me-2"></i>Phân công thợ (tùy chọn)
              </h5>
              <div class="form-row">
                <div class="col-md-12">
                  <div v-if="selectedTechnical" class="selected-item">
                    <div class="selected-info">
                      <strong>{{ selectedTechnical.fullName }}</strong>
                      <span>{{ selectedTechnical.email }}</span>
                      <span>{{ selectedTechnical.phone }}</span>
                      <span :class="selectedTechnical.isAvailable ? 'text-success' : 'text-warning'">
                        {{ selectedTechnical.isAvailable ? 'Rảnh' : `Đang có ${selectedTechnical.currentTaskCount} task` }}
                      </span>
                    </div>
                    <GmsButton variant="outline" size="small" icon="fa-times" @click="clearTechnical">
                      Xóa
                    </GmsButton>
                  </div>
                  <GmsButton
                    v-else
                    variant="primary"
                    icon="fa-user-plus"
                    @click="showAssignModal = true"
                  >
                    Chọn thợ
                  </GmsButton>
                </div>
                <div v-if="selectedTechnical" class="col-md-12 mt-3">
                  <GmsInput
                    v-model="formData.assignDescription"
                    label="Mô tả công việc"
                    placeholder="Nhập mô tả công việc cho thợ..."
                  />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <GmsButton variant="outline" @click="$router.back()">Hủy</GmsButton>
              <GmsButton type="submit" variant="primary" :loading="submitting">
                Tạo phiếu dịch vụ
              </GmsButton>
            </div>
          </form>
        </div>
      </main>
    </div>

    <!-- Assign Technical Staff Modal -->
    <GmsDialog
      v-model="showAssignModal"
      title="Chọn thợ kỹ thuật"
      size="large"
    >
      <div class="assign-modal-content">
        <!-- Filter -->
        <div class="filter-section">
          <label class="form-label">Lọc theo trạng thái:</label>
          <div class="filter-buttons">
            <GmsButton
              variant="outline"
              :class="{ active: availabilityFilter === null }"
              @click="availabilityFilter = null"
            >
              Tất cả
            </GmsButton>
            <GmsButton
              variant="outline"
              :class="{ active: availabilityFilter === true }"
              @click="availabilityFilter = true"
            >
              Rảnh
            </GmsButton>
            <GmsButton
              variant="outline"
              :class="{ active: availabilityFilter === false }"
              @click="availabilityFilter = false"
            >
              Đang bận
            </GmsButton>
          </div>
        </div>

        <!-- Technical Staff List -->
        <div class="technical-staff-grid">
          <div
            v-for="staff in filteredTechnicalStaff"
            :key="staff.userId"
            class="technical-card"
            :class="{
              'available': staff.isAvailable,
              'busy': !staff.isAvailable,
              'selected': selectedTechnical?.userId === staff.userId
            }"
            @click="selectTechnical(staff)"
          >
            <div class="card-header">
              <div class="staff-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="staff-info">
                <h6 class="staff-name">{{ staff.fullName }}</h6>
                <div class="staff-status">
                  <span :class="staff.isAvailable ? 'status-available' : 'status-busy'">
                    <i :class="staff.isAvailable ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
                    {{ staff.isAvailable ? 'Rảnh' : `Đang có ${staff.currentTaskCount} task` }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <i class="fas fa-envelope"></i>
                <span>{{ staff.email }}</span>
              </div>
              <div class="info-row">
                <i class="fas fa-phone"></i>
                <span>{{ staff.phone }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredTechnicalStaff.length === 0" class="empty-state">
          <i class="fas fa-users"></i>
          <p>Không có thợ kỹ thuật nào</p>
        </div>

        <div class="dialog-actions">
          <GmsButton variant="outline" @click="showAssignModal = false">Hủy</GmsButton>
          <GmsButton
            variant="primary"
            :disabled="!selectedTechnical"
            @click="confirmTechnical"
          >
            Xác nhận
          </GmsButton>
        </div>
      </div>
    </GmsDialog>

    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TheHeader, TheSideBar } from '@/layout'
import { GmsInput, GmsButton, GmsDialog, GmsToast } from '@/components'
import { useToast } from '@/composables/useToast'
import { getMenuByRole } from '@/utils/menu'
import authService from '@/services/auth'
import bookingService from '@/services/booking'
import serviceTicketService from '@/services/serviceTicket'
import customerService from '@/services/customer'
import vehicleService from '@/services/vehicle'
import partService from '@/services/part'
import garageServiceService from '@/services/garageService'
import userService from '@/services/user'

const router = useRouter()
const route = useRoute()
const toastRef = ref(null)
const toast = useToast()

const sidebarCollapsed = ref(false)
const submitting = ref(false)
const menuItems = ref([])

// Search states
const customerSearch = ref('')
const customerSearchResults = ref([])
const showCustomerDropdown = ref(false)
const selectedCustomer = ref(null)

const vehicleSearch = ref('')
const vehicleSearchResults = ref([])
const showVehicleDropdown = ref(false)
const selectedVehicle = ref(null)

const partSearch = ref('')
const partSearchResults = ref([])
const showPartDropdown = ref(false)
const selectedParts = ref([])

const serviceSearch = ref('')
const serviceSearchResults = ref([])
const showServiceDropdown = ref(false)
const selectedServices = ref([])

// Technical staff
const technicalStaff = ref([])
const showAssignModal = ref(false)
const availabilityFilter = ref(null)
const selectedTechnical = ref(null)

// New customer/vehicle data
const newCustomer = ref({
  customerName: '',
  customerPhone: '',
  customerEmail: ''
})

const newVehicle = ref({
  vehicleName: '',
  vehicleLicensePlate: '',
  currentKm: null,
  make: '',
  model: ''
})

// Form data
const formData = ref({
  initialIssue: '',
  assignedToTechnical: null,
  assignDescription: ''
})

// Computed
const hasCustomer = computed(() => {
  return selectedCustomer.value !== null || (newCustomer.value.customerName && newCustomer.value.customerPhone)
})

const filteredTechnicalStaff = computed(() => {
  if (availabilityFilter.value === null) {
    return technicalStaff.value
  }
  return technicalStaff.value.filter(staff => staff.isAvailable === availabilityFilter.value)
})

// Methods
const formatPrice = (price) => {
  if (!price && price !== 0) return ''
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const searchCustomers = async () => {
  if (!customerSearch.value || customerSearch.value.length < 2) {
    customerSearchResults.value = []
    return
  }

  try {
    const response = await customerService.search(customerSearch.value)
    customerSearchResults.value = response.data || []
  } catch (error) {
    console.error('Error searching customers:', error)
    customerSearchResults.value = []
  }
}

const selectCustomer = (customer) => {
  selectedCustomer.value = customer
  customerSearch.value = customer.customerName
  showCustomerDropdown.value = false
  customerSearchResults.value = []
  clearVehicle()
}

const clearCustomer = () => {
  selectedCustomer.value = null
  customerSearch.value = ''
  newCustomer.value = {
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  }
  clearVehicle()
}

const searchVehicles = async () => {
  if (!vehicleSearch.value || vehicleSearch.value.length < 2) {
    vehicleSearchResults.value = []
    return
  }

  const customerId = selectedCustomer.value?.customerId || null
  if (!customerId && !newCustomer.value.customerName) {
    vehicleSearchResults.value = []
    return
  }

  try {
    const response = await vehicleService.search(vehicleSearch.value, customerId)
    vehicleSearchResults.value = response.data || []
  } catch (error) {
    console.error('Error searching vehicles:', error)
    vehicleSearchResults.value = []
  }
}

const selectVehicle = (vehicle) => {
  selectedVehicle.value = vehicle
  vehicleSearch.value = vehicle.vehicleName
  showVehicleDropdown.value = false
  vehicleSearchResults.value = []
}

const clearVehicle = () => {
  selectedVehicle.value = null
  vehicleSearch.value = ''
  newVehicle.value = {
    vehicleName: '',
    vehicleLicensePlate: '',
    currentKm: null,
    make: '',
    model: ''
  }
}

const searchParts = async () => {
  if (!partSearch.value || partSearch.value.length < 2) {
    partSearchResults.value = []
    return
  }

  try {
    const response = await partService.search(partSearch.value)
    partSearchResults.value = (response.data || []).filter(part =>
      !selectedParts.value.find(sp => sp.partId === part.partId)
    )
  } catch (error) {
    console.error('Error searching parts:', error)
    partSearchResults.value = []
  }
}

const addPart = (part) => {
  if (selectedParts.value.find(sp => sp.partId === part.partId)) {
    toast.warning('Phụ tùng đã được thêm')
    return
  }

  selectedParts.value.push({
    ...part,
    quantity: 1
  })

  partSearch.value = ''
  showPartDropdown.value = false
  partSearchResults.value = []
}

const removePart = (index) => {
  selectedParts.value.splice(index, 1)
}

const searchServices = async () => {
  if (!serviceSearch.value || serviceSearch.value.length < 2) {
    serviceSearchResults.value = []
    return
  }

  try {
    const response = await garageServiceService.search(serviceSearch.value)
    serviceSearchResults.value = (response.data || []).filter(service =>
      !selectedServices.value.find(ss => ss.garageServiceId === service.garageServiceId)
    )
  } catch (error) {
    console.error('Error searching services:', error)
    serviceSearchResults.value = []
  }
}

const addService = (service) => {
  if (selectedServices.value.find(ss => ss.garageServiceId === service.garageServiceId)) {
    toast.warning('Dịch vụ đã được thêm')
    return
  }

  selectedServices.value.push(service)
  serviceSearch.value = ''
  showServiceDropdown.value = false
  serviceSearchResults.value = []
}

const removeService = (index) => {
  selectedServices.value.splice(index, 1)
}

const loadTechnicalStaff = async () => {
  try {
    const response = await userService.getTechnicalStaff()
    technicalStaff.value = response.data || []
  } catch (error) {
    console.error('Error loading technical staff:', error)
    technicalStaff.value = []
  }
}

const selectTechnical = (staff) => {
  selectedTechnical.value = staff
}

const confirmTechnical = () => {
  if (selectedTechnical.value) {
    formData.value.assignedToTechnical = selectedTechnical.value.userId
    showAssignModal.value = false
  }
}

const clearTechnical = () => {
  selectedTechnical.value = null
  formData.value.assignedToTechnical = null
  formData.value.assignDescription = ''
}

const handleSubmit = async () => {
  // Validation - Không bắt buộc chọn customer, có thể tạo mới khi nhập thông tin
  // Nếu không chọn customer, phải nhập thông tin mới
  if (!selectedCustomer.value) {
    if (!newCustomer.value.customerName?.trim() || !newCustomer.value.customerPhone?.trim()) {
      toast.error('Vui lòng chọn khách hàng hoặc nhập đầy đủ thông tin khách hàng mới (Tên và Số điện thoại)')
      return
    }
  }

  if (!selectedVehicle.value && (!newVehicle.value.vehicleName || !newVehicle.value.vehicleLicensePlate)) {
    toast.error('Vui lòng chọn hoặc nhập thông tin xe')
    return
  }

  if (!formData.value.initialIssue.trim()) {
    toast.error('Vui lòng nhập mô tả vấn đề')
    return
  }

  // Validate part quantities
  for (const part of selectedParts.value) {
    if (!part.quantity || part.quantity < 1) {
      toast.error(`Vui lòng nhập số lượng hợp lệ cho ${part.partName}`)
      return
    }
    if (part.quantity > part.partQuantity) {
      toast.error(`Số lượng ${part.partName} vượt quá tồn kho (${part.partQuantity})`)
      return
    }
  }

  try {
    submitting.value = true
    const currentUser = authService.getCurrentUser()
    const bookingId = route.query.bookingId ? Number(route.query.bookingId) : null

    const payload = {
      createdBy: currentUser?.userId,
      initialIssue: formData.value.initialIssue.trim(),
      parts: selectedParts.value.map(p => ({
        partId: p.partId,
        quantity: p.quantity
      })),
      garageServiceIds: selectedServices.value.map(s => s.garageServiceId)
    }

    if (bookingId) {
      payload.bookingId = bookingId
    }

    // Customer
    if (selectedCustomer.value) {
      payload.customerId = selectedCustomer.value.customerId
    } else {
      payload.customerInfo = {
        customerName: newCustomer.value.customerName.trim(),
        customerPhone: newCustomer.value.customerPhone.trim(),
        customerEmail: newCustomer.value.customerEmail?.trim() || null
      }
    }

    // Vehicle
    if (selectedVehicle.value) {
      payload.vehicleId = selectedVehicle.value.vehicleId
    } else {
      const customerId = selectedCustomer.value?.customerId
      if (!customerId) {
        toast.error('Vui lòng chọn khách hàng trước khi tạo xe mới')
        return
      }

      payload.vehicleInfo = {
        vehicleName: newVehicle.value.vehicleName.trim(),
        vehicleLicensePlate: newVehicle.value.vehicleLicensePlate.trim(),
        currentKm: newVehicle.value.currentKm || null,
        make: newVehicle.value.make?.trim() || null,
        model: newVehicle.value.model?.trim() || null
      }
    }

    // Technical Staff
    if (formData.value.assignedToTechnical) {
      payload.assignedToTechnical = formData.value.assignedToTechnical
      payload.assignDescription = formData.value.assignDescription?.trim() || ''
    }

    const response = await serviceTicketService.create(payload)

    toast.success('Tạo phiếu dịch vụ thành công!')
    router.push(`/staff/service-tickets/${response.data.serviceTicketId}`)
  } catch (error) {
    toast.error('Lỗi khi tạo phiếu dịch vụ', error.message || error.userMsg || 'Có lỗi xảy ra')
  } finally {
    submitting.value = false
  }
}

const handleLogout = async () => {
  await authService.logout()
  router.push('/')
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.search-input-wrapper')) {
    showCustomerDropdown.value = false
    showVehicleDropdown.value = false
    showPartDropdown.value = false
    showServiceDropdown.value = false
  }
}

onMounted(async () => {
  if (toastRef.value) {
    const { setToastInstance } = await import('@/composables/useToast')
    setToastInstance(toastRef.value)
  }

  const user = authService.getCurrentUser()
  if (user) {
    menuItems.value = getMenuByRole(user.role)
  }

  await loadTechnicalStaff()

  // Prefill từ booking (nếu có)
  const bookingId = route.query.bookingId
  if (bookingId) {
    try {
      const res = await bookingService.getById(bookingId)
      const data = res?.data || res
      const customerId = route.query.customerId || data.customerId || data.customerID
      const prefillCustomer = {
        customerId: customerId ? Number(customerId) : null,
        customerName: route.query.customerName || data.customerName || '',
        customerPhone: route.query.customerPhone || data.customerPhone || '',
        customerEmail: route.query.customerEmail || data.customerEmail || data.email || ''
      }
      // Nếu chưa có email nhưng có customerId, cố lấy thêm từ Customer
      if (!prefillCustomer.customerEmail && prefillCustomer.customerId) {
        try {
          const cusRes = await customerService.getById(prefillCustomer.customerId)
          const cus = cusRes?.data || cusRes
          prefillCustomer.customerEmail = cus?.customerEmail || cus?.email || ''
        } catch (err) {
          console.warn('Không lấy được email khách hàng', err)
        }
      }
      // Chỉ gán khi có tên/sđt để tránh tạo bản rỗng
      if (prefillCustomer.customerName || prefillCustomer.customerPhone) {
        selectedCustomer.value = prefillCustomer
        customerSearch.value = prefillCustomer.customerName
        newCustomer.value = {
          customerName: '',
          customerPhone: '',
          customerEmail: ''
        }
      }
    } catch (err) {
      console.warn('Không prefill được từ booking', err)
    }
  }

  document.addEventListener('click', handleClickOutside)
})

// Watch for customer changes to update vehicle search
watch([selectedCustomer, () => newCustomer.value.customerName], () => {
  if (vehicleSearch.value) {
    searchVehicles()
  }
})
</script>

<style scoped>
.create-service-ticket-view {
  min-height: 100vh;
  background: var(--light, #f8f9fa);
}

.content-wrapper {
  transition: margin-left 0.3s ease;
}

.page-header {
  margin-bottom: 2rem;
}

.form-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.search-container {
  margin-bottom: 1rem;
}

.search-input-wrapper {
  position: relative;
}

.dropdown-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 600;
  color: var(--dark, #2c3a47);
  margin-bottom: 0.25rem;
}

.item-details {
  font-size: 0.875rem;
  color: #666;
  display: flex;
  gap: 1rem;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.selected-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.selected-info strong {
  color: var(--dark, #2c3a47);
}

.selected-info span {
  font-size: 0.875rem;
  color: #666;
}

.selected-items-list {
  margin-top: 1rem;
}

.quantity-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-input label {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-row .col-md-2,
.form-row .col-md-3,
.form-row .col-md-4,
.form-row .col-md-6,
.form-row .col-md-12 {
  flex: 1;
  min-width: 200px;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #f0f0f0;
}

.mt-3 {
  margin-top: 1rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.text-success {
  color: #28a745;
}

.text-warning {
  color: #ffc107;
}

/* Assign Modal Styles */
.assign-modal-content {
  padding: 0.5rem 0;
}

.filter-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.filter-buttons .gms-button.active {
  background: var(--primary, #ff7a00);
  color: white;
  border-color: var(--primary, #ff7a00);
}

.technical-staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  max-height: 500px;
  overflow-y: auto;
  padding: 0.5rem;
}

.technical-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.technical-card:hover {
  border-color: var(--primary, #ff7a00);
  box-shadow: 0 4px 12px rgba(255, 122, 0, 0.1);
}

.technical-card.available {
  border-color: #28a745;
}

.technical-card.busy {
  border-color: #ffc107;
}

.technical-card.selected {
  border-color: var(--primary, #ff7a00);
  background: #fff5e6;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.staff-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary, #ff7a00);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.staff-info {
  flex: 1;
}

.staff-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark, #2c3a47);
}

.staff-status {
  margin-top: 0.25rem;
}

.status-available {
  color: #28a745;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-busy {
  color: #ffc107;
  font-size: 0.875rem;
  font-weight: 500;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.info-row i {
  width: 16px;
  color: var(--primary, #ff7a00);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}
</style>
