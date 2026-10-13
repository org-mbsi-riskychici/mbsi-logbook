/* ============================================================
 * spring.js — simulasi spring fisik untuk animasi UI
 *
 * Bukan easing kurva biasa. Ini simulasi massa-pegas-redaman:
 *   F = -k·x - c·v
 * dengan:
 *   k = stiffness (kekakuan, makin besar = makin cepat ditarik)
 *   c = damping   (redaman, makin besar = makin cepat reda)
 *   m = mass      (makin besar = makin berat / lambat start)
 *
 * Rasio redaman ζ = c / (2·√(k·m)) menentukan karakter:
 *   ζ < 1  → underdamped  (overshoot + mantul, "hidup")
 *   ζ = 1  → critical     (settle cepat tanpa overshoot)
 *   ζ > 1  → overdamped   (lambat, "kenyal")
 *
 * Rekomendasi nilai:
 *   ζ ≈ 0.55–0.65 → overshoot 8–14%, 1–2 mantul, ala Telegram ✅
 *   ζ ≈ 0.75–0.85 → overshoot 2–5%, hampir tidak kelihatan mantul
 *   ζ ≥ 1         → tidak mantul
 *
 * Contoh kombinasi "Telegram feel":
 *   STIFFNESS = 200, DAMPING = 18, MASS = 1  → ζ ≈ 0.64
 *   STIFFNESS = 170, DAMPING = 22, MASS = 1  → ζ ≈ 0.84 (nyaris tidak mantul)
 * ============================================================ */
import { useEffect, useRef } from 'react'

/* Preset siap pakai. Sesuaikan sesuai kebutuhan. */
export const SPRING = {
  /* Scroll auto-bottom ChatWidget: overshoot kecil, mantul 1-2 kali */
  scroll:   { stiffness: 200, damping: 18, mass: 1 },
  /* FAB menekan / melepas: ringan, cepat, mantul halus */
  tap:      { stiffness: 420, damping: 22, mass: 0.7 },
  /* Panel buka / tutup: mantul sedikit, terasa "hidup" */
  panel:    { stiffness: 260, damping: 20, mass: 1 },
  /* Bubble masuk: overshoot terlihat jelas tapi tidak berlebihan */
  bubble:   { stiffness: 320, damping: 20, mass: 0.9 },
  /* Overlay / modal: cepat, nyaris tidak mantul */
  overlay:  { stiffness: 340, damping: 30, mass: 1 },
}

/* Hitung ζ dari parameter spring. Berguna untuk debugging / tuning. */
export function dampingRatio({ stiffness, damping, mass }) {
  return damping / (2 * Math.sqrt(stiffness * mass))
}

/* ============================================================
 * animateSpring(el, onTick, opts)
 * Framework-agnostic. Menggerakkan nilai dari `dari` ke `ke`,
 * memanggil `onTick(nilai)` setiap frame sampai settle.
 *
 * Return: fungsi cancel() untuk menghentikan animasi.
 * ============================================================ */
export function animateSpring(el, onTick, opts) {
  const dari = Number(opts.dari) || 0
  const ke = Number(opts.ke) || 0
  const stiffness = opts.stiffness ?? SPRING.scroll.stiffness
  const damping = opts.damping ?? SPRING.scroll.damping
  const mass = opts.mass ?? SPRING.scroll.mass
  const POSISI_EPS = opts.posisiEps ?? 0.5
  const KECEPATAN_EPS = opts.kecepatanEps ?? 0.5
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced || Math.abs(ke - dari) < 0.01) {
    onTick(ke)
    return function () {}
  }

  let posisi = dari
  let kecepatan = opts.kecepatanAwal || 0
  let frameTerakhir = performance.now()
  let raf = null
  let batal = false

  function step(now) {
    if (batal) return
    let dt = (now - frameTerakhir) / 1000
    if (dt > 0.05) dt = 0.05
    frameTerakhir = now

    const selisih = posisi - ke
    const gayaSpring = -stiffness * selisih
    const gayaRedam = -damping * kecepatan
    const percepatan = (gayaSpring + gayaRedam) / mass

    kecepatan += percepatan * dt
    posisi += kecepatan * dt

    if (!isFinite(posisi) || !isFinite(kecepatan)) {
      onTick(ke)
      raf = null
      return
    }

    onTick(posisi)

    if (
      Math.abs(posisi - ke) < POSISI_EPS &&
      Math.abs(kecepatan) < KECEPATAN_EPS
    ) {
      onTick(ke)
      raf = null
      return
    }

    raf = requestAnimationFrame(step)
  }

  raf = requestAnimationFrame(step)

  return function cancel() {
    batal = true
    if (raf) cancelAnimationFrame(raf)
    raf = null
  }
}

/* ============================================================
 * useSpring — hook React untuk animasi spring pada state.
 * ============================================================ */
export function useSpring(opts) {
  const cancelRef = useRef(null)
  const lastValueRef = useRef(0)

  useEffect(function () {
    return function () {
      if (cancelRef.current) cancelRef.current()
    }
  }, [])

  function to(el, target, onTick) {
    if (!el) return
    if (cancelRef.current) cancelRef.current()
    const dari = lastValueRef.current
    cancelRef.current = animateSpring(
      el,
      function (v) {
        lastValueRef.current = v
        if (onTick) onTick(v)
      },
      Object.assign({}, opts, { dari: dari, ke: target })
    )
  }

  function cancel() {
    if (cancelRef.current) cancelRef.current()
    cancelRef.current = null
  }

  return { to, cancel }
}

/* ============================================================
 * springTransform — animasi transform CSS pakai spring.
 * Menyimpan nilai scale,x,y di cache per elemen (el.__springVal).
 *
 * Contoh:
 *   springTransform(el, { scale: 1.08 }, { preset: SPRING.tap })
 * ============================================================ */
export function springTransform(el, target, opts) {
  if (!el) return
  const preset = (opts && opts.preset) || SPRING.tap
  const prev = el.__springVal || { scale: 1, x: 0, y: 0 }
  const keys = Object.keys(target)
  const start = Object.assign({}, prev)
  const end = Object.assign({}, prev, target)

  const runners = keys.map(function (k) {
    let val = start[k]
    let vel = 0
    const goal = end[k]
    let last = performance.now()
    return {
      key: k,
      get() { return val },
      step(now) {
        let dt = (now - last) / 1000
        if (dt > 0.05) dt = 0.05
        last = now
        const force = -preset.stiffness * (val - goal) - preset.damping * vel
        const acc = force / preset.mass
        vel += acc * dt
        val += vel * dt
        return Math.abs(val - goal) < 0.001 && Math.abs(vel) < 0.001
      },
    }
  })

  let raf = null
  let batal = false

  function loop(now) {
    if (batal) return
    let semuaSelesai = true
    runners.forEach(function (r) {
      if (!r.step(now)) semuaSelesai = false
    })
    const out = { scale: 1, x: 0, y: 0 }
    runners.forEach(function (r) { out[r.key] = r.get() })
    el.style.transform =
      'translate(' + out.x + 'px,' + out.y + 'px) scale(' + out.scale + ')'
    if (semuaSelesai) {
      el.__springVal = end
      raf = null
      if (opts && opts.onSettle) opts.onSettle()
      return
    }
    raf = requestAnimationFrame(loop)
  }

  el.__springVal = start
  raf = requestAnimationFrame(loop)

  return function cancel() {
    batal = true
    if (raf) cancelAnimationFrame(raf)
  }
}
