# SECURITY.md — Ringkasan Implementasi Keamanan

Dokumen ini memetakan setiap requirement keamanan di brief (poin #22, #23, #29, #30) ke implementasi nyata di kode.

| Requirement | Implementasi | Lokasi |
|---|---|---|
| Password hashing | bcrypt, 12 salt rounds | `lib/password.ts` |
| Session (bukan JWT stateless) | Opaque token di cookie httpOnly+secure, hash token disimpan di DB, bisa di-revoke kapan saja | `lib/session.ts` |
| Input validation | Zod schema di setiap Server Action & API boundary | `types/*.ts` |
| SQL injection protection | Prisma ORM (parameterized query otomatis), tidak ada raw SQL string concat | seluruh `services/` |
| XSS protection | React auto-escape by default; tidak ada `dangerouslySetInnerHTML` dipakai di codebase | — |
| CSRF protection | Server Actions Next.js punya proteksi CSRF bawaan (origin check); form GET (cek transaksi/search) tidak mengubah state | `actions/*.ts` |
| Rate limiting | In-memory fixed window pada login, register, create order, webhook (catatan: ganti ke Redis/Upstash saat multi-instance production) | `lib/rate-limit.ts` |
| Authentication middleware | Cek cepat cookie di edge (`middleware.ts`) + validasi penuh di server (`lib/guards.ts`) | `middleware.ts`, `lib/guards.ts` |
| Authorization (role-based) | `requireUser()` / `requireAdmin()` dipanggil di setiap layout terproteksi | `lib/guards.ts` |
| Secure cookies | `httpOnly`, `secure` (production), `sameSite: lax` | `lib/session.ts` |
| Environment variables | Semua secret lewat `process.env`, tidak ada hardcode | `.env.example` |
| Webhook signature validation | HMAC signature wajib valid sebelum payload diproses | `services/payment/*.adapter.ts`, `app/api/webhook/payment/route.ts` |
| Idempotency | Unique constraint `idempotencyKey` (Transaction, Deposit), `[source, eventId]` (WebhookLog), `[referenceType, referenceId, type]` (WalletMutation) | `prisma/schema.prisma` |
| Server-side price validation | Harga SELALU di-refetch dari `Product.sellPrice`/`adminFee` di server saat create order, tidak pernah menerima harga dari client | `services/transaction/transaction.service.ts` |
| Anti duplicate transaction | Idempotency key + unique constraint DB + pengecekan status sebelum transisi (`if (status !== "PENDING") return`) | `services/transaction/transaction.service.ts` |
| Error handling ke user | Pesan error generik ke user (`"Terjadi kesalahan server..."`), detail asli hanya di `console.error` (server log) | seluruh Server Action |
| Logging | Semua webhook (valid/invalid) dicatat ke `WebhookLog`; error request dicatat ke server log | `app/api/webhook/payment/route.ts` |
| Tidak logging data sensitif | Tidak ada `password`, `passwordHash`, API key/secret yang di-log | seluruh codebase |
| Admin tidak bisa ubah password user langsung | Tidak ada action untuk itu — hanya user sendiri yang bisa ganti password (dengan verifikasi password lama) | `actions/profile.ts`, `actions/admin.ts` |
| Revoke session saat ganti password / suspend | `prisma.session.deleteMany()` dipanggil | `actions/profile.ts`, `actions/admin.ts` |

## Yang WAJIB diganti sebelum production

1. **Payment & Product Provider mock** — `PAYMENT_PROVIDER=mock` dan `PRODUCT_PROVIDER=mock` di `.env` HANYA untuk development. Ganti dengan adapter gateway/provider asli sebelum go-live (lihat komentar `DEVELOPMENT ONLY` di kode adapter).
2. **Rate limiter in-memory** — tidak reliable di lingkungan serverless multi-instance (Vercel). Ganti ke Vercel KV/Upstash Redis dengan interface yang sama (`lib/rate-limit.ts`).
3. **Password admin default di seed** (`ChangeMe123!`) — wajib diganti setelah deploy.
4. **AUTH_SECRET** dan seluruh secret di `.env.example` — generate ulang dengan `openssl rand -base64 32`, jangan pernah commit `.env` asli ke git.
