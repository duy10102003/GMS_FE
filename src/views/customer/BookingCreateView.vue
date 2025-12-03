<template>
  <div class="booking-create">
    <TheSideBar
      :collapsed="sidebarCollapsed"
      :menu-items="sidebarMenu"
      :collapsible="true"
      @update:collapsed="sidebarCollapsed = $event"
      @logout="handleLogout"
    />

    <div class="booking-create__content" :style="{ marginLeft: sidebarCollapsed ? '80px' : '260px' }">
      <header class="page-header">
        <button class="back-btn" @click="goBack">
          <i class="fa-solid fa-arrow-left"></i>
          Back
        </button>
        <div>
          <h1>Create New Booking</h1>
          <p>Add a new vehicle booking to the system</p>
        </div>
      </header>

      <section class="form-card">
        <h3>Customer Information</h3>
        <div class="form-grid">
          <div class="form-control">
            <label>Customer Name</label>
            <input v-model="form.customerName" type="text" placeholder="Enter customer name" />
          </div>
          <div class="form-control">
            <label>Phone <span class="required">*</span></label>
            <input v-model="form.phone" type="tel" placeholder="Enter phone number" />
          </div>
          <div class="form-control full">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="Enter email address" />
          </div>
        </div>

        <div class="divider"></div>

        <h3>Booking Details</h3>
        <div class="form-grid">
          <div class="form-control">
            <label>Booking Time <span class="required">*</span></label>
            <div class="input-icon">
              <i class="fa-regular fa-calendar"></i>
              <input v-model="form.bookingTime" type="datetime-local" />
            </div>
          </div>
          <div class="form-control">
            <label>Vehicle Name</label>
            <input v-model="form.vehicleName" type="text" placeholder="Enter vehicle name or model" />
          </div>
          <div class="form-control full">
            <label>Booking Status</label>
            <select v-model="form.status">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="form-control full">
            <label>Notes</label>
            <textarea
              v-model="form.notes"
              rows="5"
              placeholder="Add any additional notes about the booking"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-outline" @click="goBack">Cancel</button>
          <button class="btn-primary" @click="handleSubmit">Create Booking</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import TheSideBar from '../../layout/TheSideBar.vue'

const router = useRouter()
const sidebarCollapsed = ref(false)

const sidebarMenu = [
  { key: 'bookings', label: 'Bookings', icon: 'fa-calendar-check', path: '/customer/bookings', exact: true },
  { key: 'vehicles', label: 'Vehicles', icon: 'fa-car', path: '#' },
  { key: 'customers', label: 'Customers', icon: 'fa-user', path: '#' },
  { key: 'reports', label: 'Reports', icon: 'fa-chart-column', path: '#' }
]

const form = reactive({
  customerName: '',
  phone: '',
  email: '',
  bookingTime: '',
  vehicleName: '',
  status: 'pending',
  notes: ''
})

const goBack = () => {
  router.push('/customer/bookings')
}

const handleSubmit = () => {
  // Hook for future integration; for now just log payload
  console.log('Create booking payload', { ...form })
  goBack()
}

const handleLogout = () => {
  console.log('logout clicked')
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

.booking-create {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.booking-create__content {
  flex: 1;
  padding: 28px 32px 40px;
  transition: margin-left 0.2s ease;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 6px;
  font-size: 26px;
  color: #1f2933;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.back-btn {
  background: none;
  border: none;
  color: #ff7a00;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.form-card h3 {
  margin: 0 0 16px;
  font-size: 17px;
  color: #1f2933;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
}

.form-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-control.full {
  grid-column: 1 / -1;
}

label {
  font-weight: 600;
  color: #1f2933;
}

.required {
  color: #ee5253;
}

input,
select,
textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #ff7a00;
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.15);
}

.input-icon {
  position: relative;
}

.input-icon i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.input-icon input {
  padding-left: 38px;
}

textarea {
  resize: vertical;
}

.divider {
  border-top: 1px solid #e5e7eb;
  margin: 20px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-primary,
.btn-outline {
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--primary, #ff7a00);
  color: #fff;
  box-shadow: 0 12px 30px rgba(255, 122, 0, 0.25);
}

.btn-primary:hover {
  background: var(--primary-dark, #e66d00);
}

.btn-outline {
  background: #fff;
  color: #1f2933;
  border-color: #d1d5db;
}

.btn-outline:hover {
  border-color: #ff7a00;
  color: #ff7a00;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .booking-create__content {
    margin-left: 0 !important;
    padding: 20px;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
