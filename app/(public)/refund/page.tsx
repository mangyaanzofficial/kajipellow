export const metadata = { title: "Kebijakan Refund" };

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 prose prose-invert prose-sm">
      <h1 className="text-2xl font-bold mb-6">Kebijakan Refund</h1>
      <p className="text-muted-foreground">
        Jika transaksi Anda gagal diproses SETELAH pembayaran berhasil diverifikasi, dana akan
        dikembalikan secara otomatis ke saldo akun SANTANIC Anda. Refund tidak berlaku untuk kesalahan
        input data (User ID/Server ID salah) yang dilakukan oleh pengguna sendiri.
      </p>
      <p className="text-muted-foreground mt-4">
        [Placeholder — lengkapi dengan kebijakan refund resmi sesuai kebutuhan bisnis Anda.]
      </p>
    </div>
  );
}
