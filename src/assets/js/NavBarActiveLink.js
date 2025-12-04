export function initNavBarActiveLink(root = document) {
  if (typeof window === 'undefined' || !root) {
    return () => {}
  }

  const links = Array.from(root.querySelectorAll('.nav-link'))
  const handleClick = function handleClick(event) {
    links.forEach((item) => item.classList.remove('active'))
    this.classList.add('active')
  }

  links.forEach((link) => link.addEventListener('click', handleClick))

  return () => {
    links.forEach((link) => link.removeEventListener('click', handleClick))
  }
}

export function confirmLogout(callback) {
  if (
    window.confirm('Dang xuat khoi he thong quan ly?')
  ) {
    document.body.style.transition = 'opacity 0.3s ease'
    document.body.style.opacity = '0'
    window.setTimeout(() => {
      window.alert('Da dang xuat thanh cong!')
      if (typeof callback === 'function') {
        callback()
      }
    }, 500)
  }
}
