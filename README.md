# SmartCast AdSlots MVP

SmartCast AdSlots is a Next.js 14 MVP where advertisers can buy monthly ad placements on venue screens.

## Brief Project Description

AdSlots is a SmartCast marketplace MVP where advertisers book digital screen slots by date range, upload media, submit campaigns, pay, and download invoices. Admins manage locations, screen settings, approvals, proof uploads, bulk moderation, and notification logs.

## Tech

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- Advertiser registration/login (local sessions)
- Admin auth with password from `.env`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Run database migration:

```bash
npx prisma migrate dev
```

4. Seed demo data:

```bash
npm run prisma:seed
```

5. Start the app:

```bash
npm run dev
```

Optional:

```bash
npm run sync:statuses
```

## Required environment variables

See `.env.example`:

- `DATABASE_URL` (SQLite path)
- `ADMIN_PASSWORD` (admin login password)
- `ADMIN_EMAIL` (notification recipient, default fallback exists)
- `TELEGRAM_BOT_TOKEN` (optional for Telegram alerts)
- `TELEGRAM_CHAT_ID` (optional for Telegram alerts)
- `CRON_SECRET` (optional auth for cron sync endpoint)

## Main routes

- `/` guest landing or advertiser location list (after sign-in)
- `/auth/register` advertiser sign-up
- `/auth/login` advertiser sign-in
- `/locations/[id]` location details and availability check
- `/campaign/new?locationId=...` campaign creation
- `/campaigns/[id]` campaign status/details/proof
- `/admin/login` admin login
- `/admin` admin dashboard
- `/api/payments/checkout` simulated payment endpoint (card/click/payme)
- `/api/invoices/[campaignId]` invoice download endpoint
- `/api/cron/sync-statuses` lifecycle auto-sync endpoint

## Notes

- Uploads are saved locally to `public/uploads`.
- Intro marketing video default path: `public/smartcast-intro.mp4` (fallback also checks `public/videos/smartcast-intro.mp4`; or set `NEXT_PUBLIC_SMARTCAST_VIDEO_URL` in `.env`).
- Social links are configurable via:
  - `NEXT_PUBLIC_SMARTCAST_INSTAGRAM_URL`
  - `NEXT_PUBLIC_SMARTCAST_TELEGRAM_URL`
  - `NEXT_PUBLIC_SMARTCAST_YOUTUBE_URL`
  - `NEXT_PUBLIC_SMARTCAST_LINKEDIN_URL`
- Availability is integer slot-based only (`total slots`, `X available for your dates`).
- Overlap logic counts only `APPROVED` and `LIVE` campaigns.
- Screen defaults are high-capacity (18 slots, allowed range 15-20).
