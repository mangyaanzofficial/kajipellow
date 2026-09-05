# DEPLOYMENT.md — Deploy ke Vercel

## 1. Siapkan Database PostgreSQL

Gunakan provider PostgreSQL yang kompatibel dengan serverless (koneksi pooled), misalnya:
- Vercel Postgres (terintegrasi langsung)
- Neon
- Supabase Database

Catat `DATABASE_URL` yang diberikan.

## 2. Push kode ke Git

```bash
git init
git add .
git commit -m "Initial commit: SANTANIC TOPUP & PPOB"
git branch -M main
git remote add origin <URL_REPO_ANDA>
git push -u origin main
```

## 3. Import project ke Vercel

1. Buka https://vercel.com/new
2. Import repository yang baru saja di-push
3. Framework preset akan otomatis terdeteksi sebagai **Next.js**

## 4. Set Environment Variables di Vercel

Masuk ke **Project Settings → Environment Variables**, isi semua variable dari `.env.example`:

| Key | Wajib diisi dengan |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL production |
| `AUTH_SECRET` | Hasil `openssl rand -base64 32` |
| `SESSION_COOKIE_NAME` | Boleh biarkan default |
| `PAYMENT_PROVIDER` | Nama adapter gateway ASLI (bukan `mock`) |
| `PAYMENT_API_KEY`, `PAYMENT_MERCHANT_ID`, `PAYMENT_SECRET` | Credential dari payment gateway pilihan Anda |
| `PAYMENT_CALLBACK_URL` | `https://domain-anda.com/api/webhook/payment` |
| `PRODUCT_PROVIDER` | Kode provider ASLI (bukan `mock`) |
| `PROVIDER_API_KEY`, `PROVIDER_USERNAME`, `PROVIDER_SECRET` | Credential dari provider PPOB pilihan Anda |
| `NEXT_PUBLIC_APP_URL` | `https://domain-anda.com` |
| `NEXT_PUBLIC_APP_NAME` | `SANTANIC TOPUP & PPOB` |
| `NEXT_PUBLIC_TELEGRAM_USERNAME`, `NEXT_PUBLIC_WHATSAPP_NUMBER` | Kontak CS Anda |

**JANGAN** set `PAYMENT_PROVIDER=mock` atau `PRODUCT_PROVIDER=mock` di production — endpoint
`/api/dev/mock-pay` sudah otomatis diblokir saat `NODE_ENV=production`, tapi adapter mock tetap
tidak akan memproses pembayaran/produk sungguhan.

## 5. Migrate database

Vercel tidak menjalankan migration otomatis. Jalankan dari mesin lokal (atau CI) yang punya akses ke `DATABASE_URL` production:

```bash
npx prisma migrate deploy
npx prisma db seed   # opsional: isi data awal kategori/produk contoh
```

## 6. Deploy

Klik **Deploy** di Vercel. Build command default (`npm run build`) sudah benar karena `package.json`
sudah menyertakan `prisma generate` secara implisit lewat `postinstall` — tambahkan script berikut
jika belum otomatis ter-generate:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

## 7. Setelah deploy pertama kali

- [ ] Login sebagai admin (`admin@santanic.dev` / password dari seed) lalu **segera ganti password**
      lewat halaman `/dashboard/pengaturan`
- [ ] Cek `/admin/settings` dan sesuaikan nama website, kontak CS, dsb.
- [ ] Test webhook payment gateway ASLI mengarah ke `https://domain-anda.com/api/webhook/payment`
      dengan transaksi nominal kecil terlebih dahulu
- [ ] Set custom domain di Vercel Project Settings → Domains
- [ ] Aktifkan Vercel Analytics/Logs untuk memantau error production

## 8. Rencana Scaling (opsional, untuk trafik tinggi)

- Ganti rate limiter in-memory (`lib/rate-limit.ts`) ke Vercel KV/Upstash Redis
- Tambahkan index database tambahan sesuai query yang paling sering dipakai (sudah ada index dasar di `schema.prisma`)
- Pertimbangkan caching halaman produk dengan `revalidate` di Next.js untuk mengurangi beban DB
