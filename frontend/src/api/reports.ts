interface ReportHeader {
  tenantName: string;
  cnpj: string;
  period: {
    from: string;
    to: string;
  };
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  source: 'receivable' | 'payable';
  type: 'entrada' | 'saída';
  category: string | null;
  accumulatedBalance: number;
  createdAt: string;
  updatedAt: string;
}

interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ReportData {
  header: ReportHeader;
  initialBalance: number;
  finalBalance: number;
  data: Transaction[];
  pagination: ReportPagination;
}

interface ReportResponse {
  data: ReportData;
}

export async function getFinancialReport(
  from: string,
  to: string,
  page: number = 1,
  limit: number = 20
): Promise<ReportData> {
  const response = await fetch(
    `/api/v1/reports?from=${from}&to=${to}&page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar relatório: ${response.status}`);
  }

  const result: ReportResponse = await response.json();
  return result.data;
}