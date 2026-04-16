<template>
  <div class="surface-ground px-4 py-5 md:px-6 lg:px-8">
    <div class="flex align-items-center justify-content-between mb-4">
      <div>
        <div class="text-900 font-medium text-3xl">Extrato Financeiro</div>
        <div class="text-500">Consulte suas transações por período</div>
      </div>
    </div>
  <div v-if="reportData" class="flex gap-2">
    <Button
      label="Exportar CSV"
      icon="pi pi-file-excel"
      @click="exportCSV"
      :loading="isExporting"
      class="p-button-success mr-2"
    />
  </div>
    
    <!-- Filtros de Período -->
    <div class="surface-card p-4 shadow-2 border-round mb-4">
      <div class="grid">
        <div class="col-12 md:col-4">
          <label class="block text-700 text-sm font-bold mb-2">Data Inicial</label>
          <input 
            type="date" 
            v-model="filters.from" 
            class="w-full p-inputtext"
            :max="filters.to"
          />
        </div>
        <div class="col-12 md:col-4">
          <label class="block text-700 text-sm font-bold mb-2">Data Final</label>
          <input 
            type="date" 
            v-model="filters.to" 
            class="w-full p-inputtext"
            :min="filters.from"
          />
        </div>
        <div class="col-12 md:col-4 flex align-items-end">
          <Button 
            label="Gerar Extrato" 
            icon="pi pi-search" 
            @click="generateReport"
            :loading="isLoading"
            class="w-full"
          />
        </div>
      </div>
    </div>
    
    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-content-center p-5">
      <ProgressSpinner />
    </div>
    
    <!-- Resultados -->
    <div v-else-if="reportData" class="surface-card p-4 shadow-2 border-round">
      <!-- Cabeçalho do Extrato -->
      <div class="border-bottom-1 surface-border pb-3 mb-3">
        <div class="text-900 font-medium text-xl">{{ reportData.header.tenantName }}</div>
        <div class="text-500 text-sm">CNPJ: {{ reportData.header.cnpj }}</div>
        <div class="text-500 text-sm">Período: {{ formatDate(reportData.header.period.from) }} - {{ formatDate(reportData.header.period.to) }}</div>
      </div>
      
      <!-- Saldos -->
      <div class="grid mb-4">
        <div class="col-12 md:col-4">
          <div class="surface-50 p-3 border-round">
            <div class="text-500 text-sm">Saldo Inicial</div>
            <div :class="reportData.initialBalance >= 0 ? 'text-900' : 'text-red-500'" class="text-xl font-medium">
              {{ formatCurrency(reportData.initialBalance) }}
            </div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-50 p-3 border-round">
            <div class="text-500 text-sm">Saldo Final</div>
            <div :class="reportData.finalBalance >= 0 ? 'text-900' : 'text-red-500'" class="text-xl font-medium">
              {{ formatCurrency(reportData.finalBalance) }}
            </div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-50 p-3 border-round">
            <div class="text-500 text-sm">Total de Transações</div>
            <div class="text-900 text-xl font-medium">{{ reportData.pagination.total }}</div>
          </div>
        </div>
      </div>
      
      <!-- Lista de Transações -->
      <div v-if="reportData.data.length > 0">
        <DataTable 
          :value="reportData.data" 
          :paginator="true" 
          :rows="20"
          :rowsPerPageOptions="[10, 20, 50]"
          v-model:filters="tableFilters"
          filterDisplay="menu"
          :globalFilterFields="['description', 'category']"
          class="p-datatable-sm"
          responsiveLayout="scroll"
        >
          <Column field="date" header="Data" sortable>
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
          </Column>
          <Column field="description" header="Descrição" sortable></Column>
          <Column field="category" header="Categoria" sortable></Column>
          <Column field="type" header="Tipo" sortable>
            <template #body="{ data }">
              <Tag 
                :value="data.type === 'entrada' ? 'Entrada' : 'Saída'" 
                :severity="data.type === 'entrada' ? 'success' : 'danger'"
              />
            </template>
          </Column>
          <Column field="amount" header="Valor" sortable>
            <template #body="{ data }">
              <span :class="data.type === 'entrada' ? 'text-green-500' : 'text-red-500'">
                {{ formatCurrency(data.amount) }}
              </span>
            </template>
          </Column>
          <Column field="accumulatedBalance" header="Saldo Acumulado" sortable>
            <template #body="{ data }">
              {{ formatCurrency(data.accumulatedBalance) }}
            </template>
          </Column>
        </DataTable>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-5">
        <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
        <div class="text-700">Nenhuma transação neste período</div>
      </div>
    </div>
    
    <!-- Estado Inicial -->
    <div v-else class="surface-card p-5 shadow-2 border-round text-center">
      <i class="pi pi-file-o text-4xl text-400 mb-3"></i>
      <div class="text-700">Selecione um período e clique em "Gerar Extrato"</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

const isLoading = ref(false);
const isExporting = ref(false);
const reportData = ref<any>(null);

const filters = ref({
  from: '',
  to: ''
});

const tableFilters = ref({
  global: { value: null, matchMode: 'contains' as any },
});

onMounted(() => {
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  filters.value.from = firstDay.toISOString().split('T')[0];
  filters.value.to = today.toISOString().split('T')[0];
});

const generateReport = async () => {
  if (!filters.value.from || !filters.value.to) {
    return;
  }
  
  isLoading.value = true;
  reportData.value = null;
  
  try {
    const response = await fetch(
      `/api/v1/reports?from=${filters.value.from}&to=${filters.value.to}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }
    
    const result = await response.json();
    reportData.value = result.data;
  } catch (error) {
    console.error('Erro ao gerar extrato:', error);
  } finally {
    isLoading.value = false;
  }
};

const exportCSV = async () => {
  if (!filters.value.from || !filters.value.to || !reportData.value) {
    return;
  }

  isExporting.value = true;

  try {
    const response = await fetch(
      `/api/v1/reports/export/csv?from=${filters.value.from}&to=${filters.value.to}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    // Download do arquivo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extrato_${filters.value.from}_ate_${filters.value.to}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
  } finally {
    isExporting.value = false;
  }
};

const formatCurrency = (value: number) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};
</script>