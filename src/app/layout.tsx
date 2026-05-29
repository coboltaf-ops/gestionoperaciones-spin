import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('app')
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="antialiased min-h-screen relative overflow-x-hidden bg-gray-950">
        {/* Mesh Gradient Background */}
        <div className="fixed inset-0 -z-10 bg-gray-950 [background-image:radial-gradient(at_40%_20%,rgba(96,165,250,0.25)_0px,transparent_50%),radial-gradient(at_80%_0%,rgba(59,130,246,0.2)_0px,transparent_50%),radial-gradient(at_0%_50%,rgba(56,189,248,0.2)_0px,transparent_50%),radial-gradient(at_80%_50%,rgba(30,64,175,0.3)_0px,transparent_50%),radial-gradient(at_0%_100%,rgba(96,165,250,0.2)_0px,transparent_50%)]" />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
