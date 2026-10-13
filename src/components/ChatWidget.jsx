import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { tanyaDospem } from '../lib/ai.js'
import { animateSpring, springTransform, SPRING } from '../lib/spring.js'

const NAMA_ASISTEN = 'Asisten Magang'
const SUBTITLE_ASISTEN = 'Online'
const GREETING = 'Hai, aku Asisten Magang disini. Tanya apa aja deh soal kegiatan mahasiswa. Tapi jangan tanya yang lain yaa wkwk'
const KEY_RIWAYAT = 'mbsi-chat-riwayat'
const COOLDOWN_NORMAL = 5
const COOLDOWN_RATE_LIMIT = 30
/* Cache jawaban AI di server — samakan dengan TTL_JAWABAN di api/ai/chat.js */
const CACHE_MENIT = 30
const SARAN = [
  'Siapa yang paling sering bolos?',
  'Ringkas kegiatan mahasiswa minggu ini',
  'Mahasiswa mana yang paling produktif?'
]

function IkonChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function IkonClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function IkonSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
/* spring-bubble-masuk-v1: bubble chat masuk dengan animasi spring.
   Overshoot terasa jelas (±6%), durasi settle ~400ms. Hanya jalan sekali
   per mount (pakai flag sudah.current) supaya bubble lama yang dirender
   ulang (karena typing animasi) tidak ikut mantul berkali-kali. */
