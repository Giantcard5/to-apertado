import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireAdmin } from '../hooks/require-admin.js'
import { addPoints, awardBadgeIfEarned } from '../services/gamification.js'

const moderationActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
})

const reportActionSchema = z.object({
  action: z.enum(['confirm_active', 'close', 'clear_reports']),
})

export default async function adminRoute(fastify: FastifyInstance) {
  // GET /admin/moderation — fila de fotos para revisão manual
  fastify.get('/admin/moderation', { preHandler: requireAdmin }, async (req, reply) => {
    const { rows } = await fastify.db.query(
      `SELECT
         p.id AS photo_id, p.url, p.vision_score,
         mq.id AS queue_id, mq.reason, mq.created_at,
         b.id AS bathroom_id, b.name AS bathroom_name,
         u.id AS user_id, u.name AS user_name
       FROM moderation_queue mq
       JOIN photos p ON p.id = mq.photo_id
       JOIN bathrooms b ON b.id = p.bathroom_id
       LEFT JOIN users u ON u.id = p.user_id
       WHERE mq.status = 'pending'
       ORDER BY mq.created_at ASC
       LIMIT 50`
    )
    return reply.send({ data: rows })
  })

  // PUT /admin/moderation/:photoId — aprovar ou rejeitar foto
  fastify.put<{ Params: { photoId: string } }>(
    '/admin/moderation/:photoId',
    { preHandler: requireAdmin },
    async (req, reply) => {
      const body = moderationActionSchema.parse(req.body)
      const { photoId } = req.params
      const adminId = req.user!.userId

      const { rows } = await fastify.db.query(
        'SELECT id, user_id FROM photos WHERE id = $1',
        [photoId]
      )
      if (!rows[0]) {
        return reply.code(404).send({ error: 'NOT_FOUND', message: 'Foto não encontrada' })
      }

      const newStatus = body.action === 'approve' ? 'approved' : 'rejected'

      const client = await fastify.db.connect()
      try {
        await client.query('BEGIN')

        await client.query(
          `UPDATE photos SET status = $1 WHERE id = $2`,
          [newStatus, photoId]
        )

        await client.query(
          `UPDATE moderation_queue SET status = $1, reviewed_by = $2 WHERE photo_id = $3`,
          [body.action === 'approve' ? 'approved' : 'rejected', adminId, photoId]
        )

        if (body.action === 'approve' && rows[0].user_id) {
          await addPoints(client, rows[0].user_id, 20)
          await awardBadgeIfEarned(client, rows[0].user_id, 'fotografo', 100)
        }

        await client.query('COMMIT')
        return reply.send({ ok: true, status: newStatus })
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    }
  )

  // GET /admin/reports — banheiros com needs_review
  fastify.get('/admin/reports', { preHandler: requireAdmin }, async (req, reply) => {
    const { rows } = await fastify.db.query(
      `SELECT
         b.id, b.name, b.address, b.status,
         ST_Y(b.location::geometry) AS lat,
         ST_X(b.location::geometry) AS lng,
         COUNT(r.id)::int AS report_count,
         MAX(r.created_at) AS last_report_at
       FROM bathrooms b
       JOIN reports r ON r.target_id = b.id AND r.type = 'bathroom'
       WHERE b.status = 'needs_review'
       GROUP BY b.id
       ORDER BY report_count DESC, last_report_at DESC
       LIMIT 50`
    )
    return reply.send({ data: rows })
  })

  // PUT /admin/reports/:bathroomId — resolver report
  fastify.put<{ Params: { bathroomId: string } }>(
    '/admin/reports/:bathroomId',
    { preHandler: requireAdmin },
    async (req, reply) => {
      const body = reportActionSchema.parse(req.body)
      const { bathroomId } = req.params

      const { rows } = await fastify.db.query(
        'SELECT id FROM bathrooms WHERE id = $1',
        [bathroomId]
      )
      if (!rows[0]) {
        return reply.code(404).send({ error: 'NOT_FOUND', message: 'Banheiro não encontrado' })
      }

      const client = await fastify.db.connect()
      try {
        await client.query('BEGIN')

        if (body.action === 'close') {
          await client.query(
            `UPDATE bathrooms SET status = 'closed' WHERE id = $1`,
            [bathroomId]
          )

          // Pontua quem reportou (cada reporter que contribuiu para fechar)
          const { rows: reporters } = await client.query(
            `SELECT DISTINCT user_id FROM reports WHERE type = 'bathroom' AND target_id = $1`,
            [bathroomId]
          )
          for (const reporter of reporters) {
            if (reporter.user_id) {
              await addPoints(client, reporter.user_id, 15)
            }
          }
        } else {
          // confirm_active ou clear_reports → volta para active
          await client.query(
            `UPDATE bathrooms SET status = 'active' WHERE id = $1`,
            [bathroomId]
          )
        }

        await client.query(
          `DELETE FROM reports WHERE type = 'bathroom' AND target_id = $1`,
          [bathroomId]
        )

        await client.query('COMMIT')
        return reply.send({ ok: true })
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    }
  )
}
