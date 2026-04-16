<template>
  <div class="card">
    <Toolbar>
      <template #start>
        <h3>Contas a Receber</h3>
      </template>
      <template #center>
        <!-- Filtros -->
        <div class="p-inputgroup flex-1" style="max-width: 600px;">
          <Calendar 
            v-model="filters.dateFrom" 
            placeholder="Data inicial" 
            dateFormat="dd/mm/yy"
            :showIcon="true"
          />
          <Calendar 
            v-model="filters.dateTo" 
            placeholder="Data final" 
            dateFormat="dd/mm/yy"
            :showIcon="true"
          />
          <Dropdown 
            v-model="filters.status" 
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos os status"
            style="min-width: 150px;"
          />
          <Button 
            label="Filtrar" 
            icon="pi pi-filter" 
            @click="applyFilters"
            :disabled="loading"
          />
          <Button 
            label="Limpar" 
            icon="pi pi-times" 
            class="p-button-secondary" 
            @click="clearFilters"
            :disabled="loading"
          />
        </div>
      </template>
      <template #end>
        <Button 
          label="Nova Conta" 
          icon="pi pi-plus" 
          class="p-button-success"
          @click="openNewAccount"
        />
      </template>
    </Toolbar>

    <DataTable 
      :value="accounts" 
      :paginator="true" 
      :rows="rowsPerPage"
      :loading="loading"
      v-model:selection="selectedAccounts"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rows-per-page-options="[10, 20, 50]"
      current-page-report-template="Mostrando {first} a {last} de {totalRecords}"
      @page="onPageChange"
    >
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column field="description" header="Descrição" sortable>
        <template #body="slotProps">
          {{ slotProps.data.description }}
        </template>
      </Column>
      <Column field="amount" header="Valor" sortable>
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.amount) }}
        </template>
      </Column>
      <Column field="dueDate" header="Vencimento" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.dueDate) }}
        </template>
      </Column>
      <Column field="categoryName" header="Categoria" sortable>
        <template #body="slotProps">
          {{ slotProps.data.categoryName || 'Sem categoria' }}
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
      <Column header="Ações" headerStyle="width: 10rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
        <template #body="slotProps">
          <Button
            v-tooltip.top="'Editar'"
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success mr-2"
            @click="editAccount(slotProps.data)"
            :disabled="loading"
          />
          <Button
            v-tooltip.top="'Marcar como recebida'"
            icon="pi pi-check"
            class="p-button-rounded p-button-info mr-2"
            @click="confirmReceiveAccount(slotProps.data)"
            :disabled="slotProps.data.status === 'received' || loading"
          />
          <Button
            v-tooltip.top="'Excluir'"
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="confirmDeleteAccount(slotProps.data)"
            :disabled="loading"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Total de registros -->
    <div class="p-2 text-right" v-if="totalRecords > 0">
      <small>Total de registros: {{ totalRecords }}</small>
    </div>

    <!-- Modal para formulário de conta -->
    <AccountReceivableForm
      v-model="showAccountModal"
      :isEditing="isEditing"
      :accountData="selectedAccount"
      @created="onAccountCreated"
      @updated="onAccountUpdated"
    />

    <!-- Confirmação de exclusão -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useUserStore } from '@/stores/user';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';
import vTooltip from 'primevue/tooltip';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import AccountReceivableForm from './AccountReceivableForm.vue';
import { getReceivableAccounts, deleteReceivableAccount, markAsReceived } from '@/api/accountsReceivable';

// Stores
const userStore = useUserStore();
const toast = useToast();
const confirm = useConfirm();

// Reactive data
const accounts = ref<any[]>([]);
const loading = ref(true);
const selectedAccounts = ref<any[]>([]);
const showAccountModal = ref(false);
const isEditing = ref(false);
const selectedAccount = ref<any>(null);
const totalRecords = ref(0);
const currentPage = ref(1);
const rowsPerPage = ref(20);

