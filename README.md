# Serverly OS

**Your community. Your architecture.**

Serverly OS is a visual workspace for planning Discord communities. It uses Discord-only Auth.js sign-in and Neon/PostgreSQL for project persistence.

## Local setup

Requirements: Node.js 20+ and npm.

1. Copy `.env.example` to `.env.local`.
2. In Neon Console, open **Connect**, select your database and role, and copy the PostgreSQL connection string into `DATABASE_URL`.
3. Create an OAuth application in the Discord Developer Portal. Add this redirect URI exactly: `http://localhost:3000/api/auth/callback/discord`. Copy its client ID and secret into `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET`.
4. Generate a local Auth.js secret with `openssl rand -base64 32` and set `AUTH_SECRET`.
5. Install dependencies, apply the checked-in initial migration, and start Next.js:

```bash
npm install
npx drizzle-kit migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route sends signed-out users to Discord sign-in and signed-in users to their projects dashboard.

## Important: use a PostgreSQL connection string

The URL ending in `/rest/v1` is a REST endpoint, not the PostgreSQL connection string Drizzle needs. In Neon Console, use **Connect** to copy a URL shaped like:

```text
postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

Keep real credentials in `.env.local` only. Never commit `.env` or `.env.local`, and do not paste secrets into source files or chat. The repository's `.gitignore` excludes local environment files while retaining `.env.example`.

## Current implementation status

- Discord-only Auth.js sign-in configuration
- Neon/PostgreSQL access through Drizzle ORM
- Initial schema migration for auth, projects, versions, share links, and deployment foundations
- Owner-scoped project read/update/delete API
- Session-aware root route and projects dashboard

The full interactive editor's database autosave, complete version-history interface, share-link management UI, and Discord server import/publishing are still in progress. Do not treat those features as complete until they have been implemented and tested locally.
