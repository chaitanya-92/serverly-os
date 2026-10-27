# Serverly OS

**Your community. Your architecture.**

Serverly OS is a visual workspace for planning Discord communities. The current build adds Discord-only authentication, a private-by-default project workspace, and a Neon/PostgreSQL persistence foundation.

## Local setup

Requirements: Node.js 20+ and npm.

1. Copy `.env.example` to `.env.local`.
2. In Neon Console, open **Connect**, select your database and role, and copy the PostgreSQL connection string into `DATABASE_URL`.
3. Create an OAuth application in the Discord Developer Portal. Set the local redirect URI to `http://localhost:3000/api/auth/callback/discord`, then copy its client ID and secret into `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET`.
4. Generate a local Auth.js secret and set `AUTH_SECRET`.
5. Install dependencies, generate the migration, apply it, and start Next.js:

```bash
npm install
npx drizzle-kit generate
npx drizzle-kit migrate
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) to sign in, then open the projects dashboard.

## Important: use a PostgreSQL connection string

The URL ending in `/rest/v1` is a REST endpoint, not the standard Neon PostgreSQL connection string Drizzle needs. In Neon Console, use **Connect** to copy a URL shaped like:

```text
postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

Keep that URL in `.env.local` only. Do not commit it or paste the password into source files.

## Current local implementation scope

- Discord-only Auth.js sign-in
- Neon/PostgreSQL access through Drizzle ORM
- Owner-scoped project records with a JSONB blueprint document
- Version-history, read-only share-link, and deployment-operation schema foundations
- Authenticated projects dashboard and starter blueprint creation

The existing Studio is still being migrated from local-only draft storage to project-backed persistence. Discord server import/publishing and share-link UI are not yet wired up.
