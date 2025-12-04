const CAR_SLIDER_ITEMS = [
  {
    name: 'Honda CR-V 2023',
    img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    price: '720 triệu VNĐ',
  },
  {
    name: 'Toyota Camry 2022',
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    price: '850 triệu VNĐ',
  },
  {
    name: 'Mercedes C200 2021',
    img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80',
    price: '1,2 tỷ VNĐ',
  },
  {
    name: 'BMW 5 Series 2020',
    img: 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=800&q=80',
    price: '1,8 tỷ VNĐ',
  },
  {
    name: 'Porsche Cayenne 2019',
    img: 'https://images.unsplash.com/photo-1699325974549-fd06639650aa?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    price: '3,5 tỷ VNĐ',
  },
  {
    name: 'Rolls-Royce Ghost 2018',
    img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
    price: '10 tỷ VNĐ',
  },
]

const VEHICLE_SUGGESTIONS = [
  { name: 'Toyota Vios 2023', brand: 'Toyota', price: '520.000.000đ' },
  { name: 'Mazda CX-5 2022', brand: 'Mazda', price: '850.000.000đ' },
  { name: 'Hyundai Accent 2023', brand: 'Hyundai', price: '580.000.000đ' },
  { name: 'Honda City 2024', brand: 'Honda', price: '610.000.000đ' },
  { name: 'VinFast VF5 Plus 2024', brand: 'VinFast', price: '468.000.000đ' },
  { name: 'VinFast Lux A2.0 2022', brand: 'VinFast', price: '890.000.000đ' },
  { name: 'VinFast VF8 2023', brand: 'VinFast', price: '1.050.000.000đ' },
  { name: 'Kia Seltos 2023', brand: 'Kia', price: '720.000.000đ' },
  { name: 'Ford Ranger 2024', brand: 'Ford', price: '980.000.000đ' }
]

const CAR_SLIDE_INTERVAL = 3500
const CARS_PER_VIEW = 3
const SUBMIT_COOLDOWN_MS = 30000

function initTheme() {
  const body = document.body
  if (!body) {
    return () => {}
  }

  const toggle = document.getElementById('themeToggle')

  const updateDarkModeUI = () => {
    const isDark = body.dataset.theme === 'dark'
    const footer = document.querySelector('.footer')

    if (footer) {
      footer.style.backgroundColor = isDark ? '#0e0e0e' : ''
      const footerElements = footer.querySelectorAll('h4, h5, p, a, i, input, button')
      footerElements.forEach((element) => {
        element.style.color = isDark ? '#fff' : ''
      })

      const footerInput = footer.querySelector('input')
      const footerButton = footer.querySelector('button')
      if (footerInput) {
        footerInput.style.backgroundColor = isDark ? '#1b1b1b' : ''
        footerInput.style.color = isDark ? '#fff' : ''
        footerInput.style.border = isDark ? '1px solid #444' : ''
      }
      if (footerButton) {
        footerButton.style.backgroundColor = isDark ? '#ff7a00' : ''
        footerButton.style.color = isDark ? '#fff' : ''
      }
    }
  }

  const applyTheme = (theme) => {
    body.dataset.theme = theme
    localStorage.setItem('theme', theme)
    if (toggle) {
      toggle.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>'
    }
    updateDarkModeUI()
  }

  const storedTheme = localStorage.getItem('theme') || body.dataset.theme || 'light'
  applyTheme(storedTheme)

  if (!toggle) {
    return () => {}
  }

  const handleToggle = () => {
    const nextTheme = body.dataset.theme === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
  }

  toggle.addEventListener('click', handleToggle)
  return () => toggle.removeEventListener('click', handleToggle)
}

function initBackToTop() {
  const btn = document.getElementById('backToTopBtn')
  if (!btn) {
    return () => {}
  }

  const handleScroll = () => {
    if (window.scrollY > 300) {
      btn.classList.add('show')
    } else {
      btn.classList.remove('show')
    }
  }

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  window.addEventListener('scroll', handleScroll)
  btn.addEventListener('click', handleClick)

  return () => {
    window.removeEventListener('scroll', handleScroll)
    btn.removeEventListener('click', handleClick)
  }
}

