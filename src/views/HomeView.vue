<template>
  <div class="home-view" :data-theme="theme">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <span>Garage</span>Pro
        </router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#menu"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <button class="theme-toggle" @click="toggleTheme">
          <i :class="theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
        </button>
        <div class="offcanvas offcanvas-end" tabindex="-1" id="menu">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title">GaragePro</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
          </div>
          <div class="offcanvas-body">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" href="#hero" @click="scrollTo('hero')">Trang chủ</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#about" @click="scrollTo('about')">Giới thiệu</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#service" @click="scrollTo('service')">Dịch vụ</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#cars" @click="scrollTo('cars')">Xe</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#reviews" @click="scrollTo('reviews')">Đánh giá</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#contact" @click="scrollTo('contact')">Liên hệ</a>
              </li>
              <li v-if="isAuthenticated" class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                >
                  Tài khoản
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li class="dropdown-item user-info">Khách hàng: {{ currentUser?.name }}</li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="goToProfile">
                      <i class="fas fa-user me-2"></i>Hồ sơ
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="goToHistory">
                      <i class="fas fa-history me-2"></i>Lịch sử
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="goToSettings">
                      <i class="fas fa-cog me-2"></i>Cài đặt
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                      <i class="fas fa-sign-out-alt me-2"></i>Đăng xuất
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
            <div v-if="!isAuthenticated" class="d-flex mt-3 mt-lg-0 gap-2">
              <GmsButton
                variant="outline"
                @click="showLoginModal = true"
              >
                Đăng nhập
              </GmsButton>
              <GmsButton
                variant="primary"
                @click="showRegisterModal = true"
              >
                Đăng ký
              </GmsButton>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="hero">
      <div class="hero-content">
        <h1>Trải nghiệm Dịch vụ Ô tô Cao cấp cùng GaragePro</h1>
        <p>Mua bán, sửa chữa, bảo dưỡng – tất cả trong một nền tảng chuyên nghiệp và tận tâm.</p>
        <GmsButton variant="primary" size="large" @click="scrollTo('service')">
          Khám phá ngay
        </GmsButton>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about-section">
      <div class="container">
        <div class="about-content">
          <div class="about-image">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
              alt="Luxury Car"
            />
          </div>
          <div class="about-text">
            <h2>GaragePro</h2>
            <p>
              GaragePro là nền tảng hàng đầu cung cấp giải pháp toàn diện cho xe hơi, từ mua bán,
              sửa chữa đến bảo dưỡng định kỳ. Với đội ngũ kỹ thuật viên chuyên nghiệp và công nghệ
              tiên tiến, chúng tôi cam kết mang đến trải nghiệm dịch vụ cao cấp, minh bạch và đáng
              tin cậy.
            </p>
            <p>
              Mục tiêu của chúng tôi là giúp khách hàng quản lý và chăm sóc xe hơi một cách dễ dàng,
              tiết kiệm thời gian và chi phí, đồng thời đảm bảo chất lượng dịch vụ luôn đạt tiêu
              chuẩn cao nhất.
            </p>
            <div class="about-stats">
              <div class="stat-item">
                <h3>10K+</h3>
                <p>Khách hàng tin cậy</p>
              </div>
              <div class="stat-item">
                <h3>500+</h3>
                <p>Xe được phục vụ</p>
              </div>
              <div class="stat-item">
                <h3>50+</h3>
                <p>Kỹ thuật viên chuyên nghiệp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="service" class="py-5">
      <div class="container">
        <h2 class="section-title">Dịch vụ nổi bật</h2>
        <div class="row g-4">
          <div v-for="service in services" :key="service.id" class="col-md-3">
            <div class="service-card">
              <img :src="service.icon" :alt="service.title" />
              <h5>{{ service.title }}</h5>
              <p>{{ service.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Cars Section -->
    <section id="cars" class="py-5 bg-light">
      <div class="container text-center">
        <h2 class="section-title mb-4">Bộ sưu tập xe nổi bật</h2>
        <div class="position-relative">
          <GmsButton
            variant="outline"
            class="position-absolute top-50 start-0 translate-middle-y rounded-circle"
            icon="fa-chevron-left"
            @click="prevCars"
          />
          <div class="row g-4 justify-content-center" id="carList">
            <div
              v-for="car in displayedCars"
              :key="car.id"
              class="col-md-4"
            >
              <div class="car-card">
                <img :src="car.img" :alt="car.name" />
                <div class="car-info">
                  <h5>{{ car.name }}</h5>
                  <p>{{ car.price }}</p>
                  <GmsButton variant="primary" size="small" @click="viewCarDetail(car)">
                    Xem chi tiết
                  </GmsButton>
                </div>
              </div>
            </div>
          </div>
          <GmsButton
            variant="outline"
            class="position-absolute top-50 end-0 translate-middle-y rounded-circle"
            icon="fa-chevron-right"
            icon-right
            @click="nextCars"
          />
        </div>
        <div class="mt-5">
          <GmsButton variant="primary" size="large" @click="viewAllCars">
            Xem tất cả xe
            <i class="fa-solid fa-arrow-right ms-2"></i>
          </GmsButton>
        </div>
      </div>
    </section>

    <!-- Reviews Section -->
    <section id="reviews" class="py-5">
      <div class="container">
        <h2 class="section-title">Đánh giá khách hàng</h2>
        <div class="row g-4">
          <div v-for="review in reviews" :key="review.id" class="col-md-4">
            <div class="testimonial-card">
              <img :src="review.avatar" :alt="review.name" />
              <div class="stars">★★★★★</div>
              <p>"{{ review.comment }}"</p>
              <strong>- {{ review.name }}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-5 bg-light">
      <div class="container text-center">
        <h2 class="section-title fw-bold text-dark">Liên hệ ngay</h2>
        <p class="lead text-muted">
          Sẵn sàng hỗ trợ bạn 24/7. Liên hệ ngay để được tư vấn và nhận ưu đãi tốt nhất.
        </p>
        <GmsButton
          variant="primary"
          size="large"
          icon="fa-paper-plane"
          @click="showContactModal = true"
        >
          Gửi yêu cầu
        </GmsButton>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
            <h4>GaragePro</h4>
            <p>Giải pháp toàn diện cho ô tô của bạn – Uy tín, minh bạch, tận tâm.</p>
            <p>© 2025 GaragePro. All rights reserved.</p>
          </div>
          <div class="col-md-4">
            <h5>Liên hệ</h5>
            <p>
              <i class="fas fa-map-marker-alt me-2"></i> Khu Giáo dục và Đào tạo - Khu Công nghệ cao
              Hòa Lạc - Km29 Đại lộ Thăng Long, xã Hòa Lạc, TP. Hà Nội
            </p>
            <p><i class="fas fa-phone me-2"></i> (024) 7300 5588</p>
            <p><i class="fas fa-envelope me-2"></i> support@garagepro.vn</p>
          </div>
          <div class="col-md-4">
            <h5>Đăng ký nhận tin</h5>
            <p>Nhận thông tin mới nhất về các mẫu xe và ưu đãi đặc biệt.</p>
            <form class="newsletter-form" @submit.prevent="handleNewsletter">
              <GmsInput
                v-model="newsletterEmail"
                type="email"
                placeholder="Nhập email của bạn"
                :required="true"
              />
              <GmsButton type="submit" variant="primary">Đăng ký</GmsButton>
            </form>
            <h5 class="mt-4">Theo dõi chúng tôi</h5>
            <div class="d-flex gap-3">
              <a href="#"><i class="fab fa-facebook-f"></i></a>
              <a href="#"><i class="fab fa-instagram"></i></a>
              <a href="#"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Back to Top Button -->
    <button
      v-show="showBackToTop"
      id="backToTopBtn"
      class="back-to-top"
      @click="scrollToTop"
    >
      <i class="fa-solid fa-arrow-up"></i>
    </button>

    <!-- Login Modal -->
    <GmsDialog v-model="showLoginModal" title="Đăng nhập" size="large" :closable="true">
      <div class="login-modal-content">
        <div
          class="modal-image"
          style="background: url('https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=1000&q=80') center/cover no-repeat;"
        >
          <div class="modal-image-text">
            <h4>Chào mừng trở lại!</h4>
            <p>Cùng GaragePro chăm sóc chiếc xe của bạn dễ dàng hơn.</p>
          </div>
        </div>
        <div class="modal-form">
          <div class="form-header">
            <h3>Đăng nhập</h3>
            <p>Nhập email để tiếp tục</p>
          </div>
          <form @submit.prevent="handleLogin">
            <GmsInput
              v-model="loginForm.email"
              label="Email"
              type="email"
              placeholder="Nhập email của bạn"
              prefix-icon="fa-envelope"
              :required="true"
            />
            <GmsButton type="submit" variant="primary" block :loading="loginLoading">
              Đăng nhập
            </GmsButton>
          </form>
          <div class="text-center mt-3">
            <span>Chưa có tài khoản? </span>
            <a href="#" @click.prevent="switchToRegister">Đăng ký</a>
          </div>
        </div>
      </div>
    </GmsDialog>

    <!-- Register Modal -->
    <GmsDialog v-model="showRegisterModal" title="Đăng ký" size="large" :closable="true">
      <div class="register-modal-content">
        <div
          class="modal-image"
          style="background: url('https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=1000&q=80') center/cover no-repeat;"
        >
          <div class="modal-image-text">
            <h4>Gia nhập GaragePro</h4>
            <p>Tận hưởng dịch vụ chăm sóc, sửa chữa và mua bán xe toàn diện.</p>
          </div>
        </div>
        <div class="modal-form">
          <div class="form-header">
            <h3>Đăng ký</h3>
            <p>Chỉ mất 1 phút để bắt đầu</p>
          </div>
          <form @submit.prevent="handleRegister">
            <GmsInput
              v-model="registerForm.fullName"
              label="Họ và tên"
              type="text"
              placeholder="Nhập họ tên của bạn"
              prefix-icon="fa-user"
              :required="true"
            />
            <GmsInput
              v-model="registerForm.email"
              label="Email"
              type="email"
              placeholder="Nhập email của bạn"
              prefix-icon="fa-envelope"
              :required="true"
            />
            <GmsButton type="submit" variant="primary" block :loading="registerLoading">
              Đăng ký
            </GmsButton>
          </form>
          <div class="text-center mt-3">
            <span>Đã có tài khoản? </span>
            <a href="#" @click.prevent="switchToLogin">Đăng nhập</a>
          </div>
        </div>
      </div>
    </GmsDialog>

    <!-- Contact Modal -->
    <GmsDialog v-model="showContactModal" title="Gửi yêu cầu tư vấn mua xe" size="large">
      <form @submit.prevent="handleContact">
        <div class="row g-3">
          <div class="col-md-6">
            <GmsInput
              v-model="contactForm.fullName"
              label="Họ và tên"
              placeholder="Nhập họ tên của bạn"
              :required="true"
            />
          </div>
          <div class="col-md-6">
            <GmsInput
              v-model="contactForm.email"
              label="Email"
              type="email"
              placeholder="Nhập email liên hệ"
              :required="true"
            />
          </div>
          <div class="col-md-6">
            <GmsInput
              v-model="contactForm.phone"
              label="Số điện thoại"
              type="tel"
              placeholder="Nhập số điện thoại"
              :required="true"
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Dòng xe quan tâm</label>
            <GmsInput
              v-model="contactForm.carSearch"
              placeholder="Nhập tên hoặc hãng xe (VD: VinFast)"
              prefix-icon="fa-car"
              :clearable="true"
              @input="handleCarSearch"
            />
            <ul v-if="carDropdownVisible && filteredCars.length > 0" class="car-dropdown">
              <li
                v-for="car in filteredCars"
                :key="car.name"
                @click="selectCar(car)"
              >
                {{ car.name }} – {{ car.price }}
              </li>
            </ul>
          </div>
          <div class="col-12">
            <label class="form-label">Nội dung yêu cầu</label>
            <textarea
              v-model="contactForm.message"
              class="form-control"
              rows="4"
              placeholder="Nhập yêu cầu hoặc thắc mắc của bạn..."
              required
            ></textarea>
          </div>
        </div>
        <div class="text-end mt-4">
          <GmsButton type="submit" variant="primary" :loading="contactLoading">
            <i class="fas fa-paper-plane me-2"></i> Gửi yêu cầu
          </GmsButton>
        </div>
        <div v-if="contactSuccess" class="alert alert-success mt-4">
          <i class="fas fa-check-circle me-2"></i> Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại
          sớm nhất.
        </div>
      </form>
    </GmsDialog>

    <!-- Toast -->
    <GmsToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { GmsInput, GmsButton, GmsDialog, GmsToast } from '@/components'
import { useToast } from '@/composables/useToast'
import authService from '@/services/auth'
import api from '@/services/api'
import { API_ENDPOINTS } from '@/constant/api'

const router = useRouter()
const toastRef = ref(null)
const toast = useToast()

const theme = ref(localStorage.getItem('theme') || 'light')
const showBackToTop = ref(false)
const showLoginModal = ref(false)
const showRegisterModal = ref(false)
const showContactModal = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)
const contactLoading = ref(false)
const contactSuccess = ref(false)
const carDropdownVisible = ref(false)

const currentUser = ref(authService.getCurrentUser())
const isAuthenticated = computed(() => authService.isAuthenticated())

const loginForm = ref({
  email: ''
})

const registerForm = ref({
  fullName: '',
  email: ''
})

const contactForm = ref({
  fullName: '',
  email: '',
  phone: '',
  carSearch: '',
  message: ''
})

const newsletterEmail = ref('')

const services = ref([
  {
    id: 1,
    title: 'Sửa chữa chuyên nghiệp',
    description: 'Đội ngũ kỹ thuật viên chứng nhận, phục hồi mọi dòng xe.',
    icon: 'https://cdn-icons-png.flaticon.com/512/2598/2598799.png'
  },
  {
    id: 2,
    title: 'Bảo dưỡng định kỳ',
    description: 'Giữ xe vận hành ổn định, tiết kiệm chi phí dài hạn.',
    icon: 'https://cdn-icons-png.flaticon.com/512/854/854878.png'
  },
  {
    id: 3,
    title: 'Mua bán xe',
    description: 'Giao dịch minh bạch, giá trị thật, bảo hành rõ ràng.',
    icon: 'https://cdn-icons-png.flaticon.com/512/3094/3094855.png'
  },
  {
    id: 4,
    title: 'Tư vấn tài chính',
    description: 'Hỗ trợ trả góp linh hoạt, lãi suất ưu đãi nhất thị trường.',
    icon: 'https://cdn-icons-png.flaticon.com/512/2331/2331942.png'
  }
])

const cars = ref([
  {
    id: 1,
    name: 'Honda CR-V 2023',
    img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    price: '720 triệu VNĐ'
  },
  {
    id: 2,
    name: 'Toyota Camry 2022',
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    price: '850 triệu VNĐ'
  },
  {
    id: 3,
    name: 'Mercedes C200 2021',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80',
    price: '1,2 tỷ VNĐ'
  },
  {
    id: 4,
    name: 'BMW 5 Series 2020',
    img: 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=800&q=80',
    price: '1,8 tỷ VNĐ'
  },
  {
    id: 5,
    name: 'Porsche Cayenne 2019',
    img: 'https://images.unsplash.com/photo-1605559424840-4e0b86781b25?auto=format&fit=crop&w=800&q=80',
    price: '3,5 tỷ VNĐ'
  },
  {
    id: 6,
    name: 'Rolls-Royce Ghost 2018',
    img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
    price: '10 tỷ VNĐ'
  }
])

const vehicleList = ref([
  { name: 'Toyota Vios 2023', brand: 'Toyota', price: '520.000.000đ' },
  { name: 'Mazda CX-5 2022', brand: 'Mazda', price: '850.000.000đ' },
  { name: 'Hyundai Accent 2023', brand: 'Hyundai', price: '580.000.000đ' },
  { name: 'Honda City 2024', brand: 'Honda', price: '610.000.000đ' },
  { name: 'VinFast VF5 Plus 2024', brand: 'VinFast', price: '468.000.000đ' },
  { name: 'VinFast Lux A2.0 2022', brand: 'VinFast', price: '890.000.000đ' },
  { name: 'VinFast VF8 2023', brand: 'VinFast', price: '1.050.000.000đ' },
  { name: 'Kia Seltos 2023', brand: 'Kia', price: '720.000.000đ' },
  { name: 'Ford Ranger 2024', brand: 'Ford', price: '980.000.000đ' }
])

const reviews = ref([
  {
    id: 1,
    name: 'Minh Nguyễn',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    comment: 'Dịch vụ tuyệt vời, nhân viên thân thiện và chuyên nghiệp.'
  },
  {
    id: 2,
    name: 'Hương Trần',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    comment: 'Xe của tôi được bảo dưỡng nhanh chóng và tận tâm.'
  },
  {
    id: 3,
    name: 'Tuấn Phạm',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    comment: 'Mua xe tại đây rất yên tâm, mọi thứ rõ ràng và uy tín.'
  }
])

const currentCarIndex = ref(0)
const carsPerView = 3

const displayedCars = computed(() => {
  const result = []
  for (let i = 0; i < carsPerView; i++) {
    const index = (currentCarIndex.value + i) % cars.value.length
    result.push(cars.value[index])
  }
  return result
})

const filteredCars = computed(() => {
  if (!contactForm.value.carSearch) return []
  const search = contactForm.value.carSearch.toLowerCase()
  return vehicleList.value
    .filter(
      (v) =>
        v.name.toLowerCase().includes(search) || v.brand.toLowerCase().includes(search)
    )
    .slice(0, 5)
})

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
}

