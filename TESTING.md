# TESTING.md

## Unit Test

Dijalankan dengan Vitest, meng-cover logic murni yang tidak butuh koneksi DB
(business rule di Zod schema, util formatting, rate limiter).

```bash
npm run test
```

File test ada di `__tests__/`:
- `currency.test.ts` — format Rupiah
- `auth-schema.test.ts` — validasi register/login (password strength, konfirmasi password)
- `rate-limit.test.ts` — fixed-window limiter

**Catatan:** Business logic yang menyentuh Prisma (`services/*.service.ts`) sengaja tidak
di-unit-test di sini karena butuh test database terpisah (bukan production DB). Untuk
melengkapi test coverage sebelum production, disarankan menambah:
- Test integrasi dengan test database (Docker Postgres + `prisma migrate deploy` di CI)
- Test khusus untuk `createProductOrder` memastikan harga selalu diambil dari DB meski
  payload berisi harga lain
- Test khusus untuk webhook: signature invalid → ditolak, event duplikat → tidak diproses dua kali

## Manual E2E Checklist (sebelum deploy)

Alur ini mensimulasikan end-to-end memakai mock payment & mock provider (`PAYMENT_PROVIDER=mock`, `PRODUCT_PROVIDER=mock`):

1. **Register & Login**
   - [ ] Register dengan data valid → berhasil, langsung masuk ke `/dashboard`
   - [ ] Register dengan email yang sudah dipakai → ditolak dengan pesan jelas
   - [ ] Login dengan password salah 6x berturut-turut → kena rate limit
2. **Top Up Produk**
   - [ ] Buka `/produk/[slug]`, isi User ID, klik "Lanjutkan Pembayaran" → masuk `/checkout/[id]`
   - [ ] Pilih metode QRIS → redirect ke `/invoice/[id]` dengan status PENDING
   - [ ] Panggil `GET /api/dev/mock-pay?ref=...&invoice=...` (link ada di `paymentUrl` mock) → status berubah PAID → PROCESSING → SUCCESS otomatis
   - [ ] Refresh invoice page → status SUCCESS tampil, tidak ada tombol bayar lagi
3. **Anti Duplicate**
   - [ ] Panggil webhook yang sama 2x (event ID sama) → transaksi tidak diproses dua kali, `WebhookLog` menandai duplikat
   - [ ] Klik "Lanjutkan Pembayaran" 2x cepat berturut-turut → tidak membuat 2 transaksi (dibatasi rate limit + idempotency)
4. **Deposit**
   - [ ] Deposit Rp50.000 → bayar via mock → saldo wallet bertambah tepat Rp50.000 (cek `WalletMutation` tidak dobel)
5. **Admin**
   - [ ] Login sebagai admin (`admin@santanic.dev`) → akses `/admin` berhasil
   - [ ] User biasa mencoba akses `/admin` → di-redirect ke `/dashboard`
   - [ ] Tambah produk baru dari admin → langsung muncul di `/produk`
   - [ ] Set transaksi manual ke FAILED lalu klik "Retry" → produk diproses ulang
6. **Maintenance Mode**
   - [ ] Set `maintenance_mode=true` di admin settings → halaman publik menampilkan halaman maintenance untuk user biasa, admin tetap bisa akses
7. **Security**
   - [ ] Coba akses `/dashboard` tanpa login → redirect ke `/login`
   - [ ] Coba kirim POST ke `/api/webhook/payment` tanpa signature valid → ditolak 401
