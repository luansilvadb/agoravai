import express, { Request, Response } from 'express';
import { getFinancialStatementForExport } from '../services/reportService';
import { accessLogService } from '../services/accessLogService';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { attachTenant } from '../middleware/attachTenant';
import { requireRole } from '../middleware/rbac';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Endpoint para gerar relatório financeiro
router.get('/', authenticate, attachTenant, requireRole(['admin', 'operational', 'viewer']), validate(z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
}), async (req: Request, res: Response) => {
  const { from, to, page, limit } = req.query;
  const tenantId = req.tenantId;
  const userId = req.userId;
  const ipAddress = req.ip;

  try {
    const reportData = await getFinancialStatementForExport(tenantId, from, to);
    res.status(200).json(reportData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// Endpoint para exportar relatório financeiro em CSV
router.get('/export/csv', authenticate, attachTenant, requireRole(['admin', 'operational', 'viewer']), validate(z.object({
  from: z.string().optional(),
  to: z.string().optional(),
}), async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const tenantId = req.tenantId;
  const userId = req.userId;
  const ipAddress = req.ip;

  try {
    const reportData = await getFinancialStatementForExport(tenantId, from, to);
    const csvContent = generateCSV(reportData.transactions);

    // Registrar acesso ao CSV
    await accessLogService.logAccess(userId, 'export_csv', ipAddress);

    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=extrato.csv');
    res.status(200).send(`\uFEFF${csvContent}`);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao exportar relatório em CSV' });
  }
});

function generateCSV(data: Array<{ date: string, description: string, category: string, type: string, amount: number, accumulatedBalance: number }>) {
  const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Saldo Acumulado'];
  const rows = data.map(item => [
    item.date,
    item.description,
    item.category,
    item.type === 'income' ? 'Entrada' : 'Saída',
    item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    item.accumulatedBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  ].join(';'));

  return [headers.join(';'), ...rows].join('\n');
}

export default router;