function BubbleSpring(props) {
  const ref = useRef(null)
  const sudah = useRef(false)
  useEffect(function () {
    if (sudah.current || !ref.current) return undefined
    sudah.current = true
    const el = ref.current
    const yStart = props.dariUser ? 24 : 20
    el.__springVal = { scale: 0.94, x: 0, y: yStart }
    el.style.opacity = '0'
    void el.offsetWidth
    el.style.opacity = '1'
    const cancel = springTransform(el, { scale: 1, y: 0 }, { preset: SPRING.bubble })
    return function () { if (cancel) cancel() }
  }, [])
  return (
    <div
      ref={ref}
      style={{ willChange: 'transform, opacity' }}
      className={'chat-widget-bubble ' + (props.dariUser ? 'chat-widget-bubble-user' : 'chat-widget-bubble-ai')}
    >
      {props.children}
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [riwayat, setRiwayat] = useState(function () {
    try { return JSON.parse(sessionStorage.getItem(KEY_RIWAYAT) || '[]') } catch (e) { return [] }
  })

  /* typewriter-v1: balasan AI muncul ketik demi ketik.
     - textYangDitampilkan: peta index-bubble → substring yang saat
       ini ditampilkan. Kalau bubble tidak ada di peta, artinya
       tampilkan teks penuh (tidak dianimasikan).
     - Kalau user kirim pesan baru di tengah animasi, semua animasi
       aktif di-skip (bubble langsung tampil penuh) supaya tidak
       ada teks yang nyangkut di tengah.
     - Bubble dari riwayat (sessionStorage) TIDAK dianimasikan,
       langsung tampil penuh saat halaman dibuka. */
  const [teksTampil, setTeksTampil] = useState({})
  /* typewriter-skip-riwayat-v1: ref di-init null lalu lazy-init di body
     komponen. Saat mount pertama (atau refresh browser), semua bubble
     yang sudah ada di riwayat — dimuat dari sessionStorage — ditandai
     "selesai", supaya TIDAK ikut dianimasikan typewriter. Yang
     dianimasikan hanya bubble assistant baru dari API.

     Kenapa lazy-init di body, bukan di useEffect:
     - useEffect jalan SETELAH commit + paint, sedangkan effect
       typewriter juga di useEffect. Urutan antar effect bergantung
       urutan deklarasi, rapuh.
     - Lazy-init di body memastikan ref sudah terisi SEBELUM render
       pertama commit, jadi effect typewriter pasti lihat map yang
       sudah siap. */
  const animasiRef = useRef(null)
  if (animasiRef.current === null) {
    const mapAwal = {}
    for (let i = 0; i < riwayat.length; i++) mapAwal[i] = 'selesai'
    animasiRef.current = mapAwal
  }
  /* lock-while-typing-v1: true selama animasi typewriter berjalan.
     Dipakai untuk lock input & tombol kirim supaya user tidak bisa
     kirim pesan baru saat AI masih mengetik. */
  const [sedangMengetik, setSedangMengetik] = useState(false)

  /* spring-trigger-v1: ref untuk menyimpan jumlah bubble terakhir.
     Dipakai untuk membedakan "pesan baru ditambahkan" (mau mantulan)
     vs "typewriter update karakter" (jangan mantulan). */
  const panjangRiwayatRef = useRef(riwayat.length)

  useEffect(function () {
    /* Cari bubble assistant terakhir yang belum tuntas animasinya. */
    const idxTarget = riwayat.length - 1
    if (idxTarget < 0) return undefined
    const target = riwayat[idxTarget]
    if (!target || target.role !== 'assistant') return undefined
    /* Kalau sudah pernah dianimasikan atau sudah penuh, skip. */
    if (animasiRef.current[idxTarget] === 'selesai') return undefined
    if (teksTampil[idxTarget] === target.content) return undefined

    animasiRef.current[idxTarget] = 'jalan'
    setSedangMengetik(true)

    let i = teksTampil[idxTarget] ? teksTampil[idxTarget].length : 0
    const teks = target.content
    const iv = setInterval(function () {
      i += 1
      if (i >= teks.length) {
        clearInterval(iv)
        animasiRef.current[idxTarget] = 'selesai'
        setSedangMengetik(false)
        setTeksTampil(function (prev) {
          const next = Object.assign({}, prev)
          delete next[idxTarget]
          return next
        })
        return
      }
      setTeksTampil(function (prev) {
        const next = Object.assign({}, prev)
        next[idxTarget] = teks.slice(0, i)
        return next
      })
    }, 18)

    return function () { clearInterval(iv) }
  }, [riwayat])

  /* Fungsi untuk memaksa semua animasi yang masih jalan jadi penuh.
     Dipanggil di kirim() supaya user tidak lihat teks "nyangkut". */
  function tuntaskanAnimasi() {
    const keys = Object.keys(animasiRef.current)
    if (!keys.length) return
    const penuh = {}
    keys.forEach(function (k) { animasiRef.current[k] = 'selesai' })
    setTeksTampil(penuh)
    setSedangMengetik(false)
  }
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  /* typingDelay: true hanya setelah 500ms sejak user kirim. */
  const [typingDelay, setTypingDelay] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  /* fix-yank-bottom-v1: autoScroll disimpan sebagai ref (bukan state)
     supaya tidak memicu re-render + useLayoutEffect. Sebelumnya
     state ini ada di deps useLayoutEffect, sehingga saat user
     scroll mendekati bawah (jarak <80px), ref berubah true dan
     efek langsung snap scrollTop ke scrollHeight. */
  const autoScrollRef = useRef(true)
  const refScroll = useRef(null)
  const refWrap = useRef(null)            /* wrapper translateY untuk mantulan */
  const panelRef = useRef(null)
  const fabRef = useRef(null)
  /* smooth-scroll-v1: handle requestAnimationFrame untuk animasi scroll
     manual. Kalau ada scroll baru, animasi lama di-cancel supaya tidak
     tabrakan. */
  const scrollAnimRef = useRef(null)

  useEffect(function () {
    try { sessionStorage.setItem(KEY_RIWAYAT, JSON.stringify(riwayat)) } catch (e) {}
  }, [riwayat])

  /* body-lock-instant-v1: cegah halaman belakang ikut scroll saat panel
     chat terbuka di mobile, dan restore posisi scroll dengan benar
     saat panel ditutup.

     Perbaikan dari v2:
     1. State lock disimpan di ref (`bodyLockRef`). Kalau effect re-run
        karena React Strict Mode (dev) atau HMR, scrollY TIDAK di-capture
        ulang — jadi tidak salah ambil nilai 0 saat body sudah fixed.
     2. scrollTo pakai `behavior: 'instant'` untuk bypass CSS
        `scroll-behavior: smooth`. Sebelumnya halaman terlihat "meluncur"
        dari atas ke posisi user selama fade-out panel.
     3. Safety net di unmount supaya body tidak tetap terkunci kalau
        ChatWidget unmount saat chat masih terbuka. */
  const bodyLockRef = useRef({ aktif: false, scrollY: 0 })

  useEffect(function () {
    if (typeof window === 'undefined') return undefined
    if (!window.matchMedia('(max-width: 640px)').matches) return undefined

    const body = document.body
    const lock = bodyLockRef.current

    if (open) {
      /* Jangan re-capture kalau sudah terkunci — ini mencegah
         Strict Mode / HMR / re-render apapun mengubah target restore. */
      if (lock.aktif) return undefined
      lock.scrollY = window.scrollY || document.documentElement.scrollTop || 0
      lock.aktif = true

      body.style.position = 'fixed'
      body.style.top = '-' + lock.scrollY + 'px'
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'
      body.style.overflow = 'hidden'
    } else {
      /* Unlock */
      if (!lock.aktif) return undefined
      lock.aktif = false

      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''
      body.style.overflow = ''

      const target = lock.scrollY
      lock.scrollY = 0
      if (target > 0) {
        requestAnimationFrame(function () {
          /* behavior instant: bypass `html { scroll-behavior: smooth }`
             supaya tidak terlihat meluncur dari atas ke posisi target. */
          try {
            window.scrollTo({ top: target, left: 0, behavior: 'instant' })
          } catch (e) {
            window.scrollTo(0, target)
          }
        })
      }
    }

    return undefined
  }, [open])

  /* Safety net: kalau ChatWidget unmount saat chat terbuka (mis. user
     pindah rute), paksa unlock supaya body tidak tetap terkunci. */
  useEffect(function () {
    return function () {
      const lock = bodyLockRef.current
      if (!lock.aktif) return
      lock.aktif = false
      const body = document.body
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''
      body.style.overflow = ''
      if (lock.scrollY > 0) {
        try {
          window.scrollTo({ top: lock.scrollY, left: 0, behavior: 'instant' })
        } catch (e) {
          window.scrollTo(0, lock.scrollY)
        }
      }
    }
  }, [])

  /* smooth-scroll-v1 + scroll-ease-telegram-v1: animasi scroll manual pakai
     requestAnimationFrame dengan easing out-expo halus ala Telegram.
     Lebih smooth dari native `behavior: smooth` yang bisa tumpang tindih
     saat dipanggil cepat (typewriter update tiap 18ms). */
  /* scroll-spring-v3: mantulan visual dengan translateY wrapper.
   Alur:
   1. scrollTop langsung di-set ke bawah (konten baru masuk viewport).
   2. wrapper di-set translateY = +NAIK_AWAL (konten kelihatan "turun" sejenak).
   3. spring simulasi menurunkan translateY ke 0 — dengan overshoot natural
      ke nilai negatif, konten kelihatan "naik lewat sedikit" lalu mantul
      balik ke 0.
   Kenapa ini bekerja padahal scrollTop spring tidak? Karena browser
   meng-clamp scrollTop ke [0, scrollHeight - clientHeight], jadi overshoot
   tidak pernah kelihatan. translateY bebas — bisa negatif, bisa positif. */
function springScrollBottom(container, wrapper, opsi) {
  if (!container || !wrapper) return
  const opsiAman = opsi || {}
  const NAIK_AWAL = opsiAman.naikAwal == null ? 40 : opsiAman.naikAwal

  /* Kunci scrollTop di bawah duluan, biar konten baru masuk viewport */
  container.scrollTop = container.scrollHeight

  /* Hormati prefers-reduced-motion */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    wrapper.style.transform = 'translateY(0)'
    return
  }

  /* Cancel animasi lama kalau ada */
  if (scrollAnimRef.current) {
    cancelAnimationFrame(scrollAnimRef.current)
    scrollAnimRef.current = null
  }

  /* ===== Parameter spring fisik =====
     ζ = DAMPING / (2·√(STIFFNESS·MASS)) = 14 / (2·√170) ≈ 0.54
     → overshoot halus ~12-15% dari NAIK_AWAL, mantul 2 kali. */
  const STIFFNESS = 170
  const DAMPING = 14
  const MASS = 1

  let posisi = NAIK_AWAL
  let kecepatan = 0
  let frameTerakhir = performance.now()

  wrapper.style.transform = 'translateY(' + posisi + 'px)'

  const POSISI_EPS = 0.1
  const KECEPATAN_EPS = 0.1

  function step(now) {
    let dt = (now - frameTerakhir) / 1000
    if (dt > 0.05) dt = 0.05
    frameTerakhir = now

    const gayaSpring = -STIFFNESS * posisi
    const gayaRedam = -DAMPING * kecepatan
    const percepatan = (gayaSpring + gayaRedam) / MASS

    kecepatan += percepatan * dt
    posisi += kecepatan * dt

    if (!isFinite(posisi) || !isFinite(kecepatan)) {
      wrapper.style.transform = 'translateY(0)'
      scrollAnimRef.current = null
      return
    }

    wrapper.style.transform = 'translateY(' + posisi + 'px)'

    if (Math.abs(posisi) < POSISI_EPS && Math.abs(kecepatan) < KECEPATAN_EPS) {
      wrapper.style.transform = 'translateY(0)'
      scrollAnimRef.current = null
      return
    }

    scrollAnimRef.current = requestAnimationFrame(step)
  }

  scrollAnimRef.current = requestAnimationFrame(step)
}

  useLayoutEffect(function () {
    if (!open) return
    if (!autoScrollRef.current) return
    const container = refScroll.current
    const wrapper = refWrap.current
    if (!container || !wrapper) return

    /* Deteksi apakah bubble baru muncul sejak render terakhir.
       Kalau iya → mantulan spring. Kalau tidak (cuma typewriter update
       karakter di bubble yang sudah ada) → scrollTop instan saja. */
    const panjangSekarang = riwayat.length
    const adaPesanBaru = panjangSekarang !== panjangRiwayatRef.current
    panjangRiwayatRef.current = panjangSekarang

    /* Dua rAF: rAF pertama tunggu React commit, rAF kedua tunggu layout
       final (font loading, gambar thumb, dsb) sebelum hitung scrollHeight. */
    let raf2 = null
    const raf1 = requestAnimationFrame(function () {
      raf2 = requestAnimationFrame(function () {
        if (adaPesanBaru) {
          springScrollBottom(container, wrapper, { naikAwal: 40 })
        } else {
          const target = container.scrollHeight - container.clientHeight
          if (Math.abs(container.scrollTop - target) > 2) {
            container.scrollTop = target
          }
        }
      })
    })
    return function () {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [riwayat, busy, typingDelay, error, open])

  /* Cleanup: cancel animasi scroll kalau komponen unmount */
  useEffect(function () {
    return function () {
      if (scrollAnimRef.current) {
        scrollAnimRef.current()
        scrollAnimRef.current = null
      }
    }
  }, [])

  /* Deteksi user scroll manual pakai wheel/touchmove saja.
     Sebelumnya pakai onScroll yang kena trigger oleh auto-scroll
     programatik, sehingga bisa buat loop autoScroll nyala-mati. */
  function onWheelBody() {
    const el = refScroll.current
    if (!el) return
    const jarak = el.scrollHeight - el.scrollTop - el.clientHeight
    autoScrollRef.current = jarak < 80
  }

  useEffect(function () {
    if (cooldown <= 0) return undefined
    const t = setTimeout(function () {
      setCooldown(function (c) { return Math.max(0, c - 1) })
    }, 1000)
    return function () { clearTimeout(t) }
  }, [cooldown])

  useEffect(function () { if (input) setError('') }, [input])

  async function kirim(teksOverride) {
    const teks = (teksOverride != null ? teksOverride : input).trim()
    if (!teks || busy || cooldown > 0) return
    tuntaskanAnimasi()
    setBusy(true)
    setError('')
    const riwayatLama = riwayat
    setRiwayat(riwayatLama.concat([{ role: 'user', content: teks }]))
    setInput('')
    autoScrollRef.current = true

    /* min-bubble-delay-v1: jeda minimal 1 detik antara momen user kirim
       dan momen bubble AI muncul. Kalau API balas lebih cepat dari 1 detik
       (cache hit, Groq cepat), tahan dulu. Kalau lebih lambat, tampil
       begitu jawaban datang.

       Efeknya: typing indicator yang muncul di 1000ms tidak pernah
       "loncat" langsung ke bubble AI — selalu ada momen typing yang
       kelihatan, minimal sekejap. Konsisten baik jawaban fresh maupun cached. */
    const DELAY_MINIMAL = 2000
    const waktuMulai = Date.now()

    const timerTyping = setTimeout(function () { setTypingDelay(true) }, DELAY_MINIMAL)

    try {
      const r = await tanyaDospem(teks, riwayatLama)
      const jawaban = String(r.jawaban || '').trim() || 'Maaf, tidak ada jawaban.'

      const sisa = DELAY_MINIMAL - (Date.now() - waktuMulai)
      if (sisa > 0) {
        await new Promise(function (resolve) { setTimeout(resolve, sisa) })
      }

      setRiwayat(function (prev) {
        const idxBaru = prev.length
        animasiRef.current[idxBaru] = 'jalan'
        setTeksTampil(function (t) {
          const next = Object.assign({}, t)
          next[idxBaru] = ''
          return next
        })
        return prev.concat([{ role: 'assistant', content: jawaban }])
      })

      setCooldown(COOLDOWN_NORMAL)
    } catch (err) {
      const pesan = err.message || 'Gagal memanggil AI'
      const rateLimit = /terlalu banyak|rate limit|sibuk|429/i.test(pesan)
      setError(rateLimit ? 'Server AI sedang sibuk. Tunggu ' + COOLDOWN_RATE_LIMIT + ' detik, lalu coba lagi.' : pesan)
      setCooldown(rateLimit ? COOLDOWN_RATE_LIMIT : COOLDOWN_NORMAL)
      setRiwayat(riwayatLama)
      setInput(teks)
    }
    clearTimeout(timerTyping)
    setTypingDelay(false)
    setBusy(false)
  }
  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (cooldown > 0) return
      kirim()
    }
  }

  function reset() {
    if (busy) return
    setRiwayat([])
    setError('')
    setCooldown(0)
    try { sessionStorage.removeItem(KEY_RIWAYAT) } catch (e) {}
  }

  /* spring-panel-buka-tutup-v1: panel buka dengan overshoot kecil (mantul
     halus), tutup langsung ke target tanpa mantul. Di mobile (< 640px) panel
     full-screen — spring scale tetap dijalankan karena amplitudonya kecil
     (±4%) dan tidak mengganggu layout full-screen. */
  useEffect(function () {
    const el = panelRef.current
    if (!el) return undefined
    el.style.transform = ''
    if (open) {
      el.__springVal = { scale: 0.92, x: 0, y: 16 }
      const cancel = springTransform(el, { scale: 1, y: 0 }, { preset: SPRING.panel })
      return function () { if (cancel) cancel() }
    }
    el.__springVal = { scale: 1, x: 0, y: 0 }
    const cancel = springTransform(el, { scale: 0.92, y: 16 }, { preset: SPRING.overlay })
    return function () { if (cancel) cancel() }
  }, [open])

  /* spring-fab-v1: FAB menekan → mengecil dengan spring, melepas → membesar
     kembali dengan mantul halus. resetTransform dipakai supaya tidak numpuk
     dengan nilai scale dari animasi sebelumnya. */
  function onFabDown() {
    if (!fabRef.current) return
    fabRef.current.__springVal = { scale: fabRef.current.__springVal ? fabRef.current.__springVal.scale : 1, x: 0, y: 0 }
    springTransform(fabRef.current, { scale: 0.9 }, { preset: SPRING.tap })
  }
  function onFabUp() {
    if (!fabRef.current) return
    springTransform(fabRef.current, { scale: 1 }, { preset: SPRING.tap })
  }

  const terkunci = busy || cooldown > 0 || sedangMengetik
  const bubble = riwayat.length ? riwayat : [{ role: 'assistant', content: GREETING }]

  const placeholder = typingDelay
    ? 'Sedang menganalisis...'
    : busy
      ? 'Menunggu respon...'
    : sedangMengetik
      ? 'Tunggu respon selesai...'
      : cooldown > 0
        ? 'Tunggu ' + cooldown + ' detik sebelum kirim lagi'
        : 'Tulis pertanyaan...'

  return (
    <>
      <div ref={panelRef} className={'chat-widget-panel' + (open ? ' chat-widget-panel-buka' : '')} role="dialog" aria-hidden={!open}>
        <header className="chat-widget-header">
          <span className="chat-widget-avatar" aria-hidden="true">
            <img className='rounded-full' src="avatar-asisten-magang.jpeg" alt="avatar-asisten-magang" />
            {/* <IkonChat /> */}
          </span>
          <div className="chat-widget-title">
            <p className="chat-widget-title-line">{NAMA_ASISTEN}</p>
            <p className="chat-widget-sub">
              <span className="chat-widget-dot-inline" />
              {SUBTITLE_ASISTEN}
            </p>
          </div>
          <button type="button" className="chat-widget-close" onClick={function () { setOpen(false) }} title="Tutup" aria-label="Tutup chat">
            <IkonClose />
          </button>
        </header>

        <div ref={refScroll} className="chat-widget-body" onWheel={onWheelBody}
          onTouchMove={onWheelBody}>
          <div ref={refWrap} className="chat-widget-wrap">
          {bubble.map(function (m, i) {
            const dariUser = m.role === 'user'
            /* typewriter-v1: kalau bubble ini sedang dianimasikan,
               tampilkan substring dari teksTampil. Kalau tidak,
               tampilkan teks penuh (bubble lama, riwayat, user). */
            const teksRender = !dariUser && teksTampil[i] != null ? teksTampil[i] : m.content
            const keyBubble = dariUser ? 'u-' + i : 'a-' + i
            return (
              <div key={keyBubble} className={'chat-widget-row ' + (dariUser ? 'chat-widget-row-user' : '')}>
                <BubbleSpring dariUser={dariUser}>
                  {teksRender}
                </BubbleSpring>
              </div>
            )
          })}

          {!riwayat.length && !input ? (
            <div className="chat-widget-saran">
              {SARAN.map(function (s) {
                return (
                  <button key={s} type="button" onClick={function () { kirim(s) }} disabled={terkunci} className="chat-widget-saran-btn">
                    {s}
                  </button>
                )
              })}
            </div>
          ) : null}

          {typingDelay ? (
            <div className="chat-widget-row">
              <div className="chat-widget-typing" role="status" aria-label="Sedang menganalisis">
                <span className="chat-widget-typing-dot" />
                <span className="chat-widget-typing-dot" />
                <span className="chat-widget-typing-dot" />
              </div>
            </div>
          ) : null}

          {error ? <div className="chat-widget-error">{error}</div> : null}
          </div>{/* tutup .chat-widget-wrap */}
        </div>{/* tutup .chat-widget-body */}

        <footer className="chat-widget-footer">
          <div className="chat-widget-input-row">
            <div className="chat-widget-input-wrap">
              <textarea
                className="chat-widget-input"
                rows={1}
                value={input}
                onChange={function (e) { setInput(e.target.value) }}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                disabled={terkunci}
              />
            </div>
            <button
              type="button"
              className="chat-widget-send"
              onClick={function () { kirim() }}
              disabled={terkunci || !input.trim()}
              title={cooldown > 0 ? 'Tunggu ' + cooldown + ' detik' : 'Kirim'}
              aria-label="Kirim"
            >
              {cooldown > 0 ? String(cooldown) : <IkonSend />}
            </button>
          </div>
{riwayat.length ? (
            <p className="chat-widget-catatan chat-widget-catatan-satu-baris">
              <button type="button" onClick={reset} className="chat-widget-reset chat-widget-reset-pill">Mulai ulang</button>
              <span className="chat-widget-info-cache">Data AI diperbarui setiap {CACHE_MENIT} menit</span>
            </p>
          ) : (
            <p className="chat-widget-catatan">Data AI diperbarui setiap {CACHE_MENIT} menit</p>
          )}
        </footer>
      </div>

      <button
        ref={fabRef}
        type="button"
        className={'chat-widget-fab' + (open ? ' chat-widget-fab-buka' : '')}
        onClick={function () { setOpen(function (o) { return !o }) }}
        onPointerDown={onFabDown}
        onPointerUp={onFabUp}
        onPointerCancel={onFabUp}
        onPointerLeave={onFabUp}
        aria-label={open ? 'Tutup chat' : 'Buka chat'}
        title={open ? 'Tutup chat' : 'Tanya asisten'}
      >
        <span className="chat-widget-fab-icon">
          {open ? <IkonClose /> : <img className='rounded-full' src="avatar-asisten-magang.jpeg" alt="avatar-asisten-magang" />}
        </span>
        {!open ? <span className="chat-widget-dot" /> : null}
      </button>
    </>
  )
}
