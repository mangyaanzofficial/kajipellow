import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { SettingForm } from "./setting-form";

const SETTINGS_CONFIG = [
  { key: "site_name", label: "Nama Website" },
  { key: "maintenance_mode", label: "Maintenance Mode (true/false)" },
  { key: "default_admin_fee", label: "Biaya Admin Default" },
  { key: "contact_telegram", label: "Username Telegram CS" },
  { key: "contact_whatsapp", label: "Nomor WhatsApp CS" },
];

export default async function AdminSettingsPage() {
  const settings = await prisma.systemSetting.findMany();
  const settingMap = new Map(settings.map((s) => [s.key, s.value]));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pengaturan Sistem</h1>
      <Card className="p-6 space-y-4 max-w-lg">
        {SETTINGS_CONFIG.map((s) => (
          <SettingForm key={s.key} settingKey={s.key} label={s.label} value={settingMap.get(s.key) ?? ""} />
        ))}
      </Card>
    </div>
  );
}
