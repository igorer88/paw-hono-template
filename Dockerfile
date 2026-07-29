FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM jacoblincool/workerd AS runtime

COPY --from=builder /app/dist /worker/dist
COPY worker.capnp /worker/

WORKDIR /worker
EXPOSE 8080
CMD ["serve", "/worker/worker.capnp"]
