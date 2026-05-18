import 'dotenv/config'
import Fastify from 'fastify'
import { config } from './config.js'

import dbPlugin        from './plugins/db.js'
import corsPlugin      from './plugins/cors.js'
import rateLimitPlugin from './plugins/rate-limit.js'
import storagePlugin   from './plugins/storage.js'
import authPlugin      from './plugins/auth.js'
import errorHandler    from './plugins/error-handler.js'

import bathroomsRoute from './routes/bathrooms.js'
import ratingsRoute   from './routes/ratings.js'
import photosRoute    from './routes/photos.js'
import usersRoute     from './routes/users.js'
import rankingRoute   from './routes/ranking.js'
import adminRoute     from './routes/admin.js'

const loggerConfig = {
  development: {
    level: 'debug',
    transport: { target: 'pino-pretty', options: { colorize: true } },
  },
  production: { level: 'warn' },
  test: false as const,
}

const fastify = Fastify({
  logger: loggerConfig[config.NODE_ENV],
})

async function bootstrap() {
  // Plugins — ordem obrigatória: db → cors → rate-limit → storage → auth → error-handler
  await fastify.register(dbPlugin)
  await fastify.register(corsPlugin)
  await fastify.register(rateLimitPlugin)
  await fastify.register(storagePlugin)
  await fastify.register(authPlugin)
  await fastify.register(errorHandler)

  // Rotas
  await fastify.register(bathroomsRoute)
  await fastify.register(ratingsRoute)
  await fastify.register(photosRoute)
  await fastify.register(usersRoute)
  await fastify.register(rankingRoute)
  await fastify.register(adminRoute)

  await fastify.listen({ port: config.PORT, host: '0.0.0.0' })
}

bootstrap().catch(err => {
  fastify.log.error(err)
  process.exit(1)
})
