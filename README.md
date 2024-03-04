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
