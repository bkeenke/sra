FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --omit=dev

FROM node:22-alpine AS production
WORKDIR /app

RUN apk add --no-cache mimalloc
ENV LD_PRELOAD=/usr/lib/libmimalloc.so

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=256"

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3100

CMD ["node", "dist/main.js"]
