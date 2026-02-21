FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app

ARG REMNAWAVE_VERSION
RUN test -n "$REMNAWAVE_VERSION" || (echo "REMNAWAVE_VERSION is required" && exit 1)

COPY package*.json ./

RUN npm ci && npm install @remnawave/backend-contract@${REMNAWAVE_VERSION}

COPY . .

RUN npm run build

RUN npm prune --omit=dev

FROM node:22-alpine AS production
WORKDIR /app

RUN apk add --no-cache mimalloc
ENV LD_PRELOAD=/usr/lib/libmimalloc.so

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=128"

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3100

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3100/health || exit 1

CMD ["node", "dist/main.js"]
