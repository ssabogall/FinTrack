<!-- author: Santiago Gómez -->
<script setup lang="ts">
// external imports
import { computed, ref } from 'vue';

// internal imports
import AdminUserFormModal from '@/modules/admin/components/AdminUserFormModal.vue';
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';
import { AdminService } from '@/modules/admin/services/AdminService';
import { UserService } from '@/modules/user/services/UserService';
import { Formatters } from '@/utils/Formatters';

const usersWithStats = computed(() => AdminService.getUsersWithStats());

const searchQuery = ref('');
const statusFilter = ref<'all' | 'active' | 'inactive'>('all');

const filteredUsers = computed(() => {
  let list = usersWithStats.value;
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }
  if (statusFilter.value === 'active') {
    list = list.filter((u) => u.transactionCount > 0);
  } else if (statusFilter.value === 'inactive') {
    list = list.filter((u) => u.transactionCount === 0);
  }
  return list;
});

const totalUsers = computed(() => usersWithStats.value.length);

const activeUsers = computed(
  () => usersWithStats.value.filter((u) => u.transactionCount > 0).length,
);

const inactiveUsers = computed(
  () => usersWithStats.value.filter((u) => u.transactionCount === 0).length,
);

const showAddModal = ref(false);
const addLoading = ref(false);
const addError = ref<string | null>(null);

const editingId = ref<number | null>(null);
const editName = ref('');
const editEmail = ref('');
const editRole = ref<'user' | 'admin'>('user');
const editMessage = ref<'success' | 'error' | null>(null);

function startEdit(user: UserInterface): void {
  editingId.value = user.id;
  editName.value = user.name;
  editEmail.value = user.email;
  editRole.value = user.role as 'user' | 'admin';
  editMessage.value = null;
}

function cancelEdit(): void {
  editingId.value = null;
}

function saveEdit(): void {
  if (editingId.value == null) return;
  editMessage.value = null;
  try {
    UserService.updateUser(editingId.value, {
      name: editName.value.trim(),
      email: editEmail.value.trim(),
      role: editRole.value,
    });
    editMessage.value = 'success';
    setTimeout(() => {
      editingId.value = null;
      editMessage.value = null;
    }, 1500);
  } catch {
    editMessage.value = 'error';
  }
}

function handleAddUser(payload: {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}): void {
  addError.value = null;
  addLoading.value = true;
  try {
    UserService.createUser({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    });
    showAddModal.value = false;
  } catch (e) {
    addError.value = e instanceof Error ? e.message : 'Failed to create user';
  } finally {
    addLoading.value = false;
  }
}

function roleLabel(role: string): string {
  return Formatters.roleLabel(role);
}

function formatDate(d: Date | string | undefined): string {
  return Formatters.formatShortDate(d);
}

function userStatus(transactionCount: number): 'Active' | 'Inactive' {
  return transactionCount > 0 ? 'Active' : 'Inactive';
}

