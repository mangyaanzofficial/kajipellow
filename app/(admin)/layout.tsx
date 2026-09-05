import Link from "next/link";
import { LayoutDashboard, Users, Package, Receipt, Settings, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { logoutAction } from "@/actions/auth";

const MENU = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/transactions", label: "Transaksi", icon: Receipt },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border p-6 gap-1">
        <Link href="/" className="font-bold text-lg mb-1">
          <span className="bg-gradient-brand bg-clip-text text-transparent">SANTANIC</span> ADMIN
        </Link>
        <p className="text-xs text-muted-foreground mb-6">{admin.name}</p>
        {MENU.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
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
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}
