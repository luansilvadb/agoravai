import axios from 'axios';

const API_BASE_URL = '/api/v1';

/**
 * Obtém o fluxo de caixa do tenant
 * @param params Parâmetros de paginação e filtros
 * @returns Promise com os dados do fluxo de caixa
 */
export const getCashFlow = async (params?: {
  page?: number;
  limit?: number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
}) => {
  const response = await axios.get(`${API_BASE_URL}/cashflow`, { params });
  return response.data;
};

/**
 * Obtém o saldo atual do tenant
 * @returns Promise com o saldo atual
 */
export const getCurrentBalance = async () => {
  const response = await axios.get(`${API_BASE_URL}/cashflow/balance`);
  return response.data;
};

/**
 * Obtém o saldo acumulado até uma data específica
 * @param date Data no formato YYYY-MM-DD
 * @returns Promise com o saldo acumulado até a data
 */
export const getBalanceUntil = async (date: string) => {
  const response = await axios.get(`${API_BASE_URL}/cashflow/balance-until/${date}`);
  return response.data;
};
