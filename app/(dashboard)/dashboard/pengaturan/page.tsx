import { Card } from "@/components/ui/card";
import { PasswordForm } from "./password-form";

export default function PengaturanPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Akun</h1>
      <Card className="p-6">
        <h2 className="font-medium mb-4">Ganti Password</h2>
        <PasswordForm />
      </Card>
    </div>
  );
}
