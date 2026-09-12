const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { spawnSync } = require('child_process')

const FILES = []
function add(p, c) { FILES.push([p, c]) }

add('package.json', `{
  "name": "mbsi-logbook",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
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
`)

add('vite.config.js', `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
`)

add('postcss.config.js', `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
`)

add('tailwind.config.js', `export default {
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
`)

add('index.html', `<!DOCTYPE html>
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
`)

add('vercel.json', `{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
`)

add('.gitignore', `node_modules
dist
.env.local
.env
*.log
`)

add('.env.example', `VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=mbsi-media
R2_PUBLIC_BASE_URL=
`)

add('README.md', `# Logbook Magang BSI

Portal logbook, galeri, dan daftar hadir magang Bank Syariah Indonesia.

## Menjalankan lokal
1. node generate-mbsi.js (sudah dilakukan saat setup)
2. npm run dev
3. Buka http://localhost:5173

## Database
Jalankan isi file supabase/schema.sql di Supabase SQL Editor.
Buat user Auth dengan pola email NIM@magang.local dan isi tabel peserta beserta auth_uid.

## Deploy
Push ke GitHub, import di Vercel, salin isi .env.local ke Environment Variables Vercel.
`)

add('supabase/schema.sql', `create extension if not exists "pgcrypto";
create table public.peserta (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique references auth.users(id) on delete cascade,
  nim varchar(20) not null unique,
  nama varchar(100) not null,
  created_at timestamptz not null default now()
);
create table public.logbooks (
  id uuid primary key default gen_random_uuid(),
  peserta_id uuid not null references public.peserta(id) on delete cascade,
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
  peserta_id uuid not null references public.peserta(id) on delete cascade,
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
  peserta_id uuid not null references public.peserta(id) on delete cascade,
  tanggal date not null,
  status varchar(20) not null check (status in ('Masuk','Izin','Bolos')),
  alasan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (peserta_id, tanggal)
);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
create trigger trg_logbooks_upd before update on public.logbooks for each row execute function public.set_updated_at();
create trigger trg_galeri_upd before update on public.galeri for each row execute function public.set_updated_at();
create trigger trg_hadir_upd before update on public.daftar_hadir for each row execute function public.set_updated_at();
create index idx_logbooks_peserta on public.logbooks(peserta_id, tanggal desc);
create index idx_logbooks_status on public.logbooks(status);
create index idx_items_logbook on public.logbook_items(logbook_id, urutan);
create index idx_galeri_peserta on public.galeri(peserta_id, tanggal desc);
create index idx_galeri_item on public.galeri(logbook_item_id);
create index idx_hadir_peserta on public.daftar_hadir(peserta_id, tanggal desc);
alter table public.peserta enable row level security;
alter table public.logbooks enable row level security;
alter table public.logbook_items enable row level security;
alter table public.galeri enable row level security;
alter table public.daftar_hadir enable row level security;
create policy "peserta_read_all" on public.peserta for select using (true);
create policy "peserta_update_self" on public.peserta for update using (auth_uid = auth.uid());
create policy "logbooks_read" on public.logbooks for select using (
  status = 'publik' or peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "logbooks_insert_self" on public.logbooks for insert with check (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "logbooks_update_self" on public.logbooks for update using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "logbooks_delete_self" on public.logbooks for delete using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "items_read" on public.logbook_items for select using (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and (l.status = 'publik' or l.peserta_id = (select id from public.peserta where auth_uid = auth.uid())))
);
create policy "items_write_self" on public.logbook_items for all using (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and l.peserta_id = (select id from public.peserta where auth_uid = auth.uid()))
) with check (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and l.peserta_id = (select id from public.peserta where auth_uid = auth.uid()))
);
create policy "galeri_read_all" on public.galeri for select using (true);
create policy "galeri_insert_self" on public.galeri for insert with check (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "galeri_update_self" on public.galeri for update using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "galeri_delete_self" on public.galeri for delete using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "hadir_read_all" on public.daftar_hadir for select using (true);
create policy "hadir_insert_self" on public.daftar_hadir for insert with check (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "hadir_update_self" on public.daftar_hadir for update using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
create policy "hadir_delete_self" on public.daftar_hadir for delete using (
  peserta_id = (select id from public.peserta where auth_uid = auth.uid())
);
`)

add('api/r2/presign.js', `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
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
`)

add('api/r2/delete.js', `import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
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
`)

add('src/main.jsx', `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`)

add('src/index.css', `@tailwind base;
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
.anim-filter { animation: filterSlide .3s ease forwards; overflow: hidden; }

/* ===== Komponen umum ===== */
body { transition: background-color .3s ease, color .3s ease; }
button, a, input, select, textarea { transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .15s ease, box-shadow .2s ease, opacity .2s ease; }
button:active, a:active, .clickable:active { transform: scale(.97); }
.card-hover { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease, background-color .3s ease; }
.card-hover:hover { transform: translateY(-4px); }

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
.dark .bg-white\\/90 { background-color: rgba(2,6,23,.9) !important; }
.dark .bg-white\\/10 { background-color: rgba(255,255,255,.07) !important; }
.dark .bg-white\\/5 { background-color: rgba(255,255,255,.04) !important; }
.dark .border-slate-100, .dark .border-slate-200, .dark .border-slate-300, .dark .border-white\\/10 { border-color: #1e293b !important; }
.dark .text-slate-900, .dark .text-slate-800, .dark .text-slate-700 { color: #f8fafc !important; }
.dark .text-slate-600, .dark .text-slate-500, .dark .text-slate-400 { color: #94a3b8 !important; }
.dark .hover\\:bg-slate-100:hover { background-color: #1e293b !important; color: #f8fafc !important; }
.dark .hover\\:bg-slate-200:hover { background-color: #0f172a !important; color: #f8fafc !important; }
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
.dark .bg-gold-500\\/15 { background-color: rgba(245,158,11,.15) !important; }
.dark .bg-gold-500 { color: #0f172a !important; }
.dark .time-toggle { border-color: #334155; }
.dark .time-toggle button { color: #94a3b8; }
.dark .time-toggle button.active { background: #065f46; color: #fff; }
`)

