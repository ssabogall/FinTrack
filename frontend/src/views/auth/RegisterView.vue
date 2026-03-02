<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '@/services/AuthService';
import logo from '@/assets/logo/FinTrack-white.png';

const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');

const errorMessage = ref<string | null>(null);
const submitting = ref(false);

const handleSubmit = (): void => {
  errorMessage.value = null;
  submitting.value = true;

  try {
    AuthService.register({
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirmation: passwordConfirmation.value,
    });

    router.push('/');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'There was a problem creating your account.';
    errorMessage.value = message;
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
            <p class="text-xs uppercase tracking-[0.2em] text-[#1FA971]">
              Create your free account
            </p>
            <h2 class="text-3xl xl:text-4xl font-semibold tracking-tight">
              Start your journey to financial freedom
            </h2>
            <p class="text-sm text-slate-300">
              Join users who are already tracking their cash flow, setting savings goals and staying
              on top of their budgets with FinTrack.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-semibold text-slate-100">What you'll get with FinTrack</h3>
            <ul class="space-y-2 text-sm text-slate-200">
              <li class="flex items-start gap-2">
                <span
                  class="mt-1 h-4 w-4 rounded-full bg-[#1FA971] flex items-center justify-center"
                >
                  <i class="fas fa-check text-[10px] text-slate-900" />
                </span>
                <span>Income and expense tracking</span>
              </li>
              <li class="flex items-start gap-2">
                <span
                  class="mt-1 h-4 w-4 rounded-full bg-[#1FA971] flex items-center justify-center"
                >
                  <i class="fas fa-check text-[10px] text-slate-900" />
                </span>
                <span>Personalized savings goals</span>
              </li>
              <li class="flex items-start gap-2">
                <span
                  class="mt-1 h-4 w-4 rounded-full bg-[#1FA971] flex items-center justify-center"
                >
                  <i class="fas fa-check text-[10px] text-slate-900" />
                </span>
                <span>Visual reports and charts</span>
              </li>
              <li class="flex items-start gap-2">
                <span
                  class="mt-1 h-4 w-4 rounded-full bg-[#1FA971] flex items-center justify-center"
                >
                  <i class="fas fa-check text-[10px] text-slate-900" />
                </span>
                <span>Access from any device</span>
              </li>
            </ul>
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
          <h2 class="text-2xl font-semibold text-slate-900 tracking-tight">Create account</h2>
          <p class="text-sm text-slate-500">
            Fill out the form to start tracking your finances with FinTrack.
          </p>
        </header>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-1">
            <label for="name" class="block text-sm font-medium text-slate-700">Full name</label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div class="space-y-1">
            <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
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
              minlength="6"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="••••••••"
            />
            <p class="text-[11px] text-slate-500 mt-1">Minimum 6 characters.</p>
          </div>

          <div class="space-y-1">
            <label for="passwordConfirmation" class="block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              id="passwordConfirmation"
              v-model="passwordConfirmation"
              type="password"
              required
              minlength="6"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <p v-if="errorMessage" class="text-sm text-red-600">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            class="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 mt-1 hover:bg-slate-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="submitting"
          >
            <span v-if="!submitting">Create account</span>
            <span v-else>Creating account...</span>
          </button>
        </form>

        <p class="mt-2 text-xs text-center text-slate-500">
          Already have an account?
          <router-link to="/login" class="text-slate-900 font-medium hover:underline">
            Sign in
          </router-link>
        </p>
      </div>
    </section>
  </div>
</template>
