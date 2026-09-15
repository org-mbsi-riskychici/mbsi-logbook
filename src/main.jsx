import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

/* ===== Indikator scrollbar auto hide, overlay tanpa menggeser layout ===== */
;(function () {
  if (typeof document === 'undefined') return
  function pasang() {
    if (document.getElementById('scroll-indicator')) return
    const track = document.createElement('div')
    track.id = 'scroll-indicator'
    const thumb = document.createElement('div')
    thumb.id = 'scroll-thumb'
    track.appendChild(thumb)
    document.body.appendChild(track)
    let timer = null
    let sumber = null
    let watchdog = null
    function stopWatchdog() {
      if (watchdog) { clearInterval(watchdog); watchdog = null }
    }
    function mulaiWatchdog() {
      if (watchdog) return
      watchdog = setInterval(function () {
        if (!track.classList.contains('aktif')) { stopWatchdog(); return }
        if (sumber) {
          if (!sumber.isConnected || sumber.scrollHeight - sumber.clientHeight <= 4) {
            sembunyikan()
            sumber = null
            stopWatchdog()
          }
        } else if (document.documentElement.scrollHeight - window.innerHeight <= 4) {
          sembunyikan()
          stopWatchdog()
        }
      }, 90)
    }
    function sembunyikan() { track.classList.remove('aktif'); stopWatchdog() }
    function tampilkan() {
      track.classList.add('aktif')
      if (timer) clearTimeout(timer)
      timer = setTimeout(sembunyikan, 400)
      mulaiWatchdog()
    }
    function ukur(el, adalahWindow, rect) {
      const scrollTop = adalahWindow ? (window.scrollY || document.documentElement.scrollTop) : el.scrollTop
      const scrollHeight = adalahWindow ? document.documentElement.scrollHeight : el.scrollHeight
      const clientHeight = adalahWindow ? window.innerHeight : el.clientHeight
      const selisih = scrollHeight - clientHeight
      if (selisih <= 4) { sembunyikan(); return }
      const ratio = clientHeight / scrollHeight
      const trackTinggi = rect.height - 6
      const thumbTinggi = Math.max(24, trackTinggi * ratio)
      const maxTop = trackTinggi - thumbTinggi
      let gerak = scrollTop / selisih
      if (gerak < 0) gerak = 0
      if (gerak > 1) gerak = 1
      thumb.style.height = thumbTinggi + 'px'
      thumb.style.transform = 'translateY(' + (3 + gerak * maxTop) + 'px)'
      track.style.top = rect.top + 'px'
      track.style.height = rect.height + 'px'
      track.style.right = (window.innerWidth - rect.right + 2) + 'px'
    }
    function onScroll(e) {
      const t = e.target
      if (t === document || t === document.documentElement || t === window || !t || t.nodeType !== 1) {
        sumber = null
        ukur(null, true, { top: 0, height: window.innerHeight, right: window.innerWidth })
      } else {
        sumber = t
        const r = t.getBoundingClientRect()
        ukur(t, false, { top: r.top, height: r.height, right: r.right })
      }
      tampilkan()
    }
    window.addEventListener('scroll', onScroll, true)
    document.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', sembunyikan)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang)
  else pasang()
})()

/* ===== Pergeseran mulus isi filter saat mode waktu berganti (bayangan keluar plus FLIP) ===== */
;(function () {
  if (typeof document === 'undefined') return
  function pasang() {
    document.addEventListener('click', function (e) {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const tombol = e.target && e.target.closest ? e.target.closest('.time-toggle button') : null
      if (!tombol) return
      if ((' ' + tombol.className + ' ').indexOf(' active ') !== -1) return
      const toggle = tombol.closest('.time-toggle')
      if (!toggle || !toggle.parentElement) return
      const wadah = tombol.closest('.rounded-3xl') || toggle.parentElement.parentElement || toggle.parentElement
      const cabang = toggle.parentElement.querySelector('.anim-ganti-bulan, .anim-ganti-rentang')
      if (cabang) {
        const r = cabang.getBoundingClientRect()
        if (r.width > 0) {
          const hantu = cabang.cloneNode(true)
          hantu.style.position = 'fixed'
          hantu.style.left = r.left + 'px'
          hantu.style.top = r.top + 'px'
          hantu.style.width = r.width + 'px'
          hantu.style.height = r.height + 'px'
          hantu.style.margin = '0'
          hantu.style.zIndex = '45'
          hantu.classList.add('hantu-cabang')
          document.body.appendChild(hantu)
          hantu.style.animation = 'none'
          const turunan = hantu.querySelectorAll('*')
          for (let i = 0; i < turunan.length; i++) turunan[i].style.animation = 'none'
          const keBulan = !tombol.previousElementSibling
          if (hantu.animate) {
            hantu.animate([
              { opacity: 1, transform: 'translateX(0)' },
              { opacity: 0, transform: keBulan ? 'translateX(10px)' : 'translateX(-10px)' }
            ], { duration: 180, easing: 'ease-in' }).onfinish = function () { if (hantu.parentNode) hantu.parentNode.removeChild(hantu) }
          } else {
            setTimeout(function () { if (hantu.parentNode) hantu.parentNode.removeChild(hantu) }, 200)
          }
        }
      }
      const snap = new Map()
      const els = wadah.querySelectorAll('*')
      for (let i = 0; i < els.length; i++) snap.set(els[i], els[i].getBoundingClientRect())
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          snap.forEach(function (rect, el) {
            if (!el.isConnected || !el.animate) return
            const r = el.getBoundingClientRect()
            const dx = rect.left - r.left
            const dy = rect.top - r.top
            if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return
            el.animate([
              { transform: 'translate(' + dx + 'px, ' + dy + 'px)' },
              { transform: 'translate(0, 0)' }
            ], { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
          })
        })
      })
    }, true)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang)
  else pasang()
})()

