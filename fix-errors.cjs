const fs = require('fs');
const path = require('path');

console.log('Memulai perbaikan file...');

// 1. Perbaiki sintaks JSX di cards.jsx
const cardsPath = path.join(process.cwd(), 'src/components/cards.jsx');
let cardsCode = fs.readFileSync(cardsPath, 'utf8');

cardsCode = cardsCode.replace(
  `{it.media_path ? (\n                     {it.media_source === 'youtube' ? (`,
  `{it.media_path ? (\n                     it.media_source === 'youtube' ? (`
);
cardsCode = cardsCode.replace(
  `<ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />\n                     )}\n                   ) : null}`,
  `<ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />\n                     )\n                   ) : null}`
);
fs.writeFileSync(cardsPath, cardsCode);
console.log('[BERHASIL] src/components/cards.jsx diperbaiki.');

// 2. Hapus import dan state yang ganda di DashboardPage.jsx
const dashPath = path.join(process.cwd(), 'src/pages/DashboardPage.jsx');
let dashCode = fs.readFileSync(dashPath, 'utf8');

dashCode = dashCode.replace(
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'\nimport { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'`,
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'`
);

dashCode = dashCode.replace(
  `  const [galOldYt, setGalOldYt] = useState(null)\n  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })\n  const [itemMode, setItemMode] = useState({})\n  const [galMode, setGalMode] = useState('foto')\n  const [galYtLink, setGalYtLink] = useState('')\n  const [galYtTitle, setGalYtTitle] = useState('')`,
  `  const [galOldYt, setGalOldYt] = useState(null)\n  const [itemMode, setItemMode] = useState({})\n  const [galYtTitle, setGalYtTitle] = useState('')`
);

fs.writeFileSync(dashPath, dashCode);
console.log('[BERHASIL] src/pages/DashboardPage.jsx diperbaiki.');

console.log('\nSelesai! Silakan jalankan ulang npm run dev.');