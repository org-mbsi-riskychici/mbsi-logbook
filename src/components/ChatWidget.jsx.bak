import { useEffect, useRef, useState } from 'react'
import { tanyaDospem } from '../lib/ai.js'
import { TitikAnim } from './ui.jsx'

const NAMA_ASISTEN = 'Konseling Online'
const SUBTITLE_ASISTEN = 'Asisten Magang BSI \u2014 online'
const GREETING = 'Halo! Saya asisten portal magang BSI. Tanya apa saja soal kegiatan tim, kehadiran, atau dokumentasi. Bisa ketik atau rekam suara.'
const KEY_RIWAYAT = 'mbsi-chat-riwayat'
const SARAN = [
  'Siapa yang paling sering bolos?',
  'Ringkas kegiatan tim minggu ini',
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
function IkonMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17" aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
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
  const [listening, setListening] = useState(false)
  const [micSupported, setMicSupported] = useState(false)
  const refScroll = useRef(null)
  const refRecognition = useRef(null)

  useEffect(function () {
    try { sessionStorage.setItem(KEY_RIWAYAT, JSON.stringify(riwayat)) } catch (e) {}
  }, [riwayat])

  useEffect(function () {
    if (open && refScroll.current) {
      refScroll.current.scrollTop = refScroll.current.scrollHeight
    }
  }, [riwayat, busy, open])

  useEffect(function () {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SR) return undefined
    setMicSupported(true)
    const rec = new SR()
    rec.lang = 'id-ID'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = function (e) {
      const teks = e.results[0][0].transcript
      setInput(function (prev) { return (prev ? prev + ' ' : '') + teks })
    }
    rec.onend = function () { setListening(false) }
    rec.onerror = function () { setListening(false) }
    refRecognition.current = rec
    return function () { try { rec.abort() } catch (e) {} }
  }, [])

  useEffect(function () { if (input) setError('') }, [input])

  async function kirim(teksOverride) {
    const teks = (teksOverride != null ? teksOverride : input).trim()
    if (!teks || busy) return
    setBusy(true)
    setError('')
    const riwayatLama = riwayat
    setRiwayat(riwayatLama.concat([{ role: 'user', content: teks }]))
    setInput('')
    try {
      const r = await tanyaDospem(teks, riwayatLama)
      const jawaban = String(r.jawaban || '').trim() || 'Maaf, tidak ada jawaban.'
      setRiwayat(function (prev) { return prev.concat([{ role: 'assistant', content: jawaban }]) })
    } catch (err) {
      setError(err.message || 'Gagal memanggil AI')
      setRiwayat(riwayatLama)
      setInput(teks)
    }
    setBusy(false)
  }

  function toggleMic() {
    const rec = refRecognition.current
    if (!rec) return
    if (listening) {
      try { rec.stop() } catch (e) {}
      setListening(false)
    } else {
      try { rec.start(); setListening(true) } catch (e) { setListening(false) }
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      kirim()
    }
  }

  function reset() {
    if (busy) return
    setRiwayat([])
    setError('')
    try { sessionStorage.removeItem(KEY_RIWAYAT) } catch (e) {}
  }

  const bubble = riwayat.length ? riwayat : [{ role: 'assistant', content: GREETING }]

  return (
    <>
      <div className={'chat-widget-panel' + (open ? ' chat-widget-panel-buka' : '')} role="dialog" aria-hidden={!open}>
        <header className="chat-widget-header">
          <span className="chat-widget-avatar" aria-hidden="true">
            <IkonChat />
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

        <div ref={refScroll} className="chat-widget-body">
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

          {!riwayat.length ? (
            <div className="chat-widget-saran">
              {SARAN.map(function (s) {
                return (
                  <button key={s} type="button" onClick={function () { kirim(s) }} disabled={busy} className="chat-widget-saran-btn">
                    {s}
                  </button>
                )
              })}
            </div>
          ) : null}

          {busy ? (
            <div className="chat-widget-row">
              <div className="chat-widget-bubble chat-widget-bubble-ai">
                <span className="inline-flex items-center gap-1">
                  <span>Sedang menganalisis</span>
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
              placeholder="Tulis pertanyaan..."
              disabled={busy}
            />
            {micSupported ? (
              <button
                type="button"
                className={'chat-widget-mic' + (listening ? ' chat-widget-mic-aktif' : '')}
                onClick={toggleMic}
                title={listening ? 'Hentikan rekaman' : 'Rekam suara'}
                aria-label="Rekam suara"
                disabled={busy}
              >
                <IkonMic />
              </button>
            ) : null}
            <button
              type="button"
              className="chat-widget-send"
              onClick={function () { kirim() }}
              disabled={busy || !input.trim()}
              title="Kirim"
              aria-label="Kirim"
            >
              <IkonSend />
            </button>
          </div>
          {riwayat.length ? (
            <p className="chat-widget-catatan">
              <button type="button" onClick={reset} className="chat-widget-reset">Mulai ulang percakapan</button>
            </p>
          ) : (
            <p className="chat-widget-catatan">Jawaban berdasarkan data publik tim.</p>
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
