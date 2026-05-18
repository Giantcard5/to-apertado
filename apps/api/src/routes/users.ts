import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../hooks/require-auth.js'

export default async function usersRoute(fastify: FastifyInstance) {
  fastify.get('/me', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.user!.userId

    const { rows } = await fastify.db.query(
      `SELECT
         u.id, u.name, u.avatar_url, u.points, u.role,
         COALESCE(
           json_agg(json_build_object(
             'slug', b.slug,
             'name', b.name,
             'description', b.description,
             'awarded_at', ub.awarded_at
           )) FILTER (WHERE b.id IS NOT NULL),
           '[]'
         ) AS badges
       FROM users u
       LEFT JOIN user_badges ub ON ub.user_id = u.id
       LEFT JOIN badges b ON b.id = ub.badge_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    )

    if (!rows[0]) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Usuário não encontrado' })
    }

    return reply.send(rows[0])
  })
}
