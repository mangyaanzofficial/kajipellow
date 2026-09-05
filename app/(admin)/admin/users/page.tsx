import Link from "next/link";
import { getAdminUsers } from "@/services/admin/admin.service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PriceDisplay } from "@/components/ui/price-display";
import { UserRowActions } from "./user-row-actions";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const { search, page } = await searchParams;
  const result = await getAdminUsers({ search, page: page ? Number(page) : 1 });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <form method="get" className="mb-4 max-w-sm">
        <Input name="search" defaultValue={search} placeholder="Cari nama/email/username..." />
      </form>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-4">Nama</th>
              <th className="p-4">Email</th>
              <th className="p-4">Saldo</th>
              <th className="p-4">Transaksi</th>
              <th className="p-4">Role / Status</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <Link href={`/admin/users/${u.id}`} className="font-medium hover:text-primary">{u.name}</Link>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                </td>
                <td className="p-4">{u.email}</td>
                <td className="p-4"><PriceDisplay amount={u.wallet ? Number(u.wallet.balance) : 0} /></td>
                <td className="p-4">{u._count.transactions}</td>
                <td className="p-4"><UserRowActions userId={u.id} role={u.role} status={u.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
