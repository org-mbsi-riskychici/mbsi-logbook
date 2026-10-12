#!/usr/bin/env node
'use strict'

/**
 * cleanup-final.cjs
 * ---------------------------------------------------------------------
 * Bersihkan temuan kecil setelah fitur AI stabil:
 *   1. Fix autoScroll di ChatWidget (wheel/touchmove saja)
 *   2. Tambah SUPABASE_SERVICE_ROLE_KEY ke .env.example
 *   3. Deteksi file eksperimen (uji-ai.html, test-ai-provider.py)
 *   4. Deteksi file/folder "1" di root
 *   5. Deteksi dead script "apply-ai" di package.json
 *
 * CRLF-safe, idempotent. Untuk file yang perlu dihapus, script hanya
 * memberi tahu + instruksi manual (tidak auto-hapus) supaya aman.
 * ---------------------------------------------------------------------
 */

const fs = require('fs')
const path = require('path')
const ROOT = process.cwd()

function fp(r) { return path.join(ROOT, r) }
function exists(r) { return fs.existsSync(fp(r)) }
function read(r) { return fs.readFileSync(fp(r), 'utf8') }
function write(r, c) { fs.writeFileSync(fp(r), c, 'utf8') }
function head(m) { console.log('\n\x1b[1m\x1b[36m' + m + '\x1b[0m') }
function ok(m)   { console.log('  \x1b[32m\u2713\x1b[0m ' + m) }
function skip(m) { console.log('  \x1b[2m\u00b7 ' + m + '\x1b[0m') }
function warn(m) { console.log('  \x1b[33m!\x1b[0m ' + m) }

// ==================== STEP 1: autoScroll ====================

function step1() {
  head('[1/5] Fix autoScroll di src/components/ChatWidget.jsx')
  const rel = 'src/components/ChatWidget.jsx'
  if (!exists(rel)) { warn('tidak ditemukan'); return }

  const raw = read(rel)
  const eol = raw.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
  let src = raw.replace(/\r\n/g, '\n')
  let changed = 0

  // Cek sudah fix?
  if (src.indexOf('onWheel={onWheelBody}') !== -1) {
    skip('sudah pakai wheel/touchmove')
    return
  }

  // 1a. Ganti function onScrollBody jadi onWheelBody
  const oldFn = `function onScrollBody(e) {
    const el = e.currentTarget
    const jarak = el.scrollHeight - el.scrollTop - el.clientHeight
    setAutoScroll(jarak < 80)
  }`
  const newFn = `/* Deteksi user scroll manual pakai wheel/touchmove saja.
     Sebelumnya pakai onScroll yang kena trigger oleh auto-scroll
     programatik, sehingga bisa buat loop autoScroll nyala-mati. */
  function onWheelBody() {
    const el = refScroll.current
    if (!el) return
    const jarak = el.scrollHeight - el.scrollTop - el.clientHeight
    setAutoScroll(jarak < 80)
  }`

  if (src.indexOf(oldFn) !== -1) {
    src = src.replace(oldFn, newFn)
    changed++
    console.log('  \x1b[32m\u2713\x1b[0m function onScrollBody \u2192 onWheelBody')
  } else {
    warn('function onScrollBody tidak match (mungkin sudah diedit manual)')
  }

  // 1b. Ganti onScroll di JSX
  if (src.indexOf('onScroll={onScrollBody}') !== -1) {
    src = src.replace(
      'onScroll={onScrollBody}',
      'onWheel={onWheelBody}\n          onTouchMove={onWheelBody}'
    )
    changed++
    console.log('  \x1b[32m\u2713\x1b[0m onScroll \u2192 onWheel + onTouchMove')
  } else {
    warn('onScroll={onScrollBody} tidak ditemukan di JSX')
  }

  if (changed > 0) {
    const out = eol === '\r\n' ? src.replace(/\n/g, '\r\n') : src
    write(rel, out)
    ok(changed + ' perubahan diterapkan')
  }
}

// ==================== STEP 2: .env.example ====================

