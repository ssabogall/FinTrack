<!-- author: Santiago Gómez -->
<script setup lang="ts">
// external imports
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// internal imports
import { AuthService } from '@/modules/auth/services/AuthService';
import { UserService } from '@/modules/user/services/UserService';
import { Formatters } from '@/utils/Formatters';

// variables
const router = useRouter();
const user = computed(() => AuthService.getCurrentUser());

// reactive variables
const activeTab = ref<'general' | 'security'>('general');

const fullName = ref('');
const email = ref('');
const saveMessage = ref<'success' | 'error' | null>(null);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordMessage = ref<'success' | 'error' | null>(null);

watch(
  user,
  (u) => {
    if (u) {
      fullName.value = u.name;
      email.value = u.email;
    }
  },
  { immediate: true },
);

// selectors
const initials = computed(() => Formatters.initialsFromName(user.value?.name));

const memberSince = computed(() => Formatters.memberSince(user.value?.createdAt, 'en-US'));

const roleLabel = computed(() => Formatters.roleLabel(user.value?.role));

function handleSaveProfile(): void {
  saveMessage.value = null;
  try {
    UserService.updateProfile(fullName.value.trim(), email.value.trim());
    saveMessage.value = 'success';
    setTimeout(() => (saveMessage.value = null), 3000);
  } catch {
    saveMessage.value = 'error';
  }
}

function handleChangePassword(): void {
  passwordMessage.value = null;
  if (newPassword.value !== confirmPassword.value) {
    passwordMessage.value = 'error';
    return;
  }
  try {
    UserService.changePassword(currentPassword.value, newPassword.value);
    passwordMessage.value = 'success';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    setTimeout(() => (passwordMessage.value = null), 3000);
  } catch {
    passwordMessage.value = 'error';
  }
}

const handleLogout = (): void => {
  AuthService.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <section class="max-w-4xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-[#0B2C3D]">User Profile</h1>
      <p class="mt-1 text-sm text-slate-500">Manage your personal information and preferences</p>
    </header>

    <div class="flex gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 w-fit mb-8">
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition"
        :class="
          activeTab === 'general'
            ? 'bg-white text-[#0B2C3D] shadow-sm border border-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        "
        @click="activeTab = 'general'"
      >
        <i class="fas fa-user text-xs" />
        General
      </button>
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition"
        :class="
          activeTab === 'security'
            ? 'bg-white text-[#0B2C3D] shadow-sm border border-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        "
        @click="activeTab = 'security'"
      >
        <i class="fas fa-lock text-xs" />
        Security
      </button>
    </div>

    <!-- General tab -->
    <div v-show="activeTab === 'general'" class="space-y-6">
      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-[#0B2C3D]">Personal Information</h2>
          <p class="text-sm text-slate-500 mt-0.5">Update your profile information</p>
        </div>
        <div class="p-6 space-y-6">
          <div class="flex items-center gap-6">
            <div
              class="w-20 h-20 rounded-full bg-[#1FA971] text-[#0B2C3D] flex items-center justify-center text-2xl font-semibold"
            >
              {{ initials }}
            </div>
            <div>
              <p class="font-semibold text-[#0B2C3D]">{{ user?.name || '—' }}</p>
              <p class="text-sm text-slate-500">{{ user?.email || '—' }}</p>
              <p v-if="memberSince" class="text-xs text-slate-400 mt-1">
                Member since {{ memberSince }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-1">
              <label for="profile-name" class="block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="profile-name"
                v-model="fullName"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA971] focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <div class="space-y-1">
              <label for="profile-email" class="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="profile-email"
                v-model="email"
                type="email"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA971] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div class="flex items-center justify-between pt-2">
            <p v-if="saveMessage === 'success'" class="text-sm text-[#1FA971]">
              Changes saved successfully.
            </p>
            <p v-else-if="saveMessage === 'error'" class="text-sm text-red-600">
              Could not save. Try again.
            </p>
            <span v-else />
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-[#1FA971] text-white text-sm font-medium px-4 py-2.5 hover:bg-[#17825a] transition"
              @click="handleSaveProfile"
            >
              <i class="fas fa-save text-xs" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-sm text-slate-500">Role</p>
            <p class="text-sm font-medium text-slate-800">{{ roleLabel }}</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-rose-500/60 text-rose-600 text-sm font-medium px-4 py-2 hover:bg-rose-500 hover:text-white transition"
            @click="handleLogout"
          >
            <i class="fas fa-sign-out-alt text-xs" />
            Sign out
          </button>
        </div>
      </div>
    </div>

    <!-- Security tab -->
    <div v-show="activeTab === 'security'" class="space-y-6">
      <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-[#0B2C3D]">Change password</h2>
          <p class="text-sm text-slate-500 mt-0.5">
            Update your password to keep your account secure
          </p>
        </div>
        <div class="p-6 space-y-4 max-w-md">
          <div class="space-y-1">
            <label for="current-password" class="block text-sm font-medium text-slate-700">
              Current password
            </label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA971] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <div class="space-y-1">
            <label for="new-password" class="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA971] focus:border-transparent"
              placeholder="••••••••"
            />
            <p class="text-[11px] text-slate-500">Minimum 6 characters.</p>
          </div>
          <div class="space-y-1">
            <label for="confirm-password" class="block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA971] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <p v-if="passwordMessage === 'success'" class="text-sm text-[#1FA971]">
            Password updated successfully.
          </p>
          <p v-else-if="passwordMessage === 'error'" class="text-sm text-red-600">
            Check current password or that new passwords match (min 6 characters).
          </p>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-[#1FA971] text-white text-sm font-medium px-4 py-2.5 hover:bg-[#17825a] transition"
            @click="handleChangePassword"
          >
            <i class="fas fa-key text-xs" />
            Change password
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
