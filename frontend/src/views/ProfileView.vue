<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authstore';

const authStore = useAuthStore();
const router = useRouter();

const user = computed(() => authStore.user);

const initials = computed(() => {
  if (!user.value?.name) return 'FT';

  return user.value.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('');
});

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <section class="mt-4 mb-4 max-w-3xl mx-auto">
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      <div class="flex items-center gap-6 mb-6">
        <div
          class="w-16 h-16 rounded-full bg-[#1FA971]/10 text-[#0B2C3D] flex items-center justify-center text-xl font-semibold"
        >
          {{ initials }}
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-[#0B2C3D]">
            {{ user?.name || 'Guest user' }}
          </h2>
          <p class="text-sm text-slate-500">
            {{ user?.email || 'No email available' }}
          </p>
        </div>
      </div>

      <div class="border-t border-slate-100 pt-6 mt-4 flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-500">Role</p>
          <p class="text-sm font-medium text-slate-700">
            {{ user?.role || 'user' }}
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-rose-500/60 text-rose-600 text-sm font-medium px-4 py-2 hover:bg-rose-500 hover:text-white transition"
          @click="handleLogout"
        >
          <i class="fas fa-sign-out-alt text-xs" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  </section>
</template>

