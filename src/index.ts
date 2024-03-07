import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { config } from './config.js'
import { startMonitoring } from './services/monitor.js'
import { setupNotifications } from './services/notify.js' 
import { acceptInfisicalWebhook } from './route/webhook.js'

const notify = setupNotifications(config)

const app = new Hono()
app.use('*', logger())
app.get('/', c => c.text(new Date().toISOString()))
acceptInfisicalWebhook(app, config, notify)
startMonitoring(config, notify)

serve({
  fetch: app.fetch,
  port: config.PORT,
})
