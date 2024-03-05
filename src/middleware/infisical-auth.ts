import crypto from 'crypto'
import { createMiddleware } from 'hono/factory'

export const infisicalAuth = (webhookSecret: string) => {
  return createMiddleware(async (c, next) => {
    const signature = `${await c.req.header('x-infisical-signature')}`.split(';').pop()
    const hash = crypto
      .createHmac('sha256', webhookSecret)
      .update(await c.req.raw.clone().text())
      .digest('hex')

    if (hash !== signature)
      console.log(`      ❌   Invalid signature detected, aborting.`)

      try {
        const body = await c.req.raw.clone().json()
        console.log(`           Event: ${body?.event ?? "- unknown -"}`)
        console.log(`           Workspace ID: ${body?.project?.workspaceId ?? "- unknown -"}`)
        console.log(`           Environment: ${body?.project?.environment ?? "- unknown -"}`)
        console.log(`           Secret Path: ${body?.project?.secretPath ?? "- unknown -"}`)
      }
      catch(e) { /** Noop - can't read body as JSON */}

      return c.json({ error: 'Invalid signature' }, 403)

    await next()
  })
}
