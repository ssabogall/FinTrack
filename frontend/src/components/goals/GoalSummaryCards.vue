<!-- author: Santiago Sabogal -->
<script setup lang="ts">
import { Formatters } from '@/utils/Formatters';

interface Props {
  totalTarget: number;
  totalSaved: number;
  activeCount: number;
  completedCount: number;
}

defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Total Target</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-bullseye text-[#0B2C3D]" />
        <span class="text-2xl font-bold text-[#0B2C3D]">
          {{ Formatters.formatCurrency(totalTarget) }}
        </span>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Total Saved</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-piggy-bank text-[#1FA971]" />
        <span class="text-2xl font-bold text-[#1FA971]">
          {{ Formatters.formatCurrency(totalSaved) }}
        </span>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Active Goals</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-hourglass-half text-[#E5A00D]" />
        <span class="text-2xl font-bold text-[#E5A00D]">{{ activeCount }}</span>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Completed</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-check-circle text-[#8B5CF6]" />
        <span class="text-2xl font-bold text-[#8B5CF6]">{{ completedCount }}</span>
      </div>
    </div>
  </div>
</template>
