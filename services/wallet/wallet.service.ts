import "server-only";
import { prisma } from "@/lib/prisma";

export async function getWalletSummary(userId: string) {
  const [wallet, totalTransactions, successTransactions, pendingTransactions] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.transaction.count({ where: { userId } }),
    prisma.transaction.count({ where: { userId, status: "SUCCESS" } }),
    prisma.transaction.count({ where: { userId, status: { in: ["PENDING", "PAID", "PROCESSING"] } } }),
  ]);

  return {
    balance: wallet ? Number(wallet.balance) : 0,
    totalTransactions,
    successTransactions,
    pendingTransactions,
  };
}

export async function getUserTransactions(
  userId: string,
  filters: { status?: string; page?: number; pageSize?: number } = {}
) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;

  const where = {
    userId,
    ...(filters.status ? { status: filters.status as any } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
