'use client'

import { useEffect, useRef, useCallback } from 'react'

export function useServerSync<T>(
  collection: string,
  data: T,
  setData: (data: T) => void,
) {
  const loaded = useRef(false)
  const saving = useRef(false)

  // Load from server on mount
  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    fetch(`/api/data/${collection}`)
      .then(r => r.json())
      .then(serverData => {
        if (Array.isArray(serverData) && serverData.length > 0) {
          setData(serverData as T)
        } else if (!Array.isArray(serverData) && Object.keys(serverData as Record<string, unknown>).length > 0) {
          setData(serverData as T)
        }
      })
      .catch(() => {})
  }, [collection, setData])

  // Save to server on data change (debounced)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const save = useCallback(() => {
    if (!loaded.current || saving.current) return
    saving.current = true
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      fetch(`/api/data/${collection}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).finally(() => { saving.current = false })
    }, 300)
  }, [collection, data])

  useEffect(() => {
    if (loaded.current) save()
  }, [save])
}
