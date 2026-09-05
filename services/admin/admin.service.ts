import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAdminDashboardStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalTransactions,
    successTransactions,
    pendingTransactions,
    failedTransactions,
    todayTransactions,
    revenueAgg,
    costAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: "SUCCESS" } }),
    prisma.transaction.count({ where: { status: { in: ["PENDING", "PAID", "PROCESSING"] } } }),
    prisma.transaction.count({ where: { status: "FAILED" } }),
    prisma.transaction.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.transaction.aggregate({ where: { status: "SUCCESS" }, _sum: { totalAmount: true } }),
    prisma.transactionItem.findMany({
      where: { transaction: { status: "SUCCESS" } },
      include: { product: { select: { costPrice: true } } },
    }),
  ]);

  const totalOmzet = revenueAgg._sum.totalAmount ?? 0;
  const totalCost = costAgg.reduce((sum, item) => sum + item.product.costPrice * item.quantity, 0);
  const totalProfit = totalOmzet - totalCost;

  return {
    totalUsers,
    totalTransactions,
    successTransactions,
    pendingTransactions,
    failedTransactions,
    todayTransactions,
    totalOmzet,
    totalProfit,
  };
}

export async function getAdminUsers(filters: { search?: string; page?: number; pageSize?: number } = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 15;

  const where = filters.search
    ? {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" as const } },
          { email: { contains: filters.search, mode: "insensitive" as const } },
          { username: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { wallet: true, _count: { select: { transactions: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getAdminProducts(filters: { search?: string; page?: number; pageSize?: number } = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 15;

  const where = filters.search ? { name: { contains: filters.search, mode: "insensitive" as const } } : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, provider: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getAdminTransactions(filters: { status?: string; search?: string; page?: number; pageSize?: number } = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 15;

  const where = {
    ...(filters.status ? { status: filters.status as any } : {}),
    ...(filters.search ? { invoiceNumber: { contains: filters.search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { items: true, user: { select: { name: true, email: true } }, payment: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
