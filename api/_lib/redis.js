import { Redis } from '@upstash/redis'
import { createHash } from 'node:crypto'

let klien = null

export function ambilRedis(env) {
  if (klien) return klien
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  klien = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN
  })
  return klien
}

export async function denganCache(env, kunci, ttlDetik, fetcher) {
  const redis = ambilRedis(env)
  if (!redis) return { data: await fetcher(), dariCache: false }

  try {
    const cached = await redis.get(kunci)
    if (cached !== null && cached !== undefined) {
      return { data: cached, dariCache: true }
    }
  } catch (e) {
    console.warn('[redis] get gagal, fallback ke fetcher:', e.message)
  }

  const hasil = await fetcher()

  try {
    await redis.set(kunci, hasil, { ex: ttlDetik })
  } catch (e) {
    console.warn('[redis] set gagal, dilewati:', e.message)
  }

  return { data: hasil, dariCache: false }
}

/* ===== NORMALISASI SLANG CHAT INDONESIA =====
   Dictionary rename A -> B untuk menyeragamkan penulisan sebelum hash.
   Semua entry di sini adalah RENAME (bukan delete), jadi tidak menghilangkan
   kata apapun — hanya merapikan penulisannya. Entry yang membalik maksud
   (seperti "belum" <-> "sudah") sengaja TIDAK dimasukkan.

   Efeknya:
     "risky udh isi logbook?"  -> "risky sudah isi logbook"
     "risky sdh isi logbook?"  -> "risky sudah isi logbook"   (hash sama)
     "risky sudah isi logbook?" -> "risky sudah isi logbook"  (hash sama)

   Kalau ada entry baru yang mau ditambah, pastikan dia TIDAK multi-makna
   dan TIDAK membalik maksud pertanyaan. */
const SLANG = {
  // ═══ KATA GANTI ORANG ═══
  gw: 'saya', gua: 'saya', gue: 'saya', aq: 'saya', ak: 'saya', sy: 'saya',
  km: 'kamu', kmu: 'kamu', kamuh: 'kamu', lu: 'kamu', lo: 'kamu',
  elo: 'kamu', elu: 'kamu',

  // ═══ KATA TANYA ═══
  gmn: 'gimana', gmna: 'gimana', gmana: 'gimana', gimna: 'gimana',
  knp: 'kenapa', knapa: 'kenapa', napa: 'kenapa', kenape: 'kenapa',
  kpn: 'kapan', kpan: 'kapan',
  brp: 'berapa', brpa: 'berapa', brapa: 'berapa',
  dmn: 'di mana', dimna: 'di mana',
  kmn: 'ke mana', kemna: 'ke mana',
  drmn: 'dari mana',
  ngpain: 'ngapain', ngapai: 'ngapain', ngapainn: 'ngapain', ngpainn: 'ngapain',

  // ═══ NEGASI ═══
  ga: 'tidak', gk: 'tidak', gak: 'tidak', tdk: 'tidak', tak: 'tidak',
  gada: 'tidak ada', gpp: 'tidak apa-apa', gapapa: 'tidak apa-apa',
  blm: 'belum', blom: 'belum', belom: 'belum',
  jgn: 'jangan', jngn: 'jangan',

  // ═══ KONJUNGSI / PREPOSISI ═══
  dgn: 'dengan', dg: 'dengan', dngn: 'dengan',
  tp: 'tapi', tpi: 'tapi',
  krn: 'karena', krna: 'karena', karna: 'karena',
  jd: 'jadi', jdi: 'jadi',
  stlh: 'setelah', stelah: 'setelah',
  sblm: 'sebelum', sblum: 'sebelum',
  utk: 'untuk', untk: 'untuk',
  dr: 'dari', drpd: 'daripada',
  pd: 'pada', pdhal: 'padahal',
  sm: 'sama', sma: 'sama', smua: 'semua', smw: 'semua',

  // ═══ WAKTU ═══
  skrg: 'sekarang', skr: 'sekarang', skrng: 'sekarang',
  kmrn: 'kemarin', kmrin: 'kemarin',
  bsk: 'besok', bsok: 'besok',
  hr: 'hari', hri: 'hari', hrini: 'hari ini',
  tgl: 'tanggal', tnggl: 'tanggal',
  bln: 'bulan',
  thn: 'tahun', thun: 'tahun',
  mgg: 'minggu', mggu: 'minggu',
  udh: 'sudah', udah: 'sudah', sdh: 'sudah', dah: 'sudah', uda: 'sudah',

  // ═══ KETERANGAN / KATA SIFAT ═══
  bgt: 'banget', bngt: 'banget',
  bgtu: 'begitu', bgitu: 'begitu',
  aj: 'aja', ajah: 'aja', ajh: 'aja', doang: 'aja', doank: 'aja',
  yg: 'yang', yng: 'yang',
  jg: 'juga', jga: 'juga',
  lg: 'lagi', lgi: 'lagi',
  hrs: 'harus', hrus: 'harus',
  bs: 'bisa', bsa: 'bisa',
  prnh: 'pernah', prnah: 'pernah',
  sll: 'selalu', sllu: 'selalu',
  srg: 'sering', sring: 'sering',
  jdl: 'jadwal',
  trs: 'terus', trus: 'terus',

  // ═══ VERBA UMUM ═══
  mkn: 'makan', mkan: 'makan',
  tdr: 'tidur', tdur: 'tidur',
  msk: 'masuk', msuk: 'masuk',
  klr: 'keluar', kluar: 'keluar',
  dtg: 'datang', dtng: 'datang',
  plg: 'pulang', plng: 'pulang',
  lht: 'lihat', liat: 'lihat',
  dpt: 'dapat', dapet: 'dapat',
  pnya: 'punya',
  mw: 'mau',
  pgn: 'pengen', pngn: 'pengen', pengin: 'pengen',
  gabisa: 'tidak bisa',

  // ═══ SAPAAN / UCAPAN ═══
  tks: 'terima kasih', thx: 'terima kasih', mksh: 'terima kasih',
  mksih: 'terima kasih', makasi: 'terima kasih', makasih: 'terima kasih',
  mf: 'maaf', maap: 'maaf', maf: 'maaf',
  tlg: 'tolong', tlng: 'tolong',
  mnt: 'minta', mnta: 'minta',
  ok: 'oke', okey: 'oke', okay: 'oke', okeh: 'oke',
  sip: 'oke', sipp: 'oke',
  iya: 'iya', yup: 'iya', yep: 'iya',
}

