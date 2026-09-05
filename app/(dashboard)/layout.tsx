import Link from "next/link";
import { LayoutDashboard, History, Wallet, User, Settings, LogOut } from "lucide-react";
import { requireUser } from "@/lib/guards";
import { logoutAction } from "@/actions/auth";

const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produk", label: "Top Up", icon: Wallet },
  { href: "/dashboard/riwayat", label: "Riwayat Transaksi", icon: History },
  { href: "/dashboard/deposit", label: "Deposit", icon: Wallet },
  { href: "/dashboard/profil", label: "Profil", icon: User },
  { href: "/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border p-6 gap-1">
        <Link href="/" className="font-bold text-lg mb-8">
          <span className="bg-gradient-brand bg-clip-text text-transparent">SANTANIC</span> TOPUP
        </Link>
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
        <form action={logoutAction} className="mt-auto">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-danger/10 transition-colors w-full">
            <LogOut size={18} />
            Logout
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <header className="md:hidden border-b border-border p-4 flex justify-between items-center">
          <span className="font-bold">SANTANIC TOPUP</span>
          <span className="text-sm text-muted-foreground">Hi, {user.name.split(" ")[0]}</span>
        </header>
        <main className="p-6 max-w-5xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
