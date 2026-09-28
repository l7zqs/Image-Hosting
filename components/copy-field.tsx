'use client'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useToast } from './toast'

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = Object.assign(document.createElement('textarea'), { value: text })
    el.style.position = 'fixed'; el.style.opacity = '0'
    document.body.appendChild(el); el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}

export function useCopy() {
  const toast = useToast()
  const [done, setDone] = useState<string | null>(null)
  return {
    done,
    copy: async (text: string, label: string) => {
      const ok = await copyText(text)
      toast(ok ? `${label} copied` : 'Copy failed. Select the text and copy it manually.', ok ? 'success' : 'error')
      if (ok) { setDone(label); window.setTimeout(() => setDone(d => (d === label ? null : d)), 1600) }
    },
  }
}

export function CopyField({ label, value }: { label: string; value: string }) {
  const { copy, done } = useCopy()
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
      <div className="flex gap-2">
        <input readOnly value={value} onFocus={e => e.currentTarget.select()} className="h-10 min-w-0 flex-1 truncate rounded-xl border border-line bg-bg px-3 text-sm text-ink" />
        <button onClick={() => copy(value, label)} aria-label={`Copy ${label}`} className="btn-ghost size-10 shrink-0 !p-0">
          {done === label ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  )
}