add('src/lib/supabase.js', `import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
`)

add('src/lib/auth.js', `import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const EMAIL_DOMAIN = '@magang.local'

export async function loginWithNim(nim, kode) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: nim.trim() + EMAIL_DOMAIN,
    password: kode
  })
  if (error) throw error
  return data
}

export async function logoutPeserta() {
  await supabase.auth.signOut()
}

export function useAuth() {
  const [peserta, setPeserta] = useState(null)
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
      const res = await supabase.from('peserta').select('*').eq('auth_uid', uid).single()
      if (active) {
        setPeserta(res.data)
        setLoading(false)
      }
    }
    load()
    const sub = supabase.auth.onAuthStateChange(function (event, session) {
      if (!session) setPeserta(null)
    })
    return function () {
      active = false
      sub.data.subscription.unsubscribe()
    }
  }, [])

  return { peserta: peserta, loading: loading }
}
`)

add('src/lib/format.js', `export function formatTanggal(s) {
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
      const p = dateString.split('-')
      if (p.length < 2 || p[1] !== f.bulan) return false
    }
  } else if (f.timeMode === 'rentang') {
    if (f.dari && dateString < f.dari) return false
    if (f.sampai && dateString > f.sampai) return false
  }
  return true
}
`)

add('src/lib/upload.js', `import { supabase } from './supabase.js'

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
`)

add('src/lib/logbook.js', `import { supabase } from './supabase.js'

const EMPTY = '00000000-0000-0000-0000-000000000000'

export async function syncGaleriFromLogbook(pesertaId, items, meta) {
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
        peserta_id: pesertaId,
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
`)

add('src/lib/theme.jsx', `import { createContext, useContext, useEffect, useState } from 'react'

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
`)

add('src/components/ui.jsx', `export const inputCls = 'mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-bsi-500'
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
      <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 grid place-items-center text-2xl">📄</div>
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
  if (!props.open) return null
  return (
    <div className="anim-overlay fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 p-4" onClick={props.onClose}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <p className="font-bold text-slate-900">{props.title || 'Detail'}</p>
            <button onClick={props.onClose} className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 text-lg leading-none">×</button>
          </div>
          <div className="p-6">{props.children}</div>
        </div>
      </div>
    </div>
  )
}
`)

add('src/components/Carousel.jsx', `import { useEffect, useRef, useState } from 'react'

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
`)

add('src/components/FilterBar.jsx', `import { ICONS } from './icons.jsx'

export function FilterSelect(props) {
  return (
    <div className="filter-input-wrap">
      <span className="text-slate-400">{props.icon}</span>
      <select value={props.value} onChange={function (e) { props.onChange(e.target.value) }}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500 min-w-[160px]">
        {props.options.map(function (o) {
          return <option key={o.value} value={o.value}>{o.label}</option>
        })}
      </select>
    </div>
  )
}

export function FilterDate(props) {
  return (
    <div className="filter-input-wrap">
      <span className="text-slate-400">{ICONS.calendar}</span>
      <input type={props.mode === 'month' ? 'month' : 'date'} value={props.value}
        onChange={function (e) { props.onChange(e.target.value) }}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500 min-w-[150px]" />
    </div>
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
      <div className={props.open ? 'anim-filter mt-4' : 'hidden xl:block xl:mt-4'}>
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
`)

add('src/components/icons.jsx', `const wrap = function (inner) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{inner}</svg>
}

export const ICONS = {
  funnel: wrap(<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />),
  user: wrap(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  tag: wrap(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>),
  calendar: wrap(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>),
  image: wrap(<><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>),
  close: wrap(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>),
  check: wrap(<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>),
  chevron: wrap(<polyline points="6 9 12 15 18 9" />),
  list: wrap(<><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>)
}
`)

