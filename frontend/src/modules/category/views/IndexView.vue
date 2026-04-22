<!-- author: Lucas Higuita -->
<script setup lang="ts">
// external imports
import { computed, ref } from 'vue';

// internal imports
import CategoryCard from '@/modules/category/components/CategoryCard.vue';
import CategoryFormModal from '@/modules/category/components/CategoryFormModal.vue';
import CategorySummaryCards from '@/modules/category/components/CategorySummaryCards.vue';
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';
import { AuthService } from '@/modules/auth/services/AuthService';
import { CategoryService } from '@/modules/category/services/CategoryService';

// reactive variables
const showModal = ref(false);
const editingCategory = ref<CategoryInterface | null>(null);
const formError = ref<string | null>(null);
const formLoading = ref(false);
const deleteError = ref<string | null>(null);
const searchQuery = ref('');
const typeFilter = ref('all');

// selectors
const userCategories = computed((): CategoryInterface[] => CategoryService.getForCurrentUser(true));

const filteredCategories = computed((): CategoryInterface[] =>
  CategoryService.filter(userCategories.value, searchQuery.value, typeFilter.value),
);

const categorySummary = computed(() => CategoryService.getSummary(userCategories.value));

const totalCount = computed((): number => categorySummary.value.total);
const expenseCount = computed((): number => categorySummary.value.expense);
const incomeCount = computed((): number => categorySummary.value.income);

const currentUserId = computed((): number | null => AuthService.getCurrentUser()?.id ?? null);

const expenseCategorySlices = computed((): { name: string; amount: number; color: string }[] =>
  currentUserId.value ? CategoryService.getExpenseDistribution(currentUserId.value) : [],
);

const modalInitialValues = computed(() => {
  if (!editingCategory.value) return undefined;
  return {
    name: editingCategory.value.name,
    type: editingCategory.value.type,
    color: editingCategory.value.color,
  };
});

const openCreate = (): void => {
  editingCategory.value = null;
  formError.value = null;
  showModal.value = true;
};

const openEdit = (category: CategoryInterface): void => {
  editingCategory.value = category;
  formError.value = null;
  showModal.value = true;
};

const closeModal = (): void => {
  showModal.value = false;
  editingCategory.value = null;
  formError.value = null;
};

const handleFormSubmit = (payload: { name: string; type: string; color: string }): void => {
  formLoading.value = true;
  formError.value = null;

  try {
    if (editingCategory.value) {
      CategoryService.update(editingCategory.value.id, {
        name: payload.name,
        color: payload.color,
        type: payload.type,
      });
    } else {
      CategoryService.create({
        name: payload.name,
        color: payload.color,
        type: payload.type,
      });
    }

    closeModal();
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'An unexpected error occurred.';
  } finally {
    formLoading.value = false;
  }
};

const handleDelete = (id: number): void => {
  deleteError.value = null;
  try {
    CategoryService.delete(id);
  } catch (err) {
    deleteError.value = err instanceof Error ? err.message : 'Could not delete category.';
  }
};
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-[#0B2C3D]">Categories</h2>
        <p class="text-sm text-slate-500">Organize your transactions by category</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-[#0B2C3D] text-white text-sm font-medium px-4 py-2 hover:bg-[#0d3a52] transition"
        @click="openCreate"
      >
        <i class="fas fa-plus text-xs" />
        <span>New Category</span>
      </button>
    </header>

    <!-- Delete error -->
    <p
      v-if="deleteError"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
    >
      {{ deleteError }}
    </p>

    <!-- Summary cards -->
    <CategorySummaryCards :total="totalCount" :expense="expenseCount" :income="incomeCount" />

    <!-- Filters -->
    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-4">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1">
          <i
            class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search categories..."
            class="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          />
        </div>

        <!-- Type filter -->
        <select
          v-model="typeFilter"
          class="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredCategories.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center space-y-3"
    >
      <div
        class="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl"
      >
        <i class="fas fa-tags" />
      </div>
      <p class="text-sm font-medium text-slate-600">No categories found</p>
      <p class="text-xs text-slate-400">
        Create your first category to start organizing your transactions.
      </p>
      <button
        type="button"
        class="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#0B2C3D] text-white text-sm font-medium px-4 py-2 hover:bg-[#0d3a52] transition"
        @click="openCreate"
      >
        <i class="fas fa-plus text-xs" />
        <span>Create category</span>
      </button>
    </div>

    <!-- Category grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <CategoryCard
        v-for="cat in filteredCategories"
        :key="cat.id"
        :category="cat"
        :transaction-count="
          currentUserId ? CategoryService.getTransactionCount(cat.id, currentUserId) : 0
        "
        :total-amount="currentUserId ? CategoryService.getTotalAmount(cat.id, currentUserId) : 0"
        @edit="openEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Form modal -->
    <Teleport to="body">
      <CategoryFormModal
        v-if="showModal"
        :loading="formLoading"
        :error="formError"
        :initial-values="modalInitialValues"
        @submit="handleFormSubmit"
        @cancel="closeModal"
      />
    </Teleport>
  </section>
</template>
