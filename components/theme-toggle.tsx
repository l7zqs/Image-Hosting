'use client'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), [])
  return (
    <button
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="btn-ghost size-10 !p-0"
      onClick={() => {
        const next = !dark
        document.documentElement.classList.toggle('dark', next)
        try { localStorage.setItem('image-hosting:theme', next ? 'dark' : 'light') } catch {}
        setDark(next)
      }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
