import "server-only";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getSystemSetting = unstable_cache(
  async (key: string): Promise<string | null> => {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  },
  ["system-setting"],
  { revalidate: 30, tags: ["system-settings"] }
);

export async function isMaintenanceMode(): Promise<boolean> {
  const value = await getSystemSetting("maintenance_mode");
  return value === "true";
}