add('src/components/cards.jsx', `import Carousel from './Carousel.jsx'
import { StatusBadge, CategoryBadge, AttendanceBadge, btnSmall } from './ui.jsx'
import { formatTanggal, formatTanggalShort } from '../lib/format.js'

function PersonChip(props) {
  const p = props.peserta
  const nama = p ? p.nama : 'Peserta'
  const nim = p ? p.nim : '-'
  const initials = nama.split(' ').slice(0, 2).map(function (w) { return w.charAt(0) || '' }).join('').toUpperCase()
  return (
    <div className="flex items-center gap-3">
      <div className={'rounded-2xl bg-bsi-800 text-white grid place-items-center font-bold ' + (props.size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11')}>
        {initials}
      </div>
      <div>
        <p className={'font-semibold text-slate-900 ' + (props.size === 'sm' ? 'text-sm' : '')}>{nama}</p>
        <p className="text-xs text-slate-500">NIM {nim}</p>
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
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-bsi-800">{items.length} kegiatan hari ini</p>
        <div className="mt-2 space-y-1">
          {preview.map(function (it, i) {
            return <p key={it.id} className="text-xs text-slate-500 truncate">{i + 1}. {it.judul}</p>
          })}
          {items.length > 2 ? <p className="text-xs text-bsi-700 font-semibold">+{items.length - 2} kegiatan lainnya</p> : null}
        </div>
      </div>
      <div className="mt-auto border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-4">
        <PersonChip peserta={log.peserta} />
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Rincian kegiatan hari ini</p>
        <div className="mt-4">
          {items.map(function (it, i) {
            return (
              <div key={it.id} className={'relative pl-12 ' + (i < items.length - 1 ? 'pb-6' : 'pb-0')}>
                <span className="absolute left-0 top-0 h-9 w-9 rounded-full bg-bsi-800 text-white grid place-items-center text-sm font-bold">{i + 1}</span>
                {i < items.length - 1 ? <span className="absolute left-4 top-9 bottom-0 w-px bg-slate-200 dark:bg-slate-700" /> : null}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {it.media_path ? (
                    <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3">
                      {it.media_type === 'video'
                        ? <video src={it.media_path} controls className="h-full w-full object-contain" />
                        : <img src={it.media_path} alt={it.judul} className="h-full w-full object-contain" />}
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
      <div className="border-t border-slate-100 pt-4"><PersonChip peserta={log.peserta} /></div>
    </div>
  )
}

export function GalleryCard(props) {
  const item = props.item
  return (
    <article onClick={props.onDetail} className="card-hover clickable cursor-pointer bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg">
      <div className="aspect-video bg-slate-900">
        {item.media_type === 'video'
          ? <video src={item.media_path} muted preload="metadata" className="h-full w-full object-contain" />
          : <img src={item.media_path} alt={item.judul} className="h-full w-full object-contain" />}
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
          <PersonChip size="sm" peserta={item.peserta} />
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
      <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900">
        {item.media_type === 'video'
          ? <video src={item.media_path} controls className="h-full w-full object-contain" />
          : <img src={item.media_path} alt={item.judul} className="h-full w-full object-contain" />}
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
      <div className="border-t border-slate-100 pt-4"><PersonChip peserta={item.peserta} /></div>
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
          <p className="mt-1 font-bold text-slate-900">{row.peserta ? row.peserta.nama : 'Peserta'}</p>
          <p className="text-xs text-slate-500">NIM {row.peserta ? row.peserta.nim : '-'}</p>
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
      <div className="border-t border-slate-100 pt-4"><PersonChip peserta={row.peserta} /></div>
    </div>
  )
}
`)

add('src/components/Layout.jsx', `import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTheme } from '../lib/theme.jsx'
import { useAuth, logoutPeserta } from '../lib/auth.js'
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
  const { peserta } = useAuth()
  const [open, setOpen] = useState(false)

  const linkCls = function (active) {
    return 'px-3 py-2 rounded-xl text-sm font-semibold ' + (active ? 'bg-bsi-900 text-white' : 'text-slate-600 hover:bg-slate-100')
  }

  return (
    <div>
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
              <button onClick={theme.toggle} className="h-10 w-10 rounded-xl border border-slate-300 grid place-items-center hover:bg-slate-100">
                {theme.dark ? '☀️' : '🌙'}
              </button>
              {peserta ? (
                <>
                  <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-bsi-800 text-white text-sm font-semibold hover:bg-bsi-900">Dashboard</Link>
                  <Link to="/" onClick={function () { logoutPeserta() }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100">Keluar</Link>
                </>
              ) : (
                <Link to="/login" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700">Masuk Intern</Link>
              )}
            </div>
            <div className="flex xl:hidden items-center gap-2">
              <button onClick={theme.toggle} className="h-10 w-10 rounded-xl border border-slate-300 grid place-items-center">
                {theme.dark ? '☀️' : '🌙'}
              </button>
              <button onClick={function () { setOpen(function (o) { return !o }) }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Menu</button>
            </div>
          </div>
        </div>
        {open ? (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            {LINKS.map(function (l) {
              return <Link key={l.to} to={l.to} onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">{l.label}</Link>
            })}
            {peserta ? (
              <>
                <Link to="/dashboard" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-bsi-800 text-white text-sm font-semibold">Dashboard</Link>
                <Link to="/" onClick={function () { setOpen(false); logoutPeserta() }} className="block px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Keluar</Link>
              </>
            ) : (
              <Link to="/login" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold">Masuk Intern</Link>
            )}
          </div>
        ) : null}
      </header>

      <main className="anim-page max-w-7xl mx-auto px-4 py-8 lg:py-10">
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Tim Magang BSI. Dokumentasi kegiatan magang untuk keperluan akademik.
        </div>
      </footer>
    </div>
  )
}
`)

add('src/App.jsx', `import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
  const { peserta, loading } = useAuth()
  if (loading) return <div className="p-10 text-center text-slate-500">Memuat sesi...</div>
  if (!peserta) return <Navigate to="/login" replace />
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
`)

add('src/pages/HomePage.jsx', `import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { Modal } from '../components/ui.jsx'

export default function HomePage() {
  const { peserta } = useAuth()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ logbook: 0, galeri: 0, peserta: 0 })
  const [detail, setDetail] = useState(null)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, peserta(nim, nama), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const g = await supabase.from('galeri').select('id')
      const p = await supabase.from('peserta').select('id')
      setLogs(l.data || [])
      setStats({ logbook: (l.data || []).length, galeri: (g.data || []).length, peserta: (p.data || []).length })
    }
    load()
  }, [])

  return (
    <div>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
        <div className="card-hover relative overflow-hidden rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/20 blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Magang Bank BSI</span>
            <h1 className="mt-6 text-3xl lg:text-5xl font-black leading-tight max-w-2xl">Logbook, Galeri, dan Daftar Hadir Magang dalam Satu Portal</h1>
            <p className="mt-5 max-w-2xl text-white/80 leading-relaxed">Portal ini mencatat kegiatan harian, dokumentasi media, dan kehadiran tim magang selama membantu operasional Bank BSI.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/logbook" className="px-6 py-3 rounded-2xl bg-gold-500 text-slate-900 font-bold hover:bg-gold-400">Lihat Logbook</Link>
              <Link to="/galeri" className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20">Lihat Galeri</Link>
              <Link to="/absen" className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20">Daftar Hadir</Link>
              {peserta
                ? <Link to="/dashboard" className="px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100">Buka Dashboard</Link>
                : <Link to="/login" className="px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100">Masuk Intern</Link>}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <StatCard label="Total peserta magang" value={stats.peserta} sub="Peserta terdaftar dalam tim" />
          <StatCard label="Total logbook publik" value={stats.logbook} sub="Catatan kegiatan harian" />
          <StatCard label="Total media galeri" value={stats.galeri} sub="Foto dan video dokumentasi" />
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
          {logs.slice(0, 3).map(function (l) {
            return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
          })}
          {!logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah diatur sebagai siap dilihat akan tampil di sini." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
`)