/* ===== NAMA MAHASISWA - KOREKSI TYPO =====
   Dictionary terpisah dari SLANG karena:
   1. Nama orang lebih rawan tabrakan (ada 2 orang namanya mirip).
   2. Gampang dikelola - tinggal tambah/hapus di satu tempat ini saja.
   3. Kalau typo-nya salah, cukup hapus 1 baris tanpa ganggu slang umum.

   FORMAT:
     '<typo_yang_sering_muncul>': '<nama_asli_lowercase>',

   ATURAN WAJIB:
   - Value HARUS persis nama asli yang ada di tabel mahasiswa (lowercase).
   - Setiap nama WAJIB punya entry self-mapping: 'nama': 'nama'
     supaya nama yang sudah benar tidak berubah.
   - Key (typo) tidak boleh sama dengan kata umum Indonesia.
   - Kalau ada 2 mahasiswa namanya mirip (mis. Risky vs Rizki), JANGAN
     masukkan typo yang bisa jadi milik keduanya. Biarkan MISS daripada salah.

   CARA TAMBAH NAMA BARU:
   Copy blok contoh di bawah, ganti nama aslinya, sesuaikan typo-nya.
   Setelah tambah, WAJIB test: dua nama berbeda harus tetap beda hash. */
const NAMA_MHS = {
  // ═══ Risky Wahyu Firmansyah ═══
  'risky': 'risky',
  'riski': 'risky',
  'riskyy': 'risky',
  'rizki': 'risky',
  'rizky': 'risky',
  'rifky': 'risky',
  'rifki': 'risky',

  // ═══ Dini Awwibi Ramadani ═══
  'dini': 'dini',
  'andini': 'dini',
  'dina': 'dini',
  'diny': 'dini',
  'awwibi': 'dini',
  'awibi': 'dini',

  // ═══ Alvian Hamdalah ═══
  'alvian': 'alvian',
  'vian': 'alvian',
  'fian': 'alvian',
  'alvin': 'alvian',

  // ═══ Putri Novita Sari ═══
  'putri': 'putri',
  'putrii': 'putri',
  'novita': 'putri',

  // ═══ Khoirul Anwar ═══
  'khoirul': 'khoirul',
  'khoir': 'khoirul',
  'anwar': 'khoirul',
  'irul': 'khoirul',
  'irull': 'khoirul',
  'rull': 'khoirul',
  'rul': 'khoirul',
  'rulz': 'khoirul',
  'rulzz': 'khoirul',
}

/* Terapkan dictionary SLANG per kata. Kata yang tidak ada di SLANG
   dibiarkan apa adanya. */
function normalkanSlang(teks) {
  return teks
    .split(' ')
    .map(function (kata) {
      // Urutan prioritas: SLANG dulu, baru NAMA_MHS.
      // Kata umum di SLANG dianggap lebih otoritatif daripada nama.
      return SLANG[kata] || NAMA_MHS[kata] || kata
    })
    .join(' ')
}

/* Normalisasi pertanyaan jadi hash pendek untuk kunci cache jawaban.
   Alur: lowercase -> hapus tanda baca -> rapikan spasi -> rename slang
        -> hash SHA-256 -> potong 16 karakter.
   Efeknya: "Risky prodi apa?", "risky prodi apa", dan
   "risky prodi apa dong" (setelah normalisasi slang) menghasilkan
   hash yang sama. */
export function kunciJawaban(pertanyaan) {
  const bersih = String(pertanyaan || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const dirapikan = normalkanSlang(bersih)
  const hash = createHash('sha256').update(dirapikan).digest('hex').slice(0, 16)
  return 'mbsi:chat:jawaban:v2:' + hash
}
