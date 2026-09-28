export const APP_NAME = 'Image Hosting'
export const MAX_SIZE = 10 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/avif']
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'avif']

export type UploadItem = {
  id: string
  title: string
  url: string
  displayUrl: string
  viewerUrl: string
  deleteUrl: string
  width: number
  height: number
  size: number
  uploadedAt: number // ms epoch
  expiresAt: number | null // ms epoch
}

export function validateImage(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ACCEPTED_TYPES.includes(file.type) && !EXTENSIONS.includes(ext)) return 'Unsupported file. Use JPG, PNG, GIF, WEBP, BMP or AVIF.'
  if (file.size === 0) return 'This file is empty.'
  if (file.size > MAX_SIZE) return `File is too large (${formatBytes(file.size)}). The limit is 10 MB.`
  return null
}

export function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`
}

export function formatDateTime(ms: number) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms))
}

// Maps the imgBB response (data.*) to our UploadItem.
export function toUploadItem(payload: any, expirationSec: number): UploadItem {
  const d = payload.data
  const uploadedAt = Number(d.time) ? Number(d.time) * 1000 : Date.now()
  const url: string = d.url || d.image?.url || d.display_url
  return {
    id: String(d.id ?? crypto.randomUUID()),
    title: d.title || d.image?.name || 'Untitled',
    url,
    displayUrl: d.display_url || url,
    viewerUrl: d.url_viewer,
    deleteUrl: d.delete_url,
    width: Number(d.width) || 0,
    height: Number(d.height) || 0,
    size: Number(d.size) || 0,
    uploadedAt,
    expiresAt: Number(d.expiration) > 0 ? uploadedAt + Number(d.expiration) * 1000 : expirationSec ? uploadedAt + expirationSec * 1000 : null,
  }
}
