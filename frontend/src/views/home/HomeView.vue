<script setup lang="ts">
// external imports
import { computed } from 'vue';

// internal imports
import { AuthService } from '@/services/AuthService';
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue';

const isAdmin = computed(() => AuthService.isAdmin());
</script>

<template>
  <AdminDashboardView v-if="isAdmin" />
  <section v-else class="mt-4 mb-4">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-800 text-center">Home Page</h2>
    </div>
  </section>
</template>
