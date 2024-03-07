import Docker from 'dockerode'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { infisicalAuth } from './middleware/infisical-auth.js'
import { config } from './config.js'
import { startMonitoring } from './services/monitor.js'

const app = new Hono()
app.use('*', logger())
app.get('/', c => c.text(new Date().toISOString()))

if (config.INFISICAL_WEBHOOK_SECRET) {
  console.log(`🌍   Webhook is now enabled`)
  app.post('webhook', infisicalAuth(config.INFISICAL_WEBHOOK_SECRET), async c => {
    try {
      const webhook = await c.req.json()
      const system = `${webhook?.project?.secretPath ?? ""}`.replace(/^\/+|\/+$/g, '').toLowerCase()
      const environment = `${webhook?.project?.environment ?? ""}`.toLowerCase()
      const docker = new Docker()

      console.log(`      🔎   Finding containers for ${system} in ${environment} environment...`)
      const filters = {'label': [
        `${config.DOCKER_CONTAINER_LABEL_PREFIX}.system=${system}`,
        `${config.DOCKER_CONTAINER_LABEL_PREFIX}.environment=${environment}`,
        `${config.DOCKER_CONTAINER_LABEL_PREFIX}.restartOnWebhook=true`
      ]}
      const containers = await docker.listContainers({ all: true, filters })
      await containers.forEach(async container => {
        const name = container.Names.map(name => name.replace(/^\/+|\/+$/g, '')).join(', ')
        console.log(`      🐳   Restarting container ${name}`)
        return await docker.getContainer(container.Id).restart()
      })
      console.log(`      🏁   Done`)

      try {
        console.log(`      🔎   Finding services for ${system} in ${environment} environment...`)
        const filters = {'label': [
          `${config.DOCKER_SERVICE_LABEL_PREFIX}.system=${system}`,
          `${config.DOCKER_SERVICE_LABEL_PREFIX}.environment=${environment}`,
          `${config.DOCKER_SERVICE_LABEL_PREFIX}.restartOnWebhook=true`
        ]}
        const services = await docker.listServices({ filters })
        await services.forEach(async service => {
          const name = service?.Spec?.Name
          console.log(`      🐳   Restarting service ${name} [${service.ID}]`)

          const svc = await docker.getService(service.ID)
          const inspected = await svc.inspect()
          inspected.Spec.TaskTemplate.ForceUpdate = inspected.Spec.TaskTemplate.ForceUpdate + 1
          await svc.update({...inspected.Spec, version: inspected.Version.Index});
        })
        console.log(`      🏁   Done`)
      }
      catch(e) {
        console.log(`      ⏭️   Node is not running in swarm mode, skipping service restarts.`)
      }

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

startMonitoring(config)
