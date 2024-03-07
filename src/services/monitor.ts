import monitor from 'node-docker-monitor'
import { delay } from '../utils/delay.js'
import { Config } from '../config.js'
import { Notify, Type } from './notify.js'

export const startMonitoring = async (config: Config, notify: Notify) => {
  var enabled = false
  return monitor({
    onMonitorStarted: async (monitor, docker) => {
      console.log(`🚀   Monitoring starting in ${config.WARUMUP_MS}ms ...`)
      await delay(config.WARUMUP_MS)
      console.log(`🚦   Reporting now enabled`)
      enabled = true
    },
    onMonitorStopped: (monitor?, docker?) => { 
      console.log(`🛑   Monitoring stopped`)
    },
    onContainerUp: (info, docker) => {
      const shouldNotify = (info?.Labels ?? {})[`${config.DOCKER_CONTAINER_LABEL_PREFIX}.notifyOnLifecycleEvent`] === "true";
      if (enabled && shouldNotify) {
        console.log(`⏯️    Up ${info.Name}`)
        console.log(`     Image: ${info.Image}`)

        const [application, container] = info?.Name.split('_') ?? []
        const containerInfos = container?.split('.') ?? []
        notify(`🚦    _${application}_: System *${containerInfos[0]}* started\n\`Replica: ${containerInfos[1]}, ID: ${containerInfos[2]}\``, Type.Success)
      }
    },
    onContainerDown: (info, docker) => {
      const shouldNotify = (info?.Labels ?? {})[`${config.DOCKER_CONTAINER_LABEL_PREFIX}.notifyOnLifecycleEvent`] === "true";
      if (enabled && shouldNotify) {
        console.log(`⏹️    Stopped ${info.Name}`)
        console.log(`     Image: ${info.Image}`)
        console.log(`     Status: ${info.Status}`)

        const [application, container] = info?.Name.split('_') ?? []
        const containerInfos = container?.split('.') ?? []
        notify(`🛑    _${application}_: System *${containerInfos[0]}* stopped\n\`Replica: ${containerInfos[1]}, ID: ${containerInfos[2]}\`\n${info.Status}`, Type.Failure)
      }
    },
  })
}