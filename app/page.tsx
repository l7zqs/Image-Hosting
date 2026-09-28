'use client'
import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { APP_NAME, type UploadItem } from '@/lib/image'
import { useHistory } from '@/hooks/use-history'
import { ToastProvider } from '@/components/toast'
import { ThemeToggle } from '@/components/theme-toggle'
import { Uploader } from '@/components/uploader'
import { ResultCard } from '@/components/result-card'
import { History } from '@/components/history'

export default function Page() {
  const [result, setResult] = useState<UploadItem | null>(null)
  const history = useHistory()
  return (
    <ToastProvider>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-[10px] bg-accent text-accent-ink"><ImageIcon size={17} /></span>{APP_NAME}
          </a>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-20">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Upload an image, get a link.</h1>
        <p className="mt-4 max-w-md text-muted">Drop a file, copy the link, share it anywhere. Links expire after 10 minutes.</p>
        <div className="mt-10 space-y-6">
          <Uploader onUploaded={item => { setResult(item); history.add(item) }} />
          {result && <ResultCard item={result} />}
        </div>
        <History items={history.items} onRemove={history.remove} onClear={history.clear} />
      </main>
      <footer className="border-t border-line py-6 text-center text-sm text-muted">© {new Date().getFullYear()} {APP_NAME}</footer>
    </ToastProvider>
  )
}
