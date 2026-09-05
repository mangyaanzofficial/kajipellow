import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { FloatingCsButton } from "@/components/shared/floating-cs-button";
import { MaintenancePage } from "@/components/shared/maintenance-page";
import { isMaintenanceMode } from "@/lib/settings";
import { getCurrentUser } from "@/lib/session";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const maintenance = await isMaintenanceMode();
  const user = await getCurrentUser();

  // Maintenance mode aktif: hanya ADMIN yang tetap bisa browsing situs publik
  if (maintenance && user?.role !== "ADMIN") {
    return <MaintenancePage />;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingCsButton />
    </>
  );
}
