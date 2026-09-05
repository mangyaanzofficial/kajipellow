import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
            SANTANIC
          </span>
          <span className="text-2xl font-bold text-foreground"> TOPUP</span>
        </Link>
        <div className="rounded-2xl border border-border bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-2xl animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