function initAuthForms() {
  const loginForm = document.getElementById('loginForm')
  const registerForm = document.getElementById('registerForm')
  const cleanupFns = []

  const smoothRedirect = (mode, email) => {
    const body = document.body
    if (body) {
      body.style.transition = 'opacity 0.4s ease'
      body.style.opacity = '0'
    }
    window.setTimeout(() => {
      window.location.href = `/verify-otp?mode=${mode}&email=${encodeURIComponent(email)}`
    }, 400)
  }

  const hideModal = (id) => {
    const modalEl = document.getElementById(id)
    if (!modalEl || !window.bootstrap) {
      return
    }
    const modalInstance = window.bootstrap.Modal.getInstance(modalEl) ?? window.bootstrap.Modal.getOrCreateInstance(modalEl)
    modalInstance.hide()
  }

  if (loginForm && loginForm.dataset.vueHandled !== 'true') {
    const handleLogin = (event) => {
      event.preventDefault()
      const email = document.getElementById('loginEmail')?.value.trim()
      if (!email) {
        // alert('Vui lòng nhập email để nhận mã OTP.')
        return
      }
      hideModal('login-modal')
      smoothRedirect('login', email)
    }
    loginForm.addEventListener('submit', handleLogin)
    cleanupFns.push(() => loginForm.removeEventListener('submit', handleLogin))
  }

  if (registerForm) {
    const handleRegister = (event) => {
      event.preventDefault()
      const fullName = document.getElementById('registerFullName')?.value.trim()
      const email = document.getElementById('registerEmail')?.value.trim()
      if (!fullName || !email) {
        alert('Vui lòng nhập đầy đủ họ tên và email.')
        return
      }
      hideModal('register-modal')
      smoothRedirect('register', email)
    }
    registerForm.addEventListener('submit', handleRegister)
    cleanupFns.push(() => registerForm.removeEventListener('submit', handleRegister))
  }

  return () => cleanupFns.forEach((fn) => fn())
}

function initCarSlider() {
  const list = document.getElementById('carList')
  const prevBtn = document.getElementById('prevCar')
  const nextBtn = document.getElementById('nextCar')

  if (!list || !prevBtn || !nextBtn) {
    return () => {}
  }

  let currentIndex = 0

  const renderCars = () => {
    const cards = []
    for (let i = 0; i < CARS_PER_VIEW; i += 1) {
      const car = CAR_SLIDER_ITEMS[(currentIndex + i) % CAR_SLIDER_ITEMS.length]
      cards.push(`
        <div class="col-md-4">
          <div class="car-card">
            <img src="${car.img}" alt="${car.name}">
            <div class="car-info">
              <h5>${car.name}</h5>
              <p>${car.price}</p>
              <a href="#" class="btn-cta">Xem chi tiết</a>
            </div>
          </div>
        </div>
      `)
    }
    list.innerHTML = cards.join('')
  }

  const handlePrev = () => {
    currentIndex = (currentIndex - CARS_PER_VIEW + CAR_SLIDER_ITEMS.length) % CAR_SLIDER_ITEMS.length
    renderCars()
  }

  const handleNext = () => {
    currentIndex = (currentIndex + CARS_PER_VIEW) % CAR_SLIDER_ITEMS.length
    renderCars()
  }

  prevBtn.addEventListener('click', handlePrev)
  nextBtn.addEventListener('click', handleNext)
  renderCars()

  const intervalId = window.setInterval(() => {
    currentIndex = (currentIndex + 1) % CAR_SLIDER_ITEMS.length
    renderCars()
  }, CAR_SLIDE_INTERVAL)

  return () => {
    prevBtn.removeEventListener('click', handlePrev)
    nextBtn.removeEventListener('click', handleNext)
    window.clearInterval(intervalId)
  }
}

