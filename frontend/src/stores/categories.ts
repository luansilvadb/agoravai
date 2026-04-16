import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/v1/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        categories.value = result.data || [];
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  return { categories, loadCategories };
});
