import { BadgeCard, type BadgeDef } from './BadgeCard'
import type { Badge } from '@to-apertado/types'

const ALL_BADGES: BadgeDef[] = [
  { slug: 'first_flush',  name: 'Primeira Descarga', description: 'Avalie o primeiro banheiro',    icon: '🚽' },
  { slug: 'scout',        name: 'Scout',             description: 'Cadastre um banheiro',           icon: '🗺️' },
  { slug: 'explorer_10',  name: 'Explorador',        description: '10 avaliações no total',         icon: '🔍' },
  { slug: 'explorer_50',  name: 'Explorador Pro',    description: '50 avaliações no total',         icon: '🌟' },
  { slug: 'critico_100',  name: 'Crítico',           description: '100 avaliações no total',        icon: '🏆' },
  { slug: 'fotografo',    name: 'Fotógrafo',         description: 'Tenha uma foto aprovada',        icon: '📸' },
  { slug: 'guardiao_sp',  name: 'Guardião de SP',    description: 'Contribua em 5 bairros',         icon: '🛡️' },
]

interface BadgeGridProps {
  earnedBadges: Badge[]
}

export function BadgeGrid({ earnedBadges }: BadgeGridProps) {
  const earnedMap = new Map(earnedBadges.map(b => [b.slug, b.awarded_at]))

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Conquistas
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {ALL_BADGES.map(badge => (
          <BadgeCard
            key={badge.slug}
            badge={badge}
            awardedAt={earnedMap.get(badge.slug) ?? null}
          />
        ))}
      </div>
    </div>
  )
}