add('src/pages/LogbookPage.jsx', `import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters } from '../lib/format.js'
import { KATEGORI } from '../lib/constants.js'

const INITIAL = { peserta: '', kategori: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function LogbookPage() {
  const { peserta } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, peserta(nim, nama), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('peserta').select('id, nama').order('nama')
      setAll(l.data || [])
      setPeople(p.data || [])
    }
    load()
  }, [])

  const logs = all.filter(function (l) {
    if (filter.peserta && l.peserta_id !== filter.peserta) return false
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
          <FilterSelect icon={ICONS.user} value={filter.peserta} onChange={function (v) { setFilter(Object.assign({}, filter, { peserta: v })) }}
            options={[{ value: '', label: 'Semua peserta' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.tag} value={filter.kategori} onChange={function (v) { setFilter(Object.assign({}, filter, { kategori: v })) }}
            options={[{ value: '', label: 'Semua kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {logs.map(function (l) {
          return <LogbookCard key={l.id} log={l} isOwner={peserta && peserta.id === l.peserta_id}
            onDetail={function () { setDetail(l) }} />
        })}
        {!logs.length ? <EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /> : null}
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
`)

add('src/pages/GalleryPage.jsx', `import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal } from '../components/ui.jsx'
import { GalleryCard, GalleryDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters } from '../lib/format.js'
import { GALERI_KEGIATAN } from '../lib/constants.js'

const INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function GalleryPage() {
  const { peserta } = useAuth()
  const [all, setAll] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)

  useEffect(function () {
    async function load() {
      const g = await supabase.from('galeri').select('*, peserta(nim, nama)').order('tanggal', { ascending: false })
      setAll(g.data || [])
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
            options={[{ value: '', label: 'Semua media' }, { value: 'foto', label: 'Foto saja' }, { value: 'video', label: 'Video saja' }]} />
          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(function (i) {
          return <GalleryCard key={i.id} item={i} isOwner={peserta && peserta.id === i.peserta_id}
            onDetail={function () { setDetail(i) }} />
        })}
        {!items.length ? <EmptyState title="Belum ada media galeri" desc="Media galeri yang diunggah peserta akan tampil di sini." /> : null}
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <GalleryDetail item={detail} /> : null}
      </Modal>
    </div>
  )
}
`)

add('src/pages/AttendancePage.jsx', `import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal } from '../components/ui.jsx'
import { AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters } from '../lib/format.js'

const INITIAL = { peserta: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function AttendancePage() {
  const { peserta } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)

  useEffect(function () {
    async function load() {
      const a = await supabase.from('daftar_hadir').select('*, peserta(nim, nama)').order('tanggal', { ascending: false })
      const p = await supabase.from('peserta').select('id, nama').order('nama')
      setAll(a.data || [])
      setPeople(p.data || [])
    }
    load()
  }, [])

  const rows = all.filter(function (r) {
    if (filter.peserta && r.peserta_id !== filter.peserta) return false
    if (filter.status && r.status !== filter.status) return false
    return matchesDateFilters(r.tanggal, filter)
  })
  const active = countActiveFilters(filter)

  const counts = rows.reduce(function (acc, r) {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const perPerson = people.map(function (p) {
    const mine = rows.filter(function (r) { return r.peserta_id === p.id })
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
          <StatCard label="Total catatan hadir" value={rows.length} sub="Sesuai filter aktif" />
          <StatCard label="Masuk" value={counts.Masuk || 0} sub="Peserta hadir" />
          <StatCard label="Izin" value={counts.Izin || 0} sub="Dengan keterangan" />
          <StatCard label="Bolos" value={counts.Bolos || 0} sub="Tanpa keterangan" />
        </div>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.user} value={filter.peserta} onChange={function (v) { setFilter(Object.assign({}, filter, { peserta: v })) }}
            options={[{ value: '', label: 'Semua peserta' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.check} value={filter.status} onChange={function (v) { setFilter(Object.assign({}, filter, { status: v })) }}
            options={[{ value: '', label: 'Semua status' }, { value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>
      </section>

      <section className="mt-8 card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900">Grafik kehadiran per peserta</h2>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" />Masuk</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" />Izin</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" />Bolos</span>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {perPerson.map(function (p) {
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
          {rows.map(function (r) {
            return <AttendanceCard key={r.id} row={r} isOwner={peserta && peserta.id === r.peserta_id}
              onDetail={function () { setDetail(r) }} />
          })}
          {!rows.length ? <EmptyState title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah peserta mengisi daftar hadir." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <AttendanceDetail row={detail} /> : null}
      </Modal>
    </div>
  )
}
`)

