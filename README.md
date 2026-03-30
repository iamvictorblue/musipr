# MúsiPR MVP Monorepo

Production-minded MVP scaffold for a Puerto Rico-focused streaming platform.

## Stack
- Web: React + Vite + TypeScript + Tailwind
- API: Node.js + Express + TypeScript + Prisma
- DB: PostgreSQL
- Auth: JWT + refresh token
- Storage: DigitalOcean Spaces (S3-compatible)
- Audio processing: FFmpeg worker scaffolding
- Payments: Stripe scaffolding

## Monorepo layout
- `apps/web`: consumer-facing and artist/admin UI
- `apps/api`: REST API, Prisma schema, jobs
- `packages/types`: shared platform types/enums
- `packages/config`: shared env parsing helpers

## Quick start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env files:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```
3. Start PostgreSQL:
   ```bash
   npm run db:up
   ```
   The default API `DATABASE_URL` already points to the compose database:
   ```bash
   postgresql://postgres:postgres@localhost:5432/musipr
   ```
4. Generate prisma client + migrate + seed:
   ```bash
   npm run prisma:generate -w apps/api
   npm run prisma:migrate -w apps/api
   npm run seed
   ```
5. Run apps:
   ```bash
   npm run dev -w apps/api
   npm run dev -w apps/web
   ```

## MVP implemented
- JWT + refresh auth scaffold with role guards
- Artist verification submission and admin review queue
- Track upload flow with S3/Spaces presign endpoint
- Track metadata + legal ownership confirmation support
- Moderation/infringement report model and endpoints
- Scheduled release publish job scaffold
- Discovery, playlists, shows, releases, merch, admin pages
- Sticky global audio player UI scaffold

## Legal placeholders included
- Ownership confirmation during artist verification and upload
- Terms acceptance on artist signup path
- Infringement reporting routes and moderation entities
- Repeat infringer strike model + moderation audit model

## Notes
- This is an MVP scaffold with realistic structure and representative UX.
- Audio transcoding worker uses FFmpeg command scaffolding and is job-backed via DB.
- Stripe monetization is scaffolded at data/API level for future expansion.
- PostgreSQL can be started with `npm run db:up` and stopped with `npm run db:down`.
