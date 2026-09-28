'use client'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'

type Kind = 'success' | 'error'
const Ctx = createContext<(message: string, kind?: Kind) => void>(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState<{ message: string; kind: Kind; n: number } | null>(null)
  const timer = useRef<number>(0)
  const show = useCallback((message: string, kind: Kind = 'success') => {
    window.clearTimeout(timer.current)
    setT({ message, kind, n: Date.now() })
    timer.current = window.setTimeout(() => setT(null), 3200)
  }, [])
  return (
    <Ctx.Provider value={show}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center">
        {t && (
          <div key={t.n} className="animate-in fade-in slide-in-from-bottom-2 flex max-w-full items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm text-bg shadow-lg duration-200">
            {t.kind === 'error' ? <AlertCircle size={16} className="shrink-0" /> : <Check size={16} className="shrink-0" />}
            <span className="min-w-0 break-words">{t.message}</span>
          </div>
        )}
      </div>
    </Ctx.Provider>
  )
}
