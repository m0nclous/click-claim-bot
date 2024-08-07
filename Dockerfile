FROM node:20.10.0-alpine AS base
WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80

# All deps stage
FROM base AS deps
ADD package.json package-lock.json ./
RUN npm ci

# Production only deps stage
FROM base AS production-deps
ADD package.json package-lock.json ./
RUN npm ci --omit=dev

# Build stage
FROM base AS build
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN node ace build

# Production stage
FROM base
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
CMD ["node", "./bin/server.js"]
