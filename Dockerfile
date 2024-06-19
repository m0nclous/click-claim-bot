# syntax=docker/dockerfile:experimental

FROM node:21.0.0-alpine as base
ENV PORT=80
ENV HOST=0.0.0.0
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
EXPOSE 80

# All deps stage
FROM base as deps
ADD package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Production only deps stage
FROM base as production-deps
ADD package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build stage
FROM base as build
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN node ace build
COPY .env /app/build

# Development stage
FROM base as development
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
CMD ["node", "ace", "serve", "--watch"]

# Production stage
FROM base as production
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
CMD ["node", "./bin/server.js"]

# Production scheduler stage
FROM production as production-scheduler
CMD ["node", "ace", "scheduler:run"]
