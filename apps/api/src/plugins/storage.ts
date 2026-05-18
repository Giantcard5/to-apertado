import fp from 'fastify-plugin'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { config } from '../config.js'
import type { FastifyInstance } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    r2: S3Client
    generatePresignedUrl: (key: string, contentType: string, expiresIn?: number) => Promise<string>
    objectExists: (key: string) => Promise<boolean>
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     config.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: config.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
  })

  fastify.decorate('r2', client)

  fastify.decorate('generatePresignedUrl', async (key: string, contentType: string, expiresIn = 300) => {
    const command = new PutObjectCommand({
      Bucket:      config.CLOUDFLARE_R2_BUCKET,
      Key:         key,
      ContentType: contentType,
    })
    return getSignedUrl(client, command, { expiresIn })
  })

  fastify.decorate('objectExists', async (key: string) => {
    try {
      await client.send(new HeadObjectCommand({ Bucket: config.CLOUDFLARE_R2_BUCKET, Key: key }))
      return true
    } catch {
      return false
    }
  })
})
