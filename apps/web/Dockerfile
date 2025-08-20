# Multi-stage build for Next.js (apps/web)
FROM node:20-bullseye AS deps
WORKDIR /app

# Leverage npm workspaces at the repo root
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install all workspace deps reproducibly
RUN npm ci --no-audit --no-fund

FROM node:20-bullseye AS builder
WORKDIR /app

COPY --from=deps /app /app
# Copy the full repo for build (monorepo)
COPY . .

# Ensure public dir exists even if empty (COPY in runtime expects it)
RUN mkdir -p apps/web/public

# Build Next.js app (uses standalone output)
RUN npm --workspace apps/web run build

FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Non-root user for security
RUN useradd -m nextjs

# Copy standalone server and static assets
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Default port (can be overridden by PORT env)
ENV PORT=3022
EXPOSE 3022

USER nextjs

# Start the standalone server
CMD ["node", "apps/web/server.js"]


