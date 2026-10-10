import { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../lib/auth.js'
import { SizedIcon } from './icons.jsx'

/* Kapasitas card A7 (saku) dalam 1 lembar A4 = 4 (grid 2x2).
   Card A4 (standee) memenuhi 1 lembar sendiri, jadi maks 1. */
const MAKS_SAKU = 4

/* Komponen kartu dipakai berkali-kali: preview & kartu print ke-N */
function KartuQR({ targetUrl }) {
  return (
    <section
      className="qr-print-card isolate w-full rounded-[2rem] p-8 shadow-xl border border-slate-200 flex flex-col items-center text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #e7f6ec 0%, #f4fbee 55%, #fdf4e3 100%)' }}
    >
      <div className="absolute top-0 inset-x-0 h-2 bg-bsi-800" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-20 -z-10" style={{ background: '#f59e0b' }} />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full opacity-20 -z-10" style={{ background: '#16623c' }} />

      <div className="flex flex-col items-center gap-3 mt-4">
        <div className="h-16 w-16 rounded-2xl bg-bsi-800 text-white grid place-items-center shadow-md">
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
            <path d="M4 7V17C4 18.1 4.9 19 6 19H18C19.1 19 20 18.1 20 17V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 7L12 12L20 7" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
            <span className="text-bsi-800">GANK</span>
            <span className="text-slate-700">SKUYY</span>
          </h2>
          <p className="text-[11px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-1.5">
            Portal Presensi &amp; Logbook
          </p>
        </div>
      </div>

      <hr className="w-full border-slate-100 my-6" />

      <div className="space-y-1">
        <p className="text-xs font-bold text-bsi-800 uppercase tracking-widest">
          Scan QR Code di Bawah Ini
        </p>
        <p className="text-xs text-slate-500">
          Untuk mengisi Logbook harian &amp; Presensi magang
        </p>
      </div>

      <div className="my-6 p-4 border-2 border-dashed border-bsi-300 rounded-3xl" style={{ background: '#ffffff' }}>
        <QRCodeSVG value={targetUrl} size={200} bgColor="#ffffff" fgColor="#16623c" level="H" />
      </div>

      <div className="url-box w-full max-w-[20rem] border border-slate-200 px-4 py-3 rounded-2xl" style={{ background: '#ffffff' }}>
        <p className="url-label text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Akses Tautan Manual
        </p>
        <p className="url-text text-xs font-mono font-bold text-slate-700 break-all leading-normal mt-1">
          {targetUrl}
        </p>
      </div>
    </section>
  )
}

export default function QrPrintTab() {
  const { mahasiswa } = useAuth()
  const cardRef = useRef(null)
  const [unduh, setUnduh] = useState(false)
  const [ukuranPrint, setUkuranPrint] = useState('a7')
  const [jumlahCard, setJumlahCard] = useState(1)

  const targetUrl = window.location.origin + '/qr'

  const maksCard = ukuranPrint === 'a7' ? MAKS_SAKU : 1
  const amanJumlah = Math.min(jumlahCard, maksCard)

  const singleA7 = ukuranPrint === 'a7' && amanJumlah === 1
  const pageSize = singleA7 ? 'A7 portrait' : 'A4 portrait'
  const pageMargin = singleA7 ? '4mm' : (ukuranPrint === 'a7' ? '10mm' : '1.5cm')
  const gridGap = amanJumlah > 1 ? '6mm' : '0'
  const cardWidth = ukuranPrint === 'a7' ? '66mm' : '430px'
  const cardPadding = ukuranPrint === 'a7' ? '4mm' : '2rem'
  const cardRadius = ukuranPrint === 'a7' ? '5mm' : '2.5rem'

async function unduhPng() {
  if (!cardRef.current || unduh) return
  setUnduh(true)
  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      onclone: function (clonedDoc) {
        const wrap = clonedDoc.querySelector('.qr-print-wrap')
        if (!wrap) return
        /* PNG selalu 1 card, terlepas dari qty yang dipilih untuk print.
           Sembunyikan semua card kecuali yang pertama. */
        wrap.querySelectorAll('.qr-print-card').forEach(function (el, idx) {
          el.style.display = idx === 0 ? 'flex' : 'none'
        })
        wrap.style.display = 'block'
        wrap.style.width = '448px'
        wrap.style.maxWidth = 'none'
        wrap.style.margin = '0'
        wrap.style.position = 'static'
        // Perbaiki padding kotak URL pada card yang di-capture
        const url = wrap.querySelector('.qr-print-card .font-mono')
        if (url) {
          const box = url.parentElement
          if (box) {
            box.style.paddingTop = '6px'
            box.style.paddingBottom = '18px'
          }
        }
      }
    })
    const urlData = canvas.toDataURL('image/png', 1.0)
    const a = document.createElement('a')
    a.href = urlData
    a.download = 'QR-' + (mahasiswa ? mahasiswa.nama.replace(/\s+/g, '-') : 'mahasiswa') + '.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (e) {
    console.error(e)
    alert('Gagal membuat PNG: ' + e.message)
  } finally {
    setUnduh(false)
  }
}

  return (
    <>
      <style>{`
        .qr-print-wrap .qr-print-card:not(:first-child) { display: none; }

        @media print {
          /* Layout grid 2-kolom dimatikan supaya wrapper bisa absolute &
             centering print tetap konsisten seperti sebelumnya. */
          .qr-tab-grid { display: block !important; }
          .qr-tab-panel { display: none !important; }

          @page {
            size: ${pageSize};
            margin: ${pageMargin};
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html body,
          html.dark body {
            background-color: #ffffff !important;
            background-image: none !important;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * { visibility: hidden !important; }
          .qr-print-wrap, .qr-print-wrap * { visibility: visible !important; }
          .qr-print-wrap .qr-print-card { display: flex !important; }

          .qr-print-wrap {
            position: absolute !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: auto !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            align-content: center !important;
            gap: ${gridGap} !important;
            background: transparent !important;
          }
          .qr-print-card {
            position: relative !important;
            flex: 0 0 auto !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: linear-gradient(135deg, #e7f6ec 0%, #f4fbee 55%, #fdf4e3 100%) !important;
            width: ${cardWidth} !important;
            max-width: ${cardWidth} !important;
            min-width: ${cardWidth} !important;
            padding: ${cardPadding} !important;
            border-radius: ${cardRadius} !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .qr-print-card .text-slate-900 { color: #0f172a !important; }
          .qr-print-card .text-slate-700 { color: #334155 !important; }
          .qr-print-card .text-slate-500 { color: #64748b !important; }
          .qr-print-card .text-slate-400 { color: #94a3b8 !important; }

          ${ukuranPrint === 'a7' ? `
          .qr-print-card svg[width="200"] { width: 32mm !important; height: 32mm !important; }
          .qr-print-card .h-16.w-16 {
            width: 10mm !important; height: 10mm !important;
            border-radius: 2.5mm !important;
          }
          .qr-print-card .h-16.w-16 svg { width: 6.5mm !important; height: 6.5mm !important; }
          .qr-print-card h2 { font-size: 11.5pt !important; line-height: 1.15 !important; gap: 1.8mm !important; margin-bottom: 0.5mm !important; }
          .qr-print-card [class*="text-[11px]"] { font-size: 5.5pt !important; line-height: 1.25 !important; letter-spacing: 0.15em !important; margin-top: 1.3mm !important; }
          .qr-print-card .text-xs { font-size: 5.5pt !important; line-height: 1.35 !important; }
          .qr-print-card .space-y-1 > * + * { margin-top: 0.9mm !important; }
          .qr-print-card .p-4 { padding: 2.5mm !important; border-width: 0.3mm !important; border-style: dashed !important; border-radius: 3mm !important; width: fit-content !important; margin-left: auto !important; margin-right: auto !important; }
          .qr-print-card .url-box { width: 80% !important; max-width: 51mm !important; padding: 1.7mm 2mm !important; border-radius: 1.5mm !important; }
          .qr-print-card .url-label { font-size: 4pt !important; line-height: 1.15 !important; letter-spacing: 0.12em !important; margin: 0 !important; }
          .qr-print-card .url-text { font-size: 4.5pt !important; line-height: 1.2 !important; margin-top: 0.9mm !important; }
          .qr-print-card .leading-normal { line-height: 1.2 !important; }
          .qr-print-card .mt-1 { margin-top: 0.9mm !important; }
          .qr-print-card .mt-4 { margin-top: 2mm !important; }
          .qr-print-card .gap-3 { gap: 2mm !important; }
          .qr-print-card .my-6 { margin-top: 3mm !important; margin-bottom: 3mm !important; }
          .qr-print-card hr { margin-top: 3mm !important; margin-bottom: 3mm !important; }
          .qr-print-card .pointer-events-none.absolute { width: 22mm !important; height: 22mm !important; }
          .qr-print-card .-right-10.-top-10 { right: -7mm !important; top: -7mm !important; }
          .qr-print-card .-bottom-10.-left-10 { bottom: -7mm !important; left: -7mm !important; }
          .qr-print-card .top-0.inset-x-0.h-2 { height: 1mm !important; }
          ` : ''}
        }

        .dark .qr-print-card { border-color: rgba(15,42,29,.10) !important; }
        .dark .qr-print-card .text-slate-900,
        .dark .qr-print-card .text-slate-700 { color: #0f2a1d !important; }
        .dark .qr-print-card .text-slate-500,
        .dark .qr-print-card .text-slate-400 { color: #5f6f64 !important; }
        .dark .qr-print-card .text-bsi-800 { color: #177c48 !important; }
        .dark .qr-print-card .bg-bsi-800 { background-color: #16623c !important; }
        .dark .qr-print-card .bg-slate-50 { background-color: rgba(15,42,29,.06) !important; }
        .dark .qr-print-card .border-slate-100,
        .dark .qr-print-card .border-slate-200 { border-color: rgba(15,42,29,.10) !important; }
      `}</style>

      {/* Layout: mobile = stack vertikal, desktop (lg) = 2 kolom
          Kiri: preview card · Kanan: panel pengaturan + tombol */}
      <div className="anim-tab mt-8">
        <div className="qr-tab-grid mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)] lg:items-start">
          {/* Kolom kiri — preview card */}
          <div ref={cardRef} className="qr-print-wrap mx-auto w-full max-w-md">
            {Array.from({ length: amanJumlah }).map(function (_, i) {
              return <KartuQR key={i} targetUrl={targetUrl} />
            })}
          </div>

          {/* Kolom kanan — pengaturan + tombol */}
          <div className="qr-tab-panel mx-auto w-full max-w-md space-y-5 lg:mx-0 lg:sticky lg:top-24">
            <section className="bsi-panel rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ukuran Cetak</p>
              <div className="mt-3 flex gap-2">
                {[{ id: 'a7', label: 'Saku (A7)', sub: '7,4 × 10,5 cm' }, { id: 'a4', label: 'Standee (A4)', sub: '21 × 29,7 cm' }].map(function (u) {
                  const aktif = ukuranPrint === u.id
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={function () { setUkuranPrint(u.id) }}
                      className={
                        'flex-1 rounded-2xl px-3 py-3 text-left transition ' +
                        (aktif ? 'bg-bsi-800 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                      }
                    >
                      <p className={'text-sm font-bold ' + (aktif ? 'text-white' : 'text-slate-800')}>{u.label}</p>
                      <p className={'mt-0.5 text-xs ' + (aktif ? 'text-white/75' : 'text-slate-500')}>{u.sub}</p>
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Pilihan <strong>Saku</strong> untuk kartu kecil di dompet atau ditempel di meja. Pilihan <strong>Standee</strong> untuk kartu besar yang berdiri.
              </p>

              <div className="mt-5 border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Jumlah Card per Lembar
                  </p>
                  <span className="text-xs font-bold text-slate-500">
                    {amanJumlah}/{maksCard}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  {[1, 2, 3, 4].map(function (n) {
                    const aktif = amanJumlah === n
                    const terlarang = n > maksCard
                    return (
                      <button
                        key={n}
                        type="button"
                        disabled={terlarang}
                        onClick={function () { setJumlahCard(n) }}
                        title={
                          terlarang
                            ? (ukuranPrint === 'a4'
                                ? 'Card Standee memenuhi 1 lembar A4, maksimal 1 card.'
                                : 'Maksimal ' + maksCard + ' card per lembar A4.')
                            : 'Cetak ' + n + ' card'
                        }
                        className={
                          'flex-1 rounded-2xl px-3 py-3 text-sm font-bold transition ' +
                          (terlarang
                            ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                            : aktif
                              ? 'bg-bsi-800 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                        }
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {ukuranPrint === 'a7'
                    ? 'Maksimal ' + MAKS_SAKU + ' card A7 per lembar A4 (susunan 2×2). Pilihan 1 akan dicetak di kertas A7.'
                    : 'Card ukuran Standee otomatis hanya 1 per lembar karena memenuhi kertas A4.'}
                </p>
              </div>
            </section>

            <section className="bsi-panel rounded-2xl p-5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={unduhPng}
                disabled={unduh}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
              >
                <SizedIcon name="download" size={16} />
                {unduh ? 'Mengunduh...' : 'Unduh PNG'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-bsi-800 px-4 py-3 text-sm font-bold text-white hover:bg-bsi-900 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak PDF
              </button>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}