add('src/pages/DospemPage.jsx', `import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { StatCard, EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'

export default function DospemPage() {
  const [logs, setLogs] = useState([])
  const [people, setPeople] = useState([])
  const [galCount, setGalCount] = useState(0)
  const [hadirCount, setHadirCount] = useState(0)
  const [detail, setDetail] = useState(null)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, peserta(nim, nama), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('peserta').select('id, nama, nim').order('nama')
      const g = await supabase.from('galeri').select('id')
      const h = await supabase.from('daftar_hadir').select('id')
      setLogs(l.data || [])
      setPeople(p.data || [])
      setGalCount((g.data || []).length)
      setHadirCount((h.data || []).length)
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
          <div className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Total peserta</p><p className="mt-1 text-3xl font-black">{people.length}</p></div>
          <div className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Logbook publik</p><p className="mt-1 text-3xl font-black">{logs.length}</p></div>
          <div className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Media galeri</p><p className="mt-1 text-3xl font-black">{galCount}</p></div>
          <div className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Catatan hadir</p><p className="mt-1 text-3xl font-black">{hadirCount}</p></div>
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
          {people.map(function (p) {
            const total = logs.filter(function (l) { return l.peserta_id === p.id }).length
            return (
              <div key={p.id} className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <p className="font-bold text-slate-900">{p.nama}</p>
                <p className="text-xs text-slate-500">NIM {p.nim}</p>
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
          {logs.map(function (l) {
            return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
          })}
          {!logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah peserta mengatur status siap dilihat." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
`)

add('src/pages/TimPage.jsx', `import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function TimPage() {
  const [people, setPeople] = useState([])
  const [logs, setLogs] = useState([])
  const [galeri, setGaleri] = useState([])

  useEffect(function () {
    async function load() {
      const p = await supabase.from('peserta').select('id, nama, nim').order('nama')
      const l = await supabase.from('logbooks').select('id, peserta_id').eq('status', 'publik')
      const g = await supabase.from('galeri').select('id, peserta_id')
      setPeople(p.data || [])
      setLogs(l.data || [])
      setGaleri(g.data || [])
    }
    load()
  }, [])

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Profil tim</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Tim magang Bank BSI</h1>
      </section>
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {people.map(function (p) {
          const totalLog = logs.filter(function (l) { return l.peserta_id === p.id }).length
          const totalGal = galeri.filter(function (g) { return g.peserta_id === p.id }).length
          const initials = p.nama.split(' ').slice(0, 2).map(function (w) { return w.charAt(0) || '' }).join('').toUpperCase()
          return (
            <div key={p.id} className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-3xl bg-bsi-800 text-white grid place-items-center text-xl font-black">{initials}</div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{p.nama}</p>
                  <p className="text-sm text-slate-500">NIM {p.nim}</p>
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
`)

add('src/pages/LoginPage.jsx', `import { useState } from 'react'
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
      navigate('/dashboard')
    } catch (err) {
      setError('NIM atau kode akses salah.')
    }
    setBusy(false)
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
      <div className="card-hover rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-10">
        <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Area Intern</span>
        <h1 className="mt-6 text-3xl lg:text-4xl font-black leading-tight">Masuk untuk mengisi logbook, galeri, dan daftar hadir</h1>
        <p className="mt-4 text-white/80 leading-relaxed">Halaman ini hanya digunakan oleh peserta magang. Dosen pembimbing dan kaprodi tidak perlu login untuk melihat halaman publik.</p>
      </div>
      <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 lg:p-10">
        <h2 className="text-2xl font-black text-slate-900">Login peserta magang</h2>
        {error ? <p className="mt-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className={labelCls}>NIM</label>
            <input className={inputCls} value={nim} onChange={function (e) { setNim(e.target.value) }} placeholder="Contoh: 20260001" required />
          </div>
          <div>
            <label className={labelCls}>Kode akses</label>
            <input type="password" className={inputCls} value={kode} onChange={function (e) { setKode(e.target.value) }} placeholder="Masukkan kode akses" required />
          </div>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Memproses...' : 'Masuk ke dashboard'}</button>
        </form>
      </div>
    </section>
  )
}
`)

add('src/lib/constants.js', `export const KATEGORI = [
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
`)

