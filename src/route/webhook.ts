import Docker from 'dockerode'
import { Hono } from 'hono'
import { Notify, Type } from '../services/notify.js'
import { infisicalAuth } from '../middleware/infisical-auth.js'

export const acceptInfisicalWebhook = async (app: Hono, config: any, notify: Notify) => {
  if (config.INFISICAL_WEBHOOK_SECRET) {
    console.log(`🌍   Webhook is now enabled`)
    app.post('webhook', infisicalAuth(config.INFISICAL_WEBHOOK_SECRET), async c => {
      try {
        const webhook = await c.req.json()
        const system = `${webhook?.project?.secretPath ?? ""}`.replace(/^\/+|\/+$/g, '').toLowerCase()
        const environment = `${webhook?.project?.environment ?? ""}`.toLowerCase()
        var updatedServices = []
        
        if (webhook?.event === "test") {
          console.log(`      🧪   Received test webhook for ${system} in ${environment} environment`)
          notify(`🧪   Test webhook received for *${system}* in *${environment}* environment`, Type.Info)
          return c.json({ message: 'ok' }) 
        }

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
          console.log(`          --> Restarting container ${name}`)
          return await docker.getContainer(container.Id).restart()
        })
  
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
            console.log(`           --> Restarting service ${name} [${service.ID}]`)
            updatedServices.push(service)
  
            const svc = await docker.getService(service.ID)
            const inspected = await svc.inspect()
            inspected.Spec.TaskTemplate.ForceUpdate = inspected.Spec.TaskTemplate.ForceUpdate + 1
            return await svc.update({...inspected.Spec, version: inspected.Version.Index});
          })
        }
        catch(e) {
          console.log(`      ⏭️   Node is not running in swarm mode, skipping service restarts.`)
        }
  
        const updateMessage = updatedServices.length ? `\n\nRestarting:\n${updatedServices.map(service => ` • ${service.Spec.Name.split('_').join(': ')}`)}` : ''
        notify(`🔒   Detected environment variable modification for *${system}* in *${environment}* environment${updateMessage}`, Type.Info)
        return c.json({ message: 'ok' })
      } catch (e) { 
        console.log(e)
        return c.json({error: e.message}, 500)
      }
    })
  }
}