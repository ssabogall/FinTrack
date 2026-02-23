<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import logo from '@/assets/logo/FinTrack-white.png';
</script>

<template>
  <div class="min-h-screen bg-white text-[#0B2C3D]">
    <div class="flex h-screen overflow-hidden">
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
              JD
            </div>

            <div class="flex flex-col">
              <span class="font-semibold text-sm">John Doe</span>

              <span class="text-xs text-slate-400">john@email.com</span>
            </div>
          </div>
        </div>

        <!-- Main navigation -->
        <nav class="px-4 mt-6 space-y-1 flex-1">
          <RouterLink
            to="/"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition duration-200"
            :class="{
              'bg-[#1FA971] text-white shadow-md': $route.path === '/',
              'text-white hover:bg-[#1FA971]': $route.path !== '/',
            }"
          >
            <i
              class="fas fa-th-large"
            ></i>

            <span>Dashboard</span>
          </RouterLink>

          <button
            type="button"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-200 hover:bg-slate-800 transition duration-200 text-left"
          >
            <i class="fas fa-exchange-alt"></i>

            <span>Transactions</span>
          </button>

          <button
            type="button"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-200 hover:bg-slate-800 transition duration-200 text-left"
          >
            <i class="fas fa-tags"></i>

            <span>Categories</span>
          </button>

          <button
            type="button"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-200 hover:bg-slate-800 transition duration-200 text-left"
          >
            <i class="fas fa-bullseye"></i>

            <span>Goals</span>
          </button>
        </nav>

        <!-- Bottom actions -->
        <div class="px-4 pb-6 pt-2 space-y-1">
          <button
            type="button"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm text-rose-300 hover:bg-rose-500 hover:text-slate-950 transition duration-200 text-left mt-1"
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
  </div>
</template>