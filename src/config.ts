import { fromEnv, num, str } from '@protomodule/probe'

export const config = fromEnv({
  PORT: num({ default: 3000 }),
  NODE_ENV: str({ default: "development" }),
  LOG_LEVEL: str({ default: "debug" }),
  INFISICAL_WEBHOOK_SECRET: str({ default: undefined }),
  DOCKER_CONTAINER_LABEL_PREFIX: str({ default: "io.protomodule.container" }),
  DOCKER_SERVICE_LABEL_PREFIX: str({ default: "io.protomodule.service" })
})
