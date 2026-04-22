<!-- author: Santiago Gómez -->
<script setup lang="ts">
// external imports
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// internal imports
import logo from '@/assets/logo/FinTrack-white.png';
import { AuthService } from '@/modules/auth/services/AuthService';

// variables
const router = useRouter();
const route = useRoute();

// reactive variables
const email = ref('');
const password = ref('');
const localError = ref<string | null>(null);
const submitting = ref(false);

const handleSubmit = (): void => {
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
  <div class="min-h-screen flex flex-col lg:flex-row bg-[#0B2C3D] text-slate-100">
    <!-- Left marketing panel -->
    <section
      class="hidden lg:flex lg:w-1/2 flex-col px-12 py-10 bg-gradient-to-b from-[#0B2C3D] to-[#0B2C3D]"
    >
      <header class="flex justify-center">
        <img :src="logo" alt="FinTrack logo" class="h-60 w-auto" />
      </header>

      <div class="mt-10 flex flex-col">
        <div class="max-w-xl space-y-8">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-[0.2em] text-[#1FA971]">Smart personal finance</p>
            <h2 class="text-3xl xl:text-4xl font-semibold tracking-tight">
              Take control of your personal finances
            </h2>
            <p class="text-sm text-slate-300">
              Track your income, expenses and savings goals in one simple, visual dashboard so you
              can make smarter financial decisions every day.
            </p>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div
              class="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm shadow-sm"
            >
              <p class="text-[11px] text-slate-300">Active users</p>
              <p class="text-lg font-semibold mt-1 text-white">+10K</p>
            </div>
            <div
              class="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm shadow-sm"
            >
              <p class="text-[11px] text-slate-300">Tracked balance</p>
              <p class="text-lg font-semibold mt-1 text-white">$2M</p>
            </div>
            <div
              class="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm shadow-sm"
            >
              <p class="text-[11px] text-slate-300">Satisfaction</p>
              <p class="text-lg font-semibold mt-1 text-white">98%</p>
            </div>
          </div>
        </div>
      </div>

      <footer class="mt-10 text-[11px] text-slate-500">
        © {{ new Date().getFullYear() }} FinTrack. All rights reserved.
      </footer>
    </section>

    <!-- Right auth card -->
    <section class="flex-1 flex items-center justify-center px-4 py-10 bg-slate-50 lg:px-10">
      <div
        class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 px-8 py-8 space-y-6"
      >
        <header class="space-y-1">
          <div class="flex justify-center lg:hidden mb-2">
            <img :src="logo" alt="FinTrack logo" class="h-12 w-auto" />
          </div>
          <h2 class="text-2xl font-semibold text-slate-900 tracking-tight">Sign in</h2>
          <p class="text-sm text-slate-500">
            Enter your credentials to access your FinTrack account.
          </p>
        </header>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-1">
            <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
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
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <p v-if="localError" class="text-sm text-red-600">
            {{ localError }}
          </p>

          <button
            type="submit"
            class="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 mt-1 hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="submitting"
          >
            <span v-if="!submitting">Sign in</span>
            <span v-else>Signing in...</span>
          </button>
        </form>

        <p class="mt-2 text-xs text-center text-slate-500">
          Don't have an account?
          <router-link to="/register" class="text-slate-900 font-medium hover:underline">
            Register here
          </router-link>
        </p>
      </div>
    </section>
  </div>
</template>
