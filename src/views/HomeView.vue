<template>
	<div class="home-view">
		<!-- Header -->
		<header>
			<nav class="navbar navbar-expand-lg fixed-top">
				<div class="container">
					<a class="navbar-brand" href="#">
						<span>Garage</span>
						Pro
					</a>
					<button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#menu">
						<span class="navbar-toggler-icon"></span>
					</button>
					<button class="theme-toggle" id="themeToggle"><i class="fa-solid fa-sun"></i></button>
					<div class="offcanvas offcanvas-end" tabindex="-1" id="menu">
						<div class="offcanvas-header">
							<h5 class="offcanvas-title">GaragePro</h5>
							<button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
						</div>
						<div class="offcanvas-body">
							<ul class="navbar-nav ms-auto mb-2 mb-lg-0">
								<li class="nav-item"><a class="nav-link" href="#hero">Trang chủ</a></li>
								<li class="nav-item"><a class="nav-link" href="#about">Giới thiệu</a></li>
								<li class="nav-item"><a class="nav-link" href="#service">Dịch vụ</a></li>
								<li class="nav-item"><a class="nav-link" href="#cars">Xe</a></li>
								<li class="nav-item"><a class="nav-link" href="#reviews">Đánh giá</a></li>
								<li class="nav-item"><a class="nav-link" href="#booking">Đặt lịch</a></li>
								<li class="nav-item dropdown">
									<a class="nav-link dropdown-toggle" href="#" id="userDropdown"
										data-bs-toggle="dropdown">Tài khoản</a>
									<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
										<li v-if="user" class="dropdown-item user-info">
											{{ userDisplayName }}
										</li>
										<li>
											<a class="dropdown-item" @click="redirectToRolePage">
												<i class="fas fa-tachometer-alt me-2"></i>
												Dashboard
											</a>
										</li>
										<li>
											<a class="dropdown-item" href="#profile">
												<i class="fas fa-user me-2"></i>
												Hồ sơ
											</a>
										</li>
										<li>
											<a class="dropdown-item" href="#history">
												<i class="fas fa-history me-2"></i>
												Lịch sử
											</a>
										</li>
										<li>
											<a class="dropdown-item" href="#settings">
												<i class="fas fa-cog me-2"></i>
												Cài đặt
											</a>
										</li>
										<li>
											<hr class="dropdown-divider" />
										</li>
										<li>
											<a class="dropdown-item" href="#logout" @click.prevent="handleLogout">
												<i class="fas fa-sign-out-alt me-2"></i>
												Đăng xuất
											</a>
										</li>
									</ul>
								</li>
							</ul>
							<div class="d-flex mt-3 mt-lg-0 gap-2">
								<a href="#" class="btn-login" data-bs-toggle="modal" data-bs-target="#login-modal">Đăng
									nhập</a>
								<a href="#" class="btn-register" data-bs-toggle="modal"
									data-bs-target="#register-modal">Đăng ký</a>
							</div>
						</div>
					</div>
				</div>
			</nav>
		</header>

		<!-- Hero -->
		<section class="hero" id="hero">
			<div class="hero-content">
				<h1>Trải nghiệm Dịch vụ Ô tô Cao cấp cùng GaragePro</h1>
				<p>Mua bán, sửa chữa, bảo dưỡng – tất cả trong một nền tảng chuyên nghiệp và tận tâm.</p>
				<a href="#booking" class="btn-cta">Đặt lịch ngay</a>
			</div>
		</section>

		<!-- Login Modal -->
		<div class="modal fade" id="login-modal" tabindex="-1">
			<div class="modal-dialog modal-lg modal-dialog-centered">
				<div class="modal-content border-0 shadow-lg">
					<div class="custom-modal-content">
						<div class="modal-image"
							style="background: url('https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=1000&q=80') center/cover no-repeat">
							<div class="modal-image-text">
								<h4>Chào mừng trở lại!</h4>
								<p>Cùng GaragePro chăm sóc chiếc xe của bạn dễ dàng hơn.</p>
							</div>
						</div>
						<div class="modal-form">
							<button type="button" class="modal-close" data-bs-dismiss="modal">
								<i class="fa-solid fa-xmark"></i>
							</button>
							<div class="form-header">
								<h3>Đăng nhập</h3>
								<p>Nhập email để tiếp tục</p>
							</div>
							<form id="loginForm" data-vue-handled="true" @submit.prevent="sendOtp">
								<div class="floating-label-group">
									<input v-model.trim="email" type="email" id="loginEmail" placeholder=" "
										:disabled="auth.loading" />
									<label for="loginEmail">Email</label>
								</div>
								<button type="submit" :disabled="auth.loading" class="btn btn-primary w-100">
									{{ auth.loading ? 'Đang gửi...' : 'Đăng nhập' }}
								</button>
								<!-- <p v-if="localError" class="error">{{ localError }}</p> -->
								<!-- <p v-else-if="auth.error" class="error">{{ auth.error }}</p> -->
							</form>
							<div class="text-center mt-3">
								<span>Chưa có tài khoản?</span>
								<a href="#" data-bs-toggle="modal" data-bs-target="#register-modal"
									data-bs-dismiss="modal">Đăng ký</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Register Modal -->
		<div class="modal fade" id="register-modal" tabindex="-1">
			<div class="modal-dialog modal-lg modal-dialog-centered">
				<div class="modal-content border-0 shadow-lg">
					<div class="custom-modal-content">
						<div class="modal-image"
							style="background: url('https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=1000&q=80') center/cover no-repeat">
							<div class="modal-image-text">
								<h4>Gia nhập GaragePro</h4>
								<p>Tận hưởng dịch vụ chăm sóc, sửa chữa và mua bán xe toàn diện.</p>
							</div>
						</div>
						<div class="modal-form">
							<button type="button" class="modal-close" data-bs-dismiss="modal">
								<i class="fa-solid fa-xmark"></i>
							</button>
							<div class="form-header">
								<h3>Đăng ký</h3>
								<p>Chỉ mất 1 phút để bắt đầu</p>
							</div>
							<form id="registerForm">
								<!-- Họ và tên -->
								<div class="floating-label-group mb-3">
									<input type="text" id="registerFullName" class="form-control" placeholder=""
										required />
									<label for="registerFullName">Họ và tên</label>
								</div>

								<!-- Email -->
								<div class="floating-label-group mb-3">
									<input type="email" id="registerEmail" class="form-control" placeholder=""
										required />
									<label for="registerEmail">Email</label>
								</div>

								<!-- Số điện thoại -->
								<div class="floating-label-group mb-3">
									<input type="tel" id="registerPhone" class="form-control" placeholder="" required />
									<label for="registerPhone">Số điện thoại</label>
								</div>

								<!-- Địa chỉ -->
								<div class="floating-label-group mb-3">
									<input type="text" id="registerAddress" class="form-control" placeholder=""
										required />
									<label for="registerAddress">Địa chỉ</label>
								</div>

								<!-- Button -->
								<button type="submit" class="btn btn-primary w-100">Đăng ký</button>
							</form>

							<div class="text-center mt-3">
								<span>Đã có tài khoản?</span>
								<a href="#" data-bs-toggle="modal" data-bs-target="#login-modal"
									data-bs-dismiss="modal">Đăng nhập</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- About -->
		<section id="about" class="about-section">
			<div class="container">
				<div class="about-content">
					<div class="about-image">
						<img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
							alt="Luxury Car" />
					</div>
					<div class="about-text">
						<h2>GaragePro</h2>
						<p>
							GaragePro là nền tảng hàng đầu cung cấp giải pháp toàn diện cho xe hơi, từ mua bán, sửa chữa
							đến bảo dưỡng định kỳ. Với đội ngũ kỹ thuật viên chuyên nghiệp và công nghệ tiên tiến, chúng
							tôi cam kết mang đến trải nghiệm dịch vụ cao cấp, minh bạch và đáng tin cậy.
						</p>
						<p>
							Mục tiêu của chúng tôi là giúp khách hàng quản lý và chăm sóc xe hơi một cách dễ dàng, tiết
							kiệm thời gian và chi phí, đồng thời đảm bảo chất lượng dịch vụ luôn đạt tiêu chuẩn cao
							nhất.
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

		<!-- Services -->
		<section id="service" class="py-5">
			<div class="container">
				<h2 class="section-title">Dịch vụ nổi bật</h2>
				<div class="row g-4">
					<div class="col-md-3">
						<div class="service-card">
							<img src="https://cdn-icons-png.flaticon.com/512/2598/2598799.png" alt="repair" />
							<h5>Sửa chữa chuyên nghiệp</h5>
							<p>Đội ngũ kỹ thuật viên chứng nhận, phục hồi mọi dòng xe.</p>
						</div>
					</div>
					<div class="col-md-3">
						<div class="service-card">
							<img src="https://cdn-icons-png.flaticon.com/512/854/854878.png" alt="maintenance" />
							<h5>Bảo dưỡng định kỳ</h5>
							<p>Giữ xe vận hành ổn định, tiết kiệm chi phí dài hạn.</p>
						</div>
					</div>
					<div class="col-md-3">
						<div class="service-card">
							<img src="https://cdn-icons-png.flaticon.com/512/3094/3094855.png" alt="sale" />
							<h5>Mua bán xe</h5>
							<p>Giao dịch minh bạch, giá trị thật, bảo hành rõ ràng.</p>
						</div>
					</div>
					<div class="col-md-3">
						<div class="service-card">
							<img src="https://cdn-icons-png.flaticon.com/512/2331/2331942.png" alt="finance" />
							<h5>Tư vấn tài chính</h5>
							<p>Hỗ trợ trả góp linh hoạt, lãi suất ưu đãi nhất thị trường.</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Featured Cars -->
		<section id="cars" class="py-5 bg-light">
			<div class="container text-center">
				<h2 class="section-title mb-4">Bộ sưu tập xe nổi bật</h2>
				<div class="position-relative">
					<button id="prevCar"
						class="btn btn-outline-secondary rounded-circle position-absolute top-50 start-0 translate-middle-y shadow">
						<i class="fa-solid fa-chevron-left"></i>
					</button>
					<div class="row g-4 justify-content-center" id="carList"></div>
					<button id="nextCar"
						class="btn btn-outline-secondary rounded-circle position-absolute top-50 end-0 translate-middle-y shadow">
						<i class="fa-solid fa-chevron-right"></i>
					</button>
				</div>
				<div class="mt-5">
					<a href="#" class="btn btn-cta px-5">
						Xem tất cả xe
						<i class="fa-solid fa-arrow-right ms-2"></i>
					</a>
				</div>
			</div>
		</section>

		<!-- Reviews -->
		<section id="reviews" class="py-5">
			<div class="container">
				<h2 class="section-title">Đánh giá khách hàng</h2>
				<div class="row g-4">
					<div class="col-md-4">
						<div class="testimonial-card">
							<img src="https://randomuser.me/api/portraits/men/11.jpg" alt="Customer 1" />
							<div class="stars">★★★★★</div>
							<p>“Dịch vụ tuyệt vời, nhân viên thân thiện và chuyên nghiệp.”</p>
							<strong>- Minh Nguyễn</strong>
						</div>
					</div>
					<div class="col-md-4">
						<div class="testimonial-card">
							<img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Customer 2" />
							<div class="stars">★★★★★</div>
							<p>“Xe của tôi được bảo dưỡng nhanh chóng và tận tâm.”</p>
							<strong>- Hương Trần</strong>
						</div>
					</div>
					<div class="col-md-4">
						<div class="testimonial-card">
							<img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Customer 3" />
							<div class="stars">★★★★★</div>
							<p>“Mua xe tại đây rất yên tâm, mọi thứ rõ ràng và uy tín.”</p>
							<strong>- Tuấn Phạm</strong>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Contact Section -->
		<section id="booking" class="py-5 bg-light">
			<div class="container text-center">
				<h2 class="section-title fw-bold text-dark">Đặt lịch ngay</h2>
				<p class="lead text-muted">
					<strong>Sẵn sàng hỗ trợ bạn 24/7. Đặt lịch ngay để được tư vấn và nhận ưu đãi tốt nhất.</strong>
				</p>
				<a href="#" class="btn btn-cta btn-warning px-4 py-2 fw-semibold text-white" data-bs-toggle="modal"
					data-bs-target="#bookingModal">
					<i class="fas fa-paper-plane me-2"></i>
					Gửi yêu cầu
				</a>
			</div>
		</section>

		<!-- MODAL: Liên hệ đặt lịch xe -->
		<div class="modal fade" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
				<div class="modal-content border-0 shadow-lg">
					<div class="modal-header bg-light border-0">
						<h5 class="modal-title fw-bold text-dark" id="bookingModalLabel">
							<i class="fas fa-wrench me-2"></i>
							Gửi yêu cầu đặt lịch bảo dưỡng và sửa chữa xe
						</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
					</div>

					<div class="modal-body">
						<!-- Alert Messages -->
						<div id="alertSuccess" class="alert alert-success alert-dismissible fade show d-none"
							role="alert">
							<i class="fas fa-check-circle me-2"></i>
							<strong>Thành công!</strong>
							Yêu cầu của bạn đã được gửi. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.
							<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
						</div>

						<div id="alertError" class="alert alert-danger alert-dismissible fade show d-none" role="alert">
							<i class="fas fa-exclamation-triangle me-2"></i>
							<strong>Lỗi!</strong>
							<span id="errorMessage">Có lỗi xảy ra, vui lòng thử lại.</span>
							<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
						</div>

						<!-- Contact Form -->
						<form id="contactForm" novalidate>
							<div class="row g-3">
								<div class="col-md-6">
									<label for="fullName" class="form-label">
										Họ và tên
										<span class="text-danger">*</span>
									</label>
									<input type="text" class="form-control" id="fullName" name="fullName"
										placeholder="Nguyễn Văn A" required minlength="2" maxlength="100"
										autocomplete="name" />
									<div class="invalid-feedback">Vui lòng nhập họ tên (từ 2 ký tự)</div>
								</div>

								<div class="col-md-6">
									<label for="phone" class="form-label">
										Số điện thoại
										<span class="text-danger">*</span>
									</label>
									<input type="tel" class="form-control" id="phone" name="phone"
										placeholder="0912345678" required pattern="^(0|\+84)[0-9]{9,10}$"
										autocomplete="tel" />
									<div class="invalid-feedback">Vui lòng nhập số điện thoại hợp lệ</div>
								</div>

								<div class="col-md-6">
									<label for="email" class="form-label">
										Email
										<span class="text-danger">*</span>
									</label>
									<input type="email" class="form-control" id="email" name="email"
										placeholder="example@email.com" required autocomplete="email" />
									<div class="invalid-feedback">Vui lòng nhập email hợp lệ</div>
								</div>

								<div class="col-md-6">
									<label for="serviceType" class="form-label">
										Loại dịch vụ
										<span class="text-danger">*</span>
									</label>
									<select class="form-select" id="serviceType" name="serviceType" required>
										<option value="">-- Chọn loại dịch vụ --</option>
										<option value="maintenance">Bảo dưỡng định kỳ</option>
										<option value="repair">Sửa chữa</option>
										<option value="inspection">Kiểm tra tổng quát</option>
										<option value="tire">Thay lốp xe</option>
										<option value="oil">Thay dầu động cơ</option>
										<option value="brake">Hệ thống phanh</option>
										<option value="battery">Ắc quy - Bình điện</option>
										<option value="other">Dịch vụ khác</option>
									</select>
									<div class="invalid-feedback">Vui lòng chọn loại dịch vụ</div>
								</div>

								<div class="col-md-6 position-relative" id="carSearchWrapper">
									<label for="carSearch" class="form-label">Hãng xe</label>
									<input type="text" class="form-control" id="carSearch" name="carBrand"
										placeholder="Toyota, Honda, Mazda..." maxlength="50" autocomplete="off" />
									<ul class="list-group position-absolute w-100 shadow-sm mt-2" id="carDropdown"></ul>
									<small class="text-muted">Tùy chọn</small>
								</div>

								<div class="col-md-6">
									<label for="preferredDate" class="form-label">Ngày mong muốn</label>
									<input type="date" class="form-control" id="preferredDate" name="preferredDate" />
									<small class="text-muted">Tùy chọn</small>
								</div>

								<div class="col-12">
									<label for="message" class="form-label">
										Nội dung yêu cầu
										<span class="text-danger">*</span>
									</label>
									<textarea class="form-control" id="message" name="message" rows="4"
										placeholder="Mô tả chi tiết vấn đề của xe hoặc dịch vụ bạn cần..." required
										minlength="10" maxlength="1000"></textarea>
									<div class="invalid-feedback">Vui lòng nhập nội dung yêu cầu (từ 10 ký tự)</div>
									<small class="text-muted">
										<span id="charCount">0</span>
										/1000 ký tự
									</small>
								</div>

								<div class="col-12">
									<div class="form-check">
										<input class="form-check-input" type="checkbox" id="agreeTerms" required />
										<label class="form-check-label" for="agreeTerms">
											Tôi đồng ý với
											<a href="#" target="_blank">điều khoản sử dụng</a>
											và
											<a href="#" target="_blank">chính sách bảo mật</a>
											<span class="text-danger">*</span>
										</label>
										<div class="invalid-feedback">Bạn cần đồng ý với điều khoản để tiếp tục</div>
									</div>
								</div>
							</div>

							<div class="text-end mt-4">
								<button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
									<i class="fas fa-times me-2"></i>
									Hủy
								</button>
								<button type="submit" class="btn btn-garagepro fw-semibold px-4" id="submitBtn">
									<span id="btnText">
										<i class="fas fa-paper-plane me-2"></i>
										Gửi yêu cầu
									</span>
									<span id="loadingSpinner" class="d-none">
										<span class="spinner-border spinner-border-sm me-2" role="status"
											aria-hidden="true"></span>
										Đang gửi...
									</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>

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
							<i class="fas fa-map-marker-alt me-2"></i>
							Khu Giáo dục và Đào tạo - Khu Công nghệ cao Hòa Lạc - Km29 Đại lộ Thăng Long, xã Hòa Lạc,
							TP. Hà Nội
						</p>
						<p>
							<i class="fas fa-phone me-2"></i>
							(024) 7300 5588
						</p>
						<p>
							<i class="fas fa-envelope me-2"></i>
							support@garagepro.vn
						</p>
					</div>
					<div class="col-md-4">
						<h5>Đăng ký nhận tin</h5>
						<p>Nhận thông tin mới nhất về các mẫu xe và ưu đãi đặc biệt.</p>
						<form class="newsletter-form">
							<input type="email" placeholder="Nhập email của bạn" required />
							<button type="submit">Đăng ký</button>
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

		<button id="backToTopBtn" class="back-to-top"><i class="fa-solid fa-arrow-up"></i></button>
		<GmsToast ref="toastRef" />
	</div>
