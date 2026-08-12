FROM node:24-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS builder

WORKDIR /app

RUN corepack enable && chown -R node:node /app

USER node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

RUN pnpm build && \
  mkdir -p /app/workerd-bin && \
  cp "$(find node_modules/.pnpm -maxdepth 5 -type f -path '*/node_modules/workerd/bin/workerd' | head -1)" /app/workerd-bin/workerd

FROM node:24-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS runtime

WORKDIR /worker

COPY --from=builder --chown=node:node /app/dist /worker/dist
COPY --chown=node:node worker.capnp /worker/
COPY --from=builder --chown=node:node /app/workerd-bin/workerd /usr/local/bin/workerd

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["workerd", "serve", "/worker/worker.capnp"]
