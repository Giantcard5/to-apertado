import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Tô Apertado',
    template: '%s — Tô Apertado',
  },
  description: 'Banheiros de SP — rápido, honesto, crowdsourced',
  manifest: '/manifest.json',
  themeColor: '#1A6BFF',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tô Apertado',
  },
  icons: {
    apple: '/icons/icon-192.svg',
    icon: '/icons/icon-192.svg',
  },
  openGraph: {
    title: 'Tô Apertado',
    description: 'Banheiros de SP — rápido, honesto, crowdsourced',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans`}>
        <Providers>{children}</Providers>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  )
}
