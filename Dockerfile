# Builder container
FROM node:12-alpine as builder

ENV NODE_ENV=production

RUN apk --no-cache add python make g++

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile --non-interactive

# Service container
FROM node:12-alpine

WORKDIR /usr/src/app
COPY --from=builder node_modules node_modules

COPY build/ .
COPY docker-entrypoint.sh ./

ENTRYPOINT ["./docker-entrypoint.sh"]
