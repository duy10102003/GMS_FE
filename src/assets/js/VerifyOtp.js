const PARTICLE_COLORS = ['#FF7A00', '#9D4EDD', '#00D9FF', '#FF6B9D']
const PARTICLE_COUNT = 35
const SHOOTING_STAR_INTERVAL = 2500
const SHOOTING_STAR_LIFETIME = 5000
const OTP_LENGTH = 6
const VERIFY_DELAY_MS = 1500
const SUCCESS_REDIRECT_DELAY = 2000
const RESEND_COUNTDOWN_SECONDS = 30

function createParticles(container) {
  if (!container) return () => {}
  const created = []

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const particle = document.createElement('div')
    particle.className = 'particle'
    particle.style.left = `${Math.random() * 100}%`
    const size = Math.random() * 5 + 2
    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    particle.style.animationDuration = `${Math.random() * 12 + 18}s`
    particle.style.animationDelay = `${Math.random() * 6}s`
    particle.style.background = `radial-gradient(circle, ${PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]}, transparent)`
    container.appendChild(particle)
    created.push(particle)
  }

  return () => {
    created.forEach((node) => node.remove())
  }
}

function createShootingStars(container, timeouts, intervals) {
  if (!container) return
  const intervalId = window.setInterval(() => {
    const star = document.createElement('div')
    star.className = 'star'
    star.style.left = `${Math.random() * 100}%`
    star.style.top = `${Math.random() * 50}%`
    star.style.animationDuration = `${Math.random() * 2 + 3}s`
    container.appendChild(star)
    const removalTimeout = window.setTimeout(() => star.remove(), SHOOTING_STAR_LIFETIME)
    timeouts.push(removalTimeout)
  }, SHOOTING_STAR_INTERVAL)
  intervals.push(intervalId)
}

function setupOtpInputs(otpInputs, errorMessage) {
  if (!otpInputs.length) return () => {}
  const listeners = []

  const focusFirstTimeout = window.setTimeout(() => {
    otpInputs[0].focus()
  }, 0)

  const hideError = () => {
    errorMessage?.classList.remove('show')
  }

  otpInputs.forEach((input, index) => {
    const handleInput = (event) => {
      const { value } = event.target
      if (!/^\d*$/.test(value)) {
        event.target.value = ''
        return
      }
      if (value) {
        input.classList.add('filled')
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus()
        }
      } else {
        input.classList.remove('filled')
      }
      hideError()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Backspace' && !input.value && index > 0) {
        const previous = otpInputs[index - 1]
        previous.value = ''
        previous.classList.remove('filled')
        previous.focus()
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        otpInputs[index - 1].focus()
      }
      if (event.key === 'ArrowRight' && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus()
      }
    }

    const handlePaste = (event) => {
      event.preventDefault()
      const paste = event.clipboardData.getData('text').slice(0, OTP_LENGTH)
      if (!/^\d+$/.test(paste)) return
      paste.split('').forEach((char, idx) => {
        if (otpInputs[idx]) {
          otpInputs[idx].value = char
          otpInputs[idx].classList.add('filled')
        }
      })
      otpInputs[Math.min(paste.length, OTP_LENGTH - 1)].focus()
      hideError()
    }

    input.addEventListener('input', handleInput)
    input.addEventListener('keydown', handleKeyDown)
    input.addEventListener('paste', handlePaste)

    listeners.push(() => {
      input.removeEventListener('input', handleInput)
      input.removeEventListener('keydown', handleKeyDown)
      input.removeEventListener('paste', handlePaste)
    })
  })

  return () => {
    window.clearTimeout(focusFirstTimeout)
    listeners.forEach((remove) => remove())
  }
}

function getOtpValue(inputs) {
  return inputs.map((input) => input.value).join('')
}

function createCountdown(resendLink, intervals, baseText = 'Gửi lại') {
  return (seconds) => {
    if (!resendLink) return
    let remaining = seconds
    resendLink.textContent = `${baseText} (${remaining}s)`
    const intervalId = window.setInterval(() => {
      remaining -= 1
      if (remaining >= 0) {
        resendLink.textContent = `${baseText} (${remaining}s)`
      }
      if (remaining < 0) {
        window.clearInterval(intervalId)
        resendLink.textContent = baseText
        resendLink.classList.remove('disabled')
      }
    }, 1000)
    intervals.push(intervalId)
  }
}

function showError(errorMessage, message) {
  if (!errorMessage) return
  const span = errorMessage.querySelector('span')
  if (span) {
    span.textContent = message
  }
  errorMessage.classList.add('show')
  window.setTimeout(() => errorMessage.classList.remove('show'), 3500)
}

function showSuccess(successOverlay) {
  if (successOverlay) {
    successOverlay.classList.add('show')
  }
}

