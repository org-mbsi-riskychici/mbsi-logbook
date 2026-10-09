import { useEffect, useRef, useState } from 'react'
import { tanyaDospem } from '../lib/ai.js'
import { SizedIcon } from './icons.jsx'
import { TitikAnim } from './ui.jsx'

const MAKS_HARIAN = 30
const KEY_KUOTA = 'mbsi-dospem-chat-kuota'

const SARAN = [
  'Siapa yang paling sering bolos?',
  'Ringkas kegiatan setiap mahasiswa minggu ini',
  'Berapa total logbook publik yang sudah dibagikan?',
  'Mahasiswa mana yang paling produktif?'
]

function ambilKuota() {
  const hari = new Date().toISOString().slice(0, 10)
  try {
    const raw = localStorage.getItem(KEY_KUOTA)
    if (!raw) return { hari: hari, dipakai: 0 }
    const d = JSON.parse(raw)
    if (d.hari !== hari) return { hari: hari, dipakai: 0 }
    return { hari: d.hari, dipakai: Number(d.dipakai) || 0 }
  } catch (e) {
    return { hari: hari, dipakai: 0 }
  }
}

function simpanKuota(dipakai) {
  try {
    localStorage.setItem(KEY_KUOTA, JSON.stringify({
      hari: new Date().toISOString().slice(0, 10),
      dipakai: dipakai
    }))
  } catch (e) {}
}

export default function DospemChat() {
  const [riwayat, setRiwayat] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [kuota, setKuota] = useState(function () { return ambilKuota() })
  const refScroll = useRef(null)

  useEffect(function () {
    if (refScroll.current) {
      refScroll.current.scrollTop = refScroll.current.scrollHeight
    }
  }, [riwayat, busy])

  const sisa = Math.max(0, MAKS_HARIAN - kuota.dipakai)
  const habis = sisa <= 0

  async function kirim(teksOverride) {
    const teks = (teksOverride != null ? teksOverride : input).trim()
    if (!teks || busy) return
    if (habis) {
      setError('Kuota pertanyaan harian sudah habis. Coba lagi besok.')
      return
    }

    setBusy(true)
    setError('')
    const riwayatLama = riwayat
    const riwayatBaru = riwayatLama.concat([{ role: 'user', content: teks }])
    setRiwayat(riwayatBaru)
    setInput('')

    try {
      const r = await tanyaDospem(teks, riwayatLama)
      const jawaban = String(r.jawaban || '').trim() || 'Maaf, tidak ada jawaban yang dihasilkan.'
      setRiwayat(function (prev) { return prev.concat([{ role: 'assistant', content: jawaban }]) })
      const baru = kuota.dipakai + 1
      setKuota({ hari: kuota.hari, dipakai: baru })
      simpanKuota(baru)
    } catch (err) {
      setError(err.message || 'Gagal memanggil AI')
      setRiwayat(riwayatLama)
      setInput(teks)
    }
    setBusy(false)
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
  }

  return (
    <section className="mt-10 rounded-[2rem] bsi-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bsi-50 text-bsi-800">
            <SizedIcon name="list" size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-base font-black text-slate-900">Tanya tentang Tim</p>
            <p className="mt-0.5 text-xs text-slate-500">Ajukan pertanyaan soal progress magang, saya jawab dari data halaman ini.</p>
          </div>
        </div>
        {riwayat.length ? (
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Mulai Ulang
          </button>
        ) : null}
      </div>

      <div ref={refScroll} className="max-h-[420px] overflow-y-auto px-5 py-5 sm:px-8 sm:py-6 space-y-4">
        {!riwayat.length ? (
          <div>
            <p className="text-sm text-slate-600">Contoh pertanyaan yang bisa kamu tanyakan:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SARAN.map(function (s) {
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={function () { kirim(s) }}
                    disabled={busy || habis}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-bsi-300 hover:bg-bsi-50 hover:text-bsi-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {riwayat.map(function (m, i) {
          const dariUser = m.role === 'user'
          return (
            <div key={i} className={'flex ' + (dariUser ? 'justify-end' : 'justify-start')}>
              <div className={
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ' +
                (dariUser
                  ? 'bg-bsi-800 text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-100 rounded-bl-md')
              }>
                {m.content}
              </div>
            </div>
          )
        })}

        {busy ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <span className="inline-flex items-center gap-1">
                <span>Sedang menganalisis</span>
                <TitikAnim />
              </span>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex justify-center">
            <p className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-100 px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex items-end gap-2">
          <textarea
            className="flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-bsi-500 disabled:opacity-50"
            rows={1}
            value={input}
            onChange={function (e) { setInput(e.target.value) }}
            onKeyDown={onKeyDown}
            placeholder={habis ? 'Kuota harian habis, coba lagi besok.' : 'Ketik pertanyaan... (Enter untuk kirim)'}
            disabled={busy || habis}
          />
          <button
            type="button"
            onClick={function () { kirim() }}
            disabled={busy || habis || !input.trim()}
            className="shrink-0 rounded-2xl bg-bsi-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-bsi-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? '...' : 'Kirim'}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Sisa pertanyaan hari ini: <strong>{sisa}</strong> dari {MAKS_HARIAN}. Jawaban berdasarkan data publik tim.
        </p>
      </div>
    </section>
  )
}
