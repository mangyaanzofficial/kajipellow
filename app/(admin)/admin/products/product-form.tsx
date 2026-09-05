"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertProductAction, type AdminActionState } from "@/actions/admin";

const initialState: AdminActionState = {};

export function ProductForm({
  categories,
  providers,
  product,
}: {
  categories: { id: string; name: string }[];
  providers: { id: string; name: string }[];
  product?: {
    id: string; categoryId: string; providerId: string; providerSku: string; name: string; slug: string;
    costPrice: number; sellPrice: number; adminFee: number; requiresServerId: boolean; isActive: boolean;
  };
}) {
  const [state, formAction, isPending] = useActionState(upsertProductAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Kategori</label>
          <select name="categoryId" defaultValue={product?.categoryId} required className="w-full h-11 rounded-xl border border-border bg-white/5 px-4 text-sm">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Provider</label>
          <select name="providerId" defaultValue={product?.providerId} required className="w-full h-11 rounded-xl border border-border bg-white/5 px-4 text-sm">
            {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <Input name="name" label="Nama Produk" defaultValue={product?.name} required />
      <Input name="slug" label="Slug (unik)" defaultValue={product?.slug} required />
      <Input name="providerSku" label="SKU Provider" defaultValue={product?.providerSku} required />

      <div className="grid grid-cols-3 gap-4">
        <Input name="costPrice" type="number" label="Harga Provider" defaultValue={product?.costPrice} required />
        <Input name="sellPrice" type="number" label="Harga Jual" defaultValue={product?.sellPrice} required />
        <Input name="adminFee" type="number" label="Biaya Admin" defaultValue={product?.adminFee ?? 0} />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requiresServerId" defaultChecked={product?.requiresServerId} /> Butuh Server ID
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} /> Aktif
        </label>
      </div>

      {state.error && <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{state.error}</p>}
      {state.success && <p className="text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">{state.success}</p>}

      <Button type="submit" disabled={isPending}>{isPending ? "Menyimpan..." : "Simpan Produk"}</Button>
    </form>
  );
}
