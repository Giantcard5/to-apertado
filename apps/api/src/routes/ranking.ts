import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const querySchema = z.object({
  period: z.enum(['week', 'month', 'all']).default('all'),
})

export default async function rankingRoute(fastify: FastifyInstance) {
  fastify.get('/ranking', async (req, reply) => {
    const { period } = querySchema.parse(req.query)

    let query: string

    if (period === 'all') {
      query = `
        SELECT u.id, u.name, u.avatar_url, u.points AS total_points
        FROM users u
        ORDER BY u.points DESC
        LIMIT 20`
    } else {
      const interval = period === 'week' ? '7 days' : '30 days'
      query = `
        SELECT
          u.id, u.name, u.avatar_url,
          (
            COALESCE((SELECT COUNT(*) * 10 FROM ratings r WHERE r.user_id = u.id AND r.created_at > NOW() - INTERVAL '${interval}'), 0) +
            COALESCE((SELECT COUNT(*) * 50 FROM bathrooms b WHERE b.added_by = u.id AND b.created_at > NOW() - INTERVAL '${interval}'), 0) +
            COALESCE((SELECT COUNT(*) * 20 FROM photos p WHERE p.user_id = u.id AND p.status = 'approved' AND p.created_at > NOW() - INTERVAL '${interval}'), 0)
          )::int AS total_points
        FROM users u
        ORDER BY total_points DESC
        LIMIT 20`
    }

    const { rows } = await fastify.db.query(query)
    return reply.send({ data: rows, period })
  })
}