function runVerify(options, otp, timeouts) {
  if (typeof options.onVerify === 'function') {
    return Promise.resolve(options.onVerify({ email: options.email || '', otp }))
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      if (otp === '123456') {
        resolve()
      } else {
        reject(new Error('Mã OTP không chính xác. Vui lòng thử lại.'))
      }
    }, VERIFY_DELAY_MS)
    timeouts.push(timeout)
  })
}

function runResend(options, timeouts) {
  if (typeof options.onResend === 'function') {
    return Promise.resolve(options.onResend({ email: options.email || '' }))
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      window.alert(`Mã OTP mới đã được gửi đến ${options.email || 'user@example.com'}`)
      resolve()
    }, VERIFY_DELAY_MS)
    timeouts.push(timeout)
  })
}

export function initVerifyOtpPage(rootEl, options = {}) {
  if (typeof window === 'undefined' || !rootEl) {
    return () => {}
  }

  const cleanupFns = []
  const intervals = []
  const timeouts = []

  const particlesCleanup = createParticles(rootEl.querySelector('#particles'))
  cleanupFns.push(particlesCleanup)
  createShootingStars(rootEl.querySelector('#shootingStars'), timeouts, intervals)

  const otpInputs = Array.from(rootEl.querySelectorAll('.otp-inputs input'))
  const verifyBtn = rootEl.querySelector('#verifyBtn')
  const resendLink = rootEl.querySelector('#resendLink')
  const errorMessage = rootEl.querySelector('#errorMessage')
  const successOverlay = rootEl.querySelector('#successOverlay')
  const emailDisplay = rootEl.querySelector('#emailDisplay')
  const otpForm = rootEl.querySelector('#otpForm')
  const verifyBtnDefaultText = verifyBtn?.textContent?.trim() || 'Xác nhận'
  const resendLinkDefaultText = resendLink?.textContent?.trim() || 'Gửi lại'

  if (emailDisplay) {
    emailDisplay.textContent = options.email || 'user@example.com'
  }

  cleanupFns.push(setupOtpInputs(otpInputs, errorMessage))
  const startCountdown = createCountdown(
    resendLink,
    intervals,
    options.resendLabel || resendLinkDefaultText
  )

  const resetInputs = () => {
    otpInputs.forEach((input) => {
      input.value = ''
      input.classList.remove('filled')
    })
    if (otpInputs[0]) {
      otpInputs[0].focus()
    }
  }

  const finishVerify = (mode) => {
    showSuccess(successOverlay)
    const timeout = window.setTimeout(() => {
      if (typeof options.onSuccessRedirect === 'function') {
        options.onSuccessRedirect(mode)
      }
    }, SUCCESS_REDIRECT_DELAY)
    timeouts.push(timeout)
  }

  const setVerifyingState = () => {
    if (!verifyBtn) return
    verifyBtn.classList.add('loading')
    verifyBtn.textContent = ''
    verifyBtn.disabled = true
  }

  const resetVerifyButton = () => {
    if (!verifyBtn) return
    verifyBtn.classList.remove('loading')
    verifyBtn.textContent = verifyBtnDefaultText
    verifyBtn.disabled = false
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!verifyBtn) return

    const otp = getOtpValue(otpInputs)
    if (otp.length !== OTP_LENGTH) {
      showError(errorMessage, options.lengthErrorMessage || 'Vui lòng nhập đủ 6 số OTP')
      return
    }

    setVerifyingState()
    try {
      await runVerify(options, otp, timeouts)
      finishVerify(options.mode || 'login')
    } catch (error) {
      showError(errorMessage, error?.message || 'Mã OTP không chính xác. Vui lòng thử lại.')
      resetInputs()
      resetVerifyButton()
    }
  }

  const handleResend = async (event) => {
    event.preventDefault()
    if (!resendLink || resendLink.classList.contains('disabled')) {
      return
    }
    resendLink.classList.add('disabled')
    resendLink.textContent = options.resendLoadingText || 'Đang gửi...'

    try {
      await runResend(options, timeouts)
      startCountdown(options.resendCountdownSeconds || RESEND_COUNTDOWN_SECONDS)
    } catch (error) {
      showError(errorMessage, error?.message || 'Không thể gửi lại OTP lúc này.')
      resendLink.classList.remove('disabled')
      resendLink.textContent = resendLinkDefaultText
      return
    }
  }

  if (otpForm) {
    otpForm.addEventListener('submit', handleSubmit)
    cleanupFns.push(() => otpForm.removeEventListener('submit', handleSubmit))
  }

  if (resendLink) {
    resendLink.addEventListener('click', handleResend)
    cleanupFns.push(() => resendLink.removeEventListener('click', handleResend))
  }

  return () => {
    cleanupFns.forEach((fn) => {
      if (typeof fn === 'function') {
        fn()
      }
    })
    intervals.forEach((intervalId) => window.clearInterval(intervalId))
    timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
  }
}
