#!/usr/bin/env node
'use strict'

/**
 * fix-ai.cjs
 * ---------------------------------------------------------------------
 * Perbaikan untuk apply-ai.cjs yang gagal di Windows karena CRLF.
 * Menambahkan 3 sisipan yang belum masuk:
 *   - src/pages/DashboardPage.jsx : state aiDraft/aiBusy/aiOpen + UI blok
 *   - src/pages/QuickPage.jsx     : UI blok
 *
 * Idempotent: aman dijalankan berulang.
 * Cara pakai:
 *   node fix-ai.cjs
 * ---------------------------------------------------------------------
 */

const fs = require('fs')
const path = require('path')
const ROOT = process.cwd()

function fp(rel) { return path.join(ROOT, rel) }
function exists(rel) { return fs.existsSync(fp(rel)) }

// UI blok dengan indent relatif (step 2 spasi). Akan di-prepend base indent
// yang sama dengan indentasi baris <form> target.
const UI_BLOCK = `<div className="rounded-2xl border border-bsi-200 bg-gradient-to-br from-bsi-50 to-white p-4">
  <div className="flex items-start gap-3">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bsi-800 text-white text-lg">&#10024;</span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-slate-900">Tulis Cepat dengan AI</p>
      <p className="mt-0.5 text-xs text-slate-600">Ceritakan kegiatanmu sekilas, biar AI yang rapikan.</p>
    </div>
    <button type="button" onClick={function () { setAiOpen(function (v) { return !v }) }}
      className="shrink-0 text-xs font-bold text-bsi-800 hover:text-bsi-900">
      {aiOpen ? 'Tutup' : 'Buka'}
    </button>
  </div>
  {aiOpen ? (
    <div className="mt-3 space-y-3">
      <AutoTextArea
        className={inputCls}
        value={aiDraft}
        onChange={function (e) { setAiDraft(e.target.value) }}
        placeholder="Contoh: hari ini bantu input data nasabah, ada kendala sistem eror, belajar cara verifikasi berkas"
        rows={3}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={aiBusy || !aiDraft.trim()}
          onClick={handleAiTulis}
          className="rounded-xl bg-bsi-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-bsi-900 disabled:opacity-50"
        >
          {aiBusy ? <LabelProses teks="AI menulis" /> : '\u2728 Rapikan dengan AI'}
        </button>
        <button
          type="button"
          disabled={aiBusy || !aiDraft}
          onClick={function () { setAiDraft('') }}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Bersihkan
        </button>
      </div>
    </div>
  ) : null}
</div>`

function indentLines(block, base) {
  return block
    .split('\n')
    .map(function (line) { return line ? base + line : line })
    .join('\n')
}

function patchFile(rel, formClassName, isDashboard) {
  console.log('\n\x1b[1m[Patch] ' + rel + '\x1b[0m')
  if (!exists(rel)) { console.log('  \x1b[31m!\x1b[0m file tidak ditemukan'); return }
  const raw = fs.readFileSync(fp(rel), 'utf8')
  const eol = raw.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
  console.log('  \x1b[2m· line ending terdeteksi: ' + (eol === '\r\n' ? 'CRLF' : 'LF') + '\x1b[0m')
  let src = raw.replace(/\r\n/g, '\n')
  let changed = 0

  // ===== 1. State aiDraft/aiBusy/aiOpen (hanya Dashboard) =====
  if (isDashboard) {
    if (src.indexOf('const [aiDraft, setAiDraft]') !== -1) {
      console.log('  \x1b[2m·\x1b[0m state AI sudah ada, dilewati')
    } else {
      const re = /^(\s*)const \[unsavedModal, setUnsavedModal\] = useState\(null\)$/m
      if (re.test(src)) {
        src = src.replace(re, function (m, indent) {
          return (
            m + '\n' +
            indent + "const [aiDraft, setAiDraft] = useState('')\n" +
            indent + 'const [aiBusy, setAiBusy] = useState(false)\n' +
            indent + 'const [aiOpen, setAiOpen] = useState(false)'
          )
        })
        changed++
        console.log('  \x1b[32m\u2713\x1b[0m state aiDraft/aiBusy/aiOpen ditambahkan')
      } else {
        console.log('  \x1b[31m!\x1b[0m anchor state unsavedModal tidak ditemukan')
      }
    }
  }

  // ===== 2. UI blok =====
  if (src.indexOf('Tulis Cepat dengan AI') !== -1) {
    console.log('  \x1b[2m·\x1b[0m UI blok sudah ada, dilewati')
  } else {
    const esc = formClassName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(
      '^(\\s*)(<form onSubmit=\\{submitLogbook\\} className="' + esc + '">)$',
      'm'
    )
    if (re.test(src)) {
      src = src.replace(re, function (m, indent, formLine) {
        return formLine + '\n' + indentLines(UI_BLOCK, indent)
      })
      changed++
      console.log('  \x1b[32m\u2713\x1b[0m UI blok AI disisipkan')
    } else {
      console.log('  \x1b[31m!\x1b[0m anchor <form> tidak ditemukan')
    }
  }

  // ===== Tulis balik dengan line ending asli =====
  if (changed) {
    const out = eol === '\r\n' ? src.replace(/\n/g, '\r\n') : src
    fs.writeFileSync(fp(rel), out, 'utf8')
    console.log('  \x1b[32m\u2713\x1b[0m file disimpan (' + changed + ' perubahan)')
  } else {
    console.log('  \x1b[2m· tidak ada perubahan\x1b[0m')
  }
}

function main() {
  console.log('\n\x1b[1m\x1b[36m\u{1F527} Fix Apply AI (CRLF-safe)\x1b[0m')

  if (!exists('package.json') || !exists('src/App.jsx')) {
    console.log('\n\x1b[31mJalankan dari root project!\x1b[0m\n')
    process.exit(1)
  }

  patchFile('src/pages/DashboardPage.jsx', 'mt-6 space-y-4', true)
  patchFile('src/pages/QuickPage.jsx', 'mt-5 space-y-4', false)

  console.log('\n\x1b[1m\x1b[32m\u2705 Selesai!\x1b[0m')
  console.log(`
  Langkah selanjutnya:

  1. Restart dev server kalau sedang jalan:
     Ctrl+C, lalu \x1b[1mnpm run dev\x1b[0m

  2. Hard refresh browser: \x1b[1mCtrl+Shift+R\x1b[0m

  3. Login, buka \x1b[1m/dashboard\x1b[0m → tab Logbook
     Cari panel \u2728 \x1b[1mTulis Cepat dengan AI\x1b[0m

  Kalau masih tidak muncul, cek console (F12) dan kabari aku.
`)
}

main()