# Prisma 7 Migration Guide - SQLite with Better-SQLite3

## ✅ What Was Fixed

### 1. **schema.prisma** - Removed unsupported `url` property
**Before (Prisma 6 style):**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")  // ❌ P1012 error in Prisma 7
}
```

**After (Prisma 7 style):**
```prisma
datasource db {
  provider = "sqlite"
  // ✅ No url property - URL is managed by adapter or prisma.config.ts
}
```

### 2. **prisma.config.ts** - Proper datasource configuration for Migrate
**Before:**
```typescript
datasource: {
  url: env("DATABASE_URL")
}
```

**After:**
```typescript
datasource: {
  name: "db",
  provider: "sqlite",
  url: env("DATABASE_URL", "file:./dev.db")  // ✅ Falls back to local dev.db
}
```

### 3. **lib/prisma.ts** - Updated to modern pattern
- Removed `declare global` pattern
- Uses type-safe `globalThis` typing
- Cleaner PrismaClient singleton initialization

---

## 📋 Prisma 7 Architecture (SQLite + Better-SQLite3)

```
┌─────────────────────────────────────────────────┐
│           prisma.config.ts                      │
│   ├─ Defines datasource URL for migrations      │
│   ├─ Provider: sqlite                           │
│   └─ url: file:./dev.db (or DATABASE_URL env)  │
└─────────────────────────────────────────────────┘
              ↓ (for prisma migrate/db push)
┌─────────────────────────────────────────────────┐
│        prisma/schema.prisma                     │
│   ├─ NO url property (Prisma 7 change)         │
│   ├─ Provider: sqlite                          │
│   └─ Enums & Models defined here                │
└─────────────────────────────────────────────────┘
              ↓ (prisma generate creates)
┌─────────────────────────────────────────────────┐
│     @prisma/client (generated)                  │
│   ├─ TypeScript types & enums                   │
│   ├─ CampaignStatus enum ✅                     │
│   └─ PaymentStatus enum ✅                      │
└─────────────────────────────────────────────────┘
              ↓ (passed to)
┌─────────────────────────────────────────────────┐
│       lib/prisma.ts (Runtime)                   │
│   ├─ Creates PrismaClient instance              │
│   ├─ Adapter: PrismaBetterSqlite3               │
│   ├─ url: DATABASE_URL or file:./dev.db        │
│   └─ Global singleton for Node.js               │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Vercel Deployment Configuration

### 1. **Environment Variables** (Project Settings → Environment Variables)

Add to Vercel:
```env
# For production SQLite on Vercel (persistence via Vercel Postgres KV or filesystem)
DATABASE_URL=file:./dev.db

# OR for cloud-backed SQLite:
# DATABASE_URL=file:./prisma/dev.db
```

**Options:**

| Option | Best For | Setup |
|--------|----------|-------|
| `file:./dev.db` | Small projects | Works on Vercel, requires serverless consideration |
| `file:./prisma/dev.db` | Better organization | Database in prisma folder |
| Vercel KV + SQLite wrapper | Production | More reliable persistence |

### 2. **package.json Scripts** (Already Correct)
```json
{
  "scripts": {
    "build": "prisma generate && next build",    // ✅ Correct order
    "postinstall": "prisma generate",             // ✅ Auto-generates types
    "prisma:generate": "prisma generate"
  }
}
```

### 3. **Vercel Build Configuration** (Optional)
If you have a `vercel.json`:
```json
{
  "buildCommand": "prisma generate && next build",
  "env": {
    "DATABASE_URL": "file:./dev.db"
  }
}
```

Or add to `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure DATABASE_URL is available during build
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db"
  }
};

export default nextConfig;
```

---

## ✅ Verification Checklist

- [x] `prisma generate` runs without P1012 error
- [x] Enums (CampaignStatus, PaymentStatus) are generated in @prisma/client
- [x] PrismaClient initializes with Better-SQLite3 adapter
- [x] DATABASE_URL can be empty (defaults to file:./dev.db)
- [x] Global singleton pattern prevents multiple connections
- [x] Development and production logging configured
- [x] postinstall script auto-generates types on `npm install`
- [x] Compatible with Vercel serverless environment

---

## 🔧 Commands for Testing

```bash
# Regenerate Prisma Client (enums, types, etc.)
npm run prisma:generate

# Create/apply migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Full build (simulates Vercel)
npm run build

# Start dev server
npm run dev
```

---

## 📝 Key Changes from Prisma 6 → 7

| Aspect | Prisma 6 | Prisma 7 |
|--------|----------|---------|
| Datasource URL | In schema.prisma | In prisma.config.ts |
| Adapter usage | Optional | Required for non-PostgreSQL |
| Better-SQLite3 | Supported | Recommended for SQLite |
| Global singleton | Any pattern works | Type-safe recommended |
| Config file | Not required | Required with adapters |

---

## 🐛 Troubleshooting

### Error: "P1012: The datasource property `url` is no longer supported"
✅ **Fixed** - Ensure schema.prisma has NO `url` field in datasource

### Vercel build fails with database errors
✅ **Solution** - Set `DATABASE_URL=file:./dev.db` in Vercel environment

### Types not generating
✅ **Solution** - Run `npm run prisma:generate` manually or check postinstall

### Migration issues
✅ **Solution** - Ensure prisma.config.ts has correct datasource.url for migrations

---

## 📦 Dependencies
- `@prisma/client@7.4.0` ✅
- `@prisma/adapter-better-sqlite3@7.4.0` ✅
- `prisma@7.4.0` ✅
- `next@14.x` ✅
