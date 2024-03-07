import ky from 'ky'
import { Config } from '../config.js'

export enum Type {
  Info = "info",
  Success = "success",
  Warning = "warning",
  Failure = "failure",
}

export const setupNotifications = (config: Config) => async (body: string, type: Type = Type.Info, tags: string[] = [], title?: string) => {
  if (!config.APPRISE_PUSH_URL) {
    console.log(`📭   Skipping notification: URL not configured`)
    return
  }
  try {
    return await ky.post(config.APPRISE_PUSH_URL, {
      headers: (config.APPRISE_PUSH_USER && config.APPRISE_PUSH_PASSWORD) ? { Authorization: `Basic ${btoa(config.APPRISE_PUSH_USER + ':' + config.APPRISE_PUSH_PASSWORD)}` } : {},
      json: { title, body, type, tags: tags.length ? tags : ["debug"] }
    })
  }
  catch(e) {
    console.error(`📭   Failed to send notification: ${e.message}`)
  }
}

export type Notify = ReturnType<typeof setupNotifications>