const scrollTo = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const prevCars = () => {
  currentCarIndex.value = (currentCarIndex.value - carsPerView + cars.value.length) % cars.value.length
}

const nextCars = () => {
  currentCarIndex.value = (currentCarIndex.value + carsPerView) % cars.value.length
}

const viewCarDetail = (car) => {
  // Navigate to car detail
  console.log('View car:', car)
}

const viewAllCars = () => {
  // Navigate to all cars page
  console.log('View all cars')
}

const switchToRegister = () => {
  showLoginModal.value = false
  setTimeout(() => {
    showRegisterModal.value = true
  }, 300)
}

const switchToLogin = () => {
  showRegisterModal.value = false
  setTimeout(() => {
    showLoginModal.value = true
  }, 300)
}

const handleLogin = async () => {
  if (!loginForm.value.email.trim()) {
    toast.error('Vui lòng nhập email')
    return
  }

  try {
    loginLoading.value = true
    // Redirect to OTP verification
    router.push({
      path: '/verify-otp',
      query: { mode: 'login', email: loginForm.value.email }
    })
  } catch (error) {
    toast.error('Lỗi đăng nhập', error.message)
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.value.fullName.trim() || !registerForm.value.email.trim()) {
    toast.error('Vui lòng nhập đầy đủ thông tin')
    return
  }

  try {
    registerLoading.value = true
    // Redirect to OTP verification
    router.push({
      path: '/verify-otp',
      query: {
        mode: 'register',
        email: registerForm.value.email,
        name: registerForm.value.fullName
      }
    })
  } catch (error) {
    toast.error('Lỗi đăng ký', error.message)
  } finally {
    registerLoading.value = false
  }
}

