# SANTANIC TOPUP & PPOB — Struktur Project

```
santanic-topup/
├── app/
│   ├── (public)/            # Landing page & halaman publik (SEO-facing, Server Components)
│   │   ├── page.tsx                → "/"
│   │   ├── produk/page.tsx         → "/produk"
│   │   ├── produk/[slug]/page.tsx  → "/produk/[slug]"
│   │   ├── checkout/[id]/page.tsx  → "/checkout/[id]"
│   │   ├── invoice/[id]/page.tsx   → "/invoice/[id]"
│   │   ├── cek-transaksi/page.tsx  → "/cek-transaksi"
│   │   ├── bantuan/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── refund/page.tsx
│   │
│   ├── (auth)/               # Login & Register (route group terpisah, layout tanpa navbar dashboard)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (dashboard)/          # Area USER, dilindungi middleware
│   │   └── dashboard/
│   │       ├── page.tsx            → "/dashboard"
│   │       ├── riwayat/page.tsx
│   │       ├── deposit/page.tsx
│   │       ├── profil/page.tsx
│   │       └── pengaturan/page.tsx
│   │
│   ├── (admin)/               # Area ADMIN, dilindungi middleware + role check
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── users/page.tsx
│   │       ├── products/page.tsx
│   │       ├── transactions/page.tsx
│   │       └── settings/page.tsx
│   │
│   └── api/                   # Route handlers (dipanggil oleh Server Actions/client)
│       ├── orders/route.ts, orders/[id]/route.ts
│       ├── payment/create/route.ts, payment/status/[id]/route.ts
│       ├── webhook/payment/route.ts
│       ├── deposit/route.ts
│       ├── products/route.ts
│       ├── categories/route.ts
│       └── admin/{users,orders,products}/...
│
├── components/
│   ├── ui/          # Reusable primitives (Button, Card, Modal, Input, Table, Badge, Toast...)
│   ├── shared/      # Navbar, Footer, ProductCard, TransactionCard, StatusBadge, PriceDisplay
│   ├── dashboard/   # Komponen khusus user dashboard
│   └── admin/       # Komponen khusus admin panel
│
├── lib/             # Util inti: prisma client, auth/session helper, rate-limiter, logger
├── services/        # BUSINESS LOGIC — tidak boleh import apapun dari `app/`
│   ├── payment/     # PaymentGatewayAdapter interface + implementasi (mock, dst.)
│   ├── provider/    # ProductProviderAdapter interface + implementasi (mock, dst.)
│   ├── transaction/ # Order lifecycle, status transition, idempotency
│   ├── wallet/      # Saldo user, deposit, DB transaction-safe balance update
│   └── auth/        # Register, login, hashing, session
│
├── providers/       # Konfigurasi/registrasi adapter aktif (payment & product provider factory)
├── actions/         # Next.js Server Actions (tipis — hanya validasi + panggil services/)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/           # Shared TypeScript types & Zod schema inference
├── utils/           # Pure helper functions (format currency, date, slug, dll)
├── config/          # Konstanta app (kategori, biaya admin default, dsb.)
├── middleware.ts    # Auth guard + role-based route protection
├── .env.example
└── package.json
```

## Prinsip Kunci

1. **`app/` hanya untuk UI & routing.** Tidak ada business logic langsung di dalam page/route handler — semua delegasi ke `services/`.
2. **`services/` adalah satu-satunya tempat yang boleh menyentuh Prisma untuk operasi kritikal** (harga, saldo, status transaksi). Ini memudahkan audit security.
3. **Adapter pattern** di `services/payment` dan `services/provider` berarti mengganti gateway/provider = menulis 1 file baru yang implement interface, tanpa menyentuh kode lain.
4. **Route groups** `(public)`, `(auth)`, `(dashboard)`, `(admin)` dipakai supaya masing-masing bisa punya `layout.tsx` berbeda (dengan/tanpa navbar dashboard) tanpa memengaruhi URL path.
5. **`middleware.ts`** akan menangani: redirect jika belum login ke `/dashboard/*`, redirect jika bukan ADMIN ke `/admin/*`, dan cek maintenance mode.

---

File konfigurasi dasar yang sudah dibuat di step ini:
- `package.json` — dependencies (Next.js 15, Prisma, Zod, bcryptjs, jose untuk session, Tailwind, dll.)
- `tsconfig.json` — strict mode + path alias `@/*`
- `tailwind.config.ts` — dark mode class-based, warna sesuai brief (dark/putih/aksen ungu-biru gradient), animasi fade-in/slide-up
- `next.config.js`, `postcss.config.js`, `.gitignore`
- `.env.example` — semua secret sebagai placeholder, termasuk penanda `PAYMENT_PROVIDER=mock` / `PRODUCT_PROVIDER=mock` (lihat poin 40 di brief Anda — jangan pura-pura pembayaran aktif tanpa credential asli)

Struktur folder lengkap sudah dibuat (kosong, siap diisi) sesuai daftar di atas.