</template>

<script setup>
import { initHomeInteractions } from '@/assets/js/home'
import '@/assets/style/home.css'
import { GmsToast } from '@/components'
import { setToastInstance, useToast } from '@/composables/useToast'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const email = ref('')
const localError = ref('')
const toastRef = ref(null)

const user = computed(() => auth.user)

const userDisplayName = computed(() => {
	const currentUser = user.value
	if (!currentUser) return ''
	return (
		currentUser.fullName ||
		currentUser.name ||
		currentUser.username ||
		currentUser.email ||
		''
	)
})
const roleRedirectMap = {
	MANAGER: '/manager/dashboard',
	STAFF: '/staff/dashboard',
	CUSTOMER: '/customer/home',
	STOCKER: '/stocker/dashboard',
	MECHANIC: '/mechanic/dashboard'
}
const redirectToRolePage = () => {
	const role = user.value?.role
	if (!role) return
	const target = roleRedirectMap[role] || '/home'
	router.replace(target)
}
const hideModal = (modalId) => {
	if (typeof window === 'undefined' || !window.bootstrap) {
		return
	}

	const modalEl = document.getElementById(modalId)
	if (!modalEl) return

	const modalInstance =
		window.bootstrap.Modal.getInstance(modalEl) ??
		window.bootstrap.Modal.getOrCreateInstance(modalEl)
	modalInstance.hide()
}


