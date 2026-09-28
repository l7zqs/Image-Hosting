import { NextResponse } from 'next/server'
import { ACCEPTED_TYPES, MAX_SIZE } from '@/lib/image'

export const runtime = 'nodejs'

const EXPIRATION = Number(process.env.IMGBB_EXPIRATION) || 600

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status })

export async function POST(request: Request) {
  const key = process.env.IMGBB_API_KEY
  if (!key) return fail('Uploads are not configured. Set IMGBB_API_KEY on the server.', 503)

  let image: FormDataEntryValue | null
  try {
    image = (await request.formData()).get('image')
  } catch {
    return fail('Could not read the upload. Send the image as multipart form data.', 400)
  }
  if (!(image instanceof File) || (image.type && !ACCEPTED_TYPES.includes(image.type))) return fail('Select a JPG, PNG, GIF, WEBP, BMP or AVIF image.', 400)
  if (image.size === 0 || image.size > MAX_SIZE) return fail('Images must be between 1 byte and 10 MB.', 400)

  const body = new FormData()
  body.append('image', image, image.name)

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?expiration=${EXPIRATION}&key=${encodeURIComponent(key)}`, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(45_000),
    })
    const payload = await res.json().catch(() => null)
    if (!res.ok || !payload?.success) {
      console.error('imgBB error', res.status, payload?.error?.message)
      return fail(payload?.error?.message || 'imgBB rejected the upload.', res.status >= 400 && res.status < 500 ? res.status : 502)
    }
    return NextResponse.json({ ...payload, expiration: EXPIRATION })
  } catch (err) {
    console.error('imgBB request failed', err)
    const timeout = err instanceof Error && err.name === 'TimeoutError'
    return fail(timeout ? 'The upload timed out. Try again.' : 'Could not reach imgBB. Try again.', 504)
  }
}
