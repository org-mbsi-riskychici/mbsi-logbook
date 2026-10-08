const BASE = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'qwen/qwen3.8-27b'

export function modelGroq(env) {
  return env.GROQ_MODEL || DEFAULT_MODEL
}

export async function panggilGroq(env, opsi) {
  const key = env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY belum dikonfigurasi di environment')

  const body = {
    model: modelGroq(env),
    messages: [{ role: 'user', content: opsi.prompt }],
    temperature: opsi.temperature == null ? 0.6 : opsi.temperature,
    max_completion_tokens: opsi.maxTokens || 2048,
    reasoning_effort: opsi.reasoningEffort || 'none',
    response_format: { type: 'json_object' }
  }

  const r = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + key
    },
    body: JSON.stringify(body)
  })

  const teks = await r.text()
  if (!r.ok) {
    let detail = ''
    try {
      const j = JSON.parse(teks)
      if (j && j.error && j.error.message) detail = j.error.message
    } catch (e) {}
    if (r.status === 401) throw new Error('API key Groq tidak valid. Periksa GROQ_API_KEY di .env.local')
    if (r.status === 404) throw new Error('Model "' + modelGroq(env) + '" tidak ditemukan di Groq. Cek https://console.groq.com/docs/models')
    if (r.status === 429) {
      if (/per day|daily|RPD/i.test(detail)) throw new Error('Kuota harian Groq habis (1.000 request/hari untuk Qwen 3.8 27B). Reset tengah malam UTC.')
      if (/per minute|TPM|RPM/i.test(detail)) throw new Error('Rate limit Groq: terlalu banyak request per menit. Tunggu 10-20 detik lalu coba lagi.')
      throw new Error('Groq rate limit: ' + (detail || 'coba lagi sebentar lagi'))
    }
    throw new Error('Groq gagal (status ' + r.status + '): ' + (detail || teks.slice(0, 200)))
  }

  const data = JSON.parse(teks)
  const pilihan = data && data.choices && data.choices[0]
  const out = pilihan && pilihan.message && pilihan.message.content
  if (!out) throw new Error('Groq tidak mengembalikan jawaban')
  return String(out).trim()
}

export function parseJsonDariTeks(teks) {
  try { return JSON.parse(teks) } catch (e) {}
  const m = String(teks).match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch (e) { return null }
}

