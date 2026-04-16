<template>
  <Dialog 
    v-model:visible="displayModal" 
    :header="isEditing ? 'Editar Conta' : 'Nova Conta'" 
    :modal="true" 
    :closable="true"
    :style="{ width: '500px' }"
    @hide="resetForm"
  >
    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label for="description" class="font-bold mb-2">Descrição *</label>
        <InputText
          id="description"
          v-model="formData.description"
          type="text"
          class="w-full"
          :class="{ 'p-invalid': errors.description }"
          placeholder="Ex: Aluguel, Energia, Internet"
          :disabled="loading"
        />
        <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
      </div>

      <div class="field mt-3">
        <label for="amount" class="font-bold mb-2">Valor *</label>
        <InputNumber
          id="amount"
          v-model="formData.amount"
          mode="currency"
          currency="BRL"
          locale="pt-BR"
          class="w-full"
          :class="{ 'p-invalid': errors.amount }"
          :disabled="loading"
        />
        <small v-if="errors.amount" class="p-error">{{ errors.amount }}</small>
      </div>

      <div class="field mt-3">
        <label for="dueDate" class="font-bold mb-2">Data de Vencimento *</label>
        <Calendar
          id="dueDate"
          v-model="formData.dueDate"
          class="w-full"
          :class="{ 'p-invalid': errors.dueDate }"
          dateFormat="dd/mm/yy"
          :disabled="loading"
          :minDate="minDate"
        />
        <small v-if="errors.dueDate" class="p-error">{{ errors.dueDate }}</small>
      </div>

      <div class="field mt-3">
        <label for="category" class="font-bold mb-2">Categoria</label>
        <AutoComplete
          id="category"
          v-model="formData.categoryName"
          :suggestions="filteredCategories"
          @complete="searchCategories($event)"
          field="name"
          class="w-full"
          :class="{ 'p-invalid': errors.categoryId }"
          placeholder="Selecione ou digite uma categoria..."
          :dropdown="true"
          :disabled="loading"
          @item-select="onCategorySelect"
        >
          <template #empty>
            <div>Nenhuma categoria encontrada</div>
          </template>
          <template #item="slotProps: any">
            <div class="flex align-items-center">
              <div>{{ slotProps.item.name }} <span class="ml-2 text-sm text-gray-500">({{ slotProps.item.typeLabel }})</span></div>
            </div>
          </template>
        </AutoComplete>
        
        <!-- Botão para criar nova categoria (apenas para admins) -->
        <Button
          v-if="showCreateCategoryButton && userStore.user?.role === 'admin'"
          label="+ Criar categoria"
          class="mt-2 p-button-text p-button-secondary"
          @click="openCategoryCreation"
          :disabled="loading"
        />
        
        <small v-if="errors.categoryId" class="p-error">{{ errors.categoryId }}</small>
      </div>

      <div class="mt-6 flex justify-content-end gap-2">
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          class="p-button-secondary" 
          type="button" 
          @click="closeModal"
          :disabled="loading"
        />
        <Button 
          :label="isEditing ? 'Atualizar' : 'Criar'"
          icon="pi pi-check"
          type="submit"
          :loading="loading"
          :disabled="loading"
        />
      </div>
    </form>
  </Dialog>

  <!-- Modal para criação de categoria -->
  <Dialog 
    v-model:visible="showCategoryModal" 
    header="Criar Nova Categoria" 
    :modal="true" 
    :closable="true"
    :style="{ width: '400px' }"
    @hide="resetCategoryForm"
  >
    <form @submit.prevent="handleCreateCategory">
      <div class="field">
        <label for="categoryName" class="font-bold mb-2">Nome da Categoria *</label>
        <InputText
          id="categoryName"
          v-model="categoryForm.name"
          type="text"
          class="w-full"
          :class="{ 'p-invalid': categoryErrors.name }"
          placeholder="Ex: Combustível, Viagem"
          :disabled="categoryLoading"
        />
        <small v-if="categoryErrors.name" class="p-error">{{ categoryErrors.name }}</small>
      </div>

      <div class="field mt-3">
        <label for="categoryType" class="font-bold mb-2">Tipo *</label>
        <Dropdown
          id="categoryType"
          v-model="categoryForm.type"
          :options="categoryTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="Selecione o tipo"
          class="w-full"
          :class="{ 'p-invalid': categoryErrors.type }"
          :disabled="categoryLoading"
        />
        <small v-if="categoryErrors.type" class="p-error">{{ categoryErrors.type }}</small>
      </div>

      <div class="mt-6 flex justify-content-end gap-2">
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          class="p-button-secondary" 
          type="button" 
          @click="closeCategoryModal"
          :disabled="categoryLoading"
        />
        <Button 
          label="Criar"
          icon="pi pi-check"
          type="submit"
          :loading="categoryLoading"
          :disabled="categoryLoading"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { useCategoryStore } from '@/stores/categories';
