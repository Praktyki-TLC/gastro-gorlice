#!/bin/bash
set -e

echo "Czekam na bazę danych..."
# Możesz zainstalować netcat (nc) lub użyć pętli pg_isready jeśli masz klienta pg
until node -e "const net = require('net'); const client = net.connect({port: 5432, host: 'db'}, () => process.exit(0)); setTimeout(() => process.exit(1), 1000)" ; do
  echo "Baza danych niedostępna - czekam..."
  sleep 2
done

echo "Baza gotowa. Uruchamiam migracje i seed..."
pnpm db:push
pnpm db:seed

echo "Startowanie serwera..."
pnpm start