function step2() {
  head('[2/5] Tambah SUPABASE_SERVICE_ROLE_KEY ke .env.example')
  const rel = '.env.example'
  if (!exists(rel)) { warn('tidak ditemukan'); return }

  const raw = read(rel)
  const eol = raw.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
  let src = raw.replace(/\r\n/g, '\n')

  if (src.indexOf('SUPABASE_SERVICE_ROLE_KEY') !== -1) {
    skip('sudah ada')
    return
  }

  // Sisipkan setelah VITE_SUPABASE_ANON_KEY
  const anchor = 'VITE_SUPABASE_ANON_KEY='
  if (src.indexOf(anchor) === -1) {
    warn('anchor VITE_SUPABASE_ANON_KEY tidak ditemukan')
    return
  }

  src = src.replace(anchor, 'SUPABASE_SERVICE_ROLE_KEY=\n' + anchor)
  const out = eol === '\r\n' ? src.replace(/\n/g, '\r\n') : src
  write(rel, out)
  ok('SUPABASE_SERVICE_ROLE_KEY ditambahkan')
}

// ==================== STEP 3: file eksperimen ====================

function step3() {
  head('[3/5] Deteksi file eksperimen di root')
  const files = ['uji-ai.html', 'test-ai-provider.py']
  files.forEach(function (f) {
    if (exists(f)) {
      warn(f + ' masih ada di root')
      console.log('     Pindahkan ke folder tools/ atau hapus manual:')
      console.log('     \x1b[2mmkdir tools && move ' + f + ' tools\\\x1b[0m')
    } else {
      skip(f + ' tidak ada')
    }
  })
}

// ==================== STEP 4: folder "1" ====================

function step4() {
  head('[4/5] Deteksi file/folder "1" di root')
  if (exists('1')) {
    const stat = fs.statSync(fp('1'))
    const tipe = stat.isDirectory() ? 'folder' : 'file'
    warn('File/folder "1" (' + tipe + ') terdeteksi di root')
    console.log('     Kemungkinan tidak sengaja ke-create. Hapus manual:')
    console.log('     \x1b[2mrmdir /s /q 1    (kalau folder)\x1b[0m')
    console.log('     \x1b[2mdel 1             (kalau file)\x1b[0m')
  } else {
    skip('tidak ada')
  }
}

// ==================== STEP 5: dead script apply-ai ====================

function step5() {
  head('[5/5] Cek script apply-ai di package.json')
  const rel = 'package.json'
  if (!exists(rel)) { warn('tidak ditemukan'); return }

  const pkg = JSON.parse(read(rel))
  if (!pkg.scripts || !pkg.scripts['apply-ai']) {
    skip('script apply-ai tidak ada')
    return
  }

  if (exists('apply-ai.cjs')) {
    ok('script apply-ai ada & file apply-ai.cjs masih ada')
  } else {
    warn('script apply-ai ada di package.json tapi apply-ai.cjs tidak ada')
    console.log('     Edit package.json manual, hapus baris:')
    console.log('     \x1b[2m"apply-ai": "node apply-ai.cjs"\x1b[0m')
  }
}

// ==================== MAIN ====================

function main() {
  console.log('\n\x1b[1m\x1b[36m\u{1F9F9} Cleanup final temuan kecil\x1b[0m')

  if (!exists('package.json') || !exists('src/App.jsx')) {
    console.log('\n\x1b[31mJalankan dari root project.\x1b[0m\n')
    process.exit(1)
  }

  try {
    step1()
    step2()
    step3()
    step4()
    step5()
  } catch (e) {
    console.log('\n\x1b[31mGagal: ' + e.message + '\x1b[0m')
    console.error(e)
    process.exit(1)
  }

  console.log('\n\x1b[1m\x1b[32m\u2705 Selesai!\x1b[0m')
  console.log(`
  Langkah selanjutnya:

  1. Restart dev server: Ctrl+C, lalu npm run dev
  2. Hard refresh browser: Ctrl+Shift+R
  3. Test chat: scroll ke atas saat AI sedang mengetik, harusnya
     auto-scroll tidak ikut "meronta" untuk turun lagi.

  File yang perlu bersih-bersih manual (kalau perlu):
    - uji-ai.html          → pindah ke tools/ atau hapus
    - test-ai-provider.py  → pindah ke tools/ atau hapus
    - folder/file "1"      → hapus kalau tidak dipakai
`)
}

main()