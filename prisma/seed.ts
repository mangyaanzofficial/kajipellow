import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Provider (mock, DEVELOPMENT ONLY) ---
  const providerMock = await prisma.provider.upsert({
    where: { code: "mock" },
    update: {},
    create: { name: "Mock Provider (DEV ONLY)", code: "mock", isActive: true },
  });

  // --- Categories ---
  const categories = [
    { name: "Pulsa", slug: "pulsa", icon: "Smartphone" },
    { name: "Paket Data", slug: "paket-data", icon: "Wifi" },
    { name: "E-Wallet", slug: "e-wallet", icon: "Wallet" },
    { name: "Token PLN", slug: "token-pln", icon: "Zap" },
    { name: "Voucher Game", slug: "voucher-game", icon: "Gamepad2" },
    { name: "Game", slug: "game", icon: "Gamepad" },
    { name: "Streaming", slug: "streaming", icon: "Tv" },
    { name: "Voucher Digital", slug: "voucher-digital", icon: "Ticket" },
    { name: "PPOB", slug: "ppob", icon: "Receipt" },
    { name: "Produk Digital Lainnya", slug: "lainnya", icon: "Package" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  const gameCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "voucher-game" } });

  // --- Sample products: Mobile Legends ---
  const mlProducts = [
    { name: "86 Diamonds", cost: 19500, sell: 21000 },
    { name: "172 Diamonds", cost: 38500, sell: 41000 },
    { name: "257 Diamonds", cost: 57000, sell: 60500 },
    { name: "344 Diamonds", cost: 76000, sell: 80000 },
    { name: "429 Diamonds", cost: 95000, sell: 100000 },
    { name: "514 Diamonds", cost: 114000, sell: 120000 },
    { name: "706 Diamonds", cost: 152000, sell: 160000 },
    { name: "878 Diamonds", cost: 190000, sell: 200000 },
  ];

  for (const [i, p] of mlProducts.entries()) {
    const slug = `mobile-legends-${p.name.toLowerCase().replace(/\s+/g, "-")}`;
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        categoryId: gameCategory.id,
        providerId: providerMock.id,
        providerSku: `ML-${i + 1}`,
        name: `Mobile Legends - ${p.name}`,
        slug,
        costPrice: p.cost,
        sellPrice: p.sell,
        adminFee: 1000,
        requiresServerId: true,
        isActive: true,
      },
    });
  }

  // --- Admin user (DEVELOPMENT ONLY — ganti password setelah deploy) ---
  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@santanic.dev" },
    update: {},
    create: {
      name: "Super Admin",
      username: "admin",
      email: "admin@santanic.dev",
      phone: "628110000000",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, balance: 0 },
  });

  // --- Default system settings ---
  const defaults: Record<string, string> = {
    site_name: "SANTANIC TOPUP & PPOB",
    maintenance_mode: "false",
    default_admin_fee: "1000",
    contact_telegram: "Yogzoffc",
    contact_whatsapp: "6283160763111",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.systemSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log("Seed selesai. Admin login: admin@santanic.dev / ChangeMe123! (WAJIB diganti).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
