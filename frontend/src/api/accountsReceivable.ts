import axios from 'axios';

const API_BASE_URL = '/api/v1';

/**
 * Cria uma nova conta a receber
 * @param accountData Dados da conta a receber
 * @returns Promise com os dados da conta criada
 */
export const createReceivableAccount = async (accountData: {
  description: string;
  amount: number;
  dueDate: string; // ISO string format
  categoryId?: number;
}) => {
  // Converter o amount para centavos (inteiro)
  const amountInCents = Math.round(accountData.amount * 100);
  
  const response = await axios.post(`${API_BASE_URL}/accounts-receivable`, {
    ...accountData,
    amount: amountInCents
  });
  
  return response.data;
};

/**
 * Obtém todas as contas a receber do tenant com filtros opcionais
 * @param params Parâmetros de paginação e filtros
 * @returns Promise com os dados das contas
 */
export const getReceivableAccounts = async (params?: {
  page?: number;
  limit?: number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  status?: 'pending' | 'received' | 'overdue';
}) => {
  const response = await axios.get(`${API_BASE_URL}/accounts-receivable`, { params });
  return response.data;
};

/**
 * Obtém uma conta a receber específica
 * @param accountId ID da conta
 * @returns Promise com os dados da conta
 */
export const getReceivableAccountById = async (accountId: number) => {
  const response = await axios.get(`${API_BASE_URL}/accounts-receivable/${accountId}`);
  return response.data;
};

/**
 * Atualiza uma conta a receber
 * @param accountId ID da conta a ser atualizada
 * @param accountData Dados atualizados da conta
 * @returns Promise com os dados da conta atualizada
 */
export const updateReceivableAccount = async (accountId: number, accountData: {
  description?: string;
  amount?: number;
  dueDate?: string; // ISO string format
  categoryId?: number;
}) => {
  // Converter o amount para centavos (inteiro) se fornecido
  let processedData = { ...accountData };
  if (accountData.amount !== undefined) {
    processedData.amount = Math.round(accountData.amount * 100);
  }
  
  const response = await axios.put(`${API_BASE_URL}/accounts-receivable/${accountId}`, processedData);
  return response.data;
};

/**
 * Marca uma conta a receber como recebida
 * @param accountId ID da conta a ser marcada como recebida
 * @returns Promise com os dados da conta atualizada
 */
export const markAsReceived = async (accountId: number) => {
  const response = await axios.patch(`${API_BASE_URL}/accounts-receivable/${accountId}/receive`);
  return response.data;
};

/**
 * Exclui (soft delete) uma conta a receber
 * @param accountId ID da conta a ser excluída
 * @returns Promise vazia
 */
export const deleteReceivableAccount = async (accountId: number) => {
  const response = await axios.delete(`${API_BASE_URL}/accounts-receivable/${accountId}`);
  return response.data;
};
