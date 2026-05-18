'use client'

import { useEffect, useRef } from 'react'

const SESSION_KEY = 'ad_shown'

export function AdBanner() {
  const ref = useRef<HTMLDivElement>(null)

  // Show only once per session
  const alreadyShown = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)

  useEffect(() => {
    if (alreadyShown) return
    if (typeof window === 'undefined') return
    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) return

    try {
      sessionStorage.setItem(SESSION_KEY, '1')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle ?? []).push({})
    } catch {
      // silently fail if adsbygoogle not available
    }
  }, [alreadyShown])

  if (alreadyShown) return null
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) return null

  return (
    <div ref={ref} className="my-2 overflow-hidden rounded-xl">
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