const cleanupModalState = () => {
	const body = document.body
	if (body) {
		body.classList.remove('modal-open')
		body.style.removeProperty('padding-right')
	}
	document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove())
}

	const sendOtp = async () => {
	localError.value = ''

	const trimmedEmail = email.value.trim()
	if (!trimmedEmail) {
		const message = 'Vui lòng nhập email để nhận OTP đăng nhập'
		localError.value = message
		toast.error(message, 'Lỗi đăng nhập')
		return
	}

	email.value = trimmedEmail
	const ok = await auth.requestOtp(trimmedEmail)
	if (ok) {
		hideModal('login-modal')
		cleanupModalState()
		router.push({ name: 'verifyOtp', query: { email: trimmedEmail } })
		return
	}

	const errorMessage = auth.error || 'Email không hợp lệ, vui lòng thử lại'
	localError.value = errorMessage
	toast.error(errorMessage, 'Lỗi đăng nhập', { duration: 4000 })
}

let teardownFn

onMounted(() => {
	teardownFn = initHomeInteractions()

	if (toastRef.value) {
		setToastInstance(toastRef.value)
	}
})

// Watch user để redirect khi user được set
watch(user, (newUser) => {
	if (newUser) {
		redirectToRolePage()
	}
})

onBeforeUnmount(() => {
	if (typeof teardownFn === 'function') {
		teardownFn()
	}
	})

	const handleLogout = async () => {
		await auth.logout()
		router.push({ name: 'home' })
	}
</script>
