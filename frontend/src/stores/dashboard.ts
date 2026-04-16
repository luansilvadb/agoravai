import { defineStore } from 'pinia';
import { ref } from 'vue';

interface DashboardStats {
  total_received: number;
  total_paid: number;
}

interface DashboardData {
  is_first_time_user: boolean;
  has_recent_activity: boolean;
  current_balance: number;
  stats: DashboardStats;
}

export const useDashboardStore = defineStore('dashboard', () => {
  // Estado
  const isLoading = ref(false);
  const isFirstTimeUser = ref(false);
  const hasRecentActivity = ref(false);
  const currentBalance = ref(0);
  const stats = ref<DashboardStats>({
    total_received: 0,
    total_paid: 0,
  });

  // Ações
  const setFirstTimeUser = (value: boolean) => {
    isFirstTimeUser.value = value;
  };

  const setHasRecentActivity = (value: boolean) => {
    hasRecentActivity.value = value;
  };

  const setCurrentBalance = (value: number) => {
    currentBalance.value = value;
  };

  const setStats = (value: DashboardStats) => {
    stats.value = value;
  };

  const fetchDashboardData = async () => {
    try {
      isLoading.value = true;
      
      // Chamada real à API
      const response = await fetch('/api/v1/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      
      const result = await response.json();
      const data = result.data;
      
      // Atualizar estado com dados da API
      isFirstTimeUser.value = data.is_first_time_user;
      hasRecentActivity.value = data.has_recent_activity;
      currentBalance.value = data.current_balance;
      setStats(data.stats);
      
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      // Em caso de erro, podemos manter os valores antigos ou definir valores padrão
      // Dependendo dos requisitos de tratamento de erro
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // Estado
    isLoading,
    isFirstTimeUser,
    hasRecentActivity,
    currentBalance,
    stats,
    
    // Ações
    setFirstTimeUser,
    setHasRecentActivity,
    setCurrentBalance,
    setStats,
    fetchDashboardData,
  };
});