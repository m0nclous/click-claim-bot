# syntax=docker/dockerfile:experimental

FROM node:20.10.0-alpine as base
RUN apk add --no-cache python3 make g++
WORKDIR /app

# All deps stage
FROM base as deps
ADD package.json package-lock.json ./
RUN npm ci

# Production only deps stage
FROM base as production-deps
ADD package.json package-lock.json ./
RUN npm ci --omit=dev

# Build stage
FROM base as build
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN node ace build --ignore-ts-errors
COPY .env /app/build
COPY .docker/elasticsearch/cert/http_ca.crt /app/build

# Development stage
FROM base as development
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
CMD ["node", "ace", "--inspect=0.0.0.0", "serve", "--watch"]

# Production stage
FROM base as production
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
CMD ["node", "./bin/server.js"]

# Production scheduler stage
FROM production as production-scheduler
CMD ["node", "ace", "scheduler:run"]
