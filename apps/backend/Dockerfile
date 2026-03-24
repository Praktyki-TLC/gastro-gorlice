FROM mcr.microsoft.com/playwright:v1.58.2-jammy

RUN npm install -g pnpm@10.32.1
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY shared/package.json ./shared/
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile

COPY shared ./shared
COPY apps/backend ./apps/backend

RUN pnpm --filter shared build || true

COPY apps/backend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

WORKDIR /app/apps/backend

EXPOSE 4202

ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["pnpm", "start"]