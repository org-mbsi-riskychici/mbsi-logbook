This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
api/
  r2/
    delete.js
    presign.js
src/
  components/
    cards.jsx
    Carousel.jsx
    controls.jsx
    FilterBar.jsx
    icons.jsx
    Layout.jsx
    Skeleton.jsx
    ui.jsx
  lib/
    auth.js
    constants.js
    format.js
    logbook.js
    supabase.js
    theme.jsx
    upload.js
  pages/
    AttendancePage.jsx
    DashboardPage.jsx
    DospemPage.jsx
    GalleryPage.jsx
    HomePage.jsx
    LogbookPage.jsx
    LoginPage.jsx
    TimPage.jsx
  App.jsx
  index.css
  main.jsx
supabase/
  schema.sql
.env.example
.gitignore
index.html
package.json
postcss.config.js
README.md
rename-peserta.cjs
tailwind.config.js
vercel.json
vite.config.js
```

# Files

## File: api/r2/delete.js
```javascript
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Belum login' })

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  })
  const check = await supabase.auth.getUser(token)
  if (check.error || !check.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })

  const { key } = req.body || {}
  if (!key) return res.status(400).json({ error: 'Key tidak ada' })
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }))
  return res.status(200).json({ ok: true })
}
```

## File: api/r2/presign.js
```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Belum login' })

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  })
  const check = await supabase.auth.getUser(token)
  if (check.error || !check.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })

  const { filename, contentType, kind } = req.body || {}
  if (!filename || !contentType || !kind) return res.status(400).json({ error: 'Payload tidak lengkap' })

  const ext = (filename.split('.').pop() || 'bin').toLowerCase()
  const key = kind + '/' + new Date().getFullYear() + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  )
  const publicUrl = process.env.R2_PUBLIC_BASE_URL + '/' + key
  return res.status(200).json({ uploadUrl, publicUrl, key })
}
```

## File: src/components/Carousel.jsx
```javascript
import { useEffect, useRef, useState } from 'react'

