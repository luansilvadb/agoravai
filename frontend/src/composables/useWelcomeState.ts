import { computed } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';

/**
 * Composable para gerenciar o estado de boas-vindas do dashboard
 */
export const useWelcomeState = () => {
  const dashboardStore = useDashboardStore();

  // Calcula se deve mostrar o estado de boas-vindas
  const shouldShowWelcome = computed(() => {
    return dashboardStore.isFirstTimeUser;
  });

  // Calcula se deve mostrar o banner de atividade recente
  const shouldShowActivityBanner = computed(() => {
    return !dashboardStore.isFirstTimeUser && !dashboardStore.hasRecentActivity;
  });

  // Calcula se é um usuário retornando (não first-time e tem atividade recente)
  const isReturningUser = computed(() => {
    return !dashboardStore.isFirstTimeUser && dashboardStore.hasRecentActivity;
  });

  return {
    shouldShowWelcome,
    shouldShowActivityBanner,
    isReturningUser,
  };
};