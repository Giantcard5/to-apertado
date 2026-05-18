import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../hooks/require-auth.js'
import { writeRateLimit } from '../plugins/rate-limit.js'
import { addPoints, checkBathroomBadges } from '../services/gamification.js'

const searchSchema = z.object({
  lat:    z.coerce.number().min(-90).max(90),
  lng:    z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(5000).default(500),
  type:   z.string().optional(),
  free:   z.enum(['true', 'false']).transform(v => v === 'true').optional(),
})

const createSchema = z.object({
  name:         z.string().min(1).max(255),
  lat:          z.number().min(-90).max(90),
  lng:          z.number().min(-180).max(180),
  address:      z.string().optional(),
  place_type:   z.string().optional(),
  is_free:      z.boolean().default(true),
  is_accessible: z.boolean().default(false),
  requires_key: z.boolean().default(false),
  opening_hours: z.record(z.string()).optional(),
})

const updateSchema = createSchema.partial()

const reportSchema = z.object({
  reason: z.string().min(1).max(500),
})

export default async function bathroomsRoute(fastify: FastifyInstance) {
  // GET /bathrooms — busca geoespacial
  fastify.get('/bathrooms', async (req, reply) => {
    const query = searchSchema.parse(req.query)

    const { rows } = await fastify.db.query(
      `SELECT
         b.id, b.name, b.place_type, b.is_free, b.is_accessible, b.status,
         ST_Y(b.location::geometry) AS lat,
         ST_X(b.location::geometry) AS lng,
         ST_Distance(b.location, ST_MakePoint($2, $1)::geography) AS distance_meters,
         AVG(r.overall)::FLOAT   AS avg_rating,
         COUNT(r.id)::int        AS total_ratings
       FROM bathrooms b
       LEFT JOIN ratings r ON r.bathroom_id = b.id
       WHERE
         b.status IN ('active', 'needs_review')
         AND ST_DWithin(b.location, ST_MakePoint($2, $1)::geography, $3)
         AND ($4::text IS NULL OR b.place_type = $4)
         AND ($5::boolean IS NULL OR b.is_free = $5)
       GROUP BY b.id
       ORDER BY distance_meters ASC
       LIMIT 50`,
      [query.lat, query.lng, query.radius, query.type ?? null, query.free ?? null]
    )

    return reply.send({ data: rows })
  })

  // GET /bathrooms/:id — detalhes completos
  fastify.get<{ Params: { id: string } }>('/bathrooms/:id', async (req, reply) => {
    const { id } = req.params

    const { rows } = await fastify.db.query(
      `SELECT
         b.*,
         ST_Y(b.location::geometry) AS lat,
         ST_X(b.location::geometry) AS lng
       FROM bathrooms b WHERE b.id = $1`,
      [id]
    )

    if (!rows[0]) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Banheiro não encontrado' })
    }

    const [ratingsResult, photosResult] = await Promise.all([
      fastify.db.query(
        `SELECT id, overall, cleanliness, has_paper, has_soap, has_dryer, smell, comment, created_at
         FROM ratings WHERE bathroom_id = $1 ORDER BY created_at DESC LIMIT 5`,
        [id]
      ),
      fastify.db.query(
        `SELECT id, url, status FROM photos WHERE bathroom_id = $1 AND status = 'approved' ORDER BY created_at DESC LIMIT 10`,
        [id]
      ),
    ])

    return reply.send({
      ...rows[0],
      recent_ratings: ratingsResult.rows,
      photos: photosResult.rows,
    })
  })

  // POST /bathrooms — cadastrar banheiro
  fastify.post('/bathrooms', { preHandler: requireAuth, ...writeRateLimit }, async (req, reply) => {
    const body = createSchema.parse(req.body)
    const userId = req.user!.userId

    const client = await fastify.db.connect()
    try {
      await client.query('BEGIN')

      const { rows } = await client.query(
        `INSERT INTO bathrooms (name, location, address, place_type, is_free, is_accessible, requires_key, opening_hours, added_by, source)
         VALUES ($1, ST_MakePoint($3, $2)::geography, $4, $5, $6, $7, $8, $9, $10, 'user')
         RETURNING id`,
        [body.name, body.lat, body.lng, body.address ?? null, body.place_type ?? null,
         body.is_free, body.is_accessible, body.requires_key,
         body.opening_hours ? JSON.stringify(body.opening_hours) : null, userId]
      )

      await addPoints(client, userId, 50)
      const badges = await checkBathroomBadges(client, userId)

      await client.query('COMMIT')
      return reply.code(201).send({ id: rows[0].id, pointsEarned: 50, badgesEarned: badges })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  })

  // PUT /bathrooms/:id — editar banheiro
  fastify.put<{ Params: { id: string } }>('/bathrooms/:id', { preHandler: requireAuth }, async (req, reply) => {
    const body = updateSchema.parse(req.body)
    const userId = req.user!.userId

    const { rows: existing } = await fastify.db.query(
      'SELECT added_by FROM bathrooms WHERE id = $1',
      [req.params.id]
    )

    if (!existing[0]) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Banheiro não encontrado' })
    }

    if (existing[0].added_by !== userId && req.user!.role !== 'admin') {
      return reply.code(403).send({ error: 'FORBIDDEN', message: 'Sem permissão para editar este banheiro' })
    }

    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (body.name !== undefined)         { fields.push(`name = $${idx++}`);          values.push(body.name) }
    if (body.address !== undefined)      { fields.push(`address = $${idx++}`);       values.push(body.address) }
    if (body.place_type !== undefined)   { fields.push(`place_type = $${idx++}`);    values.push(body.place_type) }
    if (body.is_free !== undefined)      { fields.push(`is_free = $${idx++}`);       values.push(body.is_free) }
    if (body.is_accessible !== undefined){ fields.push(`is_accessible = $${idx++}`); values.push(body.is_accessible) }
    if (body.requires_key !== undefined) { fields.push(`requires_key = $${idx++}`);  values.push(body.requires_key) }
    if (body.opening_hours !== undefined){ fields.push(`opening_hours = $${idx++}`); values.push(JSON.stringify(body.opening_hours)) }

    if (fields.length === 0) return reply.code(400).send({ error: 'BAD_REQUEST', message: 'Nenhum campo para atualizar' })

    fields.push(`updated_at = NOW()`)
    values.push(req.params.id)

    await fastify.db.query(
      `UPDATE bathrooms SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    )

    return reply.send({ ok: true })
  })

  // POST /bathrooms/:id/report
  fastify.post<{ Params: { id: string } }>(
    '/bathrooms/:id/report',
    { preHandler: requireAuth, ...writeRateLimit },
    async (req, reply) => {
      const body = reportSchema.parse(req.body)
      const { id } = req.params
      const userId = req.user!.userId

      const { rows: existing } = await fastify.db.query(
        'SELECT id FROM bathrooms WHERE id = $1',
        [id]
      )
      if (!existing[0]) {
        return reply.code(404).send({ error: 'NOT_FOUND', message: 'Banheiro não encontrado' })
      }

      await fastify.db.query(
        `INSERT INTO reports (type, target_id, user_id, reason) VALUES ('bathroom', $1, $2, $3)`,
        [id, userId, body.reason]
      )

      const { rows: countRows } = await fastify.db.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM reports WHERE type = 'bathroom' AND target_id = $1`,
        [id]
      )

      if (parseInt(countRows[0].count) >= 3) {
        await fastify.db.query(
          `UPDATE bathrooms SET status = 'needs_review' WHERE id = $1 AND status = 'active'`,
          [id]
        )
        fastify.log.warn({ bathroomId: id, reports: countRows[0].count }, 'bathroom moved to needs_review')
      }

      return reply.send({ ok: true })
    }
  )
}