// Filtros
const filters = ref({
  dateFrom: null as Date | null,
  dateTo: null as Date | null,
  status: null as string | null
});

// Opções de status
const statusOptions = [
  { label: 'Pendente', value: 'pending' },
  { label: 'Recebida', value: 'received' },
  { label: 'Vencida', value: 'overdue' }
];

// Methods
const loadAccounts = async () => {
  try {
    loading.value = true;
    
    // Converter datas para o formato esperado pela API
    const dateFrom = filters.value.dateFrom ? formatDateForApi(filters.value.dateFrom) : undefined;
    const dateTo = filters.value.dateTo ? formatDateForApi(filters.value.dateTo) : undefined;
    
    const response = await getReceivableAccounts({ 
      page: currentPage.value, 
      limit: rowsPerPage.value,
      dateFrom,
      dateTo,
      status: filters.value.status as 'pending' | 'overdue' | 'received' | undefined
    });
    
    accounts.value = response.data;
    totalRecords.value = response.pagination.total;
  } catch (error: any) {
    console.error('Erro ao carregar contas a receber:', error);
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao carregar as contas a receber',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

const formatDateForApi = (date: Date) => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const applyFilters = async () => {
  currentPage.value = 1; // Voltar para a primeira página ao aplicar filtros
  await loadAccounts();
};

const clearFilters = async () => {
  filters.value = {
    dateFrom: null,
    dateTo: null,
    status: null
  };
  currentPage.value = 1;
  await loadAccounts();
};

const onPageChange = async (event: any) => {
  currentPage.value = event.page + 1; // PrimeVue usa index baseado em 0
  await loadAccounts();
};

const openNewAccount = () => {
  isEditing.value = false;
  selectedAccount.value = null;
  showAccountModal.value = true;
};

const editAccount = (account: any) => {
  isEditing.value = true;
  selectedAccount.value = { ...account };
  showAccountModal.value = true;
};

const confirmDeleteAccount = (account: any) => {
  confirm.require({
    message: `Tem certeza que deseja excluir a conta "${account.description}"?`,
    header: 'Confirmação',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteAccountAction(account.id);
    }
  });
};

const deleteAccountAction = async (accountId: number) => {
  try {
    await deleteReceivableAccount(accountId);
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Conta excluída',
      life: 3000
    });
    // Recarregar a lista
    await loadAccounts();
  } catch (error: any) {
    console.error('Erro ao excluir conta a receber:', error);
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: error.response?.data?.error?.message || 'Falha ao excluir a conta',
      life: 5000
    });
  }
};

const confirmReceiveAccount = (account: any) => {
  confirm.require({
    message: `Tem certeza que deseja marcar a conta "${account.description}" como recebida?`,
    header: 'Confirmação',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      receiveAccountAction(account.id);
    }
  });
};

const receiveAccountAction = async (accountId: number) => {
  try {
    await markAsReceived(accountId);
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Recebimento registrado! 💰',
      life: 3000
    });
    // Recarregar a lista
    await loadAccounts();
  } catch (error: any) {
    console.error('Erro ao marcar conta como recebida:', error);
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: error.response?.data?.error?.message || 'Falha ao marcar conta como recebida',
      life: 5000
    });
  }
};

const onAccountCreated = (newAccount: any) => {
  accounts.value.unshift(newAccount);
  showAccountModal.value = false;
};

const onAccountUpdated = (updatedAccount: any) => {
  const index = accounts.value.findIndex(acc => acc.id === updatedAccount.id);
  if (index !== -1) {
    accounts.value[index] = updatedAccount;
  }
  showAccountModal.value = false;
};

const formatCurrency = (value: number) => {
  if (!value) return 'R$ 0,00';
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

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'received':
      return 'Recebida';
    case 'overdue':
      return 'Vencida';
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
  await loadAccounts();
});
</script>

<style scoped>
::v-deep(.p-toolbar) {
  justify-content: space-between;
}

.p-inputgroup {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.flex-1 {
  flex: 1;
}
</style>
