'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Capturar parámetros de origen (from=contable, returnUrl) antes de redirigir
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const from = params.get('from')
      const ret = params.get('returnUrl')
      if (from === 'contable' && ret) {
        localStorage.setItem('gi-return-url', ret)
        localStorage.setItem('gi-from-contable', '1')
      }
    }
    router.replace('/login')
  }, [router])

  return null
}