import { useUserStore } from '@/stores/user';
import { createAccount, updateAccount } from '@/api/accountsPayable';

// Props
interface Props {
  modelValue: boolean;
  isEditing?: boolean;
  accountData?: any;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  accountData: undefined
});

// Emit
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'created': [account: any];
  'updated': [account: any];
}>();

// Stores
const categoryStore = useCategoryStore();
const userStore = useUserStore();
const toast = useToast();

// Reactive data
const displayModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const showCategoryModal = ref(false);
const loading = ref(false);
const categoryLoading = ref(false);

const formData = ref({
  description: '',
  amount: null as number | null,
  dueDate: null as Date | null,
  categoryId: null as number | null,
  categoryName: '' // Usado para autocomplete
});

const categoryForm = ref({
  name: '',
  type: 'expense' as 'expense' | 'income'
});

const errors = ref({
  description: '',
  amount: '',
  dueDate: '',
  categoryId: ''
});

const categoryErrors = ref({
  name: '',
  type: ''
});

const filteredCategories = ref<any[]>([]);
const showCreateCategoryButton = ref(false);

// Computed
const minDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() - 1); // Permitir datas a partir de ontem
  return date;
});

const categoryTypes = [
  { label: 'Despesa', value: 'expense' },
  { label: 'Receita', value: 'income' }
];

// Methods
const resetForm = () => {
  formData.value = {
    description: '',
    amount: null,
    dueDate: null,
    categoryId: null,
    categoryName: ''
  };
  errors.value = {
    description: '',
    amount: '',
    dueDate: '',
    categoryId: ''
  };
};

const resetCategoryForm = () => {
  categoryForm.value = {
    name: '',
    type: 'expense'
  };
  categoryErrors.value = {
    name: '',
    type: ''
  };
};

const searchCategories = (event: any) => {
  if (!event.query.trim()) {
    filteredCategories.value = categoryStore.categories.map(cat => ({
      ...cat,
      typeLabel: cat.type === 'expense' ? 'Despesa' : 'Receita'
    }));
  } else {
    filteredCategories.value = categoryStore.categories
      .filter(cat => cat.name.toLowerCase().includes(event.query.toLowerCase()))
      .map(cat => ({
        ...cat,
        typeLabel: cat.type === 'expense' ? 'Despesa' : 'Receita'
      }));
  }

  // Mostrar botão de criação se não houver correspondência exata
  const hasExactMatch = categoryStore.categories.some(
    cat => cat.name.toLowerCase() === event.query.toLowerCase()
  );
  showCreateCategoryButton.value = !hasExactMatch && event.query.trim().length > 0;
};

const onCategorySelect = (event: any) => {
  formData.value.categoryId = event.value.id;
  formData.value.categoryName = event.value.name;
  showCreateCategoryButton.value = false;
};

