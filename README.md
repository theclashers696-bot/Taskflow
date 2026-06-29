# TaskFlow

A full-stack Task & Team Management SaaS built with Next.js 15, Prisma, Better Auth, and PostgreSQL.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in at minimum:
- `DATABASE_URL` — your PostgreSQL connection string
- `SESSION_SECRET` — any long random string (min 32 chars)

### 3. Set up the database
```bash
npx prisma db push
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Stack
- **Framework**: Next.js 15 (App Router)
- **Auth**: Better Auth (email/password + Google OAuth)
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: TanStack Query
- **Charts**: Recharts

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Random secret for session signing (32+ chars) |
| `GOOGLE_CLIENT_ID` | Optional | Enable Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | Enable Google OAuth |
| `BETTER_AUTH_URL` | Optional | Public app URL (needed in production) |

## Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # TypeScript check
npx prisma db push   # Apply schema changes to database
npx prisma studio    # Open Prisma visual editor
```
