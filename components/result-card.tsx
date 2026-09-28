'use client'
import { Check, ExternalLink, Trash2 } from 'lucide-react'
import { formatBytes, formatDateTime, type UploadItem } from '@/lib/image'
import { CopyField, useCopy } from './copy-field'

export function ResultCard({ item }: { item: UploadItem }) {
  const { copy } = useCopy()
  const meta = [
    ['Size', formatBytes(item.size)],
    ['Resolution', item.width && item.height ? `${item.width} × ${item.height}` : '—'],
    ['Uploaded', formatDateTime(item.uploadedAt)],
    ...(item.expiresAt ? [['Expires', formatDateTime(item.expiresAt)]] : []),
  ]
  return (
    <article className="animate-in fade-in zoom-in-95 overflow-hidden rounded-[20px] border border-line bg-card shadow-sm duration-300">
      <div className="checker flex max-h-[420px] min-h-48 items-center justify-center border-b border-line">
        <img src={item.displayUrl} alt={item.title} className="max-h-[420px] w-full object-contain" />
      </div>
      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="min-w-0 truncate text-lg font-semibold" title={item.title}>{item.title}</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/10 px-3 py-1 text-xs font-medium text-ok"><Check size={12} />Upload successful</span>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
          {meta.map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-xs text-muted">{k}</dt><dd className="mt-0.5 break-words font-medium">{v}</dd></div>)}
        </dl>
        <div className="space-y-4">
          <CopyField label="Direct link" value={item.url} />
          <CopyField label="Display link" value={item.displayUrl} />
          <CopyField label="Viewer link" value={item.viewerUrl} />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button className="btn-primary" onClick={() => copy(item.url, 'Direct link')}>Copy direct link</button>
          <button className="btn-ghost" onClick={() => copy(item.displayUrl, 'Display link')}>Copy display link</button>
          <a className="btn-ghost" href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />Open image</a>
          <button className="btn-ghost text-danger" onClick={() => copy(item.deleteUrl, 'Delete link')}><Trash2 size={16} />Copy delete link</button>
        </div>
      </div>
    </article>
  )
}
