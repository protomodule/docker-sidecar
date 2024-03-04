import crypto from 'crypto'
import { createMiddleware } from 'hono/factory'

export const infisicalAuth = (webhookSecret: string) => {
  return createMiddleware(async (c, next) => {
    const signature = `${await c.req.header('x-infisical-signature')}`.split(';').pop()
    const hash = crypto
      .createHmac('sha256', webhookSecret)
      .update(await c.req.raw.text())
      .digest('hex')

    if (hash !== signature)
      return c.json({ error: 'Invalid signature' }, 403)

    await next()
  })
}
