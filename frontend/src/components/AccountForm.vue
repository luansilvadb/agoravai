<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    :header="isEditMode ? 'Editar Conta' : 'Nova Conta'" 
    :style="{ width: '500px' }"
    @hide="onHide"
  >
    <form @submit.prevent="onSubmit">
      <div class="field">
        <label for="description" class="block">Descrição *</label>
        <InputText 
          id="description" 
          v-model="form.description" 
          class="w-full" 
          :class="{ 'p-invalid': errors.description }"
          placeholder="Ex: Aluguel, Compra de materiais"
        />
        <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
      </div>

      <div class="field">
        <label for="amount" class="block">Valor *</label>
        <InputNumber 
          id="amount" 
          v-model="form.amount" 
          mode="currency" 
          currency="BRL" 
          locale="pt-BR"
          class="w-full"
          :class="{ 'p-invalid': errors.amount }"
        />
        <small v-if="errors.amount" class="p-error">{{ errors.amount }}</small>
      </div>

      <div class="field">
        <label for="dueDate" class="block">Data de Vencimento *</label>
        <Calendar 
          id="dueDate" 
          v-model="form.dueDate" 
          class="w-full"
          :class="{ 'p-invalid': errors.dueDate }"
          :minDate="today"
        />
        <small v-if="errors.dueDate" class="p-error">{{ errors.dueDate }}</small>
      </div>

      <div class="field">
        <label for="category" class="block">Categoria *</label>
        <AutoComplete
          id="category"
          v-model="form.category"
          :suggestions="filteredCategories"
          @complete="searchCategory($event)"
          class="w-full"
          :class="{ 'p-invalid': errors.category }"
          placeholder="Selecione ou digite uma categoria"
        />
        <small v-if="errors.category" class="p-error">{{ errors.category }}</small>
      </div>

      <div class="field">
        <label for="type" class="block">Tipo *</label>
        <SelectButton
          id="type"
          v-model="form.type"
          :options="accountTypes"
          optionLabel="label"
          optionValue="value"
          class="w-full"
          :class="{ 'p-invalid': errors.type }"
        />
        <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
      </div>

      <div class="flex justify-content-end gap-2 mt-4">
        <Button 
          type="button" 
          label="Cancelar" 
          severity="secondary" 
          @click="onHide"
        />
        <Button 
          type="submit" 
          :label="isEditMode ? 'Atualizar' : 'Criar'"
          :loading="loading"
          :disabled="loading"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import AutoComplete from 'primevue/autocomplete';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';

interface Props {
  modelValue: boolean;
  initialData?: AccountFormData | null;
}

interface AccountFormData {
  id?: number;
  description: string;
  amount: number;
  dueDate: Date;
  category: string;
  type: 'payable' | 'receivable';
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', data: AccountFormData): void;
  (e: 'hide'): void;
}

const props = withDefaults(defineProps<Props>(), {
  initialData: null
});

const emit = defineEmits<Emits>();

// Referências
const visible = ref(props.modelValue);
const loading = ref(false);
const today = new Date();

// Tipos de conta
const accountTypes = [
  { label: 'A Pagar', value: 'payable' },
  { label: 'A Receber', value: 'receivable' }
];

// Formulário
const form = reactive<AccountFormData>({
  description: '',
  amount: 0,
  dueDate: new Date(),
  category: '',
  type: 'payable'
});

// Erros de validação
const errors = reactive({
  description: '',
  amount: '',
  dueDate: '',
  category: '',
  type: ''
});

// Categorias
const allCategories = ref<string[]>([]);
const filteredCategories = ref<string[]>([]);

// Modo de edição
const isEditMode = computed(() => !!props.initialData);

// Watch para sincronizar visibilidade
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue;
  if (newValue && props.initialData) {
    // Carregar dados iniciais se for modo de edição
    Object.assign(form, props.initialData);
  } else if (newValue) {
    // Resetar formulário se for modo de criação
    resetForm();
  }
});

// Watch para atualizar o modelo pai
watch(visible, (newValue) => {
  emit('update:modelValue', newValue);
});

// Funções
const resetForm = () => {
  form.description = '';
  form.amount = 0;
  form.dueDate = new Date();
  form.category = '';
  form.type = 'payable';
  clearErrors();
};

const clearErrors = () => {
  errors.description = '';
  errors.amount = '';
  errors.dueDate = '';
  errors.category = '';
  errors.type = '';
};

const validate = (): boolean => {
  clearErrors();
  let isValid = true;

  if (!form.description.trim()) {
    errors.description = 'Descrição é obrigatória';
    isValid = false;
  }

  if (form.amount <= 0) {
    errors.amount = 'Valor deve ser maior que zero';
    isValid = false;
  }

  if (!form.dueDate) {
    errors.dueDate = 'Data de vencimento é obrigatória';
    isValid = false;
  }

  if (!form.category.trim()) {
    errors.category = 'Categoria é obrigatória';
    isValid = false;
  }

  if (!form.type) {
    errors.type = 'Tipo é obrigatório';
    isValid = false;
  }

  return isValid;
};

const onSubmit = async () => {
  if (!validate()) return;

  loading.value = true;
  try {
    // Emitir evento de salvamento
    emit('save', { ...form });
    
    // Fechar o modal após salvar
    setTimeout(() => {
      visible.value = false;
    }, 300);
  } catch (error) {
    console.error('Erro ao salvar conta:', error);
  } finally {
    loading.value = false;
  }
};

const onHide = () => {
  visible.value = false;
  emit('hide');
};

const searchCategory = (event: { query: string }) => {
  // Simular busca de categorias
  const query = event.query.toLowerCase();
  filteredCategories.value = allCategories.value.filter(cat => 
    cat.toLowerCase().includes(query)
  );
};

// Inicializar categorias (simulado)
allCategories.value = [
  'Aluguel', 'Energia', 'Telefone', 'Matéria-prima', 
  'Salários', 'Impostos', 'Vendas', 'Serviços'
];
</script>