/* ===== transisi-halaman-v1: picu ulang animasi saat pindah rute dan pindah halaman pagination ===== */
;(function () {
  if (typeof document === 'undefined') return
  function ulangAnimasi(el) {
    if (!el) return
    el.style.animation = 'none'
    void el.offsetWidth
    el.style.animation = ''
  }
  function pasang() {
    document.addEventListener('click', function (e) {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const t = e.target
      if (!t || !t.closest) return
      const link = t.closest('a[href]')
      if (link) {
        const href = link.getAttribute('href') || ''
        const eksternal = link.target === '_blank' || href.indexOf('http') === 0 || href.indexOf('#') === 0
        if (!eksternal) {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              ulangAnimasi(document.querySelector('main.anim-page') || document.querySelector('.anim-page'))
            })
          })
        }
        return
      }
      const pag = t.closest('.mt-8.flex.flex-wrap.items-center.justify-center.gap-2')
      if (pag && t.closest('button')) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            const grid = document.querySelectorAll('.grid-pusat, .grid-pusat-rapat, .kartu-grid')
            for (let i = 0; i < grid.length; i++) {
              const anak = grid[i].children
              for (let j = 0; j < anak.length; j++) ulangAnimasi(anak[j])
            }
          })
        })
      }
    }, true)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang)
  else pasang()
})()

/* ===== transisi-tema: aktifkan transisi pelan hanya pada momen pergantian mode ===== */
;(function () {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const akar = document.documentElement
  let gelap = akar.classList.contains('dark')
  let timer = null
  const obs = new MutationObserver(function () {
    const sekarang = akar.classList.contains('dark')
    if (sekarang === gelap) return
    gelap = sekarang
    if (document.startViewTransition) return
    akar.classList.add('theme-transition')
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () { akar.classList.remove('theme-transition') }, 400)
  })
  obs.observe(akar, { attributes: true, attributeFilter: ['class'] })
})()