const openCategoryCreation = () => {
  categoryForm.value.name = formData.value.categoryName;
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
  resetCategoryForm();
};

const handleCreateCategory = async () => {
  categoryErrors.value = {
    name: '',
    type: ''
  };

  // Validação do formulário de categoria
  if (!categoryForm.value.name.trim()) {
    categoryErrors.value.name = 'Nome é obrigatório';
    return;
  }

  if (!categoryForm.value.type) {
    categoryErrors.value.type = 'Tipo é obrigatório';
    return;
  }

  categoryLoading.value = true;

  try {
    // Aqui deveria chamar a API para criar a categoria
    // Por enquanto, simulando sucesso
    const newCategory = {
      id: Date.now(), // ID temporário
      name: categoryForm.value.name,
      type: categoryForm.value.type,
      created_at: new Date().toISOString(),
      deleted_at: null
    };

    // Adicionando à store (em produção, deveria ser adicionado via API)
    // categoryStore.addCategory(newCategory); // descomentar quando a API de categorias estiver pronta
    
    // Atualizar o formulário principal com a nova categoria
    formData.value.categoryId = newCategory.id;
    formData.value.categoryName = newCategory.name;
    
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: `Categoria "${newCategory.name}" criada`,
      life: 3000
    });
    
    closeCategoryModal();
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error);
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: error.message || 'Falha ao criar categoria',
      life: 5000
    });
  } finally {
    categoryLoading.value = false;
  }
};

const validateForm = (): boolean => {
  errors.value = {
    description: '',
    amount: '',
    dueDate: '',
    categoryId: ''
  };

  let isValid = true;

  if (!formData.value.description?.trim()) {
    errors.value.description = 'Descrição é obrigatória';
    isValid = false;
  }

  if (formData.value.amount === null || formData.value.amount <= 0) {
    errors.value.amount = 'O valor deve ser um número positivo';
    isValid = false;
  }

  if (!formData.value.dueDate) {
    errors.value.dueDate = 'Data de vencimento é obrigatória';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    let account;
    
    if (props.isEditing && props.accountData?.id) {
      // Atualizar conta existente
      account = await updateAccount(props.accountData.id, {
        description: formData.value.description,
        amount: formData.value.amount,
        dueDate: formData.value.dueDate.toISOString(),
        categoryId: formData.value.categoryId
      });
      
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Conta atualizada!',
        life: 3000
      });
      
      emit('updated', account.data);
    } else {
      // Criar nova conta
      account = await createAccount({
        description: formData.value.description,
        amount: formData.value.amount,
        dueDate: formData.value.dueDate.toISOString(),
        categoryId: formData.value.categoryId
      });
      
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Conta a pagar criada!',
        life: 3000
      });
      
      emit('created', account.data);
    }
    
    closeModal();
  } catch (error: any) {
    console.error('Erro ao salvar conta:', error);
    
    if (error.response?.data?.error) {
      const errorMsg = error.response.data.error.message;
      toast.add({
        severity: 'error',
        summary: 'Erro',
        detail: errorMsg,
        life: 5000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao salvar a conta',
        life: 5000
      });
    }
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  displayModal.value = false;
};

// Watchers
watch(
  () => props.accountData,
  (newData) => {
    if (newData && props.isEditing) {
      formData.value = {
        description: newData.description || '',
        amount: newData.amount ? newData.amount / 100 : null, // Converter de centavos para reais
        dueDate: newData.dueDate ? new Date(newData.dueDate) : null,
        categoryId: newData.categoryId || null,
        categoryName: newData.categoryName || ''
      };
    }
  },
  { deep: true, immediate: true }
);

// Lifecycle
onMounted(() => {
  // Carregar categorias se ainda não estiverem carregadas
  if (categoryStore.categories.length === 0) {
    categoryStore.loadCategories();
  }
});
</script>

<style scoped>
.field {
  margin-bottom: 0.5rem;
}
</style>
