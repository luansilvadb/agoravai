<template>
  <div class="dashboard-container">
    <!-- Primeiro acesso - Mensagem de boas-vindas -->
    <div v-if="dashboardStore.isFirstTimeUser" class="welcome-section surface-card p-4 border-round">
      <div class="text-center mb-4">
        <i class="pi pi-star-fill text-yellow-500 text-4xl mb-3"></i>
        <h2 class="text-2xl font-bold text-900">🎉 Bem-vindo ao agora-vai!</h2>
        <p class="text-lg text-600 mt-2">Seu caixa está vazio. Vamos começar?</p>
      </div>
      
      <div class="text-center">
        <Button 
          label="➕ Adicionar primeira conta" 
          icon="pi pi-plus"
          class="p-button-lg p-button-primary"
          @click="openAccountForm"
        />
      </div>
    </div>
    
    <!-- Banner para usuários que não têm contas há 7 dias -->
    <div 
      v-else-if="!dashboardStore.hasRecentActivity && !dashboardStore.isFirstTimeUser" 
      class="info-banner surface-card p-3 border-round mb-4"
    >
      <div class="flex align-items-center">
        <i class="pi pi-info-circle text-blue-500 mr-2"></i>
        <span class="text-900">Parece que está tranquilo por aqui. Que tal adicionar uma conta?</span>
        <Button 
          label="Adicionar" 
          class="p-button-text ml-auto"
          @click="openAccountForm"
        />
      </div>
    </div>
    
    <!-- Seção de saldo -->
    <div class="balance-section surface-card p-4 border-round mb-4">
      <h3 class="text-sm uppercase text-500 font-medium mb-2">Saldo Atual</h3>
      <div 
        class="balance-value text-4xl font-bold"
        :class="dashboardStore.currentBalance < 0 ? 'text-red-500' : 'text-900'"
      >
        {{ formatCurrency(dashboardStore.currentBalance) }}
      </div>
    </div>
    
    <!-- Cards de estatísticas -->
    <div class="stats-grid grid mb-4">
      <div class="col-12 md:col-6">
        <div class="stats-card surface-card p-3 border-round">
          <h4 class="text-sm uppercase text-500 font-medium mb-1">Total Recebido</h4>
          <div class="text-xl font-semibold text-green-600">
            {{ formatCurrency(dashboardStore.stats.total_received) }}
          </div>
        </div>
      </div>
      <div class="col-12 md:col-6">
        <div class="stats-card surface-card p-3 border-round">
          <h4 class="text-sm uppercase text-500 font-medium mb-1">Total Pago</h4>
          <div class="text-xl font-semibold text-red-600">
            {{ formatCurrency(dashboardStore.stats.total_paid) }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Formulário de conta (em modo diálogo) -->
    <AccountForm 
      v-model="showAccountForm"
      @save="handleSaveAccount"
    />
    
    <!-- Toast para mensagens -->
    <Toast position="bottom-right" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboard';
import { useToast } from 'primevue/usetoast';
import AccountForm from '@/components/AccountForm.vue';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

// Store e toast
const dashboardStore = useDashboardStore();
const toast = useToast();

// Estados
const showAccountForm = ref(false);

// Funções
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const openAccountForm = () => {
  showAccountForm.value = true;
};

const handleSaveAccount = (formData: any) => {
  // Simular salvamento
  console.log('Conta salva:', formData);
  
  // Mostrar mensagem de sucesso para primeira conta
  if (dashboardStore.isFirstTimeUser) {
    toast.add({
      severity: 'success',
      summary: 'Sucesso!',
      detail: 'Sua primeira conta foi adicionada! Seu fluxo de caixa já começou 🚀',
      life: 5000
    });
    
    // Atualizar o estado para não mostrar mais a mensagem de boas-vindas
    dashboardStore.setFirstTimeUser(false);
  } else {
    toast.add({
      severity: 'success',
      summary: 'Sucesso!',
      detail: 'Conta adicionada com sucesso!',
      life: 3000
    });
  }
  
  // Fechar formulário
  showAccountForm.value = false;
  
  // Atualizar dados do dashboard
  dashboardStore.fetchDashboardData();
};

// Carregar dados ao montar o componente
onMounted(async () => {
  await dashboardStore.fetchDashboardData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 2rem;
}

.balance-section {
  margin-bottom: 1.5rem;
}

.balance-value {
  transition: color 2s ease;
}

.stats-grid {
  margin-bottom: 1.5rem;
}

.stats-card {
  height: 100%;
}

.info-banner {
  border-left: 4px solid var(--primary-color);
}
</style>