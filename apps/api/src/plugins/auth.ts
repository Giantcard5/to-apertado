import fp from 'fastify-plugin'
import fastifyCookie from '@fastify/cookie'
import jwt from 'jsonwebtoken'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { config } from '../config.js'
import type { FastifyInstance } from 'fastify'

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(fastifyCookie)

  fastify.get('/auth/google', async (req, reply) => {
    const returnTo = (req.query as { returnTo?: string }).returnTo
    if (returnTo) {
      reply.setCookie('returnTo', returnTo, {
        httpOnly: false,
        maxAge: 300,
        path: '/',
      })
    }

    const params = new URLSearchParams({
      client_id: config.GOOGLE_CLIENT_ID,
      redirect_uri: config.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'openid email profile',
    })

    return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
  })

  fastify.get('/auth/google/callback', async (req, reply) => {
    const { code } = req.query as { code?: string }
    if (!code) {
      return reply.code(400).send({ error: 'BAD_REQUEST', message: 'Código OAuth ausente' })
    }

    // Troca o code pelo token do Google
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri:  config.GOOGLE_CALLBACK_URL,
        grant_type:    'authorization_code',
      }),
    })

    const tokens = await tokenRes.json() as { id_token?: string; error?: string }
    if (tokens.error || !tokens.id_token) {
      fastify.log.error({ tokens }, 'Google OAuth token exchange failed')
      return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Falha na autenticação Google' })
    }

    // Decodifica o id_token para obter dados do usuário
    const payload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString()
    ) as { sub: string; name?: string; picture?: string }

    // UPSERT do usuário no banco
    const { rows } = await fastify.db.query<{ id: string; name: string | null; avatar_url: string | null; points: number; role: string }>(
      `INSERT INTO users (provider, provider_id, name, avatar_url)
       VALUES ('google', $1, $2, $3)
       ON CONFLICT (provider, provider_id)
       DO UPDATE SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url
       RETURNING id, name, avatar_url, points, role`,
      [payload.sub, payload.name ?? null, payload.picture ?? null]
    )

    const user = rows[0]

    const token = jwt.sign(
      { userId: user.id, name: user.name, avatar: user.avatar_url, role: user.role },
      config.JWT_SECRET,
      { expiresIn: '30d' }
    )

    const returnTo = req.cookies?.returnTo ?? '/perfil'
    reply.clearCookie('returnTo')
    reply.setCookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: config.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return reply.redirect(`${config.CORS_ORIGIN}${returnTo}`)
  })

  fastify.get('/auth/logout', async (req, reply) => {
    reply.clearCookie('token', { path: '/' })
    return reply.send({ ok: true })
  })

  fastify.get('/auth/me', async (req, reply) => {
    const token = req.cookies?.token
    if (!token) return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Não autenticado' })

    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as { userId: string }
      const { rows } = await fastify.db.query(
        `SELECT u.id, u.name, u.avatar_url, u.points, u.role,
                COALESCE(
                  json_agg(json_build_object(
                    'slug', b.slug, 'name', b.name, 'description', b.description, 'awarded_at', ub.awarded_at
                  )) FILTER (WHERE b.id IS NOT NULL),
                  '[]'
                ) AS badges
         FROM users u
         LEFT JOIN user_badges ub ON ub.user_id = u.id
         LEFT JOIN badges b ON b.id = ub.badge_id
         WHERE u.id = $1
         GROUP BY u.id`,
        [payload.userId]
      )
      if (!rows[0]) return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Usuário não encontrado' })
      return reply.send(rows[0])
    } catch {
      return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Sessão expirada' })
    }
  })
})
