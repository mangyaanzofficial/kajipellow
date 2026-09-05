import { requireUser } from "@/lib/guards";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

export default async function ProfilPage() {
  const user = await requireUser();
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>
      <Card className="p-6">
        <ProfileForm name={user.name} phone={user.phone} email={user.email} username={user.username} />
      </Card>
    </div>
  );
}
