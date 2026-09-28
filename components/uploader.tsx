'use client'
import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CloudUpload, Loader2, X } from 'lucide-react'
import { formatBytes, toUploadItem, validateImage, type UploadItem } from '@/lib/image'
import { useToast } from './toast'

export function Uploader({ onUploaded }: { onUploaded: (item: UploadItem) => void }) {
  const toast = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const depth = useRef(0)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  function reset() {
    setFile(null); setPreview(null); setError('')
    if (input.current) input.current.value = '' // lets the same file be picked again
  }

  function pick(f?: File | null) {
    if (!f || busy) return
    const problem = validateImage(f)
    if (problem) { setError(problem); toast(problem, 'error'); return }
    setError(''); setFile(f); setPreview(URL.createObjectURL(f))
  }

  async function upload() {
    if (!file || busy) return
    setBusy(true); setError('')
    try {
      const body = new FormData()
      body.append('image', file)
      const res = await fetch('/api/upload', { method: 'POST', body })
      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload?.success) throw new Error(payload?.error || 'Upload failed. Try again.')
      onUploaded(toUploadItem(payload, payload.expiration))
      toast('Image uploaded')
      reset()
    } catch (e) {
      const offline = e instanceof TypeError
      const message = offline ? 'Network error. Check your connection and try again.' : (e as Error).message
      setError(message); toast(message, 'error')
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-4">
      <div
        role="button" tabIndex={0} aria-label="Choose an image to upload"
        onClick={() => !file && input.current?.click()}
        onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !file) { e.preventDefault(); input.current?.click() } }}
        onDragEnter={e => { e.preventDefault(); depth.current++; setDragging(true) }}
        onDragOver={e => e.preventDefault()}
        onDragLeave={() => { if (--depth.current <= 0) { depth.current = 0; setDragging(false) } }}
        onDrop={e => { e.preventDefault(); depth.current = 0; setDragging(false); pick(e.dataTransfer.files[0]) }}
        className={`rounded-[20px] border-2 border-dashed p-6 text-center transition-colors sm:p-10 ${file ? 'border-line' : 'cursor-pointer hover:border-accent/60'} ${dragging ? 'border-accent bg-accent/5' : 'border-line bg-card'}`}
      >
        <input ref={input} type="file" accept={'image/jpeg,image/png,image/gif,image/webp,image/bmp,image/avif'} hidden onChange={e => pick(e.target.files?.[0])} />
        {file && preview ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:text-left">
            <img src={preview} alt="Selected image preview" className="size-32 shrink-0 rounded-2xl border border-line bg-bg object-cover sm:size-28" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium" title={file.name}>{file.name}</p>
              <p className="mt-1 text-sm text-muted">{formatBytes(file.size)}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <button onClick={e => { e.stopPropagation(); upload() }} disabled={busy} className="btn-primary">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                  {busy ? 'Uploading…' : 'Upload image'}
                </button>
                <button onClick={e => { e.stopPropagation(); reset() }} disabled={busy} className="btn-ghost"><X size={16} />Remove</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent"><CloudUpload size={22} /></span>
            <p className="font-medium">{dragging ? 'Drop to select' : 'Drop an image here, or browse'}</p>
            <p className="text-sm text-muted">JPG, PNG, GIF, WEBP, BMP or AVIF, up to 10 MB</p>
          </div>
        )}
      </div>
      {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</p>}
    </div>
  )
}
