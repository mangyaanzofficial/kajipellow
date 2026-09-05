# SANTANIC TOPUP & PPOB

Platform top up & PPOB (pulsa, paket data, voucher game, token PLN, e-wallet, dll) dibangun dengan
Next.js 15, TypeScript, Prisma, dan PostgreSQL.

## Quickstart (Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Isi minimal: DATABASE_URL, AUTH_SECRET (openssl rand -base64 32)
# Biarkan PAYMENT_PROVIDER=mock dan PRODUCT_PROVIDER=mock untuk development

# 3. Setup database
npx prisma migrate dev --name init
npx prisma db seed

# 4. Jalankan development server
npm run dev
```

Buka http://localhost:3000. Login admin: `admin@santanic.dev` / `ChangeMe123!` (ganti setelah deploy).

## Dokumentasi

| File | Isi |
|---|---|
| `PROJECT_STRUCTURE.md` | Struktur folder & prinsip arsitektur |
| `SECURITY.md` | Pemetaan requirement security → implementasi kode |
| `TESTING.md` | Cara menjalankan unit test + checklist manual E2E |
| `DEPLOYMENT.md` | Panduan deploy ke Vercel step-by-step |
| `prisma/schema.prisma` | Skema database lengkap |

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, lucide-react
- **Backend:** Next.js Server Actions + Route Handlers
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Session berbasis DB (cookie httpOnly, bukan JWT stateless)
- **Payment/Provider:** Adapter pattern — mudah ganti gateway/provider tanpa ubah kode inti

## Status Implementasi (mengikuti 15 step brief awal)

- [x] STEP 1-2: Architecture & struktur folder
- [x] STEP 3: Database schema Prisma
- [x] STEP 4: Authentication (register/login/session/middleware)
- [x] STEP 5: Landing page & UI components
- [x] STEP 6: Product system (katalog & detail produk)
- [x] STEP 7: Checkout
- [x] STEP 8: Payment adapter (mock, siap diganti gateway asli)
- [x] STEP 9: Provider adapter (mock, siap diganti provider asli)
- [x] STEP 10: Transaction system + webhook aman
- [x] STEP 11: User dashboard (saldo, riwayat, deposit, profil, pengaturan)
- [x] STEP 12: Admin panel (dashboard, users, products, transactions, settings)
- [x] STEP 13: Security (lihat `SECURITY.md`)
- [x] STEP 14: Testing (unit test + checklist manual)
- [x] STEP 15: Deployment guide (lihat `DEPLOYMENT.md`)

## Yang HARUS dilakukan sebelum production

1. Ganti `MockPaymentAdapter` dan `MockProviderAdapter` dengan adapter gateway/provider asli
   (credential sudah disiapkan tempatnya di `.env.example`).
2. Ganti password admin default dari seed.
3. Ganti rate limiter in-memory ke Redis/Upstash jika deploy multi-instance.
4. Lengkapi konten `terms`, `privacy`, `refund` (masih placeholder) sesuai kebutuhan legal bisnis Anda.
