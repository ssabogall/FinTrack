<!-- author: Santiago Sabogal -->
<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  loading?: boolean;
  error?: string | null;
  initialValues?: {
    name?: string;
    description?: string;
    targetAmount?: number;
    startDate?: string;
    endDate?: string;
  };
  submitLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  initialValues: () => ({}),
  submitLabel: 'Save',
});

const emit = defineEmits<{
  (
    e: 'submit',
    payload: {
      name: string;
      description: string;
      targetAmount: number;
      startDate: string;
      endDate: string;
    },
  ): void;
}>();

const name = ref(props.initialValues.name ?? '');
const description = ref(props.initialValues.description ?? '');
const targetAmount = ref<number | ''>(props.initialValues.targetAmount ?? '');
const startDate = ref(props.initialValues.startDate ?? '');
const endDate = ref(props.initialValues.endDate ?? '');

// sync if parent updates initialValues after mount (e.g. async load)
watch(
  () => props.initialValues,
  (values) => {
    name.value = values.name ?? '';
    description.value = values.description ?? '';
    targetAmount.value = values.targetAmount ?? '';
    startDate.value = values.startDate ?? '';
    endDate.value = values.endDate ?? '';
  },
);

const handleSubmit = (): void => {
  emit('submit', {
    name: name.value,
    description: description.value,
    targetAmount: Number(targetAmount.value),
    startDate: startDate.value,
    endDate: endDate.value,
  });
};
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <!-- Name -->
    <div class="space-y-1">
      <label for="goal-name" class="block text-sm font-medium text-slate-700">Goal name</label>
      <input
        id="goal-name"
        v-model="name"
        type="text"
        required
        placeholder="e.g. Emergency fund"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
      />
    </div>

    <!-- Description -->
    <div class="space-y-1">
      <label for="goal-description" class="block text-sm font-medium text-slate-700">
        Description <span class="text-slate-400 font-normal">(optional)</span>
      </label>
      <textarea
        id="goal-description"
        v-model="description"
        rows="3"
        placeholder="Short description of your goal"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent resize-none"
      />
    </div>

    <!-- Target amount -->
    <div class="space-y-1">
      <label for="goal-amount" class="block text-sm font-medium text-slate-700">
        Target amount ($)
      </label>
      <input
        id="goal-amount"
        v-model="targetAmount"
        type="number"
        min="1"
        step="0.01"
        required
        placeholder="0.00"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
      />
    </div>

    <!-- Dates -->
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1">
        <label for="goal-start" class="block text-sm font-medium text-slate-700">Start date</label>
        <input
          id="goal-start"
          v-model="startDate"
          type="date"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
        />
      </div>

      <div class="space-y-1">
        <label for="goal-end" class="block text-sm font-medium text-slate-700">End date</label>
        <input
          id="goal-end"
          v-model="endDate"
          type="date"
          required
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
        />
      </div>
    </div>

    <!-- Error message -->
    <p v-if="props.error" class="text-sm text-red-600">{{ props.error }}</p>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="props.loading"
      class="w-full inline-flex items-center justify-center rounded-lg bg-[#0B2C3D] text-white text-sm font-medium py-2.5 hover:bg-[#0d3a52] transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span v-if="!props.loading">{{ props.submitLabel }}</span>
      <span v-else>Saving...</span>
    </button>
  </form>
</template>
