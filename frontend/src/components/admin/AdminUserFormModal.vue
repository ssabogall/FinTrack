<script setup lang="ts">
// external imports
import { ref } from 'vue';

// internal imports
import type { CreateUserDto } from '@/dtos/user/CreateUserDto';

interface Props {
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const emit = defineEmits<{
  (e: 'submit', payload: CreateUserDto): void;
  (e: 'cancel'): void;
}>();

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref<'user' | 'admin'>('user');

const handleSubmit = (): void => {
  emit('submit', {
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
    role: role.value,
  });
};
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    @click.self="emit('cancel')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div class="px-6 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold text-[#0B2C3D]">Add User</h2>
          <p class="text-xs text-slate-500">Create a new user account</p>
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
        <div class="space-y-1">
          <label for="user-name" class="block text-sm font-medium text-slate-700">Name</label>
          <input
            id="user-name"
            v-model="name"
            type="text"
            required
            placeholder="Full name"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          />
        </div>

        <div class="space-y-1">
          <label for="user-email" class="block text-sm font-medium text-slate-700">Email</label>
          <input
            id="user-email"
            v-model="email"
            type="email"
            required
            placeholder="user@example.com"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          />
        </div>

        <div class="space-y-1">
          <label for="user-password" class="block text-sm font-medium text-slate-700"
            >Password</label
          >
          <input
            id="user-password"
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="Min 6 characters"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          />
        </div>

        <div class="space-y-1">
          <label for="user-role" class="block text-sm font-medium text-slate-700">Role</label>
          <select
            id="user-role"
            v-model="role"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <p v-if="props.error" class="text-sm text-red-600">{{ props.error }}</p>

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
            <span v-if="!props.loading">Create User</span>
            <span v-else>Creating...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
