<!-- author: Lucas Higuita -->
<script setup lang="ts">
// external imports
import { ref, watch } from 'vue';

const COLOR_PALETTE = [
  '#0B2C3D',
  '#E5A00D',
  '#6B7280',
  '#EF4444',
  '#16A34A',
  '#22C55E',
  '#8B5CF6',
  '#14B8A6',
];

interface Props {
  loading?: boolean;
  error?: string | null;
  initialValues?: {
    name?: string;
    type?: string;
    color?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  initialValues: () => ({}),
});

const emit = defineEmits<{
  (e: 'submit', payload: { name: string; type: string; color: string }): void;
  (e: 'cancel'): void;
}>();

const name = ref(props.initialValues.name ?? '');
const type = ref(props.initialValues.type ?? 'expense');
const color = ref(props.initialValues.color ?? COLOR_PALETTE[0]!);

watch(
  () => props.initialValues,
  (values) => {
    name.value = values.name ?? '';
    type.value = values.type ?? 'expense';
    color.value = values.color ?? COLOR_PALETTE[0]!;
  },
);

const isEditing = (): boolean => props.initialValues.name !== undefined;

const handleSubmit = (): void => {
  emit('submit', {
    name: name.value,
    type: type.value,
    color: color.value,
  });
};
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    @click.self="emit('cancel')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm">
      <div class="px-6 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold text-[#0B2C3D]">
            {{ isEditing() ? 'Edit Category' : 'New Category' }}
          </h2>
          <p class="text-xs text-slate-500">
            {{
              isEditing()
                ? 'Update the category details.'
                : 'Create a new category to organize your transactions'
            }}
          </p>
        </div>
        <button
          type="button"
          class="text-slate-400 hover:text-slate-600 transition"
          @click="emit('cancel')"
        >
          <i class="fas fa-times" />
        </button>
      </div>

      <form class="px-6 pb-6 space-y-4" @submit.prevent="handleSubmit">
        <!-- Name -->
        <div class="space-y-1">
          <label for="cat-name" class="block text-sm font-medium text-slate-700">
            Category name
          </label>
          <input
            id="cat-name"
            v-model="name"
            type="text"
            required
            placeholder="e.g., Online Shopping"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          />
        </div>

        <!-- Type -->
        <div class="space-y-1">
          <label for="cat-type" class="block text-sm font-medium text-slate-700">Type</label>
          <select
            id="cat-type"
            v-model="type"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <!-- Color -->
        <div class="space-y-2">
          <span class="block text-sm font-medium text-slate-700">Color</span>
          <div class="flex items-center gap-2 flex-wrap">
            <button
              v-for="c in COLOR_PALETTE"
              :key="c"
              type="button"
              class="w-8 h-8 rounded-full border-2 transition"
              :class="
                color === c ? 'border-[#0B2C3D] ring-2 ring-[#0B2C3D]/30' : 'border-transparent'
              "
              :style="{ backgroundColor: c }"
              @click="color = c"
            />
          </div>
        </div>

        <!-- Error -->
        <p v-if="props.error" class="text-sm text-red-600">{{ props.error }}</p>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            class="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-5 py-2 hover:bg-slate-50 transition"
            @click="emit('cancel')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="props.loading"
            class="rounded-lg bg-[#0B2C3D] text-white text-sm font-medium px-5 py-2 hover:bg-[#0d3a52] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span v-if="!props.loading">
              {{ isEditing() ? 'Save Changes' : 'Create Category' }}
            </span>
            <span v-else>Saving...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
