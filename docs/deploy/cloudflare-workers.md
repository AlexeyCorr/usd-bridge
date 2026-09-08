# Деплой в Cloudflare Workers

Приложение собирается Vite и публикуется как Cloudflare Worker со статическими
assets. Маршрут `alexeycorr.dev/usd-bridge*` настроен в `wrangler.toml`.

## GitHub

Добавьте в настройках репозитория (`Settings` → `Secrets and variables` →
`Actions`) два repository secret:

- `CLOUDFLARE_API_TOKEN` — API-токен Cloudflare с правами на редактирование
  Workers Scripts и Workers Routes для зоны `alexeycorr.dev`;
- `CLOUDFLARE_ACCOUNT_ID` — идентификатор аккаунта Cloudflare.

Workflow `.github/workflows/ci.yml` запускает проверки для pull request и push в
`master`. После успешных проверок push в `master` автоматически публикуется в
Cloudflare Workers.

## Ручной деплой

После авторизации Wrangler:

```bash
nvm use
pnpm install --frozen-lockfile
pnpm deploy
```

Проверить результат: <https://alexeycorr.dev/usd-bridge/>.
