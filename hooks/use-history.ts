'use client'
import { useCallback, useEffect, useState } from 'react'
import type { UploadItem } from '@/lib/image'

const KEY = 'image-hosting:history'

export function useHistory() {
  const [items, setItems] = useState<UploadItem[]>([])
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      if (Array.isArray(saved)) setItems(saved)
    } catch {}
  }, [])
  const save = useCallback((next: UploadItem[]) => {
    setItems(next)
    try { localStorage.setItem(KEY, JSON.stringify(next.slice(0, 50))) } catch {}
  }, [])
  return {
    items,
    add: (item: UploadItem) => save([item, ...items.filter(i => i.id !== item.id)]),
    remove: (id: string) => save(items.filter(i => i.id !== id)),
    clear: () => save([]),
  }
}
