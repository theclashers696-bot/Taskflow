# TaskFlow — Production Deployment Guide

## Stack
- **Frontend + API**: Next.js 15 (App Router) → Vercel
- **Database**: Neon PostgreSQL (serverless)
- **File uploads**: Cloudinary
- **Auth**: Better Auth v1

---

## 1. Neon PostgreSQL Setup

1. Go to [neon.tech](https://neon.tech) → **New Project**
2. Choose a region close to your Vercel deployment region (e.g. `us-east-1` / `iad1`)
3. From the **Dashboard → Connection Details** panel, get two connection strings:
   - **Pooled** (for `DATABASE_URL`) — enables PgBouncer connection pooling
   - **Direct** (for `DIRECT_URL`) — required for Prisma migrations

```
DATABASE_URL="postgresql://USER:PWD@HOST-pooler.neon.tech:5432/DB?sslmode=require&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://USER:PWD@HOST.neon.tech:5432/DB?sslmode=require"
```

---

## 2. Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Dashboard → **Settings → API Keys**
3. Note: **Cloud name**, **API Key**, **API Secret**

```
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 3. Google OAuth Setup (optional)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Create Credentials → OAuth 2.0 Client IDs**
2. Application type: **Web application**
3. Authorised redirect URIs:
   ```
   https://yourdomain.vercel.app/api/auth/callback/google
   ```
4. Copy **Client ID** and **Client Secret**

```
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

> If left blank, the "Continue with Google" button is automatically hidden — no code change needed.

---

## 4. Vercel Deployment

### 4a. Import project

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. Select your repo → set **Root Directory** to `taskflow`
3. Framework preset: **Next.js** (auto-detected)

### 4b. Environment Variables

Add these in **Vercel → Settings → Environment Variables**:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Neon pooled URL | Required |
| `DIRECT_URL` | Neon direct URL | Required for migrations |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` | Min 32 chars |
| `BETTER_AUTH_URL` | `https://yourdomain.vercel.app` | Your Vercel URL |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.vercel.app` | Same URL |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary | For avatar uploads |
| `CLOUDINARY_API_KEY` | From Cloudinary | |
| `CLOUDINARY_API_SECRET` | From Cloudinary | |
| `GOOGLE_CLIENT_ID` | From Google Cloud | Optional |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud | Optional |
| `SMTP_HOST` | e.g. `smtp.resend.com` | Optional (for email) |
| `SMTP_PORT` | `587` | Optional |
| `SMTP_USER` | SMTP username | Optional |
| `SMTP_PASSWORD` | SMTP password | Optional |
| `EMAIL_FROM` | `noreply@yourdomain.com` | Optional |

> **Generate a secret:** `openssl rand -base64 32`

### 4c. Deploy

Click **Deploy**. The build command in `vercel.json` runs:
```
npx prisma generate && next build
```

---

## 5. Database Schema Migration

After the first successful deployment, run migrations from your **local machine** (or Vercel CLI):

```bash
cd taskflow

# Push schema to production Neon database
DATABASE_URL="your-direct-url" npx prisma db push

# Optional: seed demo data
DATABASE_URL="your-direct-url" npx tsx scripts/seed.ts
```

Or use **Neon's SQL editor** in the dashboard to inspect your schema after push.

---

## 6. Custom Domain (optional)

1. **Vercel → Settings → Domains** → Add your domain
2. Follow the DNS instructions (CNAME / A records)
3. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your custom domain
4. Update the **Google OAuth redirect URI** in Google Cloud Console
5. Redeploy

---

## 7. Production Checklist

- [ ] `BETTER_AUTH_SECRET` is a strong random string (≥ 32 chars)
- [ ] `DATABASE_URL` uses the **pooled** Neon URL
- [ ] `DIRECT_URL` uses the **direct** Neon URL  
- [ ] `BETTER_AUTH_URL` matches your exact production URL (no trailing slash)
- [ ] `NEXT_PUBLIC_APP_URL` matches `BETTER_AUTH_URL`
- [ ] Schema pushed: `prisma db push` ran against production DB
- [ ] Google OAuth redirect URI updated if using custom domain
- [ ] Cloudinary credentials set for avatar uploads
- [ ] `NODE_ENV=production` (Vercel sets this automatically)

---

## 8. Monitoring & Logs

- **Runtime logs**: Vercel Dashboard → Functions tab
- **Database queries**: Neon Dashboard → Monitoring
- **Upload usage**: Cloudinary Dashboard → Usage

---

## 9. Scaling Notes

- Neon auto-scales to zero between requests — cold starts may add ~300ms on the first request
- Enable [Neon connection pooling](https://neon.tech/docs/connect/connection-pooling) (already configured via `?pgbouncer=true`)
- Vercel's Edge Network handles SSL termination and CDN for static assets automatically
- Cloudinary CDN delivers optimized images globally

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `BETTER_AUTH_URL mismatch` error | Ensure `BETTER_AUTH_URL` = exact production URL, no trailing slash |
| Google sign-in redirect fails | Add `https://domain/api/auth/callback/google` to Google OAuth URIs |
| Avatar upload returns 503 | Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to Vercel env |
| Login works but session expires | Check `BETTER_AUTH_SECRET` is the same across all Vercel instances/regions |
| `Database connection refused` | Use the **pooled** URL for `DATABASE_URL`, not the direct URL |
| Prisma migration fails | Use `DIRECT_URL` (not pooled) for `DATABASE_URL` when running `prisma db push` |
