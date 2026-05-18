import fp from 'fastify-plugin'
import fastifyCors from '@fastify/cors'
import { config } from '../config.js'

export default fp(async (fastify) => {
  await fastify.register(fastifyCors, {
    origin: config.NODE_ENV === 'development'
      ? ['http://localhost:3000']
      : config.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
})
