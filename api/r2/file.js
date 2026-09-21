import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

/* Media disajikan lewat domain aplikasi sendiri:
   default 302 ke presigned GET R2 (untuk <img>/<video>),
   ?unduh=1 mem-proxy byte supaya unduhan Lightbox tetap same-origin. */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
    return
  }
  const url = new URL(req.url, 'http://localhost')
  const key = url.searchParams.get('key')
  if (!key) {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'Key tidak ada' }))
    return
  }
  const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })
  if (url.searchParams.get('unduh') !== '1') {
    const signed = await getSignedUrl(s3, cmd, { expiresIn: 300 })
    res.statusCode = 302
    res.setHeader('Location', signed)
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.end()
    return
  }
  try {
    const obj = await s3.send(cmd)
    res.statusCode = 200
    res.setHeader('Content-Type', obj.ContentType || 'application/octet-stream')
    if (obj.ContentLength) res.setHeader('Content-Length', String(obj.ContentLength))
    res.setHeader('Cache-Control', 'public, max-age=3600')
    obj.Body.pipe(res)
  } catch (e) {
    res.statusCode = 404
    res.end(JSON.stringify({ error: 'Media tidak ditemukan' }))
  }
}