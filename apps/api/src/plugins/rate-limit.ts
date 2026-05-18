import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'

export default fp(async (fastify) => {
  await fastify.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas requisições. Tente novamente em 1 minuto.',
    }),
  })
})

// Config de rate limit estrito para rotas de escrita
export const writeRateLimit = {
  config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
}
