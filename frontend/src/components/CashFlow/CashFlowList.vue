<template>
  <div class="card">
    <Toolbar>
      <template #start>
        <h3>Fluxo de Caixa</h3>
      </template>
      <template #center>
        <div class="p-inputgroup" style="max-width: 400px;">
          <Calendar 
            v-model="dateRange" 
            selectionMode="range" 
            placeholder="Período" 
            dateFormat="dd/mm/yy"
            :showIcon="true"
          />
          <Button 
            label="Filtrar" 
            icon="pi pi-filter" 
            @click="applyFilters"
            :disabled="loading"
          />
        </div>
      </template>
      <template #end>
        <Button 
          label="Exportar" 
          icon="pi pi-download" 
          class="p-button-secondary"
          :disabled="loading"
        />
      </template>
    </Toolbar>

    <DataTable 
      :value="cashFlow" 
      :paginator="true" 
      :rows="rowsPerPage"
      :loading="loading"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rows-per-page-options="[10, 20, 50]"
      current-page-report-template="Mostrando {first} a {last} de {totalRecords}"
      @page="onPageChange"
    >
      <Column field="date" header="Data" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date) }}
        </template>
      </Column>
      <Column field="description" header="Descrição" sortable>
        <template #body="slotProps">
          {{ slotProps.data.description }}
        </template>
      </Column>
      <Column field="source" header="Tipo" sortable>
        <template #body="slotProps">
          <Tag 
            :value="getSourceLabel(slotProps.data.source)" 
            :severity="getSourceSeverity(slotProps.data.source)"
          />
        </template>
      </Column>
      <Column field="amount" header="Valor" sortable>
        <template #body="slotProps">
          <span :class="slotProps.data.amount >= 0 ? 'text-color-success' : 'text-color-danger'">
            {{ formatCurrency(slotProps.data.amount) }}
          </span>
        </template>
      </Column>
      <Column field="accumulatedBalance" header="Saldo Acumulado" sortable>
        <template #body="slotProps">
          <span :class="slotProps.data.accumulatedBalance >= 0 ? 'text-color-success' : 'text-color-danger'">
            {{ formatCurrency(slotProps.data.accumulatedBalance) }}
          </span>
        </template>
      </Column>
      <Column field="status" header="Status" sortable>
        <template #body="slotProps">
          <Tag 
            :value="getStatusLabel(slotProps.data.status)" 
            :severity="getStatusSeverity(slotProps.data.status)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Total de registros -->
    <div class="p-2 text-right" v-if="totalRecords > 0">
      <small>Total de registros: {{ totalRecords }}</small>
    </div>

    <!-- Resumo do saldo -->
    <div class="p-2 mt-3 border-top-1 surface-border" v-if="cashFlow.length > 0">
      <div class="grid">
        <div class="col-12 md:col-4">
          <div class="surface-card p-3 shadow-2">
            <div class="text-900 font-medium text-lg">Saldo Atual</div>
            <div :class="currentBalance >= 0 ? 'text-color-success' : 'text-color-danger'" class="mt-2 text-xl">
              {{ formatCurrency(currentBalance) }}
            </div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-card p-3 shadow-2">
            <div class="text-900 font-medium text-lg">Receitas</div>
            <div class="text-color-success mt-2 text-xl">
              {{ formatCurrency(incomeTotal) }}
            </div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-card p-3 shadow-2">
            <div class="text-900 font-medium text-lg">Despesas</div>
            <div class="text-color-danger mt-2 text-xl">
              {{ formatCurrency(expenseTotal) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Calendar from 'primevue/calendar';
import { getCashFlow, getCurrentBalance } from '@/api/cashFlow';

// Stores
const toast = useToast();

// Reactive data
const cashFlow = ref<any[]>([]);
const loading = ref(true);
const totalRecords = ref(0);
const currentPage = ref(1);
const rowsPerPage = ref(20);
const currentBalance = ref(0);
const incomeTotal = ref(0);
const expenseTotal = ref(0);

// Filtros
const dateRange = ref<[Date, Date] | null>(null);

// Methods
const loadCashFlow = async () => {
  try {
    loading.value = true;
    
    // Obter parâmetros de filtro
    let params: any = { 
      page: currentPage.value, 
      limit: rowsPerPage.value 
    };
    
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      params.dateFrom = formatDateForApi(dateRange.value[0]);
      params.dateTo = formatDateForApi(dateRange.value[1]);
    }
    
    const response = await getCashFlow(params);
    
    cashFlow.value = response.data;
    totalRecords.value = response.pagination.total;
    
    // Calcular totais
    calculateTotals(response.data);
  } catch (error: any) {
    console.error('Erro ao carregar fluxo de caixa:', error);
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao carregar o fluxo de caixa',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

const loadCurrentBalance = async () => {
  try {
    const response = await getCurrentBalance();
    currentBalance.value = response.data.balance;
  } catch (error: any) {
    console.error('Erro ao carregar saldo atual:', error);
  }
};

const formatDateForApi = (date: Date) => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const applyFilters = async () => {
  currentPage.value = 1; // Voltar para a primeira página ao aplicar filtros
  await loadCashFlow();
};

const onPageChange = async (event: any) => {
  currentPage.value = event.page + 1; // PrimeVue usa index baseado em 0
  await loadCashFlow();
};

const calculateTotals = (data: any[]) => {
  let income = 0;
  let expense = 0;
  
  data.forEach(item => {
    if (item.amount > 0) {
      income += item.amount;
    } else {
      expense += item.amount;
    }
  });
  
  incomeTotal.value = income;
  expenseTotal.value = Math.abs(expense); // Mostrar como valor positivo
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

const getSourceLabel = (source: string) => {
  switch (source) {
    case 'receivable':
      return 'Recebimento';
    case 'payable':
      return 'Pagamento';
    default:
      return source;
  }
};

const getSourceSeverity = (source: string) => {
  switch (source) {
    case 'receivable':
      return 'success'; // Verde para recebimentos
    case 'payable':
      return 'danger'; // Vermelho para pagamentos
    default:
      return 'info';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'received':
      return 'Recebido';
    case 'paid':
      return 'Pago';
    case 'overdue':
      return 'Vencido';
    case 'pending':
      return 'Pendente';
    default:
      return status;
  }
};

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'received':
      return 'success';
    case 'paid':
      return 'success';
    case 'overdue':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'info';
  }
};

// Lifecycle
onMounted(async () => {
  await loadCashFlow();
  await loadCurrentBalance();
});
</script>

<style scoped>
::v-deep(.p-toolbar) {
  justify-content: space-between;
}

.text-color-success {
  color: var(--green-500);
}

.text-color-danger {
  color: var(--red-500);
}

.p-inputgroup {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
