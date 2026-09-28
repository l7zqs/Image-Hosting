'use client'
import { ExternalLink, Copy, ImageOff, X } from 'lucide-react'
import { formatBytes, formatDateTime, type UploadItem } from '@/lib/image'
import { useCopy } from './copy-field'

export function History({ items, onRemove, onClear }: { items: UploadItem[]; onRemove: (id: string) => void; onClear: () => void }) {
  const { copy } = useCopy()
  const now = Date.now()
  return (
    <section aria-labelledby="recent" className="mt-16">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="recent" className="text-lg font-semibold">Recent uploads</h2>
        {items.length > 0 && <button onClick={onClear} className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">Clear all</button>}
      </div>
      {items.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
          <ImageOff className="mx-auto mb-3" size={22} />No uploads yet. Images you upload appear here, in this browser only.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map(i => {
            const expired = !!i.expiresAt && i.expiresAt < now
            return (
              <li key={i.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
                <div className="checker grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl">
                  {expired ? <ImageOff size={18} className="text-muted" /> : <img src={i.displayUrl} alt="" loading="lazy" className="size-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={i.title}>{i.title}</p>
                  <p className="truncate text-xs text-muted">{expired ? 'Expired' : formatBytes(i.size)} · {formatDateTime(i.uploadedAt)}</p>
                  {!expired && (
                    <div className="mt-1 flex gap-3 text-xs">
                      <button className="inline-flex items-center gap-1 text-accent hover:underline" onClick={() => copy(i.url, 'Direct link')}><Copy size={12} />Copy</button>
                      <a className="inline-flex items-center gap-1 text-accent hover:underline" href={i.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} />Open</a>
                    </div>
                  )}
                </div>
                <button aria-label={`Remove ${i.title} from history`} onClick={() => onRemove(i.id)} className="btn-ghost size-8 shrink-0 !p-0"><X size={14} /></button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
