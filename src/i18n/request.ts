import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, LOCALE_COOKIE, locales, type Locale } from './config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const stored = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined
  const locale: Locale = stored && locales.includes(stored) ? stored : defaultLocale

  const messages = (await import(`../../messages/${locale}.json`)).default

  return { locale, messages }
})
