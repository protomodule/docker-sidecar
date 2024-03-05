# Protomodule-compatible Docker Sidecar

[![🐳 Docker build](https://github.com/protomodule/docker-sidecar/actions/workflows/dockerhub.yml/badge.svg)](https://github.com/protomodule/docker-sidecar/actions)

Combines a few sidecar functionalities into a single configureable container:

 * 🚧 **In development**: Webhook for managing Infisical changes
 * 🔮 **Future development**: Send notifications on configuration changes to Apprise
 * 🔮 **Future development**: Send notifications on container lifecycle events
 * 🔮 **Future development**: Expose metrics endpoint for monitoring

## 🧑‍💻 Development

### Build

```bash
docker build -t protomodule/docker-sidecar .
```

## 🛠️ Configuration

### Docker Tags

You can add tags to your Swarm deployment to control how sidecar handles incoming webhooks and notifications for container restarts:

```
version: "3.8"
services:
  hello:
    image: ...
    labels:
      - "io.protomodule.container.notifyOnLifecycleEvent=true"
    deploy:
      labels:
        - "io.protomodule.service.system=api"
        - "io.protomodule.service.environment=development"
        - "io.protomodule.service.restartOnWebhook=true"
```

Available labels under `deploy.labels` are:

 * (required) `io.protomodule.service.system` ... String corresponding to the Infisical folder (without leading or trailing `/`)
 * (required) `io.protomodule.service.environment` ... String corresponding to the Infisical environment slug
 * `io.protomodule.service.restartOnWebhook` ... `true`/`false`

Available labels under `labels` are:

 * `io.protomodule.container.notifyOnLifecycleEvent` ... `true`/`false` (default = `true`)
