import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { tanyaDospem } from '../lib/ai.js'

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
  const animasiRef = useRef({})
  /* lock-while-typing-v1: true selama animasi typewriter berjalan.
     Dipakai untuk lock input & tombol kirim supaya user tidak bisa
     kirim pesan baru saat AI masih mengetik. */
  const [sedangMengetik, setSedangMengetik] = useState(false)

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
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  /* fix-yank-bottom-v1: autoScroll disimpan sebagai ref (bukan state)
     supaya tidak memicu re-render + useLayoutEffect. Sebelumnya
     state ini ada di deps useLayoutEffect, sehingga saat user
     scroll mendekati bawah (jarak <80px), ref berubah true dan
     efek langsung snap scrollTop ke scrollHeight. */
  const autoScrollRef = useRef(true)
  const refScroll = useRef(null)

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

  useLayoutEffect(function () {
    if (!open) return
    if (!autoScrollRef.current) return
    const el = refScroll.current
    if (!el) return
    requestAnimationFrame(function () {
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [riwayat, busy, error, open])

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

    try {
      const r = await tanyaDospem(teks, riwayatLama)
      const jawaban = String(r.jawaban || '').trim() || 'Maaf, tidak ada jawaban.'
      setRiwayat(function (prev) { return prev.concat([{ role: 'assistant', content: jawaban }]) })
      setCooldown(COOLDOWN_NORMAL)
    } catch (err) {
      const pesan = err.message || 'Gagal memanggil AI'
      const rateLimit = /terlalu banyak|rate limit|sibuk|429/i.test(pesan)
      setError(rateLimit ? 'Server AI sedang sibuk. Tunggu ' + COOLDOWN_RATE_LIMIT + ' detik, lalu coba lagi.' : pesan)
      setCooldown(rateLimit ? COOLDOWN_RATE_LIMIT : COOLDOWN_NORMAL)
      setRiwayat(riwayatLama)
      setInput(teks)
    }
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

  const terkunci = busy || cooldown > 0 || sedangMengetik
  const bubble = riwayat.length ? riwayat : [{ role: 'assistant', content: GREETING }]

  const placeholder = busy
    ? 'Sedang menganalisis...'
    : sedangMengetik
      ? 'Tunggu respon selesai...'
      : cooldown > 0
        ? 'Tunggu ' + cooldown + ' detik sebelum kirim lagi'
        : 'Tulis pertanyaan...'

  return (
    <>
      <div className={'chat-widget-panel' + (open ? ' chat-widget-panel-buka' : '')} role="dialog" aria-hidden={!open}>
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
          {bubble.map(function (m, i) {
            const dariUser = m.role === 'user'
            /* typewriter-v1: kalau bubble ini sedang dianimasikan,
               tampilkan substring dari teksTampil. Kalau tidak,
               tampilkan teks penuh (bubble lama, riwayat, user). */
            const teksRender = !dariUser && teksTampil[i] != null ? teksTampil[i] : m.content
            return (
              <div key={i} className={'chat-widget-row ' + (dariUser ? 'chat-widget-row-user' : '')}>
                <div className={'chat-widget-bubble ' + (dariUser ? 'chat-widget-bubble-user' : 'chat-widget-bubble-ai')}>
                  {teksRender}
                </div>
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

          {busy ? (
            <div className="chat-widget-row">
              <div className="chat-widget-typing" role="status" aria-label="Sedang menganalisis">
                <span className="chat-widget-typing-dot" />
                <span className="chat-widget-typing-dot" />
                <span className="chat-widget-typing-dot" />
              </div>
            </div>
          ) : null}

          {error ? <div className="chat-widget-error">{error}</div> : null}
        </div>

        <footer className="chat-widget-footer">
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
        type="button"
        className={'chat-widget-fab' + (open ? ' chat-widget-fab-buka' : '')}
        onClick={function () { setOpen(function (o) { return !o }) }}
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
