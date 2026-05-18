import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { MapPin, Star } from 'lucide-react'
import { BAIRROS, getBairroBySlug } from '@/lib/bairros'
import { formatDistance } from '@/lib/utils'
import type { BathroomPin } from '@to-apertado/types'

// Revalidate page data every hour
export const revalidate = 3600

// Allow runtime generation for unknown bairros
export const dynamicParams = true

interface Props {
  params: Promise<{ bairro: string }>
}

export async function generateStaticParams() {
  return BAIRROS.map(b => ({ bairro: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bairro: slug } = await params
  const bairro = getBairroBySlug(slug)
  const name = bairro?.name ?? slug

  return {
    title: `Banheiros em ${name}, SP`,
    description: `Encontre banheiros públicos e privados em ${name}, São Paulo. Avaliações de limpeza, acessibilidade e muito mais.`,
    openGraph: {
      title: `Banheiros em ${name}, SP — Tô Apertado`,
      description: `Lista de banheiros em ${name} com avaliações da comunidade.`,
    },
    alternates: {
      canonical: `/banheiros-em/${slug}`,
    },
  }
}

async function getBathroomsInBairro(
  lat: number,
  lng: number,
  radius: number,
): Promise<BathroomPin[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  })

  try {
    const res = await fetch(`${base}/bathrooms?${params}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data ?? []) as BathroomPin[]
  } catch {
    return []
  }
}

export default async function BairroPage({ params }: Props) {
  const { bairro: slug } = await params
  const bairro = getBairroBySlug(slug)

  if (!bairro) notFound()

  const bathrooms = await getBathroomsInBairro(bairro.lat, bairro.lng, bairro.radius)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Banheiros em ${bairro.name}, SP`,
    description: `Lista de banheiros em ${bairro.name}, São Paulo`,
    numberOfItems: bathrooms.length,
    itemListElement: bathrooms.slice(0, 10).map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="px-4 pb-8 pt-6">
        {/* Header */}
        <div className="mb-6">
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:underline">São Paulo</Link>
            {' › '}
            <span>{bairro.name}</span>
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Banheiros em {bairro.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {bathrooms.length > 0
              ? `${bathrooms.length} banheiro${bathrooms.length !== 1 ? 's' : ''} encontrado${bathrooms.length !== 1 ? 's' : ''}`
              : 'Nenhum banheiro mapeado ainda'}
          </p>
        </div>

        {/* Bathroom list */}
        {bathrooms.length > 0 ? (
          <ul className="space-y-3">
            {bathrooms.map(b => (
              <li
                key={b.id}
                className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-medium text-gray-900 dark:text-gray-50">
                      {b.name}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {b.avg_rating != null && (
                        <span className="flex items-center gap-0.5">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          {b.avg_rating.toFixed(1)}
                          <span className="text-gray-400"> ({b.total_ratings})</span>
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <MapPin size={11} />
                        {formatDistance(b.distance_meters)}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 font-medium ${
                          b.is_free
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {b.is_free ? 'Gratuito' : 'Pago'}
                      </span>
                      {b.is_accessible && (
                        <span className="rounded-full bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          Acessível ♿
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-gray-50 p-8 text-center dark:bg-gray-800">
            <p className="text-2xl">🚽</p>
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Parece que ninguém mapeou banheiros aqui ainda.
            </p>
            <p className="mt-1 text-sm text-gray-400">Seja o herói.</p>
            <Link
              href="/registrar"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Cadastrar banheiro
            </Link>
          </div>
        )}

        {/* Internal links to other bairros */}
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
            Outros bairros
          </h2>
          <div className="flex flex-wrap gap-2">
            {BAIRROS.filter(b => b.slug !== slug).slice(0, 8).map(b => (
              <Link
                key={b.slug}
                href={`/banheiros-em/${b.slug}`}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
