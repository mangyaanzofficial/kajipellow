export const FEATURES = [
  { icon: "Zap", title: "Proses Cepat", desc: "Transaksi diproses otomatis dalam hitungan detik." },
  { icon: "Lock", title: "Aman", desc: "Data dan pembayaran Anda dilindungi enkripsi." },
  { icon: "Wallet", title: "Harga Kompetitif", desc: "Harga bersaing untuk semua produk digital." },
  { icon: "Smartphone", title: "Mobile Friendly", desc: "Nyaman diakses dari HP, tablet, maupun desktop." },
  { icon: "Gamepad2", title: "Banyak Produk", desc: "Ratusan produk game, pulsa, dan digital lainnya." },
  { icon: "Clock", title: "Layanan 24/7", desc: "Customer service siap membantu kapan saja." },
] as const;

export const HOW_IT_WORKS = [
  { step: 1, title: "Pilih Produk", desc: "Cari dan pilih produk yang ingin Anda top up." },
  { step: 2, title: "Isi Data", desc: "Masukkan User ID/nomor tujuan dan pilih nominal." },
  { step: 3, title: "Bayar", desc: "Selesaikan pembayaran lewat QRIS, VA, atau e-wallet." },
  { step: 4, title: "Selesai", desc: "Produk otomatis diproses dan dikirim ke akun Anda." },
] as const;

export const FAQ = [
  { q: "Berapa lama proses top up?", a: "Sebagian besar transaksi diproses otomatis dalam hitungan detik hingga beberapa menit setelah pembayaran terverifikasi." },
  { q: "Apakah pembayaran saya aman?", a: "Ya. Semua pembayaran diverifikasi langsung oleh payment gateway resmi dan tidak pernah kami proses secara manual dari sisi frontend." },
  { q: "Bagaimana jika transaksi gagal?", a: "Jika transaksi gagal setelah pembayaran berhasil, dana akan direfund otomatis ke saldo akun Anda atau diproses ulang oleh tim kami." },
  { q: "Bagaimana cara menghubungi CS?", a: "Anda bisa menghubungi kami melalui tombol WhatsApp/Telegram yang tersedia di pojok kanan bawah website." },
] as const;
