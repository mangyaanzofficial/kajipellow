import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "SANTANIC TOPUP & PPOB — Top Up Cepat, Aman & Terpercaya",
    template: "%s | SANTANIC TOPUP & PPOB",
  },
  description:
    "Top up pulsa, paket data, voucher game, token PLN, e-wallet, dan produk digital lainnya dengan proses cepat, aman, dan harga kompetitif.",
  keywords: ["top up murah", "top up game", "top up ML", "pulsa murah", "paket data murah", "top up terpercaya", "PPOB"],
  openGraph: {
    title: "SANTANIC TOPUP & PPOB",
    description: "Top Up Cepat, Aman & Terpercaya",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "SANTANIC TOPUP & PPOB",
    description: "Top Up Cepat, Aman & Terpercaya",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster richColors position="top-center" theme="dark" />
      </body>
    </html>
  );
}
