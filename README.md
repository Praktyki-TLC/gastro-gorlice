# gastro-gorlice

Monorepo projektu gastro-gorlice.pl

## Użyte technologie:

### Backend

- [Hono](https://hono.dev/)
- [drizzle](https://orm.drizzle.team/)
- [SvelteKit](https://svelte.dev/)
- [tailwindcss](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)

## Uruchamianie

### Produkcja

Projekt został przygotowany do uruchomienia w [Dockerze](https://www.docker.com/). Został przetestowany też używając [Dokploy](https://dokploy.com/).

```bash
$ git clone https://github.com/Praktyki-TLC/gastro-gorlice
$ cd gastro-gorlice

$ cp .env.example .env
# Uzupełnić .env danymi (GEMINI_API_KEY, FACEBOOK_COOKIES, ADMIN_USER, ADMIN_PASSWORD, NODE_ENV=production)

$ docker compose up 
```

### Development

Do działania projektu potrzebna jest [pnpm](https://pnpm.io/installation) i baza [PostgreSQL](https://orm.drizzle.team/docs/guides/postgresql-local-setup)!

```bash
$ git clone https://github.com/Praktyki-TLC/gastro-gorlice
$ cd gastro-gorlice

$ cp .env.example .env
# Uzupełnić .env danymi

$ pnpm install
$ pnpm db:push
$ pnpm db:seed
$ pnpm dev
```