add('src/pages/DashboardPage.jsx', `import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { uploadMedia, deleteMedia } from '../lib/upload.js'
import { syncGaleriFromLogbook } from '../lib/logbook.js'
import { todayInput } from '../lib/format.js'
import { KATEGORI, UNIT, GALERI_KEGIATAN } from '../lib/constants.js'
import { StatCard, EmptyState, Modal, inputCls, labelCls, btnPrimary, btnSmall } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail, GalleryCard, GalleryDetail, AttendanceCard, AttendanceDetail } from '../components/cards.jsx'

function newItem() {
  return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', show: false }
}

export default function DashboardPage() {
  const { peserta } = useAuth()
  const [tab, setTab] = useState('logbook')
  const [logs, setLogs] = useState([])
  const [galeri, setGaleri] = useState([])
  const [hadir, setHadir] = useState([])
  const [detail, setDetail] = useState(null)

  const [form, setForm] = useState({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
  const [items, setItems] = useState([newItem()])
  const [editLogId, setEditLogId] = useState(null)

  const [galForm, setGalForm] = useState({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '' })
  const [editGalId, setEditGalId] = useState(null)

  const [hadirForm, setHadirForm] = useState({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
  const [editHadirId, setEditHadirId] = useState(null)

  const [busy, setBusy] = useState(false)

  async function refresh() {
    const l = await supabase.from('logbooks').select('*, peserta(nim, nama), logbook_items(*)')
      .eq('peserta_id', peserta.id).order('tanggal', { ascending: false })
      .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
    const g = await supabase.from('galeri').select('*, peserta(nim, nama)').eq('peserta_id', peserta.id).order('tanggal', { ascending: false })
    const h = await supabase.from('daftar_hadir').select('*, peserta(nim, nama)').eq('peserta_id', peserta.id).order('tanggal', { ascending: false })
    setLogs(l.data || [])
    setGaleri(g.data || [])
    setHadir(h.data || [])
  }

  useEffect(function () { if (peserta) refresh() }, [peserta])

  function patchItem(i, patch) {
    setItems(function (prev) {
      return prev.map(function (it, idx) { return idx === i ? Object.assign({}, it, patch) : it })
    })
  }

  function onItemFile(i, file) {
    if (!file) return
    patchItem(i, { file: file, preview: URL.createObjectURL(file) })
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
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, show_in_gallery: it.show && !!mediaPath, _file: it.file, _oldPath: it.oldPath || '' })
      }
      if (!clean.length) { alert('Tambahkan minimal satu kegiatan dengan judul.') ; setBusy(false); return }

      let logId = editLogId
      if (editLogId) {
        await supabase.from('logbooks').update({
          tanggal: form.tanggal, unit: form.unit, kategori: form.kategori, judul: form.judul,
          kendala: form.kendala, solusi: form.solusi, pembelajaran: form.pembelajaran, status: form.status
        }).eq('id', editLogId)
        await supabase.from('logbook_items').delete().eq('logbook_id', editLogId)
      } else {
        const ins = await supabase.from('logbooks').insert({
          peserta_id: peserta.id, tanggal: form.tanggal, unit: form.unit, kategori: form.kategori, judul: form.judul,
          kendala: form.kendala, solusi: form.solusi, pembelajaran: form.pembelajaran, status: form.status
        }).select().single()
        logId = ins.data.id
      }

      const rows = clean.map(function (c, idx) {
        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, show_in_gallery: c.show_in_gallery }
      })
      const insItems = await supabase.from('logbook_items').insert(rows).select()
      await syncGaleriFromLogbook(peserta.id, insItems.data || [], { tanggal: form.tanggal, kategori: form.kategori })

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
      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', show: it.show_in_gallery, oldPath: it.media_path || '' }
    }))
    if (!items.length) setItems([newItem()])
    setTab('logbook')
  }

  async function deleteLog(log) {
    if (!confirm('Hapus logbook ini? Media galeri turunan ikut terhapus.')) return
    await supabase.from('logbooks').delete().eq('id', log.id)
    await refresh()
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
      }
      if (!mediaPath && !editGalId) { alert('Pilih file foto atau video.'); setBusy(false); return }
      const payload = {
        peserta_id: peserta.id,
        judul: galForm.judul || ('Dokumentasi ' + galForm.tanggal),
        deskripsi: galForm.deskripsi,
        tanggal: galForm.tanggal,
        kegiatan: galForm.kegiatan || 'Lainnya'
      }
      if (mediaPath) { payload.media_path = mediaPath; payload.media_type = mediaType }
      if (editGalId) {
        await supabase.from('galeri').update(payload).eq('id', editGalId)
      } else {
        await supabase.from('galeri').insert(payload)
      }
      setEditGalId(null)
      setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '' })
      await refresh()
    } catch (err) {
      alert('Gagal menyimpan galeri: ' + err.message)
    }
    setBusy(false)
  }

  async function deleteGaleri(item) {
    if (!confirm('Hapus media ini dari galeri?')) return
    await supabase.from('galeri').delete().eq('id', item.id)
    await refresh()
  }

  async function submitHadir(e) {
    e.preventDefault()
    setBusy(true)
    const payload = { peserta_id: peserta.id, tanggal: hadirForm.tanggal, status: hadirForm.status, alasan: hadirForm.status === 'Masuk' ? '' : hadirForm.alasan }
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

  async function deleteHadir(row) {
    if (!confirm('Hapus catatan kehadiran ini?')) return
    await supabase.from('daftar_hadir').delete().eq('id', row.id)
    await refresh()
  }

  const tabCls = function (t) {
    return 'px-5 py-3 rounded-2xl text-sm font-bold ' + (tab === t ? 'bg-bsi-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
  }

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm text-slate-500">Dashboard peserta</p>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900">{peserta.nama}</h1>
            <p className="text-sm text-slate-500">NIM {peserta.nim}</p>
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
          <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-black text-slate-900">{editLogId ? 'Ubah logbook harian' : 'Tambah logbook harian'}</h2>
            <form onSubmit={submitLogbook} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Tanggal</label><input type="date" required className={inputCls} value={form.tanggal} onChange={function (e) { setForm(Object.assign({}, form, { tanggal: e.target.value })) }} /></div>
                <div><label className={labelCls}>Unit utama</label>
                  <select className={inputCls} value={form.unit} onChange={function (e) { setForm(Object.assign({}, form, { unit: e.target.value })) }}>
                    <option value="">Pilih unit</option>
                    {UNIT.map(function (u) { return <option key={u} value={u}>{u}</option> })}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Kategori utama</label>
                  <select required className={inputCls} value={form.kategori} onChange={function (e) { setForm(Object.assign({}, form, { kategori: e.target.value })) }}>
                    <option value="">Pilih kategori</option>
                    {KATEGORI.map(function (k) { return <option key={k} value={k}>{k}</option> })}
                  </select>
                </div>
                <div><label className={labelCls}>Status tampil</label>
                  <select className={inputCls} value={form.status} onChange={function (e) { setForm(Object.assign({}, form, { status: e.target.value })) }}>
                    <option value="draft">Draft</option>
                    <option value="publik">Siap dilihat</option>
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>Ringkasan hari ini</label><input required className={inputCls} value={form.judul} onChange={function (e) { setForm(Object.assign({}, form, { judul: e.target.value })) }} placeholder="Contoh: Kegiatan harian di divisi Back Office" /></div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Rincian kegiatan hari ini</p>
                  <button type="button" onClick={function () { setItems(function (p) { return p.concat([newItem()]) }) }} className={btnSmall + ' bg-bsi-100 text-bsi-900 hover:bg-bsi-200'}>+ Tambah kegiatan</button>
                </div>
                {items.map(function (it, i) {
                  return (
                    <div key={it.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-bsi-800">Kegiatan {i + 1}</span>
                        {items.length > 1 ? <button type="button" onClick={function () { setItems(function (p) { return p.filter(function (x, idx) { return idx !== i }) }) }} className="text-xs text-red-600 hover:underline">Hapus</button> : null}
                      </div>
                      <input className={inputCls} value={it.judul} onChange={function (e) { patchItem(i, { judul: e.target.value }) }} placeholder="Judul kegiatan" />
                      <textarea rows="2" className={inputCls} value={it.deskripsi} onChange={function (e) { patchItem(i, { deskripsi: e.target.value }) }} placeholder="Deskripsi singkat kegiatan" />
                      <input className={inputCls} value={it.hasil} onChange={function (e) { patchItem(i, { hasil: e.target.value }) }} placeholder="Hasil (opsional)" />
                      {it.preview ? (
                        <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900">
                          {it.file && it.file.type.indexOf('video') === 0
                            ? <video src={it.preview} className="h-full w-full object-contain" muted />
                            : <img src={it.preview} alt="Pratinjau" className="h-full w-full object-contain" />}
                        </div>
                      ) : null}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div><label className="text-xs font-semibold text-slate-600">Upload media kegiatan</label>
                          <input type="file" accept="image/*,video/*" className="mt-1.5 w-full rounded-2xl border border-slate-300 px-3 py-2 bg-white text-xs"
                            onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                        </div>
                        <div className="flex items-end">
                          <label className={'flex items-start gap-3 rounded-2xl border p-3 cursor-pointer w-full ' + (it.preview ? (it.show ? 'border-gold-500 bg-gold-500/5' : 'border-slate-200') : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed')}>
                            <input type="checkbox" disabled={!it.preview} checked={it.show} onChange={function (e) { patchItem(i, { show: e.target.checked }) }} className="mt-0.5 h-4 w-4 rounded accent-bsi-800" />
                            <span className="text-sm font-semibold text-slate-800">Tampilkan kegiatan ini di galeri</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div><label className={labelCls}>Kendala</label><textarea rows="3" className={inputCls} value={form.kendala} onChange={function (e) { setForm(Object.assign({}, form, { kendala: e.target.value })) }} placeholder="Opsional" /></div>
                <div><label className={labelCls}>Solusi</label><textarea rows="3" className={inputCls} value={form.solusi} onChange={function (e) { setForm(Object.assign({}, form, { solusi: e.target.value })) }} placeholder="Opsional" /></div>
                <div><label className={labelCls}>Pembelajaran</label><textarea rows="3" className={inputCls} value={form.pembelajaran} onChange={function (e) { setForm(Object.assign({}, form, { pembelajaran: e.target.value })) }} placeholder="Opsional" /></div>
              </div>

              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Menyimpan...' : (editLogId ? 'Simpan perubahan' : 'Simpan logbook')}</button>
            </form>
          </div>

          <div className="space-y-5">
            <h2 className="text-2xl font-black text-slate-900">Logbook kamu</h2>
            {logs.map(function (l) {
              return <LogbookCard key={l.id} log={l} isOwner
                onDetail={function () { setDetail({ type: 'log', data: l }) }}
                onEdit={function () { startEditLog(l) }}
                onDelete={function () { deleteLog(l) }} />
            })}
            {!logs.length ? <EmptyState title="Belum ada logbook" desc="Tambahkan logbook harian pertama kamu." /> : null}
          </div>
        </section>
      ) : null}

      {tab === 'galeri' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-black text-slate-900">{editGalId ? 'Ubah media galeri' : 'Tambah media galeri'}</h2>
            <form onSubmit={submitGaleri} className="mt-6 space-y-4">
              <div><label className={labelCls}>Pilih foto atau video</label>
                <input type="file" accept="image/*,video/*" className="mt-1.5 w-full rounded-2xl border border-slate-300 px-4 py-3 bg-white text-sm"
                  onChange={function (e) { const f = e.target.files[0]; setGalForm(Object.assign({}, galForm, { file: f, preview: f ? URL.createObjectURL(f) : '' })) }} />
              </div>
              {galForm.preview ? (
                <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900">
                  {galForm.file && galForm.file.type.indexOf('video') === 0
                    ? <video src={galForm.preview} className="h-full w-full object-contain" muted />
                    : <img src={galForm.preview} alt="Pratinjau" className="h-full w-full object-contain" />}
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Judul (opsional)</label><input className={inputCls} value={galForm.judul} onChange={function (e) { setGalForm(Object.assign({}, galForm, { judul: e.target.value })) }} placeholder="Kosongkan untuk judul otomatis" /></div>
                <div><label className={labelCls}>Tanggal (opsional)</label><input type="date" className={inputCls} value={galForm.tanggal} onChange={function (e) { setGalForm(Object.assign({}, galForm, { tanggal: e.target.value })) }} /></div>
              </div>
              <div><label className={labelCls}>Kegiatan (opsional)</label>
                <select className={inputCls} value={galForm.kegiatan} onChange={function (e) { setGalForm(Object.assign({}, galForm, { kegiatan: e.target.value })) }}>
                  <option value="">Pilih kegiatan</option>
                  {GALERI_KEGIATAN.map(function (k) { return <option key={k} value={k}>{k}</option> })}
                </select>
              </div>
              <div><label className={labelCls}>Deskripsi (opsional)</label><textarea rows="4" className={inputCls} value={galForm.deskripsi} onChange={function (e) { setGalForm(Object.assign({}, galForm, { deskripsi: e.target.value })) }} placeholder="Tambahkan keterangan media." /></div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Menyimpan...' : (editGalId ? 'Simpan perubahan media' : 'Unggah media')}</button>
            </form>
          </div>

          <div className="space-y-5">
            <h2 className="text-2xl font-black text-slate-900">Galeri kamu</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {galeri.map(function (g) {
                return <GalleryCard key={g.id} item={g} isOwner
                  onDetail={function () { setDetail({ type: 'gal', data: g }) }}
                  onEdit={function () { setEditGalId(g.id); setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path }) }}
                  onDelete={function () { deleteGaleri(g) }} />
              })}
              {!galeri.length ? <EmptyState title="Belum ada media galeri" desc="Unggah foto atau video pertama kamu." /> : null}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'absen' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
            <h2 className="text-2xl font-black text-slate-900">{editHadirId ? 'Ubah daftar hadir' : 'Isi daftar hadir'}</h2>
            <form onSubmit={submitHadir} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Tanggal</label><input type="date" required className={inputCls} value={hadirForm.tanggal} onChange={function (e) { setHadirForm(Object.assign({}, hadirForm, { tanggal: e.target.value })) }} /></div>
                <div><label className={labelCls}>Status kehadiran</label>
                  <select required className={inputCls} value={hadirForm.status} onChange={function (e) { setHadirForm(Object.assign({}, hadirForm, { status: e.target.value })) }}>
                    <option value="Masuk">Masuk</option>
                    <option value="Izin">Izin</option>
                    <option value="Bolos">Bolos</option>
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>Alasan atau keterangan</label><textarea rows="4" className={inputCls} value={hadirForm.alasan} onChange={function (e) { setHadirForm(Object.assign({}, hadirForm, { alasan: e.target.value })) }} placeholder="Contoh: Keperluan keluarga, sakit." /></div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Menyimpan...' : (editHadirId ? 'Simpan perubahan' : 'Simpan daftar hadir')}</button>
            </form>
          </div>

          <div className="space-y-5">
            <h2 className="text-2xl font-black text-slate-900">Daftar hadir kamu</h2>
            {hadir.map(function (h) {
              return <AttendanceCard key={h.id} row={h} isOwner
                onDetail={function () { setDetail({ type: 'hadir', data: h }) }}
                onEdit={function () { setEditHadirId(h.id); setHadirForm({ tanggal: h.tanggal, status: h.status, alasan: h.alasan || '' }) }}
                onDelete={function () { deleteHadir(h) }} />
            })}
            {!hadir.length ? <EmptyState title="Belum ada data kehadiran" desc="Isi daftar hadir pertama kamu." /> : null}
          </div>
        </section>
      ) : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail && detail.type === 'log' ? <LogbookDetail log={detail.data} /> : null}
        {detail && detail.type === 'gal' ? <GalleryDetail item={detail.data} /> : null}
        {detail && detail.type === 'hadir' ? <AttendanceDetail row={detail.data} /> : null}
      </Modal>
    </div>
  )
}
`)

