FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json apps/web/
RUN npm ci --ignore-scripts --legacy-peer-deps

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm --workspace apps/web run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./.next
COPY apps/web/package*.json ./
COPY apps/web/next.config.mjs ./next.config.mjs
COPY public ./public
RUN npm ci --omit=dev --ignore-scripts --legacy-peer-deps
EXPOSE 3022
ENV PORT=3022
CMD ["npx","next","start","-p","3022"]


