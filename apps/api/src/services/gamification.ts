import type { PoolClient } from 'pg'

type BadgeCheck = { slug: string; bonusPoints: number }

export async function addPoints(db: PoolClient, userId: string, points: number) {
  await db.query('UPDATE users SET points = points + $1 WHERE id = $2', [points, userId])
}

export async function awardBadgeIfEarned(
  db: PoolClient,
  userId: string,
  slug: string,
  bonusPoints: number
): Promise<boolean> {
  const result = await db.query(
    `INSERT INTO user_badges (user_id, badge_id)
     SELECT $1, id FROM badges WHERE slug = $2
     ON CONFLICT DO NOTHING
     RETURNING badge_id`,
    [userId, slug]
  )

  if (result.rowCount && result.rowCount > 0 && bonusPoints > 0) {
    await db.query('UPDATE users SET points = points + $1 WHERE id = $2', [bonusPoints, userId])
    return true
  }

  return (result.rowCount ?? 0) > 0
}

export async function checkRatingBadges(db: PoolClient, userId: string): Promise<string[]> {
  const { rows } = await db.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM ratings WHERE user_id = $1',
    [userId]
  )
  const total = parseInt(rows[0].count)
  const earned: string[] = []

  const checks: BadgeCheck[] = [
    { slug: 'first_flush', bonusPoints: 0 },
    { slug: 'critico_100', bonusPoints: 200 },
  ]

  const thresholds: Record<string, number> = { first_flush: 1, critico_100: 100 }

  for (const check of checks) {
    if (total >= thresholds[check.slug]) {
      const awarded = await awardBadgeIfEarned(db, userId, check.slug, check.bonusPoints)
      if (awarded) earned.push(check.slug)
    }
  }

  return earned
}

export async function checkBathroomBadges(db: PoolClient, userId: string): Promise<string[]> {
  const { rows } = await db.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM bathrooms WHERE added_by = $1',
    [userId]
  )
  const total = parseInt(rows[0].count)
  const earned: string[] = []

  const checks: Array<BadgeCheck & { threshold: number }> = [
    { slug: 'scout',       bonusPoints: 0,   threshold: 1  },
    { slug: 'explorer_10', bonusPoints: 100, threshold: 10 },
    { slug: 'explorer_50', bonusPoints: 500, threshold: 50 },
  ]

  for (const check of checks) {
    if (total >= check.threshold) {
      const awarded = await awardBadgeIfEarned(db, userId, check.slug, check.bonusPoints)
      if (awarded) earned.push(check.slug)
    }
  }

  return earned
}

export async function checkPhotoBadges(db: PoolClient, userId: string): Promise<string[]> {
  const { rows } = await db.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM photos WHERE user_id = $1 AND status = 'approved'`,
    [userId]
  )
  const total = parseInt(rows[0].count)
  const earned: string[] = []

  if (total >= 10) {
    const awarded = await awardBadgeIfEarned(db, userId, 'fotografo', 100)
    if (awarded) earned.push('fotografo')
  }

  return earned
}
