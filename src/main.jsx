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
    function sembunyikan() { track.classList.remove('aktif') }
    function tampilkan() {
      track.classList.add('aktif')
      if (timer) clearTimeout(timer)
      timer = setTimeout(sembunyikan, 900)
    }
    function ukur(el, adalahWindow, rect) {
      const scrollTop = adalahWindow ? (window.scrollY || document.documentElement.scrollTop) : el.scrollTop
      const scrollHeight = adalahWindow ? document.documentElement.scrollHeight : el.scrollHeight
      const clientHeight = adalahWindow ? window.innerHeight : el.clientHeight
      const selisih = scrollHeight - clientHeight
      if (selisih <= 4) { sembunyikan(); return }
      const ratio = clientHeight / scrollHeight
      const trackTinggi = rect.height - 8
      const thumbTinggi = Math.max(36, trackTinggi * ratio)
      const maxTop = trackTinggi - thumbTinggi
      let gerak = scrollTop / selisih
      if (gerak < 0) gerak = 0
      if (gerak > 1) gerak = 1
      thumb.style.height = thumbTinggi + 'px'
      thumb.style.transform = 'translateY(' + (4 + gerak * maxTop) + 'px)'
      track.style.top = rect.top + 'px'
      track.style.height = rect.height + 'px'
      track.style.right = (window.innerWidth - rect.right + 3) + 'px'
    }
    function onScroll(e) {
      const t = e.target
      if (t === document || t === document.documentElement || t === window || !t || t.nodeType !== 1) {
        ukur(null, true, { top: 0, height: window.innerHeight, right: window.innerWidth })
      } else {
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