function closeAddModal(): void {
  showAddModal.value = false;
  addError.value = null;
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-[#0B2C3D]">Users</h2>
        <p class="text-sm text-slate-500">Manage platform users</p>
      </div>
      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-lg bg-[#0B2C3D] text-white text-sm font-medium px-4 py-2.5 hover:bg-[#0d3a52] transition"
        @click="showAddModal = true"
      >
        <i class="fas fa-plus" />
        Add User
      </button>
    </header>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        class="rounded-2xl border-t-4 border border-slate-200 bg-white px-6 py-5 space-y-2"
        style="border-top-color: #0b2c3d"
      >
        <p class="text-sm font-medium text-slate-500">Total Users</p>
        <div class="flex items-center gap-2">
          <i class="fas fa-users text-[#0B2C3D]" />
          <span class="text-2xl font-bold text-[#0B2C3D]">{{ totalUsers }}</span>
        </div>
      </div>
      <div
        class="rounded-2xl border-t-4 border border-slate-200 bg-white px-6 py-5 space-y-2"
        style="border-top-color: #16a34a"
      >
        <p class="text-sm font-medium text-slate-500">Active Users</p>
        <div class="flex items-center gap-2">
          <i class="fas fa-user-check text-green-600" />
          <span class="text-2xl font-bold text-green-600">{{ activeUsers }}</span>
        </div>
      </div>
      <div
        class="rounded-2xl border-t-4 border border-slate-200 bg-white px-6 py-5 space-y-2"
        style="border-top-color: #ef4444"
      >
        <p class="text-sm font-medium text-slate-500">Inactive / Pending</p>
        <div class="flex items-center gap-2">
          <i class="fas fa-user-times text-red-500" />
          <span class="text-2xl font-bold text-red-500">{{ inactiveUsers }}</span>
        </div>
      </div>
    </div>

    <!-- All Users table -->
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <h3 class="font-semibold text-[#0B2C3D]">All Users</h3>
        <p class="text-xs text-slate-500">Manage and view user information</p>
      </div>

      <div class="px-6 py-4 flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <i
            class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          />
        </div>
        <select
          v-model="statusFilter"
          class="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 font-semibold text-slate-700">User</th>
              <th class="px-4 py-3 font-semibold text-slate-700">Status</th>
              <th class="px-4 py-3 font-semibold text-slate-700">Balance</th>
              <th class="px-4 py-3 font-semibold text-slate-700">Transactions</th>
              <th class="px-4 py-3 font-semibold text-slate-700">Join Date</th>
              <th class="px-4 py-3 font-semibold text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-[#0B2C3D] text-white flex items-center justify-center font-semibold text-sm shrink-0"
                  >
                    {{ Formatters.initialsFromName(user.name) }}
                  </div>
                  <div>
                    <span class="font-medium text-slate-800 block">{{ user.name }}</span>
                    <span class="text-slate-500 text-xs">{{ user.email }}</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="
                    user.transactionCount > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  "
                >
                  {{ userStatus(user.transactionCount) }}
                </span>
              </td>
              <td class="px-4 py-3 font-medium text-[#0B2C3D]">
                {{ Formatters.formatCurrency(user.balance) }}
              </td>
              <td class="px-4 py-3 text-slate-600">{{ user.transactionCount }}</td>
              <td class="px-4 py-3 text-slate-500">{{ formatDate(user.createdAt) }}</td>
              <td class="px-4 py-3 text-right">
                <template v-if="editingId === user.id">
                  <button
                    type="button"
                    class="text-slate-500 hover:text-slate-700 mr-2 text-xs"
                    @click="cancelEdit"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="text-[#1FA971] hover:underline font-medium text-xs"
                    @click="saveEdit"
                  >
                    Save
                  </button>
                </template>
                <template v-else>
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="p-2 rounded-lg text-slate-400 hover:text-[#0B2C3D] hover:bg-slate-100 transition"
                      title="Edit"
                      @click="startEdit(user)"
                    >
                      <i class="fas fa-ellipsis-v text-xs" />
                    </button>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="editMessage" class="px-4 py-2 border-t border-slate-100 text-sm">
        <span v-if="editMessage === 'success'" class="text-[#1FA971]">Saved.</span>
        <span v-else class="text-red-600">Error saving. Try again.</span>
      </div>

      <p v-if="filteredUsers.length === 0" class="px-4 py-8 text-center text-slate-500">
        No users found.
      </p>
    </div>

    <!-- Edit inline (when editing, show form in a row or modal) -->
    <template v-if="editingId">
      <div
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
        @click.self="cancelEdit"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" @click.stop>
          <h3 class="font-semibold text-[#0B2C3D] mb-4">Edit User</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                v-model="editName"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                v-model="editEmail"
                type="email"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                v-model="editRole"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm"
              @click="cancelEdit"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg bg-[#0B2C3D] text-white px-4 py-2 text-sm"
              @click="saveEdit"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </template>

    <AdminUserFormModal
      v-if="showAddModal"
      :loading="addLoading"
      :error="addError"
      @submit="handleAddUser"
      @cancel="closeAddModal"
    />
  </section>
</template>
