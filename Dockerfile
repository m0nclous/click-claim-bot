# syntax=docker/dockerfile:experimental

FROM node:20.10.0-alpine as base
ENV PORT=80
ENV HOST=0.0.0.0
WORKDIR /app
EXPOSE 80

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

# Development stage
FROM base as development
ENV NODE_ENV=development
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
CMD ["node", "ace", "serve", "--watch"]

# Production stage
FROM base as production
ENV NODE_ENV=production
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
CMD ["node", "./bin/server.js"]

# Production scheduler stage
FROM production as production-scheduler
ENV NODE_ENV=production
CMD ["node", "ace", "scheduler:run"]
