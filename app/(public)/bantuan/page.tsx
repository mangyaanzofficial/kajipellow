import { FAQ } from "@/config/site";

export const metadata = { title: "Bantuan" };

export default function BantuanPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Pusat Bantuan</h1>
      <p className="text-muted-foreground mb-8">
        Jika Anda mengalami kendala, hubungi customer service kami melalui tombol WhatsApp/Telegram
        di pojok kanan bawah, atau lihat pertanyaan umum di bawah ini.
      </p>
      <div className="space-y-4">
        {FAQ.map((item) => (
          <details key={item.q} className="rounded-xl border border-border bg-white/5 p-4">
            <summary className="cursor-pointer font-medium">{item.q}</summary>
            <p className="text-sm text-muted-foreground mt-2">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
