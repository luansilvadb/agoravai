import { PrismaClient } from '@prisma/client';
import { getFinancialStatement } from './dashboardService';

const prisma = new PrismaClient();

export async function getFinancialStatementForExport(tenantId: number, from?: string, to?: string) {
  try {
    const startDate = from ? new Date(from) : undefined;
    const endDate = to ? new Date(to) : undefined;

    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId,
        ...(startDate ? { date: { gte: startDate } } : {}),
        ...(endDate ? { date: { lte: endDate } } : {}),
      },
      orderBy: { date: 'asc' },
    });

    const accumulatedBalance = transactions.reduce((acc: number, transaction: { amount: number }) => {
      return acc + transaction.amount;
    }, 0);

    return {
      transactions,
      accumulatedBalance,
    };
  } catch (error) {
    throw new Error('Erro ao obter extrato financeiro');
  }
}
