# 1. Build stage
FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY packages/engine/package*.json ./packages/engine/
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/

# Install dependencies for the monorepo
RUN npm install

# Copy source code and config
COPY tsconfig.base.json ./
COPY packages/engine ./packages/engine
COPY apps/api ./apps/api

# Build engine package first
RUN npm run build --workspace=packages/engine

# Generate Prisma Client and build API
RUN cd apps/api && npx prisma generate && npm run build

# 2. Production runner stage
FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production

# Copy built application from builder
COPY --from=builder /app ./

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push --schema=prisma/schema.prisma && npx tsx src/server.ts"]
