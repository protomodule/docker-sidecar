import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { infisicalAuth } from './middleware/infisical-auth.js'

const app = new Hono()
app.use('*', logger())
app.get('/', c => c.text(new Date().toISOString()))

app.post('webhook', infisicalAuth(process.env.INFISICAL_WEBHOOK_SECRET), async c => {
  try {
    return c.json({ message: 'ok' })
  } catch (e) { 
    console.log(e)
    return c.json({error: e.message}, 500)
  }
})

app.post('/read-body', async (c) => {
  const rawBody = await c.req.text(); // the same happens with c.req.raw.text()
  return c.json({ rawText: rawBody });
})

serve({
  fetch: app.fetch,
  port: parseInt(process.env.PORT || "3000"),
})
