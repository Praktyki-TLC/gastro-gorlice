FROM mcr.microsoft.com/playwright:v1.58.2-jammy

RUN npm install -g pnpm@10.32.1
WORKDIR /app

# Kopiujemy pliki definicji pakietów
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY shared/package.json ./shared/
COPY apps/backend/package.json ./apps/backend/

# Instalujemy zależności
RUN pnpm install --frozen-lockfile
# Dodaj to:
# RUN pnpm exec playwright install chromium --with-deps

# Kopiujemy resztę kodu
COPY shared ./shared
COPY apps/backend ./apps/backend

# Budujemy tylko shared (jeśli jest potrzebne jako biblioteka)
RUN pnpm --filter shared build || true

# W backendzie NIE robimy build (tsc), bo użyjemy tsx
WORKDIR /app/apps/backend

COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Port na którym działa backend
EXPOSE 4202

ENTRYPOINT ["/app/docker-entrypoint.sh"]
# Startujemy za pomocą tsx
CMD ["pnpm", "start"]