import { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../lib/auth.js'
import { SizedIcon } from './icons.jsx'

export default function QrPrintTab() {
  const { mahasiswa } = useAuth()
  const cardRef = useRef(null)
  const [unduh, setUnduh] = useState(false)

  const targetUrl = window.location.origin + '/qr'

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
          const url = clonedDoc.querySelector('.qr-print-card .font-mono')
          if (!url) return
          const box = url.parentElement
          box.style.paddingTop = '6px'
          box.style.paddingBottom = '18px'
        }
      })
      const url = canvas.toDataURL('image/png', 1.0)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Standee-QR-' + (mahasiswa ? mahasiswa.nama.replace(/\s+/g, '-') : 'mahasiswa') + '.png'
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
      {/* === Print CSS: hanya kartu QR yang dicetak === */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.5cm;
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
  height: 100% !important;
  overflow: hidden !important;
}
          body * {
            visibility: hidden !important;
          }
          .qr-print-card,
          .qr-print-card * {
            visibility: visible !important;
          }
.qr-print-card {
  position: fixed !important;
  top: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  margin: auto !important;
  height: fit-content !important;
  box-shadow: none !important;
  background: linear-gradient(135deg, #e7f6ec 0%, #f4fbee 55%, #fdf4e3 100%) !important;
}
/* Paksa warna light mode saat print (aman dari dark mode) */
.qr-print-card .text-slate-900 { color: #0f172a !important; }
.qr-print-card .text-slate-700 { color: #334155 !important; }
.qr-print-card .text-slate-500 { color: #64748b !important; }
.qr-print-card .text-slate-400 { color: #94a3b8 !important; }
        }

        /* Kartu QR selalu bertema terang: batalkan override dark mode di dalam kartu saja */
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

      <div className="anim-tab mt-8 space-y-6">
        {/* Kartu Poster Siap Cetak */}
        <section
  ref={cardRef}
    className="qr-print-card isolate mx-auto w-full max-w-md rounded-[2rem] p-8 shadow-xl border border-slate-200 flex flex-col items-center text-center relative overflow-hidden"
  style={{ background: 'linear-gradient(135deg, #e7f6ec 0%, #f4fbee 55%, #fdf4e3 100%)' }}
>
  {/* Accent Top Bar */}
  <div className="absolute top-0 inset-x-0 h-2 bg-bsi-800" />

  {/* Aksen dekoratif sudut (terinspirasi logo.svg) */}
<div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-20 -z-10" style={{ background: '#f59e0b' }} />
<div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full opacity-20 -z-10" style={{ background: '#16623c' }} />

          {/* Header Branding */}
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
              Untuk mengisi Logbook harian & Presensi magang
            </p>
          </div>

          <div className="my-6 p-4 border-2 border-dashed border-bsi-300 rounded-3xl" style={{ background: '#ffffff' }}>
            <QRCodeSVG
              value={targetUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#16623c"
              level="H"
            />
          </div>

          <div className="w-full max-w-[20rem] border border-slate-200 px-4 py-3 rounded-2xl" style={{ background: '#ffffff' }}>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Akses Tautan Manual
            </p>
            <p className="text-xs font-mono font-bold text-slate-700 break-all leading-normal mt-1">
              {targetUrl}
            </p>
          </div>
        </section>

        {/* Tombol Aksi (tidak ikut tercetak / terunduh) */}
        <section className="mx-auto w-full max-w-md bsi-panel rounded-2xl p-5 flex flex-col sm:flex-row gap-3">
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
    </>
  )
}