import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <span className="font-bold text-lg">
            <span className="bg-gradient-brand bg-clip-text text-transparent">SANTANIC</span> TOPUP
          </span>
          <p className="text-sm text-muted-foreground mt-2">
            Top up cepat, aman & terpercaya untuk semua kebutuhan digital Anda.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-3">Layanan</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/produk">Semua Produk</Link></li>
            <li><Link href="/cek-transaksi">Cek Transaksi</Link></li>
            <li><Link href="/bantuan">Bantuan</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/terms">Syarat & Ketentuan</Link></li>
            <li><Link href="/privacy">Kebijakan Privasi</Link></li>
            <li><Link href="/refund">Kebijakan Refund</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-3">Customer Service</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Telegram: @Yogzoffc</li>
            <li>WA: +62 831-6076-3111</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SANTANIC TOPUP & PPOB. All rights reserved.
      </div>
    </footer>
  );
}
