import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getFinancialStatement(tenantId: number, from?: string, to?: string, page: number = 1, limit: number = 20) {
  try {
    const startDate = from ? new Date(from) : undefined;
    const endDate = to ? new Date(to) : undefined;

    const skip = (page - 1) * limit;

    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId,
        ...(startDate ? { date: { gte: startDate } } : {}),
        ...(endDate ? { date: { lte: endDate } } : {}),
      },
      orderBy: { date: 'asc' },
      skip,
      take: limit,
    });

    const totalTransactions = await prisma.transaction.count({
      where: {
        tenantId,
        ...(startDate ? { date: { gte: startDate } } : {}),
        ...(endDate ? { date: { lte: endDate } } : {}),
      },
    });

    const accumulatedBalance = transactions.reduce((acc: number, transaction: { amount: number }) => {
      return acc + transaction.amount;
    }, 0);

    return {
      transactions,
      accumulatedBalance,
      totalPages: Math.ceil(totalTransactions / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error('Erro ao obter extrato financeiro');
  }
}