function ask(question, def) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(function (resolve) {
    const suffix = def ? ' [' + def + ']: ' : ': '
    rl.question(question + suffix, function (answer) {
      rl.close()
      resolve(answer.trim() || def || '')
    })
  })
}

async function main() {
  console.log('Membuat project Logbook Magang BSI...')
  for (const entry of FILES) {
    const full = path.join(process.cwd(), entry[0])
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, entry[1], 'utf8')
  }
  console.log('Sebanyak ' + FILES.length + ' file berhasil dibuat.')

  console.log('')
  console.log('Masukkan kunci akses kamu. Nilai kosong akan ditulis apa adanya.')
  const env = []
  env.push('VITE_SUPABASE_URL=' + await ask('VITE_SUPABASE_URL'))
  env.push('VITE_SUPABASE_ANON_KEY=' + await ask('VITE_SUPABASE_ANON_KEY'))
  env.push('R2_ACCOUNT_ID=' + await ask('R2_ACCOUNT_ID'))
  env.push('R2_ACCESS_KEY_ID=' + await ask('R2_ACCESS_KEY_ID'))
  env.push('R2_SECRET_ACCESS_KEY=' + await ask('R2_SECRET_ACCESS_KEY'))
  env.push('R2_BUCKET_NAME=' + await ask('R2_BUCKET_NAME', 'mbsi-media'))
  env.push('R2_PUBLIC_BASE_URL=' + await ask('R2_PUBLIC_BASE_URL (URL r2.dev)'))
  fs.writeFileSync(path.join(process.cwd(), '.env.local'), env.join('\n') + '\n', 'utf8')
  console.log('File .env.local berhasil ditulis.')

  console.log('')
  console.log('Menjalankan npm install, mohon tunggu...')
  const result = spawnSync('npm', ['install'], { stdio: 'inherit', shell: true })
  if (result.status !== 0) {
    console.log('npm install gagal. Jalankan manual dengan perintah: npm install')
  }

  console.log('')
  console.log('Selesai. Langkah berikutnya:')
  console.log('1. Jalankan isi file supabase/schema.sql di Supabase SQL Editor.')
  console.log('2. Buat user Auth dengan pola email NIM@magang.local lalu isi tabel peserta beserta auth_uid.')
  console.log('3. Jalankan npm run dev lalu buka http://localhost:5173')
}

main()