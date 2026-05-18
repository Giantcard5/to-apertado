import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { requireAuth } from '../hooks/require-auth.js'
import { writeRateLimit } from '../plugins/rate-limit.js'
import { moderatePhoto } from '../services/moderation.js'
import { addPoints, checkPhotoBadges } from '../services/gamification.js'
import { config } from '../config.js'

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

const presignSchema = z.object({
  bathroomId:  z.string().uuid(),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
})

const confirmSchema = z.object({
  key:        z.string().min(1),
  bathroomId: z.string().uuid(),
  ratingId:   z.string().uuid().optional(),
})

export default async function photosRoute(fastify: FastifyInstance) {
  // POST /photos/presign — gera presigned URL para upload direto ao R2
  fastify.post('/photos/presign', { preHandler: requireAuth, ...writeRateLimit }, async (req, reply) => {
    const body = presignSchema.parse(req.body)

    const { rows } = await fastify.db.query(
      'SELECT id FROM bathrooms WHERE id = $1',
      [body.bathroomId]
    )
    if (!rows[0]) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Banheiro não encontrado' })
    }

    const ext = body.contentType.split('/')[1]
    const key = `photos/${body.bathroomId}/${randomUUID()}.${ext}`

    const uploadUrl = await fastify.generatePresignedUrl(key, body.contentType, 300)

    return reply.send({ uploadUrl, key })
  })

  // POST /photos/confirm — confirma upload + Vision API
  fastify.post('/photos/confirm', { preHandler: requireAuth }, async (req, reply) => {
    const body = confirmSchema.parse(req.body)
    const userId = req.user!.userId

    const exists = await fastify.objectExists(body.key)
    if (!exists) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Arquivo não encontrado no storage' })
    }

    const imageUrl = `${config.CLOUDFLARE_R2_PUBLIC_URL}/${body.key}`
    const moderation = await moderatePhoto(imageUrl)

    const { rows } = await fastify.db.query(
      `INSERT INTO photos (bathroom_id, rating_id, user_id, url, status, vision_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [body.bathroomId, body.ratingId ?? null, userId, imageUrl, moderation.status, moderation.score]
    )

    const photoId = rows[0].id

    if (moderation.status === 'manual_review') {
      await fastify.db.query(
        `INSERT INTO moderation_queue (photo_id, reason) VALUES ($1, $2)`,
        [photoId, moderation.reason ?? 'vision_low_confidence']
      )
      fastify.log.warn({ photoId, reason: moderation.reason }, 'photo queued for manual review')
    }

    let pointsEarned = 0
    let badgesEarned: string[] = []

    if (moderation.status === 'approved') {
      const client = await fastify.db.connect()
      try {
        await client.query('BEGIN')
        await addPoints(client, userId, 20)
        badgesEarned = await checkPhotoBadges(client, userId)
        await client.query('COMMIT')
        pointsEarned = 20
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    }

    return reply.send({ photoId, status: moderation.status, pointsEarned, badgesEarned })
  })
}
