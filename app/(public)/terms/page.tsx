export const metadata = { title: "Syarat & Ketentuan" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 prose prose-invert prose-sm">
      <h1 className="text-2xl font-bold mb-6">Syarat & Ketentuan</h1>
      <p className="text-muted-foreground">
        Dengan menggunakan layanan SANTANIC TOPUP & PPOB, Anda menyetujui bahwa seluruh transaksi
        diproses berdasarkan data yang Anda masukkan sendiri (User ID, nomor tujuan, dsb). Kami tidak
        bertanggung jawab atas kesalahan input data oleh pengguna. Harga dan ketersediaan produk dapat
        berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.
      </p>
      <p className="text-muted-foreground mt-4">
        [Placeholder — lengkapi dengan syarat & ketentuan resmi sesuai kebutuhan bisnis dan regulasi yang berlaku di wilayah Anda.]
      </p>
    </div>
  );
}
