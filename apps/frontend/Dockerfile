FROM node:20-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY shared/package.json ./shared/
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile

COPY shared ./shared
COPY apps/frontend ./apps/frontend

ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

RUN pnpm --filter shared build || true
RUN pnpm --filter frontend build

# Etap Runnera dla mniejszego obrazu
FROM node:20-slim AS runner
WORKDIR /app
RUN corepack enable

COPY --from=builder /app/apps/frontend/build ./build
COPY --from=builder /app/apps/frontend/package.json .
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5173
ENV NODE_ENV=production
# SvelteKit adapter-node domyślnie startuje na porcie 3000, 
# zmieniamy na 5173 jeśli chcesz zachować spójność z dev
ENV PORT=5173
CMD ["node", "build"]