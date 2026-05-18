import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../hooks/require-auth.js'
import { writeRateLimit } from '../plugins/rate-limit.js'
import { addPoints, checkRatingBadges } from '../services/gamification.js'

const createRatingSchema = z.object({
  overall:     z.number().int().min(1).max(5),
  cleanliness: z.number().int().min(1).max(3).optional(),
  has_paper:   z.boolean().optional(),
  has_soap:    z.boolean().optional(),
  has_dryer:   z.boolean().optional(),
  smell:       z.number().int().min(1).max(3).optional(),
  comment:     z.string().max(1000).optional(),
})

export default async function ratingsRoute(fastify: FastifyInstance) {
  // GET /bathrooms/:id/ratings
  fastify.get<{ Params: { id: string }; Querystring: { page?: string; limit?: string } }>(
    '/bathrooms/:id/ratings',
    async (req, reply) => {
      const { id } = req.params
      const page  = Math.max(1, parseInt(req.query.page  ?? '1'))
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit ?? '10')))
      const offset = (page - 1) * limit

      const { rows } = await fastify.db.query(
        `SELECT id, overall, cleanliness, has_paper, has_soap, has_dryer, smell, comment, created_at
         FROM ratings
         WHERE bathroom_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [id, limit, offset]
      )

      return reply.send({ data: rows, page, limit })
    }
  )

  // POST /bathrooms/:id/ratings
  fastify.post<{ Params: { id: string } }>(
    '/bathrooms/:id/ratings',
    { preHandler: requireAuth, ...writeRateLimit },
    async (req, reply) => {
      const body = createRatingSchema.parse(req.body)
      const { id: bathroomId } = req.params
      const userId = req.user!.userId

      const { rows: existing } = await fastify.db.query(
        'SELECT id FROM bathrooms WHERE id = $1',
        [bathroomId]
      )
      if (!existing[0]) {
        return reply.code(404).send({ error: 'NOT_FOUND', message: 'Banheiro não encontrado' })
      }

      const client = await fastify.db.connect()
      try {
        await client.query('BEGIN')

        const { rows } = await client.query(
          `INSERT INTO ratings (bathroom_id, user_id, overall, cleanliness, has_paper, has_soap, has_dryer, smell, comment)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, overall, cleanliness, has_paper, has_soap, has_dryer, smell, comment, created_at`,
          [bathroomId, userId, body.overall, body.cleanliness ?? null,
           body.has_paper ?? null, body.has_soap ?? null, body.has_dryer ?? null,
           body.smell ?? null, body.comment ?? null]
        )

        await addPoints(client, userId, 10)
        const badges = await checkRatingBadges(client, userId)

        await client.query('COMMIT')
        return reply.code(201).send({ rating: rows[0], pointsEarned: 10, badgesEarned: badges })
      } catch (err: unknown) {
        await client.query('ROLLBACK')
        // Violação de UNIQUE (1 avaliação por dia)
        if ((err as NodeJS.ErrnoException & { code?: string }).code === '23505') {
          return reply.code(409).send({
            error: 'CONFLICT',
            message: 'Você já avaliou este banheiro hoje',
          })
        }
        throw err
      } finally {
        client.release()
      }
    }
  )
}
