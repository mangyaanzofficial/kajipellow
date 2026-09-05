import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/produk", label: "Produk" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/cek-transaksi", label: "Cek Transaksi" },
  { href: "/bantuan", label: "Bantuan" },
];

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          <span className="bg-gradient-brand bg-clip-text text-transparent">SANTANIC</span>
          <span className="text-foreground"> TOPUP</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm">Login / Daftar</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
