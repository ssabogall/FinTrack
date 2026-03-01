<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { AuthService } from '@/services/AuthService';

const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const localError = ref<string | null>(null);

const submitting = ref(false);

const handleSubmit = () => {
  submitting.value = true;
  localError.value = null;

  try {
    AuthService.login(email.value, password.value);

    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid email or password.';
    localError.value = message;
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-100 p-8">
      <h2 class="text-2xl font-semibold text-[#0B2C3D] mb-6 text-center">Sign in to FinTrack</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA971] focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div class="space-y-1">
          <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA971] focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <p v-if="localError" class="text-sm text-red-600">
          {{ localError }}
        </p>

        <button
          type="submit"
          class="w-full inline-flex items-center justify-center rounded-lg bg-[#1FA971] text-white text-sm font-medium py-2.5 mt-2 hover:bg-[#17825a] transition disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="submitting"
        >
          <span v-if="!submitting">Sign in</span>
          <span v-else>Signing in...</span>
        </button>
      </form>

      <p class="mt-4 text-xs text-center text-slate-500">
        Don't have an account?
        <router-link to="/register" class="text-[#1FA971] font-medium hover:underline">
          Create one
        </router-link>
      </p>
    </div>
  </div>
</template>
