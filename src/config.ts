import { fromEnv, num, str } from '@protomodule/probe'

export const config = fromEnv({
  PORT: num({ default: 3000 }),
  NODE_ENV: str({ default: "development" }),
  LOG_LEVEL: str({ default: "debug" }),
  WARUMUP_MS: num({ default: 3000 }),
  INFISICAL_WEBHOOK_SECRET: str({ default: undefined }),
  APPRISE_PUSH_URL: str({ default: undefined }),
  APPRISE_PUSH_USER: str({ default: undefined }),
  APPRISE_PUSH_PASSWORD: str({ default: undefined }),
  APPRISE_PUSH_TAGS: str({ default: "" }),
  DOCKER_CONTAINER_LABEL_PREFIX: str({ default: "io.protomodule.container" }),
  DOCKER_SERVICE_LABEL_PREFIX: str({ default: "io.protomodule.service" }),
})

export type Config = typeof config
