import type { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export type JwtPayload = {
  userId: string
  name: string | null
  avatar: string | null
  role: 'user' | 'admin'
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload
  }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies?.token
  if (!token) {
    return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Login necessário' })
  }
  try {
    req.user = jwt.verify(token, config.JWT_SECRET) as JwtPayload
  } catch {
    return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Sessão expirada' })
  }
}