export default function Carousel(props) {
  const slides = props.slides || []
  const autoMs = props.autoMs || 4000
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)
  const touchX = useRef(0)

  useEffect(function () {
    if (slides.length < 2 || paused) return undefined
    const t = setInterval(function () {
      setIdx(function (i) { return (i + 1) % slides.length })
    }, autoMs)
    return function () { clearInterval(t) }
  }, [slides.length, paused, autoMs])

  useEffect(function () {
    if (trackRef.current) trackRef.current.style.transform = 'translateX(-' + (idx * 100) + '%)'
  }, [idx])

  if (!slides.length) return null

  if (slides.length === 1) {
    const s = slides[0]
    return (
      <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900">
        {s.type === 'video'
          ? <video src={s.src} className="h-full w-full object-contain" muted preload="metadata" />
          : <img src={s.src} alt={s.title || 'Media'} className="h-full w-full object-contain" />}
      </div>
    )
  }

  return (
    <div
      className="media-carousel group"
      onMouseEnter={function () { setPaused(true) }}
      onMouseLeave={function () { setPaused(false) }}
      onTouchStart={function (e) { touchX.current = e.touches[0].clientX }}
      onTouchEnd={function (e) {
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) {
          setIdx(function (i) { return (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length })
        }
      }}
    >
      <div ref={trackRef} className="carousel-track">
        {slides.map(function (s, i) {
          return (
            <div key={i} className="carousel-slide">
              {s.type === 'video'
                ? <video src={s.src} muted preload="metadata" />
                : <img src={s.src} alt={s.title || 'Media'} />}
              {s.title ? (
                <span className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded-lg bg-black/60 text-white text-xs max-w-[85%] truncate">
                  {s.title}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      <button
        onClick={function () { setIdx(function (i) { return (i - 1 + slides.length) % slides.length }) }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"
      >
        &#8249;
      </button>
      <button
        onClick={function () { setIdx(function (i) { return (i + 1) % slides.length }) }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"
      >
        &#8250;
      </button>

      <div className="absolute bottom-2 right-2 z-10 flex gap-1.5">
        {slides.map(function (s, i) {
          return (
            <button
              key={i}
              onClick={function () { setIdx(i) }}
              className={'carousel-dot h-2 w-2 rounded-full transition-all ' + (i === idx ? 'bg-white' : 'bg-white/40')}
            />
          )
        })}
      </div>
    </div>
  )
}
```

## File: src/components/controls.jsx
```javascript
import { useEffect, useRef, useState } from 'react'
import { ICONS } from './icons.jsx'

const BULAN_NAMA = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const HARI_NAMA = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const defaultBtn = 'flex w-full items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-bsi-500'

function pad(n) {
  return (n < 10 ? '0' : '') + n
}

function parseValue(value, mode) {
  if (!value) return null
  const p = String(value).split('-')
  if (mode === 'month') {
    if (p.length < 2) return null
    const y = parseInt(p[0], 10)
    const m = parseInt(p[1], 10) - 1
    if (isNaN(y) || isNaN(m) || m < 0 || m > 11) return null
    return { y: y, m: m }
  }
  if (p.length < 3) return null
  const y = parseInt(p[0], 10)
  const m = parseInt(p[1], 10) - 1
  const d = parseInt(p[2], 10)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  return { y: y, m: m, d: d }
}

function useOutside(ref, open, setOpen) {
  useEffect(function () {
    if (!open) return undefined
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return function () { document.removeEventListener('mousedown', handler) }
  }, [open])
}

export function CustomSelect(props) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  useOutside(boxRef, open, setOpen)
  const options = props.options || []
  const current = options.find(function (o) { return o.value === props.value }) || null

  return (
    <div ref={boxRef} className={'relative ' + (props.className || '')}>
      <button
        type="button"
        onClick={function () { setOpen(function (o) { return !o }) }}
        className={(props.buttonCls || defaultBtn) + ' text-left'}
      >
        {props.icon ? <span className="shrink-0 text-slate-400">{props.icon}</span> : null}
        <span className={'flex-1 truncate ' + (current ? 'text-slate-800' : 'text-slate-400')}>
          {current ? current.label : (props.placeholder || 'Pilih')}
        </span>
        <span className={'shrink-0 text-slate-400 transition-transform duration-200 ' + (open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
      </button>
      {open ? (
        <div className="anim-modal absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
          {options.map(function (o) {
            const active = o.value === props.value
            return (
              <button
                type="button"
                key={String(o.value)}
                onClick={function () { props.onChange(o.value); setOpen(false) }}
                className={'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm ' + (active ? 'bg-bsi-800 text-white' : 'text-slate-700 hover:bg-slate-100')}
              >
                <span className="truncate">{o.label}</span>
                {active ? <span className="shrink-0">{ICONS.check}</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function CustomDateInput(props) {
  const mode = props.mode || 'date'
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(function () {
    const p = parseValue(props.value, mode)
    const t = new Date()
    return p ? { y: p.y, m: p.m } : { y: t.getFullYear(), m: t.getMonth() }
  })
  const boxRef = useRef(null)
  useOutside(boxRef, open, setOpen)

  const sel = parseValue(props.value, mode)
  const today = new Date()

  function toggle() {
    if (!open) {
      const p = parseValue(props.value, mode)
      if (p) setView({ y: p.y, m: p.m })
    }
    setOpen(function (o) { return !o })
  }

  function shift(delta) {
    setView(function (v) {
      if (mode === 'month') return { y: v.y + delta, m: v.m }
      let m = v.m + delta
      let y = v.y
      if (m < 0) { m = 11; y -= 1 }
      if (m > 11) { m = 0; y += 1 }
      return { y: y, m: m }
    })
  }

  function pickDay(d) {
    props.onChange(view.y + '-' + pad(view.m + 1) + '-' + pad(d))
    setOpen(false)
  }

  function pickMonth(m) {
    props.onChange(view.y + '-' + pad(m + 1))
    setOpen(false)
  }

  function pickToday() {
    const t = new Date()
    if (mode === 'month') props.onChange(t.getFullYear() + '-' + pad(t.getMonth() + 1))
    else props.onChange(t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()))
    setOpen(false)
  }

  const label = sel
    ? (mode === 'month' ? BULAN_NAMA[sel.m] + ' ' + sel.y : sel.d + ' ' + BULAN_PENDEK[sel.m] + ' ' + sel.y)
    : ''

  const firstDay = new Date(view.y, view.m, 1).getDay()
  const daysCount = new Date(view.y, view.m + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysCount; d++) cells.push(d)

  return (
    <div ref={boxRef} className={'relative ' + (props.className || '')}>
      <button type="button" onClick={toggle} className={(props.buttonCls || defaultBtn) + ' text-left'}>
        <span className="shrink-0 text-slate-400">{ICONS.calendar}</span>
        <span className={'flex-1 truncate ' + (props.value ? 'text-slate-800' : 'text-slate-400')}>
          {label || (mode === 'month' ? 'Pilih bulan' : 'Pilih tanggal')}
        </span>
        <span className={'shrink-0 text-slate-400 transition-transform duration-200 ' + (open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
      </button>
      {open ? (
        <div className="anim-modal absolute z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <button type="button" onClick={function () { shift(-1) }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">&#8249;</button>
            <p className="text-sm font-bold text-slate-800">
              {mode === 'month' ? String(view.y) : BULAN_NAMA[view.m] + ' ' + view.y}
            </p>
            <button type="button" onClick={function () { shift(1) }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">&#8250;</button>
          </div>

          {mode === 'date' ? (
            <div className="mt-3 grid grid-cols-7 gap-1 text-center">
              {HARI_NAMA.map(function (h) {
                return <span key={h} className="py-1 text-[11px] font-semibold text-slate-400">{h}</span>
              })}
              {cells.map(function (d, i) {
                if (d === null) return <span key={'kosong' + i} />
                const isSel = sel && sel.y === view.y && sel.m === view.m && sel.d === d
                const isToday = today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === d
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={function () { pickDay(d) }}
                    className={'mx-auto grid h-8 w-8 place-items-center rounded-lg text-sm ' + (isSel ? 'bg-bsi-800 font-semibold text-white' : isToday ? 'font-bold text-bsi-700 ring-1 ring-bsi-500' : 'text-slate-700 hover:bg-slate-100')}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BULAN_NAMA.map(function (nama, m) {
                const isSel = sel && sel.y === view.y && sel.m === m
                const isNow = today.getFullYear() === view.y && today.getMonth() === m
                return (
                  <button
                    key={nama}
                    type="button"
                    onClick={function () { pickMonth(m) }}
                    className={'rounded-lg px-2 py-2 text-xs font-semibold ' + (isSel ? 'bg-bsi-800 text-white' : isNow ? 'text-bsi-700 ring-1 ring-bsi-500' : 'text-slate-700 hover:bg-slate-100')}
                  >
                    {nama}
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button type="button" onClick={function () { props.onChange(''); setOpen(false) }} className="text-sm font-semibold text-slate-500 hover:text-red-600">Hapus</button>
            <button type="button" onClick={pickToday} className="text-sm font-semibold text-bsi-700 hover:text-bsi-900">Hari ini</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function FileInput(props) {
  const inputRef = useRef(null)
  return (
    <div className={props.className || ''}>
      <input
        ref={inputRef}
        type="file"
        accept={props.accept || 'image/*,video/*'}
        className="hidden"
        onChange={function (e) {
          if (props.onChange) props.onChange(e)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={function () { inputRef.current.click() }}
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-4 text-left transition hover:border-bsi-500 hover:bg-slate-100"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bsi-100 text-bsi-800">{ICONS.image}</span>
        <span className="min-w-0 flex-1">
          <span className={'block truncate text-sm font-semibold ' + (props.fileName ? 'text-slate-800' : 'text-slate-500')}>
            {props.fileName || 'Klik untuk pilih foto atau video'}
          </span>
          <span className="block text-xs text-slate-400">{props.hint || 'Maksimal 2 MB'}</span>
        </span>
        {props.fileName ? <span className="shrink-0 text-xs font-semibold text-bsi-700">Ganti</span> : null}
      </button>
    </div>
  )
}
```

## File: src/components/Skeleton.jsx
```javascript
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="skeleton h-4 w-28"></div>
      <div className="skeleton h-9 w-16 mt-3"></div>
      <div className="skeleton h-3 w-36 mt-2"></div>
    </div>
  )
}

export function SkeletonLogbookCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="skeleton h-40 w-full rounded-2xl"></div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton h-6 w-20 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-32"></div>
      <div className="skeleton h-6 w-3/4"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-2/3"></div>
      <div className="flex items-center gap-3 pt-2">
        <div className="skeleton h-11 w-11 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonGalleryCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="skeleton aspect-video w-full rounded-none"></div>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-6 w-24 rounded-full"></div>
          <div className="skeleton h-4 w-16"></div>
        </div>
        <div className="skeleton h-5 w-3/4"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-1/2"></div>
      </div>
    </div>
  )
}

export function SkeletonAttendanceCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-40"></div>
          <div className="skeleton h-5 w-32"></div>
        </div>
        <div className="skeleton h-6 w-16 rounded-full"></div>
      </div>
      <div className="skeleton h-16 w-full rounded-2xl"></div>
    </div>
  )
}

export function SkeletonPersonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="skeleton h-14 w-14 rounded-3xl"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-32"></div>
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-4 w-28 rounded-full"></div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="skeleton h-20 rounded-2xl"></div>
        <div className="skeleton h-20 rounded-2xl"></div>
      </div>
    </div>
  )
}

export function SkeletonChartRow() {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
        <div className="skeleton h-4 w-40"></div>
      </div>
      <div className="skeleton h-4 w-full rounded-full mt-4"></div>
    </div>
  )
}
```

## File: src/lib/constants.js
```javascript
export const KATEGORI = [
  'Administrasi Kantor',
  'Pengarsipan Dokumen',
  'Bantuan Layanan Nasabah',
  'Bantuan Operasional Back Office',
  'Edukasi Produk',
  'Pendataan Internal',
  'Rapat atau Briefing',
  'Pelatihan dan Sosialisasi',
  'Dokumentasi Kegiatan',
  'Pendukung Lainnya'
]

export const UNIT = ['Layanan Nasabah', 'Back Office', 'Marketing', 'Operasional', 'Umum']

export const GALERI_KEGIATAN = [
  'Dokumentasi Kegiatan',
  'Administrasi Kantor',
  'Layanan Nasabah',
  'Sosialisasi dan Edukasi',
  'Pelatihan',
  'Operasional',
  'Lainnya'
]
```

## File: src/lib/supabase.js
```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

## File: src/lib/theme.jsx
```javascript
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider(props) {
  const [dark, setDark] = useState(function () {
    const saved = localStorage.getItem('mbsi-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(function () {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('mbsi-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark: dark, toggle: function () { setDark(function (d) { return !d }) } }}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

## File: src/lib/upload.js
```javascript
import { supabase } from './supabase.js'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session ? data.session.access_token : ''
}

export async function uploadMedia(file, kind) {
  const token = await getToken()
  const res = await fetch('/api/r2/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ filename: file.name, contentType: file.type, kind: kind })
  })
  if (!res.ok) throw new Error('Gagal membuat izin upload')
  const info = await res.json()
  const put = await fetch(info.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  })
  if (!put.ok) throw new Error('Gagal upload file ke R2')
  return { path: info.key, publicUrl: info.publicUrl }
}

export async function deleteMedia(key) {
  const token = await getToken()
  await fetch('/api/r2/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ key: key })
  })
}
```

## File: src/main.jsx
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## File: .env.example
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=mbsi-media
R2_PUBLIC_BASE_URL=
```

## File: .gitignore
```
node_modules
dist
.env.local
.env
*.log
```

## File: index.html
```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Logbook Magang BSI</title>
  </head>
  <body class="bg-slate-50 text-slate-800 min-h-screen antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## File: postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

## File: rename-peserta.cjs
```javascript
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const targets = []

function kumpul(dir) {
  const entries = fs.readdirSync(path.join(root, dir), { withFileTypes: true })
  for (const e of entries) {
    const rel = dir + '/' + e.name
    if (e.isDirectory()) kumpul(rel)
    else if (e.name.endsWith('.js') || e.name.endsWith('.jsx')) targets.push(rel)
  }
}

if (fs.existsSync(path.join(root, 'src'))) kumpul('src')
if (fs.existsSync(path.join(root, 'api'))) kumpul('api')
for (const extra of ['supabase/schema.sql', 'README.md']) {
  if (fs.existsSync(path.join(root, extra))) targets.push(extra)
}

let total = 0
for (const rel of targets) {
  const full = path.join(root, rel)
  const asli = fs.readFileSync(full, 'utf8')
  const jumlah = (asli.match(/peserta/g) || []).length + (asli.match(/Peserta/g) || []).length
  if (jumlah > 0) {
    const baru = asli.split('peserta').join('mahasiswa').split('Peserta').join('Mahasiswa')
    fs.writeFileSync(full, baru, 'utf8')
    total += jumlah
    console.log('[DIGANTI] ' + rel + ' (' + jumlah + ' kata)')
  } else {
    console.log('[TETAP] ' + rel)
  }
}

console.log('')
console.log('Selesai. Total kata yang diganti: ' + total)
console.log('Pastikan langkah SQL di Supabase sudah dijalankan sebelum menguji aplikasi.')
```

## File: tailwind.config.js
```javascript
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bsi: {
          50: '#effef5', 100: '#d9fbe5', 200: '#b5f5cd', 300: '#86ecb0',
          400: '#50d98b', 500: '#27c06d', 600: '#1a9e57', 700: '#177c48',
          800: '#16623c', 900: '#135033', 950: '#072c1b'
        },
        gold: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' }
      }
    }
  },
  plugins: []
}
```

## File: vercel.json
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## File: src/lib/auth.js
```javascript
import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const EMAIL_DOMAIN = '@mbsi.local'

export async function loginWithNim(nim, kode) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: nim.trim() + EMAIL_DOMAIN,
    password: kode
  })
  if (error) throw error
  return data
}

export async function logoutMahasiswa() {
  await supabase.auth.signOut()
}

export function useAuth() {
  const [mahasiswa, setMahasiswa] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const { data } = await supabase.auth.getSession()
      const uid = data.session ? data.session.user.id : null
      if (!uid) {
        if (active) setLoading(false)
        return
      }
      const res = await supabase.from('mahasiswa').select('*').eq('auth_uid', uid).single()
      if (active) {
        setMahasiswa(res.data)
        setLoading(false)
      }
    }
    load()
    const sub = supabase.auth.onAuthStateChange(function (event, session) {
      if (!session) setMahasiswa(null)
    })
    return function () {
      active = false
      sub.data.subscription.unsubscribe()
    }
  }, [])

  return { mahasiswa: mahasiswa, loading: loading }
}
```

## File: src/lib/format.js
```javascript
export function formatTanggal(s) {
  if (!s) return 'Tanggal belum diisi'
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTanggalShort(s) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function todayInput() {
  const d = new Date()
  const m = ('0' + (d.getMonth() + 1)).slice(-2)
  const day = ('0' + d.getDate()).slice(-2)
  return d.getFullYear() + '-' + m + '-' + day
}

export function detectMediaType(u) {
  const ext = String(u || '').split('?')[0].split('.').pop().toLowerCase()
  return ['mp4', 'webm', 'ogg', 'mov', 'm4v'].indexOf(ext) !== -1 ? 'video' : 'foto'
}

export function matchesDateFilters(dateString, f) {
  if (!dateString) return false
  if (f.timeMode === 'bulan') {
    if (f.bulan) {
      if (f.bulan.length === 7) return dateString.slice(0, 7) === f.bulan
      const p = dateString.split('-')
      if (p.length < 2 || p[1] !== f.bulan) return false
    }
  } else if (f.timeMode === 'rentang') {
    if (f.dari && dateString < f.dari) return false
    if (f.sampai && dateString > f.sampai) return false
  }
  return true
}
```

## File: src/lib/logbook.js
```javascript
import { supabase } from './supabase.js'

const EMPTY = '00000000-0000-0000-0000-000000000000'

export async function syncGaleriFromLogbook(mahasiswaId, items, meta) {
  const itemIds = items.map(function (i) { return i.id }).filter(Boolean)
  const all = await supabase
    .from('galeri')
    .select('id, logbook_item_id')
    .in('logbook_item_id', itemIds.length ? itemIds : [EMPTY])
  const existing = new Map((all.data || []).map(function (g) { return [g.logbook_item_id, g.id] }))

  for (const item of items) {
    if (!item.id) continue
    if (item.show_in_gallery && item.media_path) {
      const payload = {
        mahasiswa_id: mahasiswaId,
        logbook_item_id: item.id,
        judul: item.judul,
        deskripsi: item.deskripsi || 'Dokumentasi kegiatan dari logbook harian.',
        tanggal: meta.tanggal,
        kegiatan: meta.kategori,
        media_path: item.media_path,
        media_type: item.media_type || 'foto'
      }
      if (existing.has(item.id)) {
        await supabase.from('galeri').update(payload).eq('id', existing.get(item.id))
      } else {
        await supabase.from('galeri').insert(payload)
      }
    } else if (existing.has(item.id)) {
      await supabase.from('galeri').delete().eq('id', existing.get(item.id))
    }
  }
}
```

## File: src/App.jsx
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './lib/theme.jsx'
import { useAuth } from './lib/auth.js'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import LogbookPage from './pages/LogbookPage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import DospemPage from './pages/DospemPage.jsx'
import TimPage from './pages/TimPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

function RequireAuth(props) {
  const { mahasiswa, loading } = useAuth()
  if (loading) return <div className="p-10 text-center text-slate-500">Memuat sesi...</div>
  if (!mahasiswa) return <Navigate to="/login" replace />
  return props.children
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/logbook" element={<LogbookPage />} />
            <Route path="/galeri" element={<GalleryPage />} />
            <Route path="/absen" element={<AttendancePage />} />
            <Route path="/dospem" element={<DospemPage />} />
            <Route path="/tim" element={<TimPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
```

## File: supabase/schema.sql
```sql
create extension if not exists "pgcrypto";
create table public.mahasiswa (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique references auth.users(id) on delete cascade,
  nim varchar(20) not null unique,
  nama varchar(100) not null,
  created_at timestamptz not null default now()
);
create table public.logbooks (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  tanggal date not null,
  unit varchar(50),
  kategori varchar(50) not null,
  judul varchar(255) not null,
  kendala text,
  solusi text,
  pembelajaran text,
  status varchar(20) not null default 'draft' check (status in ('draft','publik')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.logbook_items (
  id uuid primary key default gen_random_uuid(),
  logbook_id uuid not null references public.logbooks(id) on delete cascade,
  urutan integer not null default 1,
  judul varchar(255) not null,
  deskripsi text,
  hasil text,
  media_path text,
  media_type varchar(10) check (media_type in ('foto','video')),
  show_in_gallery boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.galeri (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  logbook_item_id uuid unique references public.logbook_items(id) on delete cascade,
  judul varchar(255) not null,
  deskripsi text,
  tanggal date not null,
  kegiatan varchar(50),
  media_path text not null,
  media_type varchar(10) not null check (media_type in ('foto','video')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.daftar_hadir (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  tanggal date not null,
  status varchar(20) not null check (status in ('Masuk','Izin','Bolos')),
  alasan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mahasiswa_id, tanggal)
);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
create trigger trg_logbooks_upd before update on public.logbooks for each row execute function public.set_updated_at();
create trigger trg_galeri_upd before update on public.galeri for each row execute function public.set_updated_at();
create trigger trg_hadir_upd before update on public.daftar_hadir for each row execute function public.set_updated_at();
create index idx_logbooks_mahasiswa on public.logbooks(mahasiswa_id, tanggal desc);
create index idx_logbooks_status on public.logbooks(status);
create index idx_items_logbook on public.logbook_items(logbook_id, urutan);
create index idx_galeri_mahasiswa on public.galeri(mahasiswa_id, tanggal desc);
create index idx_galeri_item on public.galeri(logbook_item_id);
create index idx_hadir_mahasiswa on public.daftar_hadir(mahasiswa_id, tanggal desc);
alter table public.mahasiswa enable row level security;
alter table public.logbooks enable row level security;
alter table public.logbook_items enable row level security;
alter table public.galeri enable row level security;
alter table public.daftar_hadir enable row level security;
create policy "mahasiswa_read_all" on public.mahasiswa for select using (true);
create policy "mahasiswa_update_self" on public.mahasiswa for update using (auth_uid = auth.uid());
create policy "logbooks_read" on public.logbooks for select using (
  status = 'publik' or mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "logbooks_insert_self" on public.logbooks for insert with check (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "logbooks_update_self" on public.logbooks for update using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "logbooks_delete_self" on public.logbooks for delete using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "items_read" on public.logbook_items for select using (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and (l.status = 'publik' or l.mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())))
);
create policy "items_write_self" on public.logbook_items for all using (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and l.mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid()))
) with check (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and l.mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid()))
);
create policy "galeri_read_all" on public.galeri for select using (true);
create policy "galeri_insert_self" on public.galeri for insert with check (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "galeri_update_self" on public.galeri for update using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "galeri_delete_self" on public.galeri for delete using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "hadir_read_all" on public.daftar_hadir for select using (true);
create policy "hadir_insert_self" on public.daftar_hadir for insert with check (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "hadir_update_self" on public.daftar_hadir for update using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "hadir_delete_self" on public.daftar_hadir for delete using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
```

## File: package.json
```json
{
  "name": "mbsi-logbook",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.600.0",
    "@aws-sdk/s3-request-presigner": "^3.600.0",
    "@supabase/supabase-js": "^2.45.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.10",
    "vite": "^5.4.0"
  }
}
```

## File: README.md
```markdown
# Logbook Magang BSI

Portal logbook, galeri, dan daftar hadir magang Bank Syariah Indonesia.

## Menjalankan lokal
1. node generate-mbsi.js (sudah dilakukan saat setup)
2. npm run dev
3. Buka http://localhost:5173

## Database
Jalankan isi file supabase/schema.sql di Supabase SQL Editor.
Buat user Auth dengan pola email NIM@magang.local dan isi tabel mahasiswa beserta auth_uid.

## Deploy
Push ke GitHub, import di Vercel, salin isi .env.local ke Environment Variables Vercel.
```

## File: vite.config.js
```javascript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

function bacaBody(req) {
  return new Promise(function (resolve) {
    let data = ''
    req.on('data', function (c) { data += c })
    req.on('end', function () {
      try { resolve(JSON.parse(data || '{}')) } catch (e) { resolve({}) }
    })
  })
}

function pluginApiR2(env) {
  const s3 = new S3Client({
    region: 'auto',
    endpoint: 'https://' + env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY
    }
  })

  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return false
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    })
    const r = await supabase.auth.getUser(token)
    return !r.error && !!r.data.user
  }

  return {
    name: 'api-r2-dev',
    configureServer(server) {
      server.middlewares.use('/api/r2/presign', async function (req, res) {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
          return
        }
        const ok = await cekSesi(req)
        if (!ok) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Sesi tidak valid' }))
          return
        }
        const body = await bacaBody(req)
        const ext = String(body.filename || 'bin').split('.').pop().toLowerCase()
        const key = body.kind + '/' + new Date().getFullYear() + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
        const uploadUrl = await getSignedUrl(
          s3,
          new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, ContentType: body.contentType }),
          { expiresIn: 300 }
        )
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          uploadUrl: uploadUrl,
          publicUrl: env.R2_PUBLIC_BASE_URL + '/' + key,
          key: key
        }))
      })

      server.middlewares.use('/api/r2/delete', async function (req, res) {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
          return
        }
        const ok = await cekSesi(req)
        if (!ok) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Sesi tidak valid' }))
          return
        }
        const body = await bacaBody(req)
        await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: body.key }))
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: true }))
      })
    }
  }
}

export default defineConfig(function ({ mode }) {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), pluginApiR2(env)]
  }
})
```

## File: src/components/FilterBar.jsx
```javascript
import { ICONS } from './icons.jsx'
import { CustomSelect, CustomDateInput } from './controls.jsx'

export function FilterSelect(props) {
  return (
    <CustomSelect
      icon={props.icon}
      value={props.value}
      onChange={props.onChange}
      options={props.options}
      className="min-w-[190px]"
      buttonCls="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
    />
  )
}

export function FilterDate(props) {
  return (
    <CustomDateInput
      mode={props.mode || 'date'}
      value={props.value}
      onChange={props.onChange}
      className="min-w-[170px]"
      buttonCls="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
    />
  )
}

export function TimeFilter(props) {
  const f = props.filter
  const set = props.set
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="time-toggle">
        <button type="button" className={f.timeMode === 'bulan' ? 'active' : ''}
          onClick={function () { set(Object.assign({}, f, { timeMode: 'bulan', bulan: '', dari: '', sampai: '' })) }}>Bulan</button>
        <button type="button" className={f.timeMode === 'rentang' ? 'active' : ''}
          onClick={function () { set(Object.assign({}, f, { timeMode: 'rentang', bulan: '', dari: '', sampai: '' })) }}>Rentang Waktu</button>
      </div>
      {f.timeMode === 'bulan'
        ? <FilterDate mode="month" value={f.bulan} onChange={function (v) { set(Object.assign({}, f, { bulan: v })) }} />
        : <div className="flex flex-wrap items-center gap-2">
            <FilterDate value={f.dari} onChange={function (v) { set(Object.assign({}, f, { dari: v })) }} />
            <span className="text-slate-400 text-sm">sampai</span>
            <FilterDate value={f.sampai} onChange={function (v) { set(Object.assign({}, f, { sampai: v })) }} />
          </div>}
    </div>
  )
}

export function FilterBar(props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <button onClick={props.onToggle}
          className="xl:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <span className="text-bsi-700">{ICONS.funnel}</span>
          <span>Filter</span>
          {props.activeCount > 0 ? (
            <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-bsi-800 text-white text-xs font-bold">{props.activeCount}</span>
          ) : null}
          <span className={'transition-transform duration-200 text-slate-400 ' + (props.open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
        </button>
        <div className="hidden xl:block text-sm text-slate-500">
          {props.activeCount > 0
            ? <span className="inline-flex items-center gap-2"><span className="text-bsi-700">{ICONS.funnel}</span><span><strong className="text-slate-900">{props.activeCount}</strong> filter aktif</span></span>
            : <span className="inline-flex items-center gap-2"><span className="text-slate-400">{ICONS.funnel}</span><span>Belum ada filter aktif</span></span>}
        </div>
      </div>
      <div className={props.open ? 'anim-page mt-4' : 'hidden xl:block xl:mt-4'}>
        <div className="flex flex-wrap items-center gap-3">
          {props.children}
          {props.activeCount > 0 ? (
            <button onClick={props.onReset}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">
              {ICONS.close}<span>Reset</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function countActiveFilters(o) {
  let c = 0
  for (const k in o) {
    if (k === 'timeMode') continue
    if (o[k]) c++
  }
  return c
}
```

## File: src/components/icons.jsx
```javascript
function svg(inner, size) {
  const s = size || 16
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {inner}
    </svg>
  )
}

const paths = {
  funnel: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  tag: (
    <>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  chevron: <polyline points="6 9 12 15 18 9" />,
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </>
  ),
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  file: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  )
}

export const ICONS = {
  funnel: svg(paths.funnel),
  user: svg(paths.user),
  tag: svg(paths.tag),
  calendar: svg(paths.calendar),
  image: svg(paths.image),
  close: svg(paths.close),
  check: svg(paths.check),
  chevron: svg(paths.chevron),
  list: svg(paths.list),
  link: svg(paths.link)
}

export function SizedIcon(props) {
  const inner = paths[props.name]
  if (!inner) return null
  return svg(inner, props.size || 16)
}
```

## File: src/pages/LoginPage.jsx
```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithNim } from '../lib/auth.js'
import { inputCls, labelCls, btnPrimary } from '../components/ui.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const [nim, setNim] = useState('')
  const [kode, setKode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
  await loginWithNim(nim, kode)
  console.log('Login berhasil, pindah ke dashboard')
  navigate('/dashboard')
} catch (err) {
  console.error('Error lengkap:', err)
  setError(err.message)
}
    setBusy(false)
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
      <div className="card-hover rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-10">
        <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Area Intern</span>
        <h1 className="mt-6 text-3xl lg:text-4xl font-black leading-tight">Masuk untuk mengisi logbook, galeri, dan daftar hadir</h1>
        <p className="mt-4 text-white/80 leading-relaxed">Halaman ini hanya digunakan oleh mahasiswa magang. Dosen pembimbing dan kaprodi tidak perlu login untuk melihat halaman publik.</p>
      </div>
      <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 lg:p-10">
        <h2 className="text-2xl font-black text-slate-900">Login mahasiswa magang</h2>
        {error ? <p className="mt-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className={labelCls}>NIM <span className="text-red-500">*</span></label>
            <input className={inputCls} value={nim} onChange={function (e) { setNim(e.target.value) }} placeholder="Contoh: 20260001" required />
          </div>
          <div>
            <label className={labelCls}>Kode akses <span className="text-red-500">*</span></label>
            <input type="password" className={inputCls} value={kode} onChange={function (e) { setKode(e.target.value) }} placeholder="Masukkan kode akses" required />
          </div>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Memproses...' : 'Masuk ke dashboard'}</button>
        </form>
      </div>
    </section>
  )
}
```

## File: src/components/Layout.jsx
```javascript
import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTheme } from '../lib/theme.jsx'
import { useAuth, logoutMahasiswa } from '../lib/auth.js'
import { SizedIcon } from './icons.jsx'
import { useState } from 'react'

const LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/logbook', label: 'Logbook' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/absen', label: 'Daftar Hadir' },
  { to: '/dospem', label: 'Dospem' },
  { to: '/tim', label: 'Tim' }
]

export default function Layout() {
  const theme = useTheme()
  const { mahasiswa } = useAuth()
  const [open, setOpen] = useState(false)

  const linkCls = function (active) {
    return 'px-3 py-2 rounded-xl text-sm font-semibold ' + (active ? 'bg-bsi-900 text-white' : 'text-slate-600 hover:bg-slate-100')
  }

  const themeBtn = function (extra) {
    return (
      <button onClick={theme.toggle} className={'rounded-xl border border-slate-300 grid place-items-center hover:bg-slate-100 text-slate-700 ' + (extra || 'h-10 w-10')} title="Ganti tema">
        <SizedIcon name={theme.dark ? 'sun' : 'moon'} size={18} />
      </button>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-bsi-800 to-gold-500 text-white grid place-items-center font-black">BSI</div>
              <div>
                <p className="font-bold leading-none text-slate-900">Logbook Magang</p>
                <p className="text-xs text-slate-500 mt-1">Bank Syariah Indonesia</p>
              </div>
            </Link>
            <nav className="hidden xl:flex items-center gap-1">
              {LINKS.map(function (l) {
                return <NavLink key={l.to} to={l.to} className={function (s) { return linkCls(s.isActive) }}>{l.label}</NavLink>
              })}
            </nav>
            <div className="hidden xl:flex items-center gap-3">
              {themeBtn()}
              {mahasiswa ? (
                <>
                  <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-bsi-800 text-white text-sm font-semibold hover:bg-bsi-900">Dashboard</Link>
                  <Link to="/" onClick={function () { logoutMahasiswa() }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100">Keluar</Link>
                </>
              ) : (
                <Link to="/login" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700">Masuk Intern</Link>
              )}
            </div>
            <div className="flex xl:hidden items-center gap-2">
              {themeBtn()}
              <button onClick={function () { setOpen(function (o) { return !o }) }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Menu</button>
            </div>
          </div>
        </div>
        {open ? (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            {LINKS.map(function (l) {
              return <Link key={l.to} to={l.to} onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">{l.label}</Link>
            })}
            {mahasiswa ? (
              <>
                <Link to="/dashboard" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-bsi-800 text-white text-sm font-semibold">Dashboard</Link>
                <Link to="/" onClick={function () { setOpen(false); logoutMahasiswa() }} className="block px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Keluar</Link>
              </>
            ) : (
              <Link to="/login" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold">Masuk Intern</Link>
            )}
          </div>
        ) : null}
      </header>

      <main className="anim-page max-w-7xl mx-auto px-4 py-8 lg:py-10 flex-1 w-full">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Tim Magang BSI
        </div>
      </footer>
    </div>
  )
}
```

## File: src/pages/DospemPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { SkeletonLogbookCard, SkeletonPersonCard } from '../components/Skeleton.jsx'

export default function DospemPage() {
  const [logs, setLogs] = useState([])
  const [people, setPeople] = useState([])
  const [galCount, setGalCount] = useState(0)
  const [hadirCount, setHadirCount] = useState(0)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(nim, nama, prodi), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('mahasiswa').select('id, nama, nim, prodi').order('nama')
      const g = await supabase.from('galeri').select('id')
      const h = await supabase.from('daftar_hadir').select('id')
      setLogs(l.data || [])
      setPeople(p.data || [])
      setGalCount((g.data || []).length)
      setHadirCount((h.data || []).length)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-12">
        <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Monitoring Dospem dan Kaprodi</span>
        <h1 className="mt-6 text-3xl lg:text-5xl font-black max-w-3xl leading-tight">Ringkasan kegiatan magang tim di Bank BSI</h1>
        <p className="mt-4 max-w-3xl text-white/80 leading-relaxed">Halaman ini dapat diakses tanpa login.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map(function (i) {
                return (
                  <div key={i} className="rounded-[1.5rem] bg-white/10 p-5">
                    <div className="skeleton skeleton-on-dark h-4 w-24"></div>
                    <div className="skeleton skeleton-on-dark h-9 w-14 mt-2"></div>
                  </div>
                )
              })
            : [
                <div key="mahasiswa" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Total mahasiswa</p><p className="mt-1 text-3xl font-black">{people.length}</p></div>,
                <div key="logbook" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Logbook publik</p><p className="mt-1 text-3xl font-black">{logs.length}</p></div>,
                <div key="galeri" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Media galeri</p><p className="mt-1 text-3xl font-black">{galCount}</p></div>,
                <div key="hadir" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Catatan hadir</p><p className="mt-1 text-3xl font-black">{hadirCount}</p></div>
              ]}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/logbook" className="px-5 py-3 rounded-2xl bg-gold-500 text-slate-900 text-sm font-bold hover:bg-gold-400">Lihat logbook</Link>
          <Link to="/galeri" className="px-5 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold hover:bg-white/20">Lihat galeri</Link>
          <Link to="/absen" className="px-5 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold hover:bg-white/20">Lihat daftar hadir</Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Ringkasan logbook per mahasiswa</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonPersonCard key={i} /> })
            : people.map(function (p) {
                const total = logs.filter(function (l) { return l.mahasiswa_id === p.id }).length
                return (
                  <div key={p.id} className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <p className="font-bold text-slate-900">{p.nama}</p>
                    <p className="text-xs text-slate-500">NIM {p.nim}</p>
                    {p.prodi ? <p className="text-xs text-slate-400">{p.prodi}</p> : null}
                    <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Logbook publik</p>
                      <p className="mt-1 text-2xl font-black text-bsi-900">{total}</p>
                    </div>
                  </div>
                )
              })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Aktivitas yang sudah dipublikasikan</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })
            : logs.map(function (l) {
                return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
              })}
          {!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/HomePage.jsx
```javascript
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { SkeletonLogbookCard, SkeletonStatCard } from '../components/Skeleton.jsx'

export default function HomePage() {
  const { mahasiswa } = useAuth()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ logbook: 0, galeri: 0, mahasiswa: 0 })
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(nim, nama, prodi), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const g = await supabase.from('galeri').select('id')
      const p = await supabase.from('mahasiswa').select('id')
      setLogs(l.data || [])
      setStats({ logbook: (l.data || []).length, galeri: (g.data || []).length, mahasiswa: (p.data || []).length })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
        <div className="card-hover relative overflow-hidden rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Magang Bank BSI</span>
            <h1 className="mt-6 text-3xl lg:text-5xl font-black leading-tight max-w-2xl">Logbook, Galeri, dan Daftar Hadir Magang dalam Satu Portal</h1>
            <p className="mt-5 max-w-2xl text-white/80 leading-relaxed">Portal ini mencatat kegiatan harian, dokumentasi media, dan kehadiran tim magang selama membantu operasional Bank BSI.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/logbook" className="px-6 py-3 rounded-2xl bg-gold-500 text-slate-900 font-bold hover:bg-gold-400">Lihat Logbook</Link>
              <Link to="/galeri" className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20">Lihat Galeri</Link>
              <Link to="/absen" className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20">Daftar Hadir</Link>
              {mahasiswa
                ? <Link to="/dashboard" className="px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100">Buka Dashboard</Link>
                : <Link to="/login" className="px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100">Masuk Intern</Link>}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonStatCard key={i} /> })
            : [
                <StatCard key="mahasiswa" label="Total mahasiswa magang" value={stats.mahasiswa} sub="Mahasiswa terdaftar dalam tim" />,
                <StatCard key="logbook" label="Total logbook publik" value={stats.logbook} sub="Catatan kegiatan harian" />,
                <StatCard key="galeri" label="Total media galeri" value={stats.galeri} sub="Foto dan video dokumentasi" />
              ]}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Kegiatan terbaru</p>
            <h2 className="mt-2 text-2xl lg:text-3xl font-black text-slate-900">Logbook terbaru tim</h2>
          </div>
          <Link to="/logbook" className="text-sm font-semibold text-bsi-800 hover:text-bsi-950">Lihat semua logbook</Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })
            : logs.slice(0, 3).map(function (l) {
                return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
              })}
          {!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah diatur sebagai siap dilihat akan tampil di sini." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/LogbookPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters } from '../lib/format.js'
import { KATEGORI } from '../lib/constants.js'
import { SkeletonLogbookCard } from '../components/Skeleton.jsx'

const INITIAL = { mahasiswa: '', kategori: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function LogbookPage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(nim, nama, prodi), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('mahasiswa').select('id, nama').order('nama')
      setAll(l.data || [])
      setPeople(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const logs = all.filter(function (l) {
    if (filter.mahasiswa && l.mahasiswa_id !== filter.mahasiswa) return false
    if (filter.kategori && l.kategori !== filter.kategori) return false
    return matchesDateFilters(l.tanggal, filter)
  })
  const active = countActiveFilters(filter)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Logbook publik</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Catatan kegiatan magang</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Satu logbook mewakili satu hari kerja dan bisa berisi beberapa kegiatan.</p>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.user} value={filter.mahasiswa} onChange={function (v) { setFilter(Object.assign({}, filter, { mahasiswa: v })) }}
            options={[{ value: '', label: 'Semua mahasiswa' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.tag} value={filter.kategori} onChange={function (v) { setFilter(Object.assign({}, filter, { kategori: v })) }}
            options={[{ value: '', label: 'Semua kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonLogbookCard key={i} /> })
          : logs.map(function (l) {
              return <LogbookCard key={l.id} log={l} isOwner={mahasiswa && mahasiswa.id === l.mahasiswa_id}
                onDetail={function () { setDetail(l) }} />
            })}
        {!loading && !logs.length ? <EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /> : null}
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/components/cards.jsx
```javascript
import Carousel from './Carousel.jsx'
import { StatusBadge, CategoryBadge, AttendanceBadge, btnSmall } from './ui.jsx'
import { formatTanggal, formatTanggalShort } from '../lib/format.js'

function PersonChip(props) {
  const p = props.mahasiswa
  const nama = p ? p.nama : 'Mahasiswa'
  const nim = p ? p.nim : '-'
  const prodi = p && p.prodi ? p.prodi : ''
  const initials = nama.split(' ').slice(0, 2).map(function (w) { return w.charAt(0) || '' }).join('').toUpperCase()
  return (
    <div className="flex items-center gap-3">
      <div className={'rounded-2xl bg-bsi-800 text-white grid place-items-center font-bold ' + (props.size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11')}>
        {initials}
      </div>
      <div>
        <p className={'font-semibold text-slate-900 ' + (props.size === 'sm' ? 'text-sm' : '')}>{nama}</p>
        <p className="text-xs text-slate-500">NIM {nim}</p>
        {prodi ? <p className="text-xs text-slate-400">{prodi}</p> : null}
      </div>
    </div>
  )
}

function ActionButtons(props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={props.onDetail} className={btnSmall + ' bg-bsi-100 text-bsi-900 hover:bg-bsi-200'}>Detail</button>
      {props.isOwner ? (
        <>
          <button onClick={props.onEdit} className={btnSmall + ' bg-slate-900 text-white hover:bg-slate-700'}>Edit</button>
          <button onClick={props.onDelete} className={btnSmall + ' bg-red-50 text-red-700 hover:bg-red-100'}>Hapus</button>
        </>
      ) : null}
    </div>
  )
}

export function slidesFromItems(items) {
  return (items || []).filter(function (i) { return i.media_path }).map(function (i) {
    return { src: i.media_path, type: i.media_type, title: i.judul }
  })
}

export function LogbookCard(props) {
  const log = props.log
  const items = log.logbook_items || []
  const slides = slidesFromItems(items)
  const preview = items.slice(0, 2)
  return (
    <article className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      {slides.length ? <Carousel slides={slides} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge value={log.kategori} />
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{log.unit || 'Unit belum diisi'}</span>
        </div>
        <StatusBadge status={log.status} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{formatTanggal(log.tanggal)}</p>
        <h3 className="mt-2 text-xl font-bold text-slate-900">{log.judul}</h3>
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-bsi-800">Terdapat {items.length} kegiatan</p>
        <div className="mt-2 space-y-1">
          {preview.map(function (it, i) {
            return <p key={it.id} className="text-xs text-slate-500 truncate">{i + 1}. {it.judul}</p>
          })}
          {items.length > 2 ? <p className="text-xs text-bsi-700 font-semibold">+{items.length - 2} kegiatan lainnya</p> : null}
        </div>
      </div>
      <div className="mt-auto border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-4">
        <PersonChip mahasiswa={log.mahasiswa} />
        <ActionButtons isOwner={props.isOwner} onDetail={props.onDetail} onEdit={props.onEdit} onDelete={props.onDelete} />
      </div>
    </article>
  )
}

export function LogbookDetail(props) {
  const log = props.log
  const items = log.logbook_items || []
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge value={log.kategori} />
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{log.unit || 'Unit belum diisi'}</span>
        <StatusBadge status={log.status} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{formatTanggal(log.tanggal)}</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">{log.judul}</h2>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Rincian kegiatan</p>
        <div className="mt-4">
          {items.map(function (it, i) {
            return (
              <div key={it.id} className={'relative pl-12 ' + (i < items.length - 1 ? 'pb-6' : 'pb-0')}>
                <span className="absolute left-0 top-0 h-9 w-9 rounded-full bg-bsi-800 text-white grid place-items-center text-sm font-bold">{i + 1}</span>
                {i < items.length - 1 ? <span className="absolute left-4 top-9 bottom-0 w-px bg-slate-200 dark:bg-slate-700" /> : null}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {it.media_path ? (
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3">
                      {it.media_type === 'video'
                        ? <video src={it.media_path} controls className="absolute inset-0 h-full w-full object-contain" />
                        : <img src={it.media_path} alt={it.judul} className="absolute inset-0 h-full w-full object-contain" />}
                    </div>
                  ) : null}
                  <p className="font-bold text-slate-900">
                    {it.judul}
                    {it.show_in_gallery && it.media_path ? <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-500/15 text-gold-600">Di galeri</span> : null}
                  </p>
                  {it.deskripsi ? <p className="mt-1 text-sm text-slate-600">{it.deskripsi}</p> : null}
                  {it.hasil ? <p className="mt-2 inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">Hasil: {it.hasil}</p> : null}
                </div>
              </div>
            )
          })}
          {!items.length ? <p className="text-sm text-slate-500">Belum ada rincian kegiatan.</p> : null}
        </div>
      </div>
      {log.kendala || log.solusi || log.pembelajaran ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Refleksi harian</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {log.kendala ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Kendala</p><p className="mt-1 text-sm text-slate-700">{log.kendala}</p></div> : null}
            {log.solusi ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Solusi</p><p className="mt-1 text-sm text-slate-700">{log.solusi}</p></div> : null}
            {log.pembelajaran ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Pembelajaran</p><p className="mt-1 text-sm text-slate-700">{log.pembelajaran}</p></div> : null}
          </div>
        </div>
      ) : null}
      <div className="border-t border-slate-100 pt-4"><PersonChip mahasiswa={log.mahasiswa} /></div>
    </div>
  )
}

export function GalleryCard(props) {
  const item = props.item
  return (
    <article onClick={props.onDetail} className="clickable cursor-pointer bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        {item.media_type === 'video'
          ? <video src={item.media_path} muted preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
          : <img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-contain" />}
      </div>
      <div className="p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <CategoryBadge value={item.kegiatan} />
            {item.logbook_item_id ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-500/15 text-gold-600">Dari logbook</span> : null}
          </div>
          <span className="text-xs text-slate-500">{formatTanggalShort(item.tanggal)}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{item.judul}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{item.deskripsi || 'Tidak ada deskripsi.'}</p>
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <PersonChip size="sm" mahasiswa={item.mahasiswa} />
          {props.isOwner ? (
            <div className="flex gap-2" onClick={function (e) { e.stopPropagation() }}>
              <button onClick={props.onEdit} className={btnSmall + ' bg-slate-900 text-white hover:bg-slate-700'}>Edit</button>
              <button onClick={props.onDelete} className={btnSmall + ' bg-red-50 text-red-700 hover:bg-red-100'}>Hapus</button>
            </div>
          ) : <span className="text-xs font-semibold text-bsi-800">Detail</span>}
        </div>
      </div>
    </article>
  )
}

export function GalleryDetail(props) {
  const item = props.item
  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
        {item.media_type === 'video'
          ? <video src={item.media_path} controls className="absolute inset-0 h-full w-full object-contain" />
          : <img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-contain" />}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <CategoryBadge value={item.kegiatan} />
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{item.media_type === 'video' ? 'Video' : 'Foto'}</span>
        </div>
        <span className="text-sm text-slate-500">{formatTanggal(item.tanggal)}</span>
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900">{item.judul}</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">{item.deskripsi || 'Tidak ada deskripsi.'}</p>
      </div>
      <div className="border-t border-slate-100 pt-4"><PersonChip mahasiswa={item.mahasiswa} /></div>
    </div>
  )
}

export function AttendanceCard(props) {
  const row = props.row
  return (
    <div className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{formatTanggal(row.tanggal)}</p>
          <p className="mt-1 font-bold text-slate-900">{row.mahasiswa ? row.mahasiswa.nama : 'Mahasiswa'}</p>
          <p className="text-xs text-slate-500">NIM {row.mahasiswa ? row.mahasiswa.nim : '-'}</p>
        </div>
        <AttendanceBadge status={row.status} />
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alasan atau keterangan</p>
        <p className="mt-1 text-sm text-slate-700">{row.alasan || 'Tidak ada alasan.'}</p>
      </div>
      <div className="mt-4">
        <ActionButtons isOwner={props.isOwner} onDetail={props.onDetail} onEdit={props.onEdit} onDelete={props.onDelete} />
      </div>
    </div>
  )
}

export function AttendanceDetail(props) {
  const row = props.row
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{formatTanggal(row.tanggal)}</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Detail daftar hadir</h2>
        </div>
        <AttendanceBadge status={row.status} />
      </div>
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alasan atau keterangan</p>
        <p className="mt-1 text-sm text-slate-700">{row.alasan || 'Tidak ada alasan.'}</p>
      </div>
      <div className="border-t border-slate-100 pt-4"><PersonChip mahasiswa={row.mahasiswa} /></div>
    </div>
  )
}
```

## File: src/pages/AttendancePage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal } from '../components/ui.jsx'
import { AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters } from '../lib/format.js'
import { SkeletonStatCard, SkeletonChartRow, SkeletonAttendanceCard } from '../components/Skeleton.jsx'

const INITIAL = { mahasiswa: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function AttendancePage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const a = await supabase.from('daftar_hadir').select('*, mahasiswa(nim, nama, prodi)').order('tanggal', { ascending: false })
      const p = await supabase.from('mahasiswa').select('id, nama').order('nama')
      setAll(a.data || [])
      setPeople(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const rows = all.filter(function (r) {
    if (filter.mahasiswa && r.mahasiswa_id !== filter.mahasiswa) return false
    if (filter.status && r.status !== filter.status) return false
    return matchesDateFilters(r.tanggal, filter)
  })
  const active = countActiveFilters(filter)

  const counts = rows.reduce(function (acc, r) {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const perPerson = people.map(function (p) {
    const mine = rows.filter(function (r) { return r.mahasiswa_id === p.id })
    const c = mine.reduce(function (acc, r) { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {})
    return { nama: p.nama, nim: p.nim, Masuk: c.Masuk || 0, Izin: c.Izin || 0, Bolos: c.Bolos || 0, total: mine.length }
  })
  const maxTotal = Math.max.apply(null, perPerson.map(function (p) { return p.total }).concat([1]))

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Daftar hadir</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Monitoring kehadiran tim magang</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map(function (i) { return <SkeletonStatCard key={i} /> })
            : [
                <StatCard key="total" label="Total catatan hadir" value={rows.length} sub="Sesuai filter aktif" />,
                <StatCard key="masuk" label="Masuk" value={counts.Masuk || 0} sub="Mahasiswa hadir" />,
                <StatCard key="izin" label="Izin" value={counts.Izin || 0} sub="Dengan keterangan" />,
                <StatCard key="bolos" label="Bolos" value={counts.Bolos || 0} sub="Tanpa keterangan" />
              ]}
        </div>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.user} value={filter.mahasiswa} onChange={function (v) { setFilter(Object.assign({}, filter, { mahasiswa: v })) }}
            options={[{ value: '', label: 'Semua mahasiswa' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.check} value={filter.status} onChange={function (v) { setFilter(Object.assign({}, filter, { status: v })) }}
            options={[{ value: '', label: 'Semua status' }, { value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>
      </section>

      <section className="mt-8 card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900">Grafik kehadiran per mahasiswa</h2>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" />Masuk</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" />Izin</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" />Bolos</span>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonChartRow key={i} /> })
            : perPerson.map(function (p) {
                return (
                  <div key={p.nim} className="card-hover rounded-[1.5rem] border border-slate-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{p.nama}</p>
                        <p className="text-xs text-slate-500">NIM {p.nim}</p>
                      </div>
                      <div className="text-xs text-slate-500">Masuk: {p.Masuk} | Izin: {p.Izin} | Bolos: {p.Bolos}</div>
                    </div>
                    <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="bg-emerald-500 transition-all duration-500" style={{ width: (p.Masuk / maxTotal) * 100 + '%' }} />
                      <div className="bg-amber-500 transition-all duration-500" style={{ width: (p.Izin / maxTotal) * 100 + '%' }} />
                      <div className="bg-red-500 transition-all duration-500" style={{ width: (p.Bolos / maxTotal) * 100 + '%' }} />
                    </div>
                  </div>
                )
              })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Daftar kehadiran sesuai filter</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonAttendanceCard key={i} /> })
            : rows.map(function (r) {
                return <AttendanceCard key={r.id} row={r} isOwner={mahasiswa && mahasiswa.id === r.mahasiswa_id}
                  onDetail={function () { setDetail(r) }} />
              })}
          {!loading && !rows.length ? <EmptyState icon="clipboard" title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah mahasiswa mengisi daftar hadir." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <AttendanceDetail row={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/TimPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { SkeletonPersonCard } from '../components/Skeleton.jsx'

export default function TimPage() {
  const [people, setPeople] = useState([])
  const [logs, setLogs] = useState([])
  const [galeri, setGaleri] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const p = await supabase.from('mahasiswa').select('id, nama, nim, prodi').order('nama')
      const l = await supabase.from('logbooks').select('id, mahasiswa_id').eq('status', 'publik')
      const g = await supabase.from('galeri').select('id, mahasiswa_id')
      setPeople(p.data || [])
      setLogs(l.data || [])
      setGaleri(g.data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Profil Mahasiswa</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Mahasiswa magang Bank BSI</h1>
      </section>
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonPersonCard key={i} /> })
          : people.map(function (p) {
              const totalLog = logs.filter(function (l) { return l.mahasiswa_id === p.id }).length
              const totalGal = galeri.filter(function (g) { return g.mahasiswa_id === p.id }).length
              const initials = p.nama.split(' ').slice(0, 2).map(function (w) { return w.charAt(0) || '' }).join('').toUpperCase()
              return (
                <div key={p.id} className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-3xl bg-bsi-800 text-white grid place-items-center text-xl font-black">{initials}</div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{p.nama}</p>
                      <p className="text-sm text-slate-500">NIM {p.nim}</p>
                      {p.prodi ? <span className="mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bsi-100 text-bsi-900">{p.prodi}</span> : null}
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Logbook publik</p><p className="mt-1 text-2xl font-black text-bsi-900">{totalLog}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Media galeri</p><p className="mt-1 text-2xl font-black text-bsi-900">{totalGal}</p></div>
                  </div>
                </div>
              )
            })}
      </section>
    </div>
  )
}
```

## File: src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===== Animasi ===== */
@keyframes appFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes modalPop { from { opacity: 0; transform: scale(.95) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes toastSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes filterSlide { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }
.anim-page { animation: appFadeUp .35s ease; }
.anim-toast { animation: toastSlide .35s ease; }
.anim-overlay { animation: overlayFade .25s ease; }
.anim-modal { animation: modalPop .3s cubic-bezier(.16,1,.3,1); }
.anim-filter { animation: filterSlide .3s ease; }

/* ===== Komponen umum ===== */
body { transition: background-color .3s ease, color .3s ease; }
button, a, input, select, textarea { transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .15s ease, box-shadow .2s ease, opacity .2s ease; }
button:active, a:active, .clickable:active { transform: scale(.97); }
.card-hover { transition: none; }
.card-hover:hover { transform: none; }

/* ===== Carousel ===== */
.media-carousel { position: relative; overflow: hidden; border-radius: 1rem; aspect-ratio: 16 / 9; background: #020617; }
.carousel-track { display: flex; height: 100%; transition: transform .5s ease; }
.carousel-slide { position: relative; flex: 0 0 100%; height: 100%; }
.carousel-slide img, .carousel-slide video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #020617; }
.media-carousel button:active { transform: translateY(-50%) scale(.97); }

/* ===== Filter ===== */
.filter-input-wrap { position: relative; display: inline-flex; align-items: center; }
.filter-input-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; z-index: 1; }
.filter-input-wrap select, .filter-input-wrap input { padding-left: 38px !important; }
.time-toggle { display: inline-flex; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; }
.time-toggle button { padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #64748b; }
.time-toggle button.active { background: #16623c; color: #fff; }

/* ===== Dark mode ===== */
.dark body { background-color: #020617; color: #e2e8f0; }
.dark .bg-white { background-color: #0f172a !important; }
.dark .bg-slate-50 { background-color: #020617 !important; }
.dark .bg-slate-100 { background-color: #1e293b !important; }
.dark .bg-slate-900 { background-color: #f8fafc !important; color: #0f172a !important; }
.dark .bg-white\/90 { background-color: rgba(2,6,23,.9) !important; }
.dark .bg-white\/10 { background-color: rgba(255,255,255,.07) !important; }
.dark .bg-white\/5 { background-color: rgba(255,255,255,.04) !important; }
.dark .border-slate-100, .dark .border-slate-200, .dark .border-slate-300, .dark .border-white\/10 { border-color: #1e293b !important; }
.dark .text-slate-900, .dark .text-slate-800, .dark .text-slate-700 { color: #f8fafc !important; }
.dark .text-slate-600, .dark .text-slate-500, .dark .text-slate-400 { color: #94a3b8 !important; }
.dark .hover\:bg-slate-100:hover { background-color: #1e293b !important; color: #f8fafc !important; }
.dark .hover\:bg-slate-200:hover { background-color: #0f172a !important; color: #f8fafc !important; }
.dark input, .dark select, .dark textarea { background-color: #0f172a; color: #e2e8f0; border-color: #334155; }
.dark input::placeholder, .dark textarea::placeholder { color: #64748b; }
.dark .bg-emerald-50, .dark .bg-emerald-100 { background-color: rgba(16,185,129,.14) !important; }
.dark .text-emerald-800, .dark .text-emerald-900 { color: #6ee7b7 !important; }
.dark .bg-amber-50, .dark .bg-amber-100 { background-color: rgba(245,158,11,.14) !important; }
.dark .text-amber-800 { color: #fcd34d !important; }
.dark .bg-red-50, .dark .bg-red-100 { background-color: rgba(239,68,68,.14) !important; }
.dark .text-red-700 { color: #fca5a5 !important; }
.dark .bg-bsi-100 { background-color: rgba(39,192,109,.16) !important; }
.dark .text-bsi-900, .dark .text-bsi-800, .dark .text-bsi-700 { color: #6ee7b7 !important; }
.dark .bg-bsi-800, .dark .bg-bsi-900 { background-color: #065f46 !important; }
.dark .text-gold-600, .dark .text-gold-500 { color: #fbbf24 !important; }
.dark .bg-gold-500\/15 { background-color: rgba(245,158,11,.15) !important; }
.dark .bg-gold-500 { color: #0f172a !important; }
.dark .time-toggle { border-color: #334155; }
.dark .time-toggle button { color: #94a3b8; }
.dark .time-toggle button.active { background: #065f46; color: #fff; }

/* ===== Skeleton loader ===== */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.skeleton {
  position: relative;
  overflow: hidden;
  background-color: #e2e8f0;
  border-radius: 0.75rem;
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: shimmer 1.4s infinite;
}
.dark .skeleton { background-color: #1e293b; }
.dark .skeleton::after { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
.skeleton-on-dark { background-color: rgba(255,255,255,0.15); }
.skeleton-on-dark::after { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); }

/* ===== Textarea tanpa resize manual ===== */
textarea {
  resize: none;
  overflow-y: hidden;
}

/* ===== Scrollbar custom tipis bertema ===== */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.dark * {
  scrollbar-color: #334155 transparent;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #16623c;
}
.dark ::-webkit-scrollbar-thumb {
  background-color: #334155;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background-color: #27c06d;
}
```

## File: src/components/ui.jsx
```javascript
import { useEffect, useRef } from 'react'
import { SizedIcon } from './icons.jsx'
function useBodyScrollLock(active) {
  useEffect(function () {
    if (!active) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return function () {
      document.body.style.overflow = previous
    }
  }, [active])
}


export const inputCls = 'mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-bsi-500'
export const labelCls = 'text-sm font-semibold text-slate-700'
export const btnPrimary = 'w-full rounded-2xl bg-bsi-800 px-6 py-4 text-white font-bold hover:bg-bsi-900'
export const btnSmall = 'px-4 py-2 rounded-xl text-sm font-semibold'
export const cardCls = 'card-hover bg-white rounded-3xl border border-slate-200 shadow-sm'

export function StatCard(props) {
  return (
    <div className={cardCls + ' p-6'}>
      <p className="text-sm text-slate-500">{props.label}</p>
      <p className="mt-2 text-3xl font-black text-bsi-900">{props.value}</p>
      {props.sub ? <p className="mt-1 text-xs text-slate-500">{props.sub}</p> : null}
    </div>
  )
}

export function EmptyState(props) {
  return (
    <div className={cardCls + ' border-dashed p-10 text-center'}>
      <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 grid place-items-center text-slate-400">
        <SizedIcon name={props.icon || 'file'} size={24} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-800">{props.title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{props.desc}</p>
    </div>
  )
}

export function StatusBadge(props) {
  const publik = props.status === 'publik'
  return (
    <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (publik ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
      {publik ? 'Siap dilihat' : 'Draft'}
    </span>
  )
}

export function CategoryBadge(props) {
  return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bsi-100 text-bsi-900">{props.value || 'Lainnya'}</span>
}

export function AttendanceBadge(props) {
  const map = {
    Masuk: 'bg-emerald-100 text-emerald-800',
    Izin: 'bg-amber-100 text-amber-800',
    Bolos: 'bg-red-100 text-red-700'
  }
  return <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (map[props.status] || 'bg-slate-100 text-slate-700')}>{props.status}</span>
}

export function Modal(props) {
  useBodyScrollLock(props.open)
  if (!props.open) return null
  return (
    <div className="anim-overlay fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onClose}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <p className="font-bold text-slate-900">{props.title || 'Detail'}</p>
            <button onClick={props.onClose} className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 grid place-items-center">
              <SizedIcon name="close" size={16} />
            </button>
          </div>
          <div className="p-6">{props.children}</div>
        </div>
      </div>
    </div>
  )
}

export function AutoTextArea(props) {
  const ref = useRef(null)

  useEffect(function () {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [props.value])

  return (
    <textarea
      ref={ref}
      className={props.className}
      rows={props.rows || 2}
      value={props.value}
      placeholder={props.placeholder}
      onChange={props.onChange}
      disabled={props.disabled || false}
    />
  )
}

export function ConfirmModal(props) {
  useBodyScrollLock(props.open)
  if (!props.open) return null
  return (
    <div className="anim-overlay fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onCancel}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-md rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
          <div className="p-6 space-y-4">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-red-100 text-red-600 grid place-items-center">
              <SizedIcon name="trash" size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900">{props.title || 'Hapus data ini?'}</h3>
              <p className="mt-2 text-sm text-slate-500">{props.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={props.onCancel}
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Batal
              </button>
              <button type="button" onClick={props.onConfirm}
                className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600">
                {props.confirmLabel || 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## File: src/pages/GalleryPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal } from '../components/ui.jsx'
import { GalleryCard, GalleryDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters } from '../lib/format.js'
import { GALERI_KEGIATAN } from '../lib/constants.js'
import { SkeletonGalleryCard } from '../components/Skeleton.jsx'

const INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function GalleryPage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const g = await supabase.from('galeri').select('*, mahasiswa(nim, nama, prodi)').order('tanggal', { ascending: false })
      setAll(g.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const items = all.filter(function (i) {
    if (filter.kegiatan && (i.kegiatan || 'Lainnya') !== filter.kegiatan) return false
    if (filter.tipe && i.media_type !== filter.tipe) return false
    return matchesDateFilters(i.tanggal, filter)
  })
  const active = countActiveFilters(filter)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Galeri dokumentasi</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Foto dan video kegiatan magang</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Setiap kartu mewakili satu kegiatan. Klik media untuk melihat detail.</p>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.tag} value={filter.kegiatan} onChange={function (v) { setFilter(Object.assign({}, filter, { kegiatan: v })) }}
            options={[{ value: '', label: 'Semua kegiatan' }].concat(GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } }))} />
          <FilterSelect icon={ICONS.image} value={filter.tipe} onChange={function (v) { setFilter(Object.assign({}, filter, { tipe: v })) }}
            options={[{ value: '', label: 'Semua media' }, { value: 'foto', label: 'Foto' }, { value: 'video', label: 'Video' }]} />
          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonGalleryCard key={i} /> })
          : items.map(function (i) {
              return <GalleryCard key={i.id} item={i} isOwner={mahasiswa && mahasiswa.id === i.mahasiswa_id}
                onDetail={function () { setDetail(i) }} />
            })}
        {!loading && !items.length ? <EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /> : null}
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <GalleryDetail item={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/DashboardPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { uploadMedia, deleteMedia } from '../lib/upload.js'
import { syncGaleriFromLogbook } from '../lib/logbook.js'
import { todayInput, detectMediaType, matchesDateFilters } from '../lib/format.js'
import { KATEGORI, UNIT, GALERI_KEGIATAN } from '../lib/constants.js'
import { EmptyState, Modal, ConfirmModal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail, GalleryCard, GalleryDetail, AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { CustomSelect, CustomDateInput, FileInput } from '../components/controls.jsx'
import { SizedIcon, ICONS } from '../components/icons.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'

function newItem() {
  return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', show: false }
}

const LOG_INITIAL = { kategori: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const GAL_INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const HADIR_INITIAL = { status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function DashboardPage() {
  const { mahasiswa, loading } = useAuth()
  const [tab, setTab] = useState('logbook')
  const [logs, setLogs] = useState([])
  const [galeri, setGaleri] = useState([])
  const [hadir, setHadir] = useState([])
  const [detail, setDetail] = useState(null)

  const [form, setForm] = useState({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
  const [items, setItems] = useState([newItem()])
  const [editLogId, setEditLogId] = useState(null)

  const [galForm, setGalForm] = useState({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '' })
  const [editGalId, setEditGalId] = useState(null)

  const [hadirForm, setHadirForm] = useState({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
  const [editHadirId, setEditHadirId] = useState(null)

  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const [logFilter, setLogFilter] = useState(LOG_INITIAL)
  const [logFilterOpen, setLogFilterOpen] = useState(false)
  const [galFilter, setGalFilter] = useState(GAL_INITIAL)
  const [galFilterOpen, setGalFilterOpen] = useState(false)
  const [hadirFilter, setHadirFilter] = useState(HADIR_INITIAL)
  const [hadirFilterOpen, setHadirFilterOpen] = useState(false)

  async function refresh() {
    if (!mahasiswa) return
    const l = await supabase.from('logbooks').select('*, mahasiswa(nim, nama, prodi), logbook_items(*)')
      .eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
      .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
    const g = await supabase.from('galeri').select('*, mahasiswa(nim, nama, prodi)').eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
    const h = await supabase.from('daftar_hadir').select('*, mahasiswa(nim, nama, prodi)').eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
    setLogs(l.data || [])
    setGaleri(g.data || [])
    setHadir(h.data || [])
  }

  useEffect(function () {
    if (mahasiswa) refresh()
  }, [mahasiswa])

  if (loading || !mahasiswa) {
    return <div className="p-10 text-center text-slate-500">Memuat sesi...</div>
  }

  function patchItem(i, patch) {
    setItems(function (prev) {
      return prev.map(function (it, idx) { return idx === i ? Object.assign({}, it, patch) : it })
    })
  }

  function onItemFile(i, file) {
    if (!file) return
    patchItem(i, { file: file, preview: URL.createObjectURL(file) })
  }

  function removeItemFile(i) {
    patchItem(i, { file: null, preview: '', oldPath: '', show: false })
  }

  function keyDariUrl(url) {
    try {
      return new URL(url).pathname.slice(1)
    } catch (e) {
      return ''
    }
  }

  async function hapusMediaR2(url) {
    const key = keyDariUrl(url)
    if (key) await deleteMedia(key)
  }

  async function submitLogbook(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const clean = []
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        if (!it.judul.trim()) continue
        let mediaPath = ''
        let mediaType = ''
        if (it.file) {
          const up = await uploadMedia(it.file, 'logbook')
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, show_in_gallery: it.show && !!mediaPath })
      }
      if (!clean.length) { alert('Tambahkan minimal satu kegiatan dengan judul.'); setBusy(false); return }

      let logId = editLogId
      let oldUrls = []
      if (editLogId) {
        const oldItems = await supabase.from('logbook_items').select('media_path').eq('logbook_id', editLogId)
        oldUrls = (oldItems.data || []).map(function (it) { return it.media_path }).filter(Boolean)
        await supabase.from('logbooks').update({
          tanggal: form.tanggal, unit: form.unit, kategori: form.kategori, judul: form.judul,
          kendala: form.kendala, solusi: form.solusi, pembelajaran: form.pembelajaran, status: form.status
        }).eq('id', editLogId)
        await supabase.from('logbook_items').delete().eq('logbook_id', editLogId)
      } else {
        const ins = await supabase.from('logbooks').insert({
          mahasiswa_id: mahasiswa.id, tanggal: form.tanggal, unit: form.unit, kategori: form.kategori, judul: form.judul,
          kendala: form.kendala, solusi: form.solusi, pembelajaran: form.pembelajaran, status: form.status
        }).select().single()
        logId = ins.data.id
      }

      const rows = clean.map(function (c, idx) {
        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, show_in_gallery: c.show_in_gallery }
      })
      const insItems = await supabase.from('logbook_items').insert(rows).select()
      await syncGaleriFromLogbook(mahasiswa.id, insItems.data || [], { tanggal: form.tanggal, kategori: form.kategori })

      setEditLogId(null)
      setForm({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
      setItems([newItem()])
      await refresh()
    } catch (err) {
      alert('Gagal menyimpan logbook: ' + err.message)
    }
    setBusy(false)
  }

  function startEditLog(log) {
    setEditLogId(log.id)
    setForm({
      tanggal: log.tanggal, unit: log.unit || '', kategori: log.kategori, judul: log.judul,
      kendala: log.kendala || '', solusi: log.solusi || '', pembelajaran: log.pembelajaran || '', status: log.status
    })
    setItems((log.logbook_items || []).map(function (it) {
      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_path || '', show: it.show_in_gallery }
    }))
    if (!items.length) setItems([newItem()])
    setTab('logbook')
  }

  function deleteLog(log) {
    setPendingDelete({ type: 'log', data: log })
  }

  async function submitGaleri(e) {
    e.preventDefault()
    setBusy(true)
    try {
      let mediaPath = ''
      let mediaType = ''
      if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri')
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
      }
      if (!mediaPath) { alert('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
      const payload = {
        mahasiswa_id: mahasiswa.id,
        judul: galForm.judul || ('Dokumentasi ' + galForm.tanggal),
        deskripsi: galForm.deskripsi,
        tanggal: galForm.tanggal,
        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType
      }
      let oldGalUrl = ''
      if (editGalId) {
        const existing = galeri.find(function (g) { return g.id === editGalId })
        oldGalUrl = existing && !existing.logbook_item_id && existing.media_path !== payload.media_path ? existing.media_path : ''
        await supabase.from('galeri').update(payload).eq('id', editGalId)
      } else {
        await supabase.from('galeri').insert(payload)
      }
      if (oldGalUrl) await hapusMediaR2(oldGalUrl)
      setEditGalId(null)
      setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '' })
      await refresh()
    } catch (err) {
      alert('Gagal menyimpan galeri: ' + err.message)
    }
    setBusy(false)
  }

  function deleteGaleri(item) {
    setPendingDelete({ type: 'gal', data: item })
  }

  async function submitHadir(e) {
    e.preventDefault()
    setBusy(true)
    const payload = { mahasiswa_id: mahasiswa.id, tanggal: hadirForm.tanggal, status: hadirForm.status, alasan: hadirForm.status === 'Masuk' ? '' : hadirForm.alasan }
    if (editHadirId) {
      await supabase.from('daftar_hadir').update(payload).eq('id', editHadirId)
    } else {
      const res = await supabase.from('daftar_hadir').insert(payload)
      if (res.error) { alert('Kamu sudah punya catatan hadir di tanggal tersebut.'); setBusy(false); return }
    }
    setEditHadirId(null)
    setHadirForm({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
    await refresh()
    setBusy(false)
  }

  function deleteHadir(row) {
    setPendingDelete({ type: 'hadir', data: row })
  }

  function confirmInfo() {
    if (!pendingDelete) return null
    if (pendingDelete.type === 'media-item') {
      return {
        title: 'Hapus gambar?',
        message: 'Lampiran gambar pada kegiatan ini akan dibatalkan. Kamu bisa memilih file lain setelahnya.'
      }
    }
    if (pendingDelete.type === 'media-gal') {
      return {
        title: 'Hapus gambar?',
        message: 'Lampiran gambar pada form galeri akan dibatalkan. Kamu bisa memilih file lain setelahnya.'
      }
    }
    if (pendingDelete.type === 'log') {
      return {
        title: 'Hapus logbook?',
        message: 'Logbook "' + pendingDelete.data.judul + '" beserta seluruh rincian kegiatannya akan dihapus permanen. Media galeri yang terhubung dari logbook ini juga ikut terhapus.'
      }
    }
    if (pendingDelete.type === 'gal') {
      const extra = pendingDelete.data.logbook_item_id
        ? ' Media ini berasal dari logbook, jadi logbook asalnya tidak ikut terhapus.'
        : ''
      return {
        title: 'Hapus media galeri?',
        message: 'Media "' + pendingDelete.data.judul + '" akan dihapus permanen dari galeri kamu.' + extra
      }
    }
    return {
      title: 'Hapus catatan hadir?',
      message: 'Catatan kehadiran tanggal ' + pendingDelete.data.tanggal + ' dengan status ' + pendingDelete.data.status + ' akan dihapus permanen.'
    }
  }

  async function executeDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setPendingDelete(null)
    if (target.type === 'media-item') {
      removeItemFile(target.data)
      return
    }
    if (target.type === 'media-gal') {
      setGalForm(function (g) { return Object.assign({}, g, { file: null, preview: '', oldPath: '' }) })
      return
    }
    if (target.type === 'log') {
      const urls = (target.data.logbook_items || []).map(function (it) { return it.media_path }).filter(Boolean)
      await supabase.from('logbooks').delete().eq('id', target.data.id)
      for (const u of urls) await hapusMediaR2(u)
    } else if (target.type === 'gal') {
      const url = target.data.logbook_item_id ? '' : target.data.media_path
      await supabase.from('galeri').delete().eq('id', target.data.id)
      if (url) await hapusMediaR2(url)
    } else if (target.type === 'hadir') {
      await supabase.from('daftar_hadir').delete().eq('id', target.data.id)
    }
    await refresh()
  }

  const filteredLogs = logs.filter(function (l) {
    if (logFilter.kategori && l.kategori !== logFilter.kategori) return false
    if (logFilter.status && l.status !== logFilter.status) return false
    return matchesDateFilters(l.tanggal, logFilter)
  })
  const logFilterActive = countActiveFilters(logFilter)

  const filteredGaleri = galeri.filter(function (g) {
    if (galFilter.kegiatan && (g.kegiatan || 'Lainnya') !== galFilter.kegiatan) return false
    if (galFilter.tipe && g.media_type !== galFilter.tipe) return false
    return matchesDateFilters(g.tanggal, galFilter)
  })
  const galFilterActive = countActiveFilters(galFilter)

  const filteredHadir = hadir.filter(function (h) {
    if (hadirFilter.status && h.status !== hadirFilter.status) return false
    return matchesDateFilters(h.tanggal, hadirFilter)
  })
  const hadirFilterActive = countActiveFilters(hadirFilter)

  const tabCls = function (t) {
    return 'px-5 py-3 rounded-2xl text-sm font-bold ' + (tab === t ? 'bg-bsi-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
  }

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm text-slate-500">Dashboard mahasiswa</p>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900">{mahasiswa.nama}</h1>
            <p className="text-sm text-slate-500">NIM {mahasiswa.nim}</p>
            {mahasiswa.prodi ? <p className="text-sm text-slate-500">{mahasiswa.prodi}</p> : null}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={function () { setTab('logbook') }} className={tabCls('logbook')}>Logbook</button>
          <button onClick={function () { setTab('galeri') }} className={tabCls('galeri')}>Galeri</button>
          <button onClick={function () { setTab('absen') }} className={tabCls('absen')}>Daftar Hadir</button>
        </div>
      </section>

      {tab === 'logbook' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">{editLogId ? 'Ubah logbook harian' : 'Tambah logbook harian'}</h2>
            <form onSubmit={submitLogbook} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Tanggal <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomDateInput value={form.tanggal} onChange={function (v) { setForm(Object.assign({}, form, { tanggal: v })) }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Unit utama</label>
                  <div className="mt-1.5">
                    <CustomSelect placeholder="Pilih unit" value={form.unit}
                      onChange={function (v) { setForm(Object.assign({}, form, { unit: v })) }}
                      options={UNIT.map(function (u) { return { value: u, label: u } })} />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Kategori utama <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomSelect placeholder="Pilih kategori" value={form.kategori}
                      onChange={function (v) { setForm(Object.assign({}, form, { kategori: v })) }}
                      options={KATEGORI.map(function (k) { return { value: k, label: k } })} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Status tampil</label>
                  <div className="mt-1.5">
                    <CustomSelect value={form.status}
                      onChange={function (v) { setForm(Object.assign({}, form, { status: v })) }}
                      options={[{ value: 'draft', label: 'Draft' }, { value: 'publik', label: 'Siap dilihat' }]} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Ringkasan hari ini <span className="text-red-500">*</span></label>
                <input required className={inputCls} value={form.judul} onChange={function (e) { setForm(Object.assign({}, form, { judul: e.target.value })) }} placeholder="Contoh: Kegiatan harian di divisi Back Office" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Rincian kegiatan hari ini <span className="text-red-500">*</span></p>
                  <button type="button" onClick={function () { setItems(function (p) { return p.concat([newItem()]) }) }} className={btnSmall + ' bg-bsi-100 text-bsi-900 hover:bg-bsi-200'}>+ Tambah kegiatan</button>
                </div>
                {items.map(function (it, i) {
                  return (
                    <div key={it.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-bsi-800">Kegiatan {i + 1}</span>
                        {items.length > 1 ? <button type="button" onClick={function () { setItems(function (p) { return p.filter(function (x, idx) { return idx !== i }) }) }} className="text-xs text-red-600 hover:underline">Hapus</button> : null}
                      </div>
                      <input className={inputCls} value={it.judul} onChange={function (e) { patchItem(i, { judul: e.target.value }) }} placeholder="Judul kegiatan" />
                      <AutoTextArea className={inputCls} value={it.deskripsi} onChange={function (e) { patchItem(i, { deskripsi: e.target.value }) }} placeholder="Deskripsi singkat kegiatan" />
                      <input className={inputCls} value={it.hasil} onChange={function (e) { patchItem(i, { hasil: e.target.value }) }} placeholder="Hasil (opsional)" />
                      {it.preview ? (
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                          {it.file && it.file.type.indexOf('video') === 0
                            ? <video src={it.preview} className="absolute inset-0 h-full w-full object-contain" muted />
                            : <img src={it.preview} alt="Pratinjau" className="absolute inset-0 h-full w-full object-contain" />}
                          <button type="button" onClick={function () { setPendingDelete({ type: 'media-item', data: i }) }} title="Hapus gambar"
                            className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                            <SizedIcon name="close" size={14} />
                          </button>
                        </div>
                      ) : null}
                      <FileInput accept="image/*,video/*" fileName={it.file ? it.file.name : ''}
                        onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                      <label className={'flex items-start gap-3 rounded-2xl border p-3 cursor-pointer w-full ' + (it.preview ? (it.show ? 'border-gold-500 bg-gold-500/5' : 'border-slate-200') : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed')}>
                        <input type="checkbox" disabled={!it.preview} checked={it.show} onChange={function (e) { patchItem(i, { show: e.target.checked }) }} className="mt-0.5 h-4 w-4 rounded accent-bsi-800" />
                        <span className="text-sm font-semibold text-slate-800">Tampilkan kegiatan ini di galeri</span>
                      </label>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div><label className={labelCls}>Kendala</label><AutoTextArea className={inputCls} value={form.kendala} onChange={function (e) { setForm(Object.assign({}, form, { kendala: e.target.value })) }} placeholder="Opsional" /></div>
                <div><label className={labelCls}>Solusi</label><AutoTextArea className={inputCls} value={form.solusi} onChange={function (e) { setForm(Object.assign({}, form, { solusi: e.target.value })) }} placeholder="Opsional" /></div>
                <div><label className={labelCls}>Pembelajaran</label><AutoTextArea className={inputCls} value={form.pembelajaran} onChange={function (e) { setForm(Object.assign({}, form, { pembelajaran: e.target.value })) }} placeholder="Opsional" /></div>
              </div>

              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Menyimpan...' : (editLogId ? 'Simpan perubahan' : 'Simpan logbook')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">Logbook kamu</h2>
            <FilterBar open={logFilterOpen} onToggle={function () { setLogFilterOpen(function (o) { return !o }) }} activeCount={logFilterActive}
              onReset={function () { setLogFilter(LOG_INITIAL) }}>
              <FilterSelect icon={ICONS.tag} value={logFilter.kategori} onChange={function (v) { setLogFilter(Object.assign({}, logFilter, { kategori: v })) }}
                options={[{ value: '', label: 'Semua kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
              <FilterSelect icon={ICONS.check} value={logFilter.status} onChange={function (v) { setLogFilter(Object.assign({}, logFilter, { status: v })) }}
                options={[{ value: '', label: 'Semua status' }, { value: 'draft', label: 'Draft' }, { value: 'publik', label: 'Siap dilihat' }]} />
              <TimeFilter filter={logFilter} set={setLogFilter} />
            </FilterBar>
            <p className="text-sm text-slate-500">Menampilkan {filteredLogs.length} dari {logs.length} logbook</p>
            {filteredLogs.map(function (l) {
              return <LogbookCard key={l.id} log={l} isOwner
                onDetail={function () { setDetail({ type: 'log', data: l }) }}
                onEdit={function () { startEditLog(l) }}
                onDelete={function () { deleteLog(l) }} />
            })}
            {!filteredLogs.length ? <EmptyState title={logs.length ? 'Logbook tidak ditemukan' : 'Belum ada logbook'} desc={logs.length ? 'Coba reset filter atau pilih filter lain.' : 'Tambahkan logbook harian pertama kamu.'} /> : null}
          </div>
        </section>
      ) : null}

      {tab === 'galeri' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">{editGalId ? 'Ubah media galeri' : 'Tambah media galeri'}</h2>
            <form onSubmit={submitGaleri} className="mt-6 space-y-4">
              <div>
                <label className={labelCls}>Pilih foto atau video {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5">
                  <FileInput accept="image/*,video/*" fileName={galForm.file ? galForm.file.name : ''}
                    onChange={function (e) {
                      const f = e.target.files[0]
                      if (!f) return
                      setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f) }) })
                    }} />
                </div>
              </div>
              {galForm.preview ? (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                  {galForm.file && galForm.file.type.indexOf('video') === 0
                    ? <video src={galForm.preview} className="absolute inset-0 h-full w-full object-contain" muted />
                    : <img src={galForm.preview} alt="Pratinjau" className="absolute inset-0 h-full w-full object-contain" />}
                  <button type="button" onClick={function () { setPendingDelete({ type: 'media-gal' }) }} title="Hapus gambar"
                    className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                    <SizedIcon name="close" size={14} />
                  </button>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Judul (opsional)</label><input className={inputCls} value={galForm.judul} onChange={function (e) { setGalForm(Object.assign({}, galForm, { judul: e.target.value })) }} placeholder="Kosongkan untuk judul otomatis" /></div>
                <div>
                  <label className={labelCls}>Tanggal (opsional)</label>
                  <div className="mt-1.5">
                    <CustomDateInput value={galForm.tanggal} onChange={function (v) { setGalForm(Object.assign({}, galForm, { tanggal: v })) }} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Kegiatan (opsional)</label>
                <div className="mt-1.5">
                  <CustomSelect placeholder="Pilih kegiatan" value={galForm.kegiatan}
                    onChange={function (v) { setGalForm(Object.assign({}, galForm, { kegiatan: v })) }}
                    options={GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } })} />
                </div>
              </div>
              <div><label className={labelCls}>Deskripsi (opsional)</label><AutoTextArea className={inputCls} value={galForm.deskripsi} onChange={function (e) { setGalForm(Object.assign({}, galForm, { deskripsi: e.target.value })) }} placeholder="Tambahkan keterangan media." /></div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Menyimpan...' : (editGalId ? 'Simpan perubahan media' : 'Unggah media')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">Galeri kamu</h2>
            <FilterBar open={galFilterOpen} onToggle={function () { setGalFilterOpen(function (o) { return !o }) }} activeCount={galFilterActive}
              onReset={function () { setGalFilter(GAL_INITIAL) }}>
              <FilterSelect icon={ICONS.tag} value={galFilter.kegiatan} onChange={function (v) { setGalFilter(Object.assign({}, galFilter, { kegiatan: v })) }}
                options={[{ value: '', label: 'Semua kegiatan' }].concat(GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } }))} />
              <FilterSelect icon={ICONS.image} value={galFilter.tipe} onChange={function (v) { setGalFilter(Object.assign({}, galFilter, { tipe: v })) }}
                options={[{ value: '', label: 'Semua media' }, { value: 'foto', label: 'Foto' }, { value: 'video', label: 'Video' }]} />
              <TimeFilter filter={galFilter} set={setGalFilter} />
            </FilterBar>
            <p className="text-sm text-slate-500">Menampilkan {filteredGaleri.length} dari {galeri.length} media</p>
            <div className="grid gap-5 md:grid-cols-2">
              {filteredGaleri.map(function (g) {
                return <GalleryCard key={g.id} item={g} isOwner
                  onDetail={function () { setDetail({ type: 'gal', data: g }) }}
                  onEdit={function () { setEditGalId(g.id); setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path }) }}
                  onDelete={function () { deleteGaleri(g) }} />
              })}
              {!filteredGaleri.length ? <EmptyState icon="camera" title={galeri.length ? 'Media tidak ditemukan' : 'Belum ada media galeri'} desc={galeri.length ? 'Coba reset filter atau pilih filter lain.' : 'Unggah foto atau video pertama kamu.'} /> : null}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'absen' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">{editHadirId ? 'Ubah daftar hadir' : 'Isi daftar hadir'}</h2>
            <form onSubmit={submitHadir} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Tanggal <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomDateInput value={hadirForm.tanggal} onChange={function (v) { setHadirForm(Object.assign({}, hadirForm, { tanggal: v })) }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Status kehadiran <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomSelect value={hadirForm.status}
                      onChange={function (v) { setHadirForm(Object.assign({}, hadirForm, { status: v, alasan: v === 'Masuk' ? '' : hadirForm.alasan })) }}
                      options={[{ value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Alasan atau keterangan</label>
                <AutoTextArea
                  className={inputCls + (hadirForm.status === 'Masuk' ? ' opacity-60 cursor-not-allowed' : '')}
                  value={hadirForm.alasan}
                  onChange={function (e) { setHadirForm(Object.assign({}, hadirForm, { alasan: e.target.value })) }}
                  placeholder={hadirForm.status === 'Masuk' ? 'Status Masuk tidak memerlukan alasan' : 'Contoh: Keperluan keluarga, sakit.'}
                  disabled={hadirForm.status === 'Masuk'}
                />
                {hadirForm.status === 'Masuk' ? <p className="mt-1 text-xs text-slate-400">Field ini hanya terisi untuk status Izin atau Bolos.</p> : null}
              </div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Menyimpan...' : (editHadirId ? 'Simpan perubahan' : 'Simpan daftar hadir')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">Daftar hadir kamu</h2>
            <FilterBar open={hadirFilterOpen} onToggle={function () { setHadirFilterOpen(function (o) { return !o }) }} activeCount={hadirFilterActive}
              onReset={function () { setHadirFilter(HADIR_INITIAL) }}>
              <FilterSelect icon={ICONS.check} value={hadirFilter.status} onChange={function (v) { setHadirFilter(Object.assign({}, hadirFilter, { status: v })) }}
                options={[{ value: '', label: 'Semua status' }, { value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
              <TimeFilter filter={hadirFilter} set={setHadirFilter} />
            </FilterBar>
            <p className="text-sm text-slate-500">Menampilkan {filteredHadir.length} dari {hadir.length} catatan</p>
            {filteredHadir.map(function (h) {
              return <AttendanceCard key={h.id} row={h} isOwner
                onDetail={function () { setDetail({ type: 'hadir', data: h }) }}
                onEdit={function () { setEditHadirId(h.id); setHadirForm({ tanggal: h.tanggal, status: h.status, alasan: h.alasan || '' }) }}
                onDelete={function () { deleteHadir(h) }} />
            })}
            {!filteredHadir.length ? <EmptyState icon="clipboard" title={hadir.length ? 'Catatan tidak ditemukan' : 'Belum ada data kehadiran'} desc={hadir.length ? 'Coba reset filter atau pilih filter lain.' : 'Isi daftar hadir pertama kamu.'} /> : null}
          </div>
        </section>
      ) : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail && detail.type === 'log' ? <LogbookDetail log={detail.data} /> : null}
        {detail && detail.type === 'gal' ? <GalleryDetail item={detail.data} /> : null}
        {detail && detail.type === 'hadir' ? <AttendanceDetail row={detail.data} /> : null}
      </Modal>

      {pendingDelete ? (
        <ConfirmModal
          open={true}
          title={confirmInfo().title}
          message={confirmInfo().message}
          onCancel={function () { setPendingDelete(null) }}
          onConfirm={executeDelete}
        />
      ) : null}
    </div>
  )
}
```
