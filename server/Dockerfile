FROM node:22-slim AS base
RUN npm i -g pnpm@10

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/core/package.json packages/core/
COPY server/package.json server/

RUN pnpm install --frozen-lockfile --filter @moyun/server...

COPY packages/core/ packages/core/
COPY server/ server/

WORKDIR /app/server
EXPOSE 3001
ENV PORT=3001
CMD ["pnpm", "start"]
