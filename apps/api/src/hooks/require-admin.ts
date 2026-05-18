import type { FastifyRequest, FastifyReply } from 'fastify'
import { requireAuth } from './require-auth.js'

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await requireAuth(req, reply)
  if (reply.sent) return
  if (req.user?.role !== 'admin') {
    return reply.code(403).send({ error: 'FORBIDDEN', message: 'Acesso restrito' })
  }
}
