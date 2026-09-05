export const metadata = { title: "Kebijakan Privasi" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 prose prose-invert prose-sm">
      <h1 className="text-2xl font-bold mb-6">Kebijakan Privasi</h1>
      <p className="text-muted-foreground">
        Kami mengumpulkan data pribadi (nama, email, nomor HP) hanya untuk keperluan pembuatan akun dan
        pemrosesan transaksi. Kata sandi Anda disimpan dalam bentuk hash dan tidak pernah dapat dilihat
        oleh siapa pun, termasuk tim kami. Data pembayaran diproses langsung oleh payment gateway pihak
        ketiga dan tidak kami simpan di server kami.
      </p>
      <p className="text-muted-foreground mt-4">
        [Placeholder — lengkapi dengan kebijakan privasi resmi sesuai regulasi perlindungan data yang berlaku.]
      </p>
    </div>
  );
}
