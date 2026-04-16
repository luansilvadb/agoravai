import { defineStore } from 'pinia';
import { ref } from 'vue';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  company_id: number;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);

  const setUser = (u: User | null) => {
    user.value = u;
  };

  return { user, setUser };
});
