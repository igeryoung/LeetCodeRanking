# Stateful LeetCode Ranking

Monorepo for a React client and an Express/Postgres API.

## Local Development

Install dependencies at the repo root, then run the client and server in separate terminals:

```bash
npm install
npm run dev:server
npm run dev:client
```

The server reads local config from `server/.env`.

## Database Commands

These commands are intentionally manual. They should not run during app startup.

```bash
npm run db:migrate
npm run db:seed
```

`db:seed` is idempotent and skips importing problems when the `problems` table already contains data.

## Railway

The Railway web service should only build and start the app:

- Build: `npm run build`
- Start: `npm run start`

Recommended app service variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
CLIENT_URL=https://your-app.up.railway.app
SERVER_URL=https://your-app.up.railway.app
NODE_ENV=production
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Do not set `PORT` manually on Railway.

Run migrations and seeding separately when needed, either from a Railway shell session or another controlled release step.