function initCarSearchAutocomplete() {
  const input = document.getElementById('carSearch')
  const dropdown = document.getElementById('carDropdown')
  const wrapper = document.getElementById('carSearchWrapper')

  if (!input || !dropdown || !wrapper) {
    return () => {}
  }

  const renderDropdown = (keyword) => {
    dropdown.innerHTML = ''
    if (!keyword) {
      dropdown.style.display = 'none'
      return
    }

    const normalized = keyword.toLowerCase()
    const suggestions = VEHICLE_SUGGESTIONS.filter((vehicle) =>
      vehicle.name.toLowerCase().includes(normalized) || vehicle.brand.toLowerCase().includes(normalized)
    )

    suggestions.slice(0, 5).forEach((vehicle) => {
      const item = document.createElement('li')
      item.classList.add('list-group-item')
      item.textContent = `${vehicle.name} • ${vehicle.price}`
      item.addEventListener('click', () => {
        input.value = vehicle.name
        dropdown.style.display = 'none'
      })
      dropdown.appendChild(item)
    })

    dropdown.style.display = suggestions.length > 0 ? 'block' : 'none'
  }

  const handleInput = (event) => {
    renderDropdown(event.target.value.trim())
  }

  const handleClickOutside = (event) => {
    if (!wrapper.contains(event.target)) {
      dropdown.style.display = 'none'
    }
  }

  input.addEventListener('input', handleInput)
  document.addEventListener('click', handleClickOutside)

  return () => {
    input.removeEventListener('input', handleInput)
    document.removeEventListener('click', handleClickOutside)
  }
}

function initContactForm() {
  const form = document.getElementById('contactForm')
  const submitBtn = document.getElementById('submitBtn')
  const btnText = document.getElementById('btnText')
  const loadingSpinner = document.getElementById('loadingSpinner')
  const successAlert = document.getElementById('alertSuccess')
  const errorAlert = document.getElementById('alertError')
  const errorMessage = document.getElementById('errorMessage')
  const messageField = document.getElementById('message')
  const charCount = document.getElementById('charCount')

  if (!form || !submitBtn || !btnText || !loadingSpinner) {
    return () => {}
  }

  const timeouts = []

  const updateCharCount = () => {
    if (charCount && messageField) {
      charCount.textContent = String(messageField.value.length)
    }
  }

  if (messageField && charCount) {
    messageField.addEventListener('input', updateCharCount)
  }
  updateCharCount()

  const setLoading = (isLoading) => {
    submitBtn.disabled = isLoading
    btnText.classList.toggle('d-none', isLoading)
    loadingSpinner.classList.toggle('d-none', !isLoading)
  }

  const toggleAlert = (element, shouldShow) => {
    if (element) {
      element.classList.toggle('d-none', !shouldShow)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    const now = Date.now()
    const lastSubmit = Number(localStorage.getItem('lastSubmitTime') || '0')
    if (lastSubmit && now - lastSubmit < SUBMIT_COOLDOWN_MS) {
      if (errorMessage) {
        errorMessage.textContent = 'Bạn vừa gửi yêu cầu, vui lòng chờ ít phút trước khi gửi lại.'
      }
      toggleAlert(errorAlert, true)
      return
    }

    toggleAlert(errorAlert, false)
    toggleAlert(successAlert, false)
    setLoading(true)

    const requestTimeout = window.setTimeout(() => {
      setLoading(false)
      localStorage.setItem('lastSubmitTime', String(now))
      form.reset()
      form.classList.remove('was-validated')
      updateCharCount()
      toggleAlert(successAlert, true)

      const hideSuccessTimeout = window.setTimeout(() => toggleAlert(successAlert, false), 2500)
      timeouts.push(hideSuccessTimeout)

      const modalEl = document.getElementById('bookingModal')
      if (modalEl && window.bootstrap) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl) ?? window.bootstrap.Modal.getOrCreateInstance(modalEl)
        modalInstance.hide()
      }
    }, 1000)

    timeouts.push(requestTimeout)
  }

  form.addEventListener('submit', handleSubmit)

  return () => {
    form.removeEventListener('submit', handleSubmit)
    if (messageField && charCount) {
      messageField.removeEventListener('input', updateCharCount)
    }
    timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
  }
}

export function initHomeInteractions() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }

  const teardowns = [
    initTheme(),
    initBackToTop(),
    initAuthForms(),
    initCarSlider(),
    initCarSearchAutocomplete(),
    initContactForm()
  ]

  return () => {
    teardowns.forEach((teardown) => {
      if (typeof teardown === 'function') {
        teardown()
      }
    })
  }
}
