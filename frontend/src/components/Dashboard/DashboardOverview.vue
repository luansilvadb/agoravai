<template>
  <div class="grid">
    <!-- Card de Saldo Atual -->
    <div class="col-12 md:col-6">
      <div class="surface-card p-4 shadow-2 border-round">
        <div class="text-900 font-medium text-lg mb-3">Saldo Atual</div>
        <div 
          :class="currentBalance >= 0 ? 'text-900' : 'text-red-500'" 
          class="text-4xl font-bold"
        >
          {{ formatCurrency(currentBalance) }}
        </div>
        <div class="mt-3">
          <span 
            :class="{
              'bg-green-100 text-green-800': currentBalance >= 0,
              'bg-red-100 text-red-800': currentBalance < 0
            }" 
            class="inline-flex align-items-center px-2 py-1 border-round-xl"
          >
            <i :class="currentBalance >= 0 ? 'pi-arrow-up' : 'pi-arrow-down'" class="mr-1"></i>
            <span v-if="currentBalance >= 0">Positivo</span>
            <span v-else>Negativo</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Card de Contas a Vencer -->
    <div class="col-12 md:col-6">
      <div class="surface-card p-4 shadow-2 border-round">
        <div class="flex justify-content-between align-items-start">
          <div>
            <div class="text-900 font-medium text-lg mb-3">Contas a Vencer</div>
            <div 
              :class="{
                'bg-red-100 text-red-800': upcomingBills.hasBills && upcomingBills.count > 3,
                'bg-yellow-100 text-yellow-800': upcomingBills.hasBills && upcomingBills.count <= 3,
                'bg-green-100 text-green-800': !upcomingBills.hasBills
              }" 
              class="inline-flex align-items-center px-3 py-2 border-round-xl"
            >
              <i :class="{
                'pi-exclamation-triangle': upcomingBills.hasBills,
                'pi-check-circle': !upcomingBills.hasBills
              }" class="mr-2"></i>
              <span class="font-medium">{{ upcomingBills.badgeMessage }}</span>
            </div>
          </div>
          <Button 
            icon="pi pi-arrow-right" 
            class="p-button-rounded p-button-text" 
            @click="goToAccountsPayable"
          />
        </div>
        
        <!-- Lista de contas a vencer -->
        <div class="mt-4" v-if="upcomingBills.hasBills">
          <div 
            v-for="bill in upcomingBills.bills.slice(0, 3)" 
            :key="bill.id" 
            class="flex align-items-center py-2 border-bottom-1 surface-border"
          >
            <div class="w-3rem h-3rem flex align-items-center justify-content-center bg-blue-50 border-round mr-3">
              <i class="pi" :class="bill.source === 'receivable' ? 'pi-arrow-down text-green-500' : 'pi-arrow-up text-red-500'"></i>
            </div>
            <div class="flex-auto">
              <div class="font-medium text-900">{{ bill.description }}</div>
              <div class="text-sm text-600">{{ formatDate(bill.dueDate) }}</div>
            </div>
            <div :class="bill.amount >= 0 ? 'text-color-success' : 'text-color-danger'" class="font-medium ml-2">
              {{ formatCurrency(bill.amount) }}
            </div>
          </div>
          
          <div v-if="upcomingBills.count > 3" class="text-center pt-3">
            <small>+{{ upcomingBills.count - 3 }} contas a vencer</small>
          </div>
        </div>
        
        <!-- Mensagem quando não há contas a vencer -->
        <div class="mt-4 text-center py-4" v-else>
          <i class="pi pi-check-circle text-green-500 text-3xl"></i>
          <div class="mt-2 text-700">Nenhuma conta vencendo esta semana</div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Card de Top Categorias -->
  <div class="col-12 mt-4" v-if="topCategories.hasTransactions || topCategories.expenses.length > 0 || topCategories.income.length > 0">
    <div class="surface-card p-4 shadow-2 border-round">
      <div class="text-900 font-medium text-lg mb-4">Top Categorias</div>
      
      <div class="grid">
        <!-- Top Despesas -->
        <div class="col-12 md:col-6">
          <div class="mb-3">
            <span class="text-700 font-medium">Despesas</span>
          </div>
          <div v-if="topCategories.expenses.length > 0">
            <div 
              v-for="(cat, index) in topCategories.expenses" 
              :key="'expense-' + cat.id"
              class="flex align-items-center py-2 border-bottom-1 surface-border"
            >
              <div class="w-2rem h-2rem flex align-items-center justify-content-center bg-red-50 border-round mr-3">
                <span class="text-red-500 font-medium">{{ index + 1 }}</span>
              </div>
              <div class="flex-auto">
                <div class="font-medium text-900">{{ cat.name }}</div>
              </div>
              <div class="text-red-500 font-medium">
                {{ cat.formatted }}
              </div>
            </div>
          </div>
          <div v-else class="text-500 text-sm">
            Nenhuma despesa este mês
          </div>
        </div>
        
        <!-- Top Receitas -->
        <div class="col-12 md:col-6">
          <div class="mb-3">
            <span class="text-700 font-medium">Receitas</span>
          </div>
          <div v-if="topCategories.income.length > 0">
            <div 
              v-for="(cat, index) in topCategories.income" 
              :key="'income-' + cat.id"
              class="flex align-items-center py-2 border-bottom-1 surface-border"
            >
              <div class="w-2rem h-2rem flex align-items-center justify-content-center bg-green-50 border-round mr-3">
                <span class="text-green-500 font-medium">{{ index + 1 }}</span>
              </div>
              <div class="flex-auto">
                <div class="font-medium text-900">{{ cat.name }}</div>
              </div>
              <div class="text-green-500 font-medium">
                {{ cat.formatted }}
              </div>
            </div>
          </div>
          <div v-else class="text-500 text-sm">
            Nenhuma receita este mês
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Mensagem quando não há transações no mês -->
  <div class="col-12 mt-4" v-else>
    <div class="surface-card p-4 shadow-2 border-round text-center">
      <i class="pi pi-inbox text-3xl text-500 mb-2"></i>
      <div class="text-700">Nenhuma transação este mês</div>
    </div>
  </div>
  
  <!-- Card de Resumo Financeiro -->
  <div class="col-12 mt-4">
    <div class="surface-card p-4 shadow-2 border-round">
      <div class="text-900 font-medium text-lg mb-4">Resumo Financeiro</div>
      
      <div class="grid">
        <div class="col-12 md:col-4">
          <div class="border-2 border-dashed surface-border border-round p-3 text-center">
            <div class="text-500 mb-1">Recebido (7 dias)</div>
            <div class="text-900 font-medium">{{ formatCurrency(summary.receivedLast7Days) }}</div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="border-2 border-dashed surface-border border-round p-3 text-center">
            <div class="text-500 mb-1">Pago (7 dias)</div>
            <div class="text-900 font-medium">{{ formatCurrency(summary.paidLast7Days) }}</div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="border-2 border-dashed surface-border border-round p-3 text-center">
            <div class="text-500 mb-1">Fluxo (7 dias)</div>
            <div :class="summary.netLast7Days >= 0 ? 'text-color-success' : 'text-color-danger'" class="text-900 font-medium">
              {{ formatCurrency(summary.netLast7Days) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

// Router
const router = useRouter();

// Reactive data
const currentBalance = ref(0);
const upcomingBills = ref({
  bills: [] as any[],
  count: 0,
  hasBills: false,
  badgeMessage: '',
  badgeSeverity: ''
});

const topCategories = ref({
  expenses: [] as Array<{ id: number; name: string; total: number; formatted: string }>,
  income: [] as Array<{ id: number; name: string; total: number; formatted: string }>,
  hasTransactions: false,
  emptyMessage: ''
});

const summary = ref({
  receivedLast7Days: 0,
  paidLast7Days: 0,
  netLast7Days: 0
});

// Methods
const loadDashboardData = async () => {
  try {
    const data = await getDashboardData();
    
    currentBalance.value = data.balance.current;
    upcomingBills.value = data.upcoming;
    topCategories.value = data.topCategories;
    
    // Calcular resumo financeiro (exemplo com dados fictícios por enquanto)
    // Na implementação real, isso viria do backend
    summary.value = {
      receivedLast7Days: data.balance.current * 0.1,
      paidLast7Days: data.balance.current * 0.05,
      netLast7Days: data.balance.current * 0.05
    };
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  }
};

const goToAccountsPayable = () => {
  router.push('/accounts-payable');
};

const formatCurrency = (value: number) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100); // Converter de centavos para reais
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// API fetch (inline for simplicity)
const getDashboardData = async () => {
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
  return result.data;
};

// Lifecycle
onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.text-color-success {
  color: var(--green-500);
}

.text-color-danger {
  color: var(--red-500);
}
</style>
