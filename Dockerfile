# ---- 1. build stage ----
FROM node:20 as builder
LABEL maintainer="Lukas Korl <hello@lukaskorl.com>"

WORKDIR /usr/src/app
COPY package.json \
     tsconfig.json \
     yarn.lock \
     ./
RUN yarn install --frozen-lockfile

COPY ./src ./src
RUN yarn build && \
    rm -rf node_modules && \
    yarn install --production

# ---- 2. release stage ----
FROM node:20-slim
LABEL maintainer="Lukas Korl <hello@lukaskorl.com>"

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder \
  /usr/src/app/package.json \
  ./

CMD [ "yarn", "start" ]
