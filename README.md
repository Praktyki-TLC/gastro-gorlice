# gastro-gorlice

Monorepo projektu gastro-gorlice.pl

## Informacje

- Projekt składa się z dwóch aplikacji (`/apps/backend`, `/apps/frontend`) oraz modułu współdzielonego (/shared). Monorepo używa `pnpm workspace`. Do jego działania muszą być uruchomione obydzie naraz! W przeciwnym wypadku przy każdym requeście frontend wyrzuci error `HTTP 500 Internal server error`.

- Codziennie kilka razy (10-12:00,10,30) odpala się scraper Facebooka, który pobiera posty z profili konkretnych restauracji, a następnie posty są analizowane przez AI i zapisywane jako dania dnia do bazy danych.

- Przy pierwszym uruchomieniu należy odpalić skrypt `pnpm db:push`, który wprowadzi strukturę bazy danych oraz skrypt `pnpm db:seed`, który umieści przykładowe restauracje. 

- Na frontendzie znajduje się prosty admin panel (`GET /admin`), do którego logujemy się danymi z pliku `.env` (`ADMIN_USER`, `ADMIN_PASSWORD`). Można w nim wymusić sync (odpalenie scrapera), zarządzać restauracjami i wyświetlać logi scrapera.

- Na stronie głównej (`GET /`) znajduje się lista restauracji z dzisiejszym daniem dnia (jeżeli już zostało pobrane).

- Po kliknięciu w kafelek restauracji, użytkownik zostaje przeniesiony na podstronę restauracji (`GET /restaurant/[slug]`), gdzie znajdują się informacje o restauracji, archiwalne dania dnia i wykres historii cen.

- Wszystkie formularze (logowanie i na admin panelu) obsługiwane są za pomocą [Form Actions](https://svelte.dev/docs/kit/form-actions), przez co nie ma potrzeby wystawiania backendu na zewnątrz, co zostało zrobione w przykładowej konfiguracji `docker-compose.yml`

- Dokumentacji backendu nie ma, ale można łatwo wywnioskować wszystko z plików [mainRouter.ts](https://github.com/Praktyki-TLC/gastro-gorlice/blob/main/apps/backend/src/routers/mainRouter.ts) i [adminRouter.ts](https://github.com/Praktyki-TLC/gastro-gorlice/blob/main/apps/backend/src/routers/adminRouter.ts)

## Użyte technologie:

### Backend

- [Hono](https://hono.dev/)
- [drizzle](https://orm.drizzle.team/)
- [Playwright](https://playwright.dev/)
- [Google Generative AI](https://www.npmjs.com/package/@google/generative-ai) 

### Frontend

- [SvelteKit](https://svelte.dev/)
- [tailwindcss](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)

## Uruchamianie

### Produkcja

Projekt został przygotowany do uruchomienia w [Dockerze](https://www.docker.com/). Został przetestowany używając [Dokploy](https://dokploy.com/).

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

