<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import logo from '@/assets/logo/FinTrack-white.png';
import { AuthService } from '@/services/AuthService';
import { Formatters } from '@/utils/Formatters';

const router = useRouter();

const displayName = computed(() => AuthService.getCurrentUser()?.name || 'Guest user');

const displayEmail = computed(() => AuthService.getCurrentUser()?.email || 'guest@example.com');

const initials = computed(() => Formatters.initialsFromName(AuthService.getCurrentUser()?.name));

const handleLogout = (): void => {
  AuthService.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <div class="min-h-screen bg-white text-[#0B2C3D]">
    <!-- Main application layout (only for authenticated routes) -->
    <div v-if="!$route.meta.guestOnly" class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <aside
        class="w-72 bg-[#0B2C3D] text-white shadow-xl fixed h-full flex flex-col border-r border-black/10"
      >
        <!-- Brand -->
        <div class="px-6 pt-6 pb-4 flex items-center justify-center">
          <img :src="logo" alt="FinTrack Logo" class="h-35 w-auto object-contain" />
        </div>

        <!-- User card -->
        <div class="px-6">
          <div
            class="rounded-2xl px-4 py-4 flex items-center gap-3 bg-white/5 border border-white/10"
          >
            <div
              class="w-12 h-12 rounded-full bg-[#1FA971] text-[#0B2C3D] flex items-center justify-center font-semibold"
            >
              {{ initials }}
            </div>

            <div class="flex flex-col">
              <span class="font-semibold text-sm">{{ displayName }}</span>

              <span class="text-xs text-slate-400">{{ displayEmail }}</span>
            </div>
          </div>
        </div>

        <!-- Main navigation -->
        <nav class="px-4 mt-6 space-y-1 flex-1">
          <RouterLink
            :to="AuthService.isAdmin() ? '/admin' : '/'"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200"
            :class="{
              'bg-[#1FA971] text-white shadow-md': $route.path === '/' || $route.path === '/admin',
              'text-white hover:bg-[#1FA971]': $route.path !== '/' && $route.path !== '/admin',
            }"
          >
            <i class="fas fa-th-large"></i>
            <span>Dashboard</span>
          </RouterLink>

          <RouterLink
            v-if="AuthService.isAuthenticated()"
            to="/profile"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200"
            :class="{
              'bg-[#1FA971] text-white shadow-md': $route.path === '/profile',
              'text-white hover:bg-[#1FA971]': $route.path !== '/profile',
            }"
          >
            <i class="fas fa-user-circle"></i>
            <span>Profile</span>
          </RouterLink>

          <RouterLink
            v-if="AuthService.isAuthenticated() && !AuthService.isAdmin()"
            :to="{ name: 'category.index' }"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200"
            :class="{
              'bg-[#1FA971] text-white shadow-md': $route.path.startsWith('/categories'),
              'text-white hover:bg-[#1FA971]': !$route.path.startsWith('/categories'),
            }"
          >
            <i class="fas fa-tags"></i>
            <span>Categories</span>
          </RouterLink>
          <RouterLink
            v-if="AuthService.isAuthenticated() && !AuthService.isAdmin()"
            :to="{ name: 'transaction.index' }"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200"
            :class="{
              'bg-[#1FA971] text-white shadow-md': $route.path.startsWith('/transactions'),
              'text-white hover:bg-[#1FA971]': !$route.path.startsWith('/transactions'),
            }"
          >
            <i class="fas fa-exchange-alt"></i>
            <span>Transactions</span>
          </RouterLink>

          <RouterLink
            v-if="AuthService.isAuthenticated() && !AuthService.isAdmin()"
            :to="{ name: 'goal.index' }"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200"
            :class="{
              'bg-[#1FA971] text-white shadow-md': $route.path.startsWith('/goals'),
              'text-white hover:bg-[#1FA971]': !$route.path.startsWith('/goals'),
            }"
          >
            <i class="fas fa-bullseye"></i>
            <span>Goals</span>
          </RouterLink>

          <RouterLink
            v-if="AuthService.isAdmin()"
            to="/admin/users"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200"
            :class="{
              'bg-[#1FA971] text-white shadow-md': $route.path.startsWith('/admin/users'),
              'text-white hover:bg-[#1FA971]': !$route.path.startsWith('/admin/users'),
            }"
          >
            <i class="fas fa-users"></i>
            <span>Users</span>
          </RouterLink>
          <RouterLink
            v-if="AuthService.isAdmin()"
            to="/admin/reports"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200"
            :class="{
              'bg-[#1FA971] text-white shadow-md': $route.path.startsWith('/admin/reports'),
              'text-white hover:bg-[#1FA971]': !$route.path.startsWith('/admin/reports'),
            }"
          >
            <i class="fas fa-file-alt"></i>
            <span>Reports</span>
          </RouterLink>

          <RouterLink
            v-if="!AuthService.isAuthenticated()"
            to="/login"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200"
            :class="{
              'bg-[#1FA971] text-white shadow-md': $route.path === '/login',
              'text-white hover:bg-[#1FA971]': $route.path !== '/login',
            }"
          >
            <i class="fas fa-sign-in-alt"></i>
            <span>Sign In</span>
          </RouterLink>

          <RouterLink
            v-if="!AuthService.isAuthenticated()"
            to="/register"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200"
            :class="{
              'bg-[#1FA971] text-white shadow-md': $route.path === '/register',
              'text-white hover:bg-[#1FA971]': $route.path !== '/register',
            }"
          >
            <i class="fas fa-user-plus"></i>
            <span>Register</span>
          </RouterLink>
        </nav>

        <!-- Bottom actions -->
        <div class="px-4 pb-6 pt-2 space-y-1">
          <button
            v-if="AuthService.isAuthenticated()"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm text-rose-300 hover:bg-rose-500 hover:text-slate-950 transition duration-200 text-left mt-1"
            @click="handleLogout"
          >
            <i class="fas fa-sign-out-alt text-sm"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main content area -->
      <div class="flex-1 flex flex-col overflow-hidden ml-72">
        <!-- Top header -->
        <header class="bg-white border-b border-[#0B2C3D]/10 backdrop-blur">
          <div class="px-8 py-5 flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-[#0B2C3D]">
                {{ $route.meta.title || 'Dashboard' }}
              </h1>
            </div>
          </div>
        </header>

        <!-- Main content -->
        <main class="flex-1 overflow-y-auto p-8 bg-white">
          <RouterView />
        </main>
      </div>
    </div>

    <!-- Auth pages (login / register) without sidebar layout -->
    <div v-else class="min-h-screen bg-[#0B2C3D]">
      <RouterView />
    </div>
  </div>
</template>
