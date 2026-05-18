import fp from 'fastify-plugin'
import { Pool } from 'pg'
import { config } from '../config.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool
  }
}

export default fp(async (fastify) => {
  const pool = new Pool({ connectionString: config.DATABASE_URL })

  await pool.query('SELECT 1')
  fastify.log.info('Database connected')

  fastify.decorate('db', pool)
  fastify.addHook('onClose', async () => { await pool.end() })
})
