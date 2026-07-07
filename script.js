// ============ Preloader ============
;(function initPreloader() {
  const preloader = document.getElementById('preloader')
  const num = document.getElementById('preloader-num')
  if (!preloader || !num) return

  let count = 0
  const interval = setInterval(() => {
    count = Math.min(100, count + Math.ceil(Math.random() * 9))
    num.textContent = String(count)
    if (count >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        preloader.classList.add('done')
        setTimeout(() => preloader.remove(), 1000)
      }, 350)
    }
  }, 55)
})()

// ============ Custom cursor ============
;(function initCursor() {
  const fine = window.matchMedia('(pointer: fine)')
  if (!fine.matches) return

  const dot = document.getElementById('cursor-dot')
  const ring = document.getElementById('cursor-ring')
  if (!dot || !ring) return

  let mouseX = -100
  let mouseY = -100
  let ringX = -100
  let ringY = -100

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
    dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`
    const target = e.target
    const isPointer =
      target instanceof Element &&
      !!target.closest('a, button, [role="button"], [data-cursor="pointer"]')
    ring.classList.toggle('is-pointer', isPointer)
  })

  function animateRing() {
    // Spring-like smoothing (lerp)
    ringX += (mouseX - ringX) * 0.16
    ringY += (mouseY - ringY) * 0.16
    const half = ring.offsetWidth / 2
    ring.style.transform = `translate(${ringX - half}px, ${ringY - half}px)`
    requestAnimationFrame(animateRing)
  }
  animateRing()
})()

// ============ Marquee items ============
;(function initMarquee() {
  const track = document.getElementById('marquee-track')
  if (!track) return

  const items = [
    'Лендинги',
    'Интернет-магазины',
    'Сайты под ключ',
    'Дизайн',
    'Анимации',
    'Портфолио',
    'Бизнес-сайты',
    'Редизайн',
  ]

  // Duplicate the row for a seamless loop
  const row = items.concat(items)
  const fragment = document.createDocumentFragment()
  row.forEach((item) => {
    const span = document.createElement('span')
    span.className = 'marquee-item'
    span.textContent = item
    const dotEl = document.createElement('span')
    dotEl.className = 'marquee-dot'
    dotEl.setAttribute('aria-hidden', 'true')
    span.appendChild(dotEl)
    fragment.appendChild(span)
  })
  track.appendChild(fragment)
})()

// ============ Scroll reveals (IntersectionObserver) ============
;(function initReveals() {
  const revealEls = document.querySelectorAll('[data-reveal]')
  if (!revealEls.length) return

  // Stagger cards and stats like the original (index-based delay)
  document.querySelectorAll('[data-reveal="card"]').forEach((el, i) => {
    el.style.setProperty('--rd', `${(i % 2) * 0.12}s`)
  })
  document.querySelectorAll('[data-reveal="stat"]').forEach((el, i) => {
    el.style.setProperty('--rd', `${i * 0.1}s`)
  })

  // For masked lines, the translated element is clipped by overflow:hidden,
  // so the observer must watch a visible wrapper instead of the line itself.
  const targetToReveal = new Map()
  revealEls.forEach((el) => {
    const isLine = el.getAttribute('data-reveal') === 'line'
    const target = isLine ? el.closest('.line-mask') || el : el
    if (!targetToReveal.has(target)) targetToReveal.set(target, [])
    targetToReveal.get(target).push(el)
  })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const els = targetToReveal.get(entry.target) || []
          els.forEach((el) => el.classList.add('in-view'))
          observer.unobserve(entry.target)
        }
      })
    },
    { rootMargin: '-60px 0px' }
  )

  targetToReveal.forEach((_, target) => observer.observe(target))
})()

// ============ Hero parallax on scroll ============
;(function initHeroParallax() {
  const content = document.getElementById('hero-content')
  if (!content) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (reduced.matches) return

  let ticking = false

  function update() {
    const scrollY = window.scrollY
    const vh = window.innerHeight
    const progress = Math.min(1, Math.max(0, scrollY / vh))
    const y = progress * 220
    const opacity = Math.max(0, 1 - progress / 0.8)
    content.style.transform = `translateY(${y}px)`
    content.style.opacity = String(opacity)
    ticking = false
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    },
    { passive: true }
  )
})()

// ============ About: word-by-word reveal on scroll ============
;(function initWordReveal() {
  const container = document.getElementById('about-words')
  if (!container) return

  // Split text into word spans
  const text = container.textContent.trim()
  const words = text.split(/\s+/)
  container.textContent = ''
  const fragment = document.createDocumentFragment()
  words.forEach((word) => {
    const span = document.createElement('span')
    span.className = 'word'
    span.textContent = word
    fragment.appendChild(span)
  })
  container.appendChild(fragment)

  const wordEls = container.querySelectorAll('.word')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (reduced.matches) {
    wordEls.forEach((el) => (el.style.opacity = '1'))
    return
  }

  let ticking = false

  function update() {
    const rect = container.getBoundingClientRect()
    const vh = window.innerHeight
    // Progress: 0 when container top is at 85% of viewport, 1 at 35%
    const start = vh * 0.85
    const end = vh * 0.35
    const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)))

    wordEls.forEach((el, i) => {
      const wordStart = i / wordEls.length
      const wordEnd = wordStart + 1 / wordEls.length
      const local = Math.min(1, Math.max(0, (progress - wordStart) / (wordEnd - wordStart)))
      el.style.opacity = String(0.15 + local * 0.85)
    })
    ticking = false
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    },
    { passive: true }
  )
  update()
})()
