'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { setLocale as setLocaleAction } from '@/i18n/actions'
import type { Locale } from '@/i18n/config'

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('common')

  const switchTo = (next: Locale) => {
    if (next === locale) return
    startTransition(async () => {
      await setLocaleAction(next)
      router.refresh()
    })
  }

  const baseBtn =
    'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all disabled:opacity-60'
  const active =
    'text-white bg-white/15 border border-white/20 shadow-sm'
  const inactive =
    'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'

  return (
    <div
      className="flex items-center gap-1 px-1.5 py-1 rounded-lg"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      aria-label={t('language')}
    >
      <button
        type="button"
        onClick={() => switchTo('es')}
        disabled={isPending}
        className={`${baseBtn} ${locale === 'es' ? active : inactive}`}
        aria-pressed={locale === 'es'}
      >
        🇪🇸 ES
      </button>
      <button
        type="button"
        onClick={() => switchTo('en')}
        disabled={isPending}
        className={`${baseBtn} ${locale === 'en' ? active : inactive}`}
        aria-pressed={locale === 'en'}
      >
        🇬🇧 EN
      </button>
    </div>
  )
}
