import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "primary" }> = {
  PENDING: { label: "Menunggu Pembayaran", variant: "warning" },
  PAID: { label: "Dibayar", variant: "primary" },
  PROCESSING: { label: "Diproses", variant: "primary" },
  SUCCESS: { label: "Berhasil", variant: "success" },
  FAILED: { label: "Gagal", variant: "danger" },
  EXPIRED: { label: "Kedaluwarsa", variant: "default" },
  REFUNDED: { label: "Direfund", variant: "warning" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
