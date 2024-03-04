import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { infisicalAuth } from './middleware/infisical-auth.js'
import { config } from './config.js'
import Docker from 'dockerode'

const app = new Hono()
app.use('*', logger())
app.get('/', c => c.text(new Date().toISOString()))

if (config.INFISICAL_WEBHOOK_SECRET) {
  app.post('webhook', infisicalAuth(config.INFISICAL_WEBHOOK_SECRET), async c => {
    try {
      const webhook = await c.req.json()
      const system = `${webhook?.project?.secretPath ?? ""}`.replace(/^\/+|\/+$/g, '').toLowerCase()
      const environment = `${webhook?.project?.environment ?? ""}`.toLowerCase()

      console.log(`      🔎   Finding containers for ${system} in ${environment} environment...`)
      const docker = new Docker()
      const filters = {'label': [
        `${config.DOCKER_LABEL_PREFIX}.system=${system}`,
        `${config.DOCKER_LABEL_PREFIX}.environment=${environment}`,
        `${config.DOCKER_LABEL_PREFIX}.restartOnWebhook=true`
      ]}
      const containers = await docker.listContainers({ all: true, filters })
      await containers.forEach(async container => {
        const name = container.Names.map(name => name.replace(/^\/+|\/+$/g, '')).join(', ')
        console.log(`      🐳   Restarting container ${name}`)
        return await docker.getContainer(container.Id).restart()
      })
      console.log(`      🏁   Done`)

      return c.json({ message: 'ok' })
    } catch (e) { 
      console.log(e)
      return c.json({error: e.message}, 500)
    }
  })
}

serve({
  fetch: app.fetch,
  port: config.PORT,
})