function bangunPrompt(draft, kategoriList, unitList) {
  return [
    'Kamu asisten yang bantu nulis logbook magang di Bank Syariah Indonesia (BSI).',
    '',
    'Tugas: ubah catatan kasar jadi logbook harian yang enak dibaca.',
    '',
    '════ GAYA BAHASA (WAJIB DIIKUTI) ════',
    '1. Sudut pandang ORANG PERTAMA (diri sendiri).',
    '   - Pakai "saya" sesekali, atau tanpa subjek.',
    '   - DILARANG menyebut "mahasiswa", "peserta magang", "praktikan", nama orang, atau "penulis".',
    '',
    '2. Bahasa natural & mengalir, seperti ngobrol sama teman kantor.',
    '   - Hindari kata kaku: "mengonsumsi", "melaksanakan", "melakukan", "adapun", "yakni", "sebagaimana", "tersebut".',
    '   - Ganti jadi kata sehari-hari:',
    '       "mengonsumsi makanan" → "makan"',
    '       "melaksanakan tugas" → "kerjain"',
    '       "melakukan input" → "input"',
    '       "memberikan pelayanan" → "layani"',
    '       "mempelajari cara" → "belajar cara"',
    '       "melakukan kegiatan" → (hapus aja, langsung ke aksinya)',
    '',
    '3. Tetap sopan & profesional, tapi tidak birokratis.',
    '   - Boleh santai. Jangan lebay, jangan alay.',
    '   - Hindari tanda seru berlebihan, emoji, atau bahasa gaul yang berlebihan.',
    '',
    '════ CONTOH (IKUTI GAYA INI) ════',
    'Draft: "makan gorengan siang bareng temen kantor"',
    '→ judul: "Istirahat siang bareng rekan kantor"',
    '→ items[0]: { "judul": "Makan bareng rekan kantor", "deskripsi": "Ngemil gorengan bareng teman kantor pas jam istirahat siang." }',
    '',
    'Draft: "bantu CS input data nasabah, sistem sempat error"',
    '→ judul: "Bantu Input Data Nasabah dan Tangani Kendala Sistem"',
    '→ items[0]: { "judul": "Bantu input data nasabah", "deskripsi": "Dampingi CS masukin data nasabah baru ke sistem." }',
    '→ kendala: "Sistem sempat error pas lagi input data."',
    '',
    'Draft: "belajar cara verifikasi KTP dan NPWP"',
    '→ judul: "Belajar Verifikasi Berkas Nasabah"',
    '→ items[0]: { "judul": "Belajar verifikasi KTP dan NPWP", "deskripsi": "Pelajari cara cek keaslian berkas KTP dan NPWP nasabah." }',
    '→ pembelajaran: "Jadi paham cara cek keaslian berkas nasabah."',
    '',
    '════ FORMAT OUTPUT ════',
    'WAJIB balas dengan JSON murni tanpa teks pembuka/penutup. Struktur:',
    '{',
    '  "judul": "string",',
    '  "kategori": "string",',
    '  "unit": "string",',
    '  "kendala": "string",',
    '  "solusi": "string",',
    '  "pembelajaran": "string",',
    '  "items": [{ "judul": "string", "deskripsi": "string" }]',
    '}',
    '',
    'Aturan field:',
    '- "judul": ringkasan hari itu, maks 12 kata, tanpa titik di akhir. POV orang pertama (bisa tanpa subjek).',
    '- "kategori": pilih SATU persis dari: ' + kategoriList.join(', ') + '.',
    '- "unit": pilih SATU persis dari: ' + unitList.join(', ') + ', atau "" kalau tidak jelas.',
    '- "items": 1-5 kegiatan. Tiap item: "judul" (maks 10 kata) + "deskripsi" (1-2 kalimat, POV orang pertama).',
    '- "kendala", "solusi", "pembelajaran": POV orang pertama. Isi kalau ada di catatan, kalau tidak isi "".',
    '- Jangan mengarang detail yang tidak ada di catatan.',
    '',
    'Catatan kasar:',
    '"""',
    draft.trim(),
    '"""'
  ].join('\n')
}

function potong(s, n) { return String(s || '').slice(0, n) }

export async function susunLogbookDenganGroq(env, opts) {
  const draft = String(opts.draft || '').trim()
  if (!draft) throw new Error('Catatan kosong')
  if (draft.length > 2000) throw new Error('Catatan terlalu panjang (maks 2000 karakter)')
  const kat = (opts.kategoriList && opts.kategoriList.length) ? opts.kategoriList : []
  const unit = (opts.unitList && opts.unitList.length) ? opts.unitList : []

  const raw = await panggilGroq(env, {
    prompt: bangunPrompt(draft, kat, unit),
    temperature: 0.6,
    maxTokens: 2048,
    reasoningEffort: 'none'
  })
  const hasil = parseJsonDariTeks(raw)
  if (!hasil) throw new Error('AI tidak menghasilkan JSON valid')

  return {
    judul: potong(hasil.judul, 200),
    kategori: kat.indexOf(hasil.kategori) !== -1 ? hasil.kategori : '',
    unit: unit.indexOf(hasil.unit) !== -1 ? hasil.unit : '',
    kendala: potong(hasil.kendala, 800),
    solusi: potong(hasil.solusi, 800),
    pembelajaran: potong(hasil.pembelajaran, 800),
    items: Array.isArray(hasil.items)
      ? hasil.items.slice(0, 5).map(function (it) {
          return { judul: potong(it.judul, 200), deskripsi: potong(it.deskripsi, 800) }
        }).filter(function (it) { return it.judul })
      : []
  }
}