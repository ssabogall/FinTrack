<!-- author: Lucas Higuita -->
<script setup lang="ts">
// external imports
import { ref, watch } from 'vue';

// internal imports
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';

interface Props {
  categories: CategoryInterface[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'filter', payload: { search: string; type: string; categoryId: number | null }): void;
}>();

const search = ref('');
const type = ref('all');
const categoryId = ref<number | null>(null);

const emitFilter = (): void => {
  emit('filter', {
    search: search.value,
    type: type.value,
    categoryId: categoryId.value,
  });
};

watch([search, type, categoryId], () => emitFilter());

// Filter categories based on selected type
const handleCategoryChange = (event: Event): void => {
  const value = (event.target as HTMLSelectElement).value;
  categoryId.value = value ? Number(value) : null;
};
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white px-6 py-4">
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <!-- Search -->
      <div class="relative flex-1">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          v-model="search"
          type="text"
          placeholder="Search transactions..."
          class="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
        />
      </div>

      <!-- Type filter -->
      <div class="flex items-center gap-2">
        <i class="fas fa-filter text-slate-400 text-sm" />
        <select
          v-model="type"
          class="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <!-- Category filter -->
      <select
        :value="categoryId ?? ''"
        class="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
        @change="handleCategoryChange"
      >
        <option value="">All categories</option>
        <option v-for="cat in props.categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>
  </div>
</template>