const handleCarSearch = () => {
  carDropdownVisible.value = contactForm.value.carSearch.length > 0
}

const selectCar = (car) => {
  contactForm.value.carSearch = car.name
  carDropdownVisible.value = false
}

const handleContact = async () => {
  const lastSubmit = localStorage.getItem('lastSubmitTime')
  const now = Date.now()

  if (lastSubmit && now - lastSubmit < 30000) {
    toast.warning('Bạn vừa gửi yêu cầu, vui lòng thử lại sau ít phút.')
    return
  }

  try {
    contactLoading.value = true
    await api.post('/contact', contactForm.value)
    
    contactSuccess.value = true
    localStorage.setItem('lastSubmitTime', now)
    
    setTimeout(() => {
      showContactModal.value = false
      contactSuccess.value = false
      contactForm.value = {
        fullName: '',
        email: '',
        phone: '',
        carSearch: '',
        message: ''
      }
    }, 2000)
    
    toast.success('Gửi yêu cầu thành công!')
  } catch (error) {
    toast.error('Lỗi khi gửi yêu cầu', error.message)
  } finally {
    contactLoading.value = false
  }
}

const handleNewsletter = async () => {
  if (!newsletterEmail.value.trim()) {
    toast.error('Vui lòng nhập email')
    return
  }

  try {
    await api.post('/newsletter', { email: newsletterEmail.value })
    toast.success('Đăng ký nhận tin thành công!')
    newsletterEmail.value = ''
  } catch (error) {
    toast.error('Lỗi khi đăng ký', error.message)
  }
}

const handleLogout = async () => {
  await authService.logout()
  currentUser.value = null
  router.push('/')
}

const goToProfile = () => {
  router.push('/customer/profile')
}

const goToHistory = () => {
  router.push('/customer/service-tickets')
}

const goToSettings = () => {
  router.push('/customer/settings')
}

onMounted(async () => {
  // Set toast instance
  if (toastRef.value) {
    const { setToastInstance } = await import('@/composables/useToast')
    setToastInstance(toastRef.value)
  }

  // Auto rotate cars
  setInterval(() => {
    currentCarIndex.value = (currentCarIndex.value + 1) % cars.value.length
  }, 3500)

  // Scroll handler
  window.addEventListener('scroll', handleScroll)

  // Close car dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.position-relative')) {
      carDropdownVisible.value = false
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@import '../assets/style/home.css';
</style>

