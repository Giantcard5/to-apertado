import fp from 'fastify-plugin'
import { ZodError } from 'zod'

export default fp(async (fastify) => {
  fastify.setErrorHandler((error, req, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      })
    }

    if (error.statusCode) {
      return reply.code(error.statusCode).send({
        error: (error as NodeJS.ErrnoException & { code?: string }).code ?? 'ERROR',
        message: error.message,
      })
    }

    fastify.log.error(error)
    return reply.code(500).send({ error: 'INTERNAL_ERROR', message: 'Algo deu errado' })
  })
})
