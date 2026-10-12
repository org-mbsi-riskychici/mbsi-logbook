import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { tanyaDospem } from '../lib/ai.js'
import { TitikAnim } from './ui.jsx'

const NAMA_ASISTEN = 'Asisten Magang'
const SUBTITLE_ASISTEN = 'Online'
const GREETING = 'Hai, aku Asisten Magang disini. Tanya apa aja deh soal kegiatan mahasiswa. Tapi jangan tanya yang lain yaa wkwk'
const KEY_RIWAYAT = 'mbsi-chat-riwayat'
const COOLDOWN_NORMAL = 5
const COOLDOWN_RATE_LIMIT = 30
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
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [autoScroll, setAutoScroll] = useState(true)
  const refScroll = useRef(null)

  useEffect(function () {
    try { sessionStorage.setItem(KEY_RIWAYAT, JSON.stringify(riwayat)) } catch (e) {}
  }, [riwayat])

  useLayoutEffect(function () {
    if (!open) return
    const el = refScroll.current
    if (!el || !autoScroll) return
    requestAnimationFrame(function () {
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [riwayat, busy, error, open, autoScroll])

  /* Deteksi user scroll manual pakai wheel/touchmove saja.
     Sebelumnya pakai onScroll yang kena trigger oleh auto-scroll
     programatik, sehingga bisa buat loop autoScroll nyala-mati. */
  function onWheelBody() {
    const el = refScroll.current
    if (!el) return
    const jarak = el.scrollHeight - el.scrollTop - el.clientHeight
    setAutoScroll(jarak < 80)
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
    setBusy(true)
    setError('')
    const riwayatLama = riwayat
    setRiwayat(riwayatLama.concat([{ role: 'user', content: teks }]))
    setInput('')
    setAutoScroll(true)

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

  const terkunci = busy || cooldown > 0
  const bubble = riwayat.length ? riwayat : [{ role: 'assistant', content: GREETING }]

  const placeholder = busy
    ? 'Sedang menganalisis...'
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
            return (
              <div key={i} className={'chat-widget-row ' + (dariUser ? 'chat-widget-row-user' : '')}>
                <div className={'chat-widget-bubble ' + (dariUser ? 'chat-widget-bubble-user' : 'chat-widget-bubble-ai')}>
                  {m.content}
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
              <div className="chat-widget-bubble chat-widget-bubble-ai">
                <span className="inline-flex items-center">
                  <span></span>
                  <TitikAnim />
                </span>
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
            <p className="chat-widget-catatan">
              <button type="button" onClick={reset} className="chat-widget-reset">Mulai ulang percakapan</button>
            </p>
          ) : (
            <p className="chat-widget-catatan">Jawaban berdasarkan data portal.</p>
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
          {open ? <IkonClose /> : <IkonChat />}
        </span>
        {!open ? <span className="chat-widget-dot" /> : null}
      </button>
    </>
  )
}
