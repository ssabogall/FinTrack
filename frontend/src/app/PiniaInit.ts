// author: Santiago Gómez Ospina

// external imports
import { createPinia } from 'pinia';
import { watch } from 'vue';

// internal imports
import { userSeeder } from '@/modules/user/seeders/userseeder';
import { categorySeeder } from '@/modules/category/seeders/categoryseeder';
import { goalSeeder } from '@/modules/goal/seeders/goalseeder';
import { transactionSeeder } from '@/modules/transaction/seeders/transactionseeder';

export default class PiniaInit {
  public static init() {
    const pinia = createPinia();

    const savedState = localStorage.getItem('piniaState');

    if (savedState) {
      pinia.state.value = JSON.parse(savedState);
    } else {
      // initialize the state with the seeders
      pinia.state.value = {
        user: {
          users: userSeeder,
        },
        transaction: {
          transactions: transactionSeeder,
        },
        category: {
          categories: categorySeeder,
        },
        goal: {
          goals: goalSeeder,
        },
      };

      // save the initial state to localStorage
      localStorage.setItem('piniaState', JSON.stringify(pinia.state.value));
    }

    // auth state is always rehydrated from backend via AuthService.bootstrap()
    pinia.state.value.auth = { currentUser: null };

    // watch for changes and save to localStorage

    watch(
      pinia.state,

      (state) => {
        localStorage.setItem('piniaState', JSON.stringify(state));
      },

      { deep: true },
    );

    return pinia;
  }
}
