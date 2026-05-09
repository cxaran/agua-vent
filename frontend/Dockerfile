ARG NODE_VERSION=22.14.0-slim

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM deps AS dev
COPY . .
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["pnpm", "dev"]

FROM deps AS builder
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:${NODE_VERSION} AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=node:node /app/public ./public
RUN mkdir .next && chown node:node .next
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
