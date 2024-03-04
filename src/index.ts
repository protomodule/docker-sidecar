import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { infisicalAuth } from './middleware/infisical-auth.js'
import { config } from './config.js'

const app = new Hono()
app.use('*', logger())
app.get('/', c => c.text(new Date().toISOString()))

if (config.INFISICAL_WEBHOOK_SECRET) {
  app.post('webhook', infisicalAuth(config.INFISICAL_WEBHOOK_SECRET), async c => {
    try {
      return c.json({ message: 'ok' })
    } catch (e) { 
      console.log(e)
      return c.json({error: e.message}, 500)
    }
  })
}

app.post('/read-body', async (c) => {
  const rawBody = await c.req.text();
  return c.json({ rawText: rawBody });
})

serve({
  fetch: app.fetch,
  port: config.PORT,
})
