import axios from 'axios';

const API_BASE_URL = '/api/v1';

/**
 * Cria uma nova conta a pagar
 * @param accountData Dados da conta a pagar
 * @returns Promise com os dados da conta criada
 */
export const createAccount = async (accountData: {
  description: string;
  amount: number;
  dueDate: string; // ISO string format
  categoryId?: number;
}) => {
  // Converter o amount para centavos (inteiro)
  const amountInCents = Math.round(accountData.amount * 100);
  
  const response = await axios.post(`${API_BASE_URL}/accounts-payable`, {
    ...accountData,
    amount: amountInCents
  });
  
  return response.data;
};

/**
 * Obtém todas as contas a pagar do tenant com filtros opcionais
 * @param params Parâmetros de paginação e filtros
 * @returns Promise com os dados das contas
 */
export const getAccounts = async (params?: {
  page?: number;
  limit?: number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  status?: 'pending' | 'paid' | 'overdue';
}) => {
  const response = await axios.get(`${API_BASE_URL}/accounts-payable`, { params });
  return response.data;
};

/**
 * Obtém uma conta a pagar específica
 * @param accountId ID da conta
 * @returns Promise com os dados da conta
 */
export const getAccountById = async (accountId: number) => {
  const response = await axios.get(`${API_BASE_URL}/accounts-payable/${accountId}`);
  return response.data;
};

/**
 * Atualiza uma conta a pagar
 * @param accountId ID da conta a ser atualizada
 * @param accountData Dados atualizados da conta
 * @returns Promise com os dados da conta atualizada
 */
export const updateAccount = async (accountId: number, accountData: {
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
  
  const response = await axios.put(`${API_BASE_URL}/accounts-payable/${accountId}`, processedData);
  return response.data;
};

/**
 * Marca uma conta a pagar como paga
 * @param accountId ID da conta a ser marcada como paga
 * @returns Promise com os dados da conta atualizada
 */
export const markAsPaid = async (accountId: number) => {
  const response = await axios.patch(`${API_BASE_URL}/accounts-payable/${accountId}/pay`);
  return response.data;
};

/**
 * Exclui (soft delete) uma conta a pagar
 * @param accountId ID da conta a ser excluída
 * @returns Promise vazia
 */
export const deleteAccount = async (accountId: number) => {
  const response = await axios.delete(`${API_BASE_URL}/accounts-payable/${accountId}`);
  return response.data;